import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

const connectionString = process.env.DATABASE_URL ?? "";

export const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
