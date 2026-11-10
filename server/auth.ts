import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/index.js';
import * as schema from './db/schema.js';
import { sendPasswordResetEmail } from './lib/email.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL || {
    allowedHosts: [
      'www.canibunk.in',
      'canibunk.in',
      'atten-dance.ayushsawant.dev',
      'localhost:5173',
      'localhost:3000',
      'localhost:3001',
      '*.vercel.app',
    ],
    fallback: 'https://www.canibunk.in',
  },
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name || undefined,
        url,
        expiresInMinutes: 60,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  trustedOrigins: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://www.canibunk.in',
    'https://canibunk.in',
    'https://*.canibunk.in',
    'https://*.vercel.app',
    'https://atten-dance.ayushsawant.dev',
    'https://atten-dance.ayushsawant.dev/',
    process.env.VITE_APP_URL || '',
    process.env.BETTER_AUTH_URL || ''
  ].filter(Boolean),
  user: {
    modelName: "users",
    additionalFields: {
      dob: {
        type: "date",
        required: false,
      }
    }
  }
});
