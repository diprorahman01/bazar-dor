import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is missing from your environment variables."
  );
}

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
};

const client =
  globalForMongo._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClient = client;
}

export const mongoClient = client;

export const db = client.db(
  process.env.MONGODB_DB || "bazardor"
);

