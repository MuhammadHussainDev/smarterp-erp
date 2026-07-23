import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Seed roles
  await prisma.role.createMany({
    data: [
      { name: "admin" },
      { name: "manager" },
      { name: "staff" },
    ],
  });

  // Seed users
  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
  const staffRole = await prisma.role.findUnique({ where: { name: "staff" } });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", name: "Admin User", roleId: adminRole!.id },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {},
    create: { email: "staff@example.com", name: "Staff User", roleId: staffRole!.id },
  });

  // Seed accounts
  const assetAccount = await prisma.account.upsert({
    where: { code: "1000" },
    update: {},
    create: { code: "1000", name: "Cash", type: "ASSET" },
  });

  const revenueAccount = await prisma.account.upsert({
    where: { code: "4000" },
    update: {},
    create: { code: "4000", name: "Sales Revenue", type: "REVENUE" },
  });

  const expenseAccount = await prisma.account.upsert({
    where: { code: "5000" },
    update: {},
    create: { code: "5000", name: "Cost of Goods Sold", type: "EXPENSE" },
  });

  const inventoryAccount = await prisma.account.upsert({
    where: { code: "1200" },
    update: {},
    create: { code: "1200", name: "Inventory", type: "ASSET" },
  });

  // Seed customers
  const customer1 = await prisma.customer.upsert({
    where: { email: "acme@example.com" },
    update: {},
    create: { name: "Acme Corp", email: "acme@example.com", phone: "555-0100", balance: 0 },
  });
  const customer2 = await prisma.customer.upsert({
    where: { email: "globex@example.com" },
    update: {},
    create: { name: "Globex Inc", email: "globex@example.com", phone: "555-0200", balance: 0 },
  });

  // Seed vendors
  const vendor1 = await prisma.vendor.upsert({
    where: { code: "V-001" },
    update: {},
    create: { code: "V-001", name: "Initech Supplies", email: "sales@initech.com", phone: "555-0300" },
  });
  const vendor2 = await prisma.vendor.upsert({
    where: { code: "V-002" },
    update: {},
    create: { code: "V-002", name: "Umbrella Corp", email: "orders@umbrella.com", phone: "555-0400" },
  });

  // Seed warehouses
  const warehouse1 = await prisma.warehouse.upsert({
    where: { code: "WH-01" },
    update: {},
    create: { code: "WH-01", name: "Main Warehouse" },
  });

  // Seed products
  const product1 = await prisma.product.upsert({
    where: { sku: "PROD-001" },
    update: {},
    create: {
      sku: "PROD-001", name: "Widget A", price: 25.00, cost: 12.00,
      quantityOnHand: 150, reorderLevel: 20, inventoryAccountId: inventoryAccount.id, revenueAccountId: revenueAccount.id,
    },
  });
  const product2 = await prisma.product.upsert({
    where: { sku: "PROD-002" },
    update: {},
    create: {
      sku: "PROD-002", name: "Gadget B", price: 50.00, cost: 30.00,
      quantityOnHand: 80, reorderLevel: 10, inventoryAccountId: inventoryAccount.id, revenueAccountId: revenueAccount.id,
    },
  });
  const product3 = await prisma.product.upsert({
    where: { sku: "PROD-003" },
    update: {},
    create: {
      sku: "PROD-003", name: "Component C", price: 100.00, cost: 60.00,
      quantityOnHand: 5, reorderLevel: 10, inventoryAccountId: inventoryAccount.id, revenueAccountId: revenueAccount.id,
    },
  });

  // Seed inventory transactions
  await prisma.inventoryTransaction.createMany({
    data: [
      { productId: product1.id, warehouseId: warehouse1.id, quantity: 200, type: "PURCHASE", reference: "PO-001" },
      { productId: product1.id, warehouseId: warehouse1.id, quantity: -50, type: "SALE", reference: "SO-001" },
      { productId: product2.id, warehouseId: warehouse1.id, quantity: 100, type: "PURCHASE", reference: "PO-002" },
    ],
  });

  // Seed leads
  await prisma.lead.createMany({
    data: [
      { contactName: "Alice Johnson", companyName: "TechStart Inc", email: "alice@techstart.com", phone: "555-1001", source: "Web", status: "NEW" },
      { contactName: "Bob Williams", companyName: "Global Solutions", email: "bob@globalsolutions.com", phone: "555-1002", source: "Referral", status: "CONTACTED" },
      { contactName: "Carol Davis", companyName: "Innovate Ltd", email: "carol@innovate.com", phone: "555-1003", source: "Ad", status: "QUALIFIED" },
      { contactName: "David Brown", companyName: "Future Corp", email: "david@future.com", phone: "555-1004", source: "Web", status: "PROPOSAL" },
      { contactName: "Eva Martinez", companyName: "Pioneer Systems", email: "eva@pioneer.com", phone: "555-1005", source: "Event", status: "LOST" },
    ],
  });

  // Seed sales orders
  const order1 = await prisma.salesOrder.create({
    data: {
      orderNumber: "SO-1001",
      customerId: customer1.id,
      userId: staff.id,
      status: "CONFIRMED",
      issueDate: new Date("2025-01-15"),
      dueDate: new Date("2025-02-15"),
      subtotal: 250.00,
      tax: 25.00,
      total: 275.00,
      items: {
        create: [
          { productId: product1.id, quantity: 10, unitPrice: 25.00, accountId: revenueAccount.id },
        ],
      },
    },
  });

  const order2 = await prisma.salesOrder.create({
    data: {
      orderNumber: "SO-1002",
      customerId: customer2.id,
      userId: staff.id,
      status: "DRAFT",
      issueDate: new Date("2025-01-20"),
      dueDate: new Date("2025-02-20"),
      subtotal: 200.00,
      tax: 20.00,
      total: 220.00,
      items: {
        create: [
          { productId: product2.id, quantity: 4, unitPrice: 50.00, accountId: revenueAccount.id },
        ],
      },
    },
  });

  await prisma.salesOrderItem.update({
    where: { id: order1.items[0].id },
    data: { accountId: revenueAccount.id },
  });
  await prisma.salesOrderItem.update({
    where: { id: order2.items[0].id },
    data: { accountId: revenueAccount.id },
  });

  // Seed purchase orders
  const purchase1 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-1001",
      vendorId: vendor1.id,
      userId: staff.id,
      status: "RECEIVED",
      orderDate: new Date("2025-01-10"),
      subtotal: 600.00,
      tax: 60.00,
      total: 660.00,
      items: {
        create: [
          { productId: product1.id, quantity: 50, unitCost: 12.00, accountId: expenseAccount.id },
        ],
      },
    },
  });

  const purchase2 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-1002",
      vendorId: vendor2.id,
      userId: staff.id,
      status: "SUBMITTED",
      orderDate: new Date("2025-01-25"),
      subtotal: 1800.00,
      tax: 180.00,
      total: 1980.00,
      items: {
        create: [
          { productId: product2.id, quantity: 60, unitCost: 30.00, accountId: expenseAccount.id },
        ],
      },
    },
  });

  await prisma.purchaseOrderItem.update({
    where: { id: purchase1.items[0].id },
    data: { accountId: expenseAccount.id },
  });
  await prisma.purchaseOrderItem.update({
    where: { id: purchase2.items[0].id },
    data: { accountId: expenseAccount.id },
  });

  // Seed journal entries
  await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-1001",
      date: new Date("2025-01-01"),
      memo: "Opening balance",
      userId: admin.id,
      lines: {
        create: [
          { accountId: assetAccount.id, debit: 10000, credit: 0 },
          { accountId: revenueAccount.id, debit: 0, credit: 10000 },
        ],
      },
    },
  });

  await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-1002",
      date: new Date("2025-01-15"),
      memo: "Inventory purchase",
      userId: staff.id,
      lines: {
        create: [
          { accountId: inventoryAccount.id, debit: 600, credit: 0 },
          { accountId: assetAccount.id, debit: 0, credit: 600 },
        ],
      },
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
