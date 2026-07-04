import type { Request, Response, NextFunction } from 'express';
import { auth } from '../auth.js';
import { fromNodeHeaders } from 'better-auth/node';

// Extend Express Request with user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
      };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    };

    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
