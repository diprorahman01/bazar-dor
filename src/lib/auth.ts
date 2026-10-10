
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { db } from "@/lib/mongodb";

const LOCAL_URL = "http://localhost:3000";

const PRODUCTION_URL =
  "https://bazar-dor-five-phi.vercel.app";

function getBaseURL(): string {
  const configuredURL =
    process.env.BETTER_AUTH_URL?.trim();

  if (!configuredURL) {
    return process.env.NODE_ENV === "production"
      ? PRODUCTION_URL
      : LOCAL_URL;
  }

  const parsed = new URL(configuredURL);

  if (
    parsed.protocol !== "http:" &&
    parsed.protocol !== "https:"
  ) {
    throw new Error(
      "BETTER_AUTH_URL must use HTTP or HTTPS."
    );
  }

  return parsed.origin;
}

const baseURL = getBaseURL();

const secret = process.env.BETTER_AUTH_SECRET;

if (!secret || secret.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET must contain at least 32 characters."
  );
}

const googleClientId =
  process.env.GOOGLE_CLIENT_ID?.trim();

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET?.trim();

const githubClientId =
  process.env.GITHUB_CLIENT_ID?.trim();

const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET?.trim();

const googleConfigured =
  Boolean(googleClientId && googleClientSecret);

const githubConfigured =
  Boolean(githubClientId && githubClientSecret);

if (!googleConfigured) {
  console.warn(
    "[Better Auth] Google OAuth credentials are missing."
  );
}

if (!githubConfigured) {
  console.warn(
    "[Better Auth] GitHub OAuth credentials are missing."
  );
}

export const auth = betterAuth({
  appName: "BazarDor",

  baseURL,

  secret,

  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
    minPasswordLength: 8,
  },

  socialProviders: {
    ...(googleConfigured
      ? {
          google: {
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
          },
        }
      : {}),

    ...(githubConfigured
      ? {
          github: {
            clientId: githubClientId!,
            clientSecret: githubClientSecret!,
            scope: ["read:user", "user:email"],
          },
        }
      : {}),
  },

  trustedOrigins: [
    LOCAL_URL,
    PRODUCTION_URL,
    baseURL,
  ],
});
