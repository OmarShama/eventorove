import { Request, Response, NextFunction } from 'express';

export function timezoneMiddleware(req: Request, res: Response, next: NextFunction) {
  // Set timezone to Cairo for all date operations
  process.env.TZ = 'Africa/Cairo';
  
  // Add timezone helper to request object
  (req as any).timezone = 'Africa/Cairo';
  
  // Helper function to convert dates to Cairo timezone
  (req as any).toCairoTime = (date: Date) => {
    return new Date(date.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
  };

  next();
}
