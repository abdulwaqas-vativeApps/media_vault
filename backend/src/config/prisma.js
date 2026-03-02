import { PrismaClient } from "@prisma/client";
import env from "./env.js";

const prisma = new PrismaClient({
  datasourceUrl: env.DATABASE_URL,
});

export default prisma;
