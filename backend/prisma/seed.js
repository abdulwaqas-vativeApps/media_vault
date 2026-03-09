import prisma from "../src/config/prisma.js";

async function main() {
  console.log("Seeding default roles...");

  // Default roles
  const roles = ["Admin", "Member"];

  for (const name of roles) {
    await prisma.roles.upsert({
      where: { name },   // check if role already exists
      update: {},        // if exists, do nothing
      create: { name },  // if not, create new
    });
  }

  console.log("Default roles seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });