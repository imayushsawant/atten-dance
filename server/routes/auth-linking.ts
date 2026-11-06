import { Router, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { db } from '../db/index.js';
import { users, account } from '../db/schema.js';

const router = Router();

// Check if an email exists and what auth methods it is connected to
router.post('/check-status', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [existingUser] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!existingUser) {
      return res.json({
        exists: false,
        hasGoogle: false,
        hasPassword: false,
      });
    }

    const accounts = await db
      .select({
        providerId: account.providerId,
        hasPasswordHash: account.password,
      })
      .from(account)
      .where(eq(account.userId, existingUser.id));

    const hasGoogle = accounts.some((a) => a.providerId === 'google');
    const hasPassword = accounts.some(
      (a) => a.providerId === 'credential' && !!a.hasPasswordHash
    );

    return res.json({
      exists: true,
      hasGoogle,
      hasPassword,
      name: existingUser.name,
    });
  } catch (error: any) {
    console.error('Error checking account status:', error);
    return res.status(500).json({ error: 'Failed to verify account status' });
  }
});

// Link password credentials to an existing OAuth account
router.post('/link-password', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!existingUser) {
      return res.status(404).json({ error: 'Account not found with this email' });
    }

    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, existingUser.id));

    const existingCredential = accounts.find(
      (a) => a.providerId === 'credential' && !!a.password
    );

    if (existingCredential) {
      return res.status(400).json({
        error: 'This account already has a password configured. Please sign in with your email and password.',
      });
    }

    const hasGoogle = accounts.some((a) => a.providerId === 'google');
    if (!hasGoogle) {
      return res.status(400).json({
        error: 'No Google OAuth account found to link to.',
      });
    }

    const hashedPassword = await hashPassword(password);

    await db.insert(account).values({
      id: randomUUID(),
      userId: existingUser.id,
      accountId: existingUser.id,
      providerId: 'credential',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.json({
      success: true,
      message: 'Password successfully linked to your account.',
    });
  } catch (error: any) {
    console.error('Error linking password:', error);
    return res.status(500).json({ error: 'Failed to link password' });
  }
});

export default router;

