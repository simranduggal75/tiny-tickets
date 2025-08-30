import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prismaClient";
import { authRequired, AuthedRequest } from "../middleware/auth";

export const commentsRouter = Router();

// --- Create Comment ---
const createSchema = z.object({
  body: z.string().min(1)
});

commentsRouter.post("/tickets/:ticketId/comments", authRequired, async (req: AuthedRequest, res) => {
  const ticketId = req.params.ticketId;
  const userId = req.user!.sub;

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // check ticket + project membership
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { project: { include: { members: true } } }
  });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const isMember = ticket.project.members.some(m => m.userId === userId);
  if (!isMember) return res.status(403).json({ error: "Not a project member" });

  const comment = await prisma.comment.create({
    data: {
      ticketId,
      authorId: userId,
      body: parsed.data.body
    },
    include: {
      author: { select: { id: true, email: true, name: true } }
    }
  });

  return res.status(201).json(comment);
});

// --- List Comments ---
commentsRouter.get("/tickets/:ticketId/comments", authRequired, async (req: AuthedRequest, res) => {
  const ticketId = req.params.ticketId;
  const userId = req.user!.sub;

  // check ticket + project membership
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { project: { include: { members: true } } }
  });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const isMember = ticket.project.members.some(m => m.userId === userId);
  if (!isMember) return res.status(403).json({ error: "Not a project member" });

  const comments = await prisma.comment.findMany({
    where: { ticketId },
    include: {
      author: { select: { id: true, email: true, name: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  return res.json(comments);
});
