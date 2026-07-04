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
  trustedOrigins: process.env.VITE_APP_URL ? [process.env.VITE_APP_URL, 'http://localhost:5173'] : ['http://localhost:5173'],
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
