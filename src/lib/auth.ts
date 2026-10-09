
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { db } from "@/lib/mongodb";

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const isProduction = process.env.NODE_ENV === "production";

const baseURL = (
  process.env.BETTER_AUTH_URL ||
  (isProduction
    ? "https://bazar-dor-phi.vercel.app"
    : "http://localhost:3000")
).trim().replace(/\/+$/, "");

const authSecret = process.env.BETTER_AUTH_SECRET?.trim();

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

const githubClientId = process.env.GITHUB_CLIENT_ID?.trim();
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

// ============================================
// VALIDATE BETTER AUTH SECRET
// ============================================

if (!authSecret || authSecret.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET is missing or too short. " +
    "Set a secure secret of at least 32 characters " +
    "in your environment variables."
  );
}

// ============================================
// VALIDATE OAUTH CREDENTIALS
// ============================================

function hasValidCredentials(
  clientId: string | undefined,
  clientSecret: string | undefined
): boolean {
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

  // ==========================================
  // APPLICATION CONFIGURATION
  // ==========================================

  baseURL,

  secret: authSecret,

  trustedOrigins: [
    "http://localhost:3000",
    "https://bazar-dor-phi.vercel.app",
    baseURL,
  ],

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
    ...(googleEnabled && googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {}),

    ...(githubEnabled && githubClientId && githubClientSecret
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            scope: ["read:user", "user:email"],
          },
        }
      : {}),
  },
});
