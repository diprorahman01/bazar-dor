
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is missing from your environment variables."
  );
}

const dbName = process.env.MONGODB_DB || "bazardor";

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
};

function createMongoClient(): MongoClient {
  return new MongoClient(uri!, {
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 60000,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
}

const client: MongoClient =
  globalForMongo._mongoClient ??
  createMongoClient();

const clientPromise: Promise<MongoClient> =
  globalForMongo._mongoClientPromise ??
  client.connect();

globalForMongo._mongoClient = client;
globalForMongo._mongoClientPromise = clientPromise;

export const mongoClient = client;

export const mongoClientPromise = clientPromise;

export const db: Db = client.db(dbName);
