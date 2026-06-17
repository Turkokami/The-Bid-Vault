import { PrismaPg } from "@prisma/adapter-pg";
// PrismaClient is generated into src/generated/prisma at build time
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("../src/generated/prisma/index.js");

const connectionString = process.env.DATABASE_URL ?? "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
}) as any;
