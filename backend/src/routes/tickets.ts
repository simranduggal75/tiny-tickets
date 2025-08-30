import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prismaClient";
import { authRequired, AuthedRequest } from "../middleware/auth";
import { TicketStatus, TicketPriority } from "@prisma/client"; // ✅ use Prisma enums

export const ticketsRouter = Router();

// --- Create Ticket ---
const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(TicketStatus).default(TicketStatus.OPEN),       // ✅
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM), // ✅
  assigneeId: z.string().optional()
});

ticketsRouter.post(
  "/projects/:id/tickets",
  authRequired,
  async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { title, description, status, priority, assigneeId } = parsed.data;
    const projectId = req.params.id;
    const userId = req.user!.sub;

    // check membership
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });
    if (!membership) {
      return res.status(403).json({ error: "Not a project member" });
    }

    const ticket = await prisma.ticket.create({
      data: {
        projectId,
        title,
        description: description ?? null,
        status,
        priority,
        assigneeId: assigneeId ?? null
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        assigneeId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(201).json(ticket);
  }
);

// --- List Tickets with filters ---
ticketsRouter.get(
  "/projects/:id/tickets",
  authRequired,
  async (req: AuthedRequest, res) => {
    const projectId = req.params.id;
    const userId = req.user!.sub;

    // check membership
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });
    if (!membership) {
      return res.status(403).json({ error: "Not a project member" });
    }

    const { status, priority, assigneeId, search } = req.query;

    const tickets = await prisma.ticket.findMany({
      where: {
        projectId,
        ...(status ? { status: status as TicketStatus } : {}),          
        ...(priority ? { priority: priority as TicketPriority } : {}),  
        ...(assigneeId ? { assigneeId: String(assigneeId) } : {}),
        ...(search
          ? { title: { contains: String(search), mode: "insensitive" } }
          : {})
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        assignee: { select: { id: true, email: true, name: true } },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(tickets);
  }
);

// --- Get Ticket Details ---
ticketsRouter.get("/tickets/:id", authRequired, async (req: AuthedRequest, res) => {
  const ticketId = req.params.id;
  const userId = req.user!.sub;

  // check that user is a member of the project this ticket belongs to
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      project: {
        include: {
          members: { select: { userId: true } }
        }
      },
      assignee: { select: { id: true, email: true, name: true } }
    }
  });

  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const isMember = ticket.project.members.some(m => m.userId === userId);
  if (!isMember) return res.status(403).json({ error: "Not a project member" });

  return res.json({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    assignee: ticket.assignee,
    projectId: ticket.projectId,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt
  });
});
