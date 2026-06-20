import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { sendResetPasswordEmail } from "./email";

const prisma = new PrismaClient();

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://booking-app-peach-one.vercel.app";

export const auth = betterAuth({
  baseURL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable in production
    sendResetPassword: async ({ user, url }) => {
      // Ensure the URL uses the correct domain
      const correctedUrl = url.replace(/http:\/\/localhost:\d+/, baseURL);
      await sendResetPasswordEmail({
        to: user.email,
        resetUrl: correctedUrl,
        userName: user.name || "User",
      });
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [],
  basePath: "/api/auth",
});

export type Session = typeof auth.$Infer.Session;
