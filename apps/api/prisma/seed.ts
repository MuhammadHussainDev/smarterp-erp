import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const existingTenant = await prisma.tenant.findFirst();
  if (existingTenant) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  const passwordHash = await argon2.hash("admin123");

  const tenant = await prisma.tenant.create({
    data: {
      name: "Acme Corp",
      slug: "acme",
      currency: "USD",
      timezone: "UTC",
      status: "ACTIVE",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: "admin@smarterp.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: "Admin",
      description: "Full system access",
      isSystem: true,
    },
  });

  await prisma.userRole.create({
    data: { userId: adminUser.id, roleId: adminRole.id },
  });

  await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: "Manager",
      description: "Department management access",
      isSystem: true,
    },
  });

  await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: "Employee",
      description: "Basic employee access",
      isSystem: true,
    },
  });

  await prisma.branch.create({
    data: { tenantId: tenant.id, name: "Head Office", isActive: true },
  });

  await prisma.department.create({
    data: { tenantId: tenant.id, name: "General", isActive: true },
  });

  const accountTypes = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];
  for (const type of accountTypes) {
    await prisma.account.create({
      data: {
        tenantId: tenant.id,
        code: type === "ASSET" ? "1000" : type === "LIABILITY" ? "2000" : type === "EQUITY" ? "3000" : type === "REVENUE" ? "4000" : "5000",
        name: `${type.charAt(0) + type.slice(1).toLowerCase()}s`,
        type,
        isActive: true,
      },
    });
  }

  await prisma.category.create({
    data: { tenantId: tenant.id, name: "General", isActive: true },
  });

  await prisma.brand.create({
    data: { tenantId: tenant.id, name: "Default", isActive: true },
  });

  await prisma.unit.create({
    data: { tenantId: tenant.id, name: "Piece", abbreviation: "pc" },
  });

  await prisma.leaveType.create({
    data: { tenantId: tenant.id, name: "Annual Leave", daysAllowed: 20 },
  });

  console.log("Database seeded successfully!");
  console.log(`Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`Admin: admin@smarterp.com / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
