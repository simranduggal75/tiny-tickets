import { Request, Response, NextFunction } from "express";
import { prisma } from "../prismaClient";
import { AuthedRequest } from "./auth";

export async function ownerOnly(req: AuthedRequest, res: Response, next: NextFunction) {
  const userId = req.user?.sub;
  const projectId = req.params.id;

  if (!userId || !projectId) {
    return res.status(400).json({ error: "Missing user or project id" });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true }
  });

  if (!project) return res.status(404).json({ error: "Project not found" });
  if (project.ownerId !== userId) return res.status(403).json({ error: "Owner role required" });

  return next();
}
