import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/index.js';
import * as schema from './db/schema.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
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
