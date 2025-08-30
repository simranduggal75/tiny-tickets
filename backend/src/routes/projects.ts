import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prismaClient";
import { authRequired, AuthedRequest } from "../middleware/auth";
import { ownerOnly } from "../middleware/owner";

export const projectsRouter = Router();

// Create a project
const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

projectsRouter.post("/projects", authRequired, async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, description } = parsed.data;
  const userId = req.user!.sub;

  const project = await prisma.project.create({
    data: {
      name,
      description: description ?? null,
      ownerId: userId,
      members: { create: { userId, role: "OWNER" } }
    },
    select: { id: true, name: true, description: true, createdAt: true }
  });

  return res.status(201).json(project);
});

// List projects (where caller is owner or member)
projectsRouter.get("/projects", authRequired, async (req: AuthedRequest, res) => {
  const userId = req.user!.sub;

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      ownerId: true,
      members: {
        select: {
          role: true,
          user: { select: { id: true, email: true, name: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return res.json(projects);
});

// Project details
projectsRouter.get("/projects/:id", authRequired, async (req: AuthedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.sub;

  // must be owner or member
  const allowed = await prisma.project.findFirst({
    where: { id, OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
    select: { id: true }
  });
  if (!allowed) return res.status(404).json({ error: "Not found or no access" });

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      owner: { select: { id: true, email: true, name: true } },
      members: {
        select: {
          role: true,
          user: { select: { id: true, email: true, name: true } }
        }
      },
      _count: { select: { tickets: true } }
    }
  });

  return res.json(project);
});

// Add member (owner-only)
const addMemberSchema = z.object({ email: z.string().email() });

projectsRouter.post("/projects/:id/members", authRequired, ownerOnly, async (req: AuthedRequest, res) => {
  const parsed = addMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email } = parsed.data;
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const membership = await prisma.projectMember.upsert({
    where: { userId_projectId: { userId: user.id, projectId: id } },
    update: { role: "MEMBER" },
    create: { userId: user.id, projectId: id, role: "MEMBER" },
    select: { role: true, user: { select: { id: true, email: true, name: true } } }
  });

  return res.status(201).json(membership);
});
