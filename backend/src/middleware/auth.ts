import { Request, Response, NextFunction } from "express";


export function authRequired(_req: Request, res: Response, next: NextFunction) {
  
  return next();
}
