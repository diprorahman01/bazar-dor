
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { db } from "@/lib/mongodb";

// ============================================
// APPLICATION URL
// ============================================

const PRODUCTION_URL =
  "https://bazar-dor-five-phi.vercel.app";

function normalizeURL(value: string | undefined): string {
  const url = value?.trim().replace(/\/+$/, "");

  if (!url) {
    return process.env.NODE_ENV === "production"
      ? PRODUCTION_URL
      : "http://localhost:3000";
  }

  try {
    const parsed = new URL(url);

    if (
      parsed.protocol !== "https:" &&
      parsed.protocol !== "http:"
    ) {
      throw new Error("Unsupported URL protocol");
    }

    return parsed.origin;
  } catch {
    throw new Error(
      "Invalid BETTER_AUTH_URL. Use a complete URL, such as https://bazar-dor-five-phi.vercel.app"
    );
  }
}

const baseURL = normalizeURL(
  process.env.BETTER_AUTH_URL
);

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

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
// OAUTH CREDENTIAL VALIDATION
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
// TRUSTED ORIGINS
// ============================================

const trustedOrigins = [
  "http://localhost:3000",
  PRODUCTION_URL,
  baseURL,

  // Only preview deployments belonging to
  // this specific Vercel project/team.
  "https://*-diprorahman01s-projects.vercel.app",
];

// ============================================
// BETTER AUTH
// ============================================

export const auth = betterAuth({
  appName: "BazarDor",

  baseURL,

  secret: authSecret,

  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
    minPasswordLength: 8,
  },

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
            scope: ["read:user", "user:email"],
          },
        }
      : {}),
  },

  trustedOrigins,
});
