import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prismaClient";
import { authRequired, AuthedRequest } from "../middleware/auth";

export const labelsRouter = Router();

// --- Create Label ---
const createSchema = z.object({
  name: z.string().min(1)
});

labelsRouter.post("/projects/:id/labels", authRequired, async (req: AuthedRequest, res) => {
  const projectId = req.params.id;
  const userId = req.user!.sub;

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // check membership
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  if (!membership) return res.status(403).json({ error: "Not a project member" });

  const label = await prisma.label.create({
    data: { name: parsed.data.name, projectId }
  });

  return res.status(201).json(label);
});

// --- List Labels ---
labelsRouter.get("/projects/:id/labels", authRequired, async (req: AuthedRequest, res) => {
  const projectId = req.params.id;
  const userId = req.user!.sub;

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  if (!membership) return res.status(403).json({ error: "Not a project member" });

  const labels = await prisma.label.findMany({
    where: { projectId },
    orderBy: { name: "asc" }
  });

  return res.json(labels);
});

// --- Attach Label to Ticket ---
labelsRouter.post("/tickets/:ticketId/labels/:labelId", authRequired, async (req: AuthedRequest, res) => {
  const { ticketId, labelId } = req.params;
  const userId = req.user!.sub;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { project: { include: { members: true } } }
  });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const isMember = ticket.project.members.some(m => m.userId === userId);
  if (!isMember) return res.status(403).json({ error: "Not a project member" });

  await prisma.ticketLabel.create({
    data: { ticketId, labelId }
  });

  return res.status(201).json({ message: "Label attached" });
});

// --- Detach Label from Ticket ---
labelsRouter.delete("/tickets/:ticketId/labels/:labelId", authRequired, async (req: AuthedRequest, res) => {
  const { ticketId, labelId } = req.params;
  const userId = req.user!.sub;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { project: { include: { members: true } } }
  });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const isMember = ticket.project.members.some(m => m.userId === userId);
  if (!isMember) return res.status(403).json({ error: "Not a project member" });

  await prisma.ticketLabel.delete({
    where: { ticketId_labelId: { ticketId, labelId } }
  });

  return res.status(204).send();
});
