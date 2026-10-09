
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { db } from "@/lib/mongodb";

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const baseURL =
  process.env.BETTER_AUTH_URL?.trim() ||
  "http://localhost:3000";

const authSecret =
  process.env.BETTER_AUTH_SECRET?.trim();

const googleClientId =
  process.env.GOOGLE_CLIENT_ID?.trim();

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET?.trim();

const githubClientId =
  process.env.GITHUB_CLIENT_ID?.trim();

const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET?.trim();

// ============================================
// VALIDATE OAUTH CREDENTIALS
// ============================================

function hasValidCredentials(
  clientId: string | undefined,
  clientSecret: string | undefined
): clientId is string {
  return Boolean(
    clientId &&
      clientSecret &&
      !clientId.startsWith("YOUR_") &&
      !clientSecret.startsWith("YOUR_")
  );
}

const googleEnabled = hasValidCredentials(
  googleClientId,
  googleClientSecret
);

const githubEnabled = hasValidCredentials(
  githubClientId,
  githubClientSecret
);

// ============================================
// BETTER AUTH CONFIGURATION
// ============================================

export const auth = betterAuth({
  appName: "BazarDor",

  // Application URL
  baseURL,

  // Session encryption/signing secret
  secret: authSecret,

  // ==========================================
  // MONGODB DATABASE
  // ==========================================

  database: mongodbAdapter(db),

  // ==========================================
  // EMAIL AND PASSWORD AUTHENTICATION
  // ==========================================

  emailAndPassword: {
    enabled: true,

    requireEmailVerification: false,

    autoSignIn: false,

    minPasswordLength: 8,
  },

  // ==========================================
  // GOOGLE AND GITHUB OAUTH
  // ==========================================

  socialProviders: {
    ...(googleEnabled
      ? {
          google: {
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
          },
        }
      : {}),

    ...(githubEnabled
      ? {
          github: {
            clientId: githubClientId!,
            clientSecret: githubClientSecret!,

            // Request access to the user's
            // basic profile and email.
            scope: ["read:user", "user:email"],
          },
        }
      : {}),
  },

  // ==========================================
  // TRUSTED ORIGINS
  // ==========================================

  trustedOrigins: [
  "http://localhost:3000",
  "https://bazar-dor-five-phi.vercel.app",
  "https://bazar-ijznw19ew-diprorahman01s-projects.vercel.app",
  "https://bazar-bjetwtmw0-diprorahman01s-projects.vercel.app",
],
});
