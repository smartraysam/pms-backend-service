import prisma from "../src/lib/prisma";
import bcrypt from "bcrypt";

export async function main() {
  // Step 1: Create Permissions
  await prisma.permission.createMany({
    data: [
      { action: "VIEW" },
      { action: "EDIT" },
      { action: "DELETE" },
      { action: "CREATE" },
    ],
    skipDuplicates: true,
  });

  // Fetch permission IDs
  const viewPermission = await prisma.permission.findFirst({
    where: { action: "VIEW" },
  });
  const editPermission = await prisma.permission.findFirst({
    where: { action: "EDIT" },
  });
  const deletePermission = await prisma.permission.findFirst({
    where: { action: "DELETE" },
  });
  const createPermission = await prisma.permission.findFirst({
    where: { action: "CREATE" },
  });

  // Create roles
  const superManagerRole = await prisma.role.create({
    data: {
      name: "Super Manager",
      permissions: {
        create: [
          { permissionId: viewPermission?.id! },
          { permissionId: editPermission?.id! },
          { permissionId: deletePermission?.id! },
          { permissionId: createPermission?.id! },
        ],
      },
    },
  });

  const locationManagerRole = await prisma.role.create({
    data: {
      name: "Location Manager",
      permissions: {
        create: [{ permissionId: viewPermission?.id! }],
      },
    },
  });

  const operationalManagerRole = await prisma.role.create({
    data: {
      name: "Operational Manager",
      permissions: {
        create: [
          { permissionId: viewPermission?.id! },
          { permissionId: editPermission?.id! },
        ],
      },
    },
  });

  //  Create Users and Assign Roles
  const hashedPassword = await bcrypt.hash("yourPasswordHere", 10);

  await prisma.user.createMany({
    data: [
      {
        email: "super.manager@example.com",
        name: "Super Manager",
        password: hashedPassword,
        phone_number: "1234567890",
        roleId: superManagerRole.id,
      },
      {
        email: "location.manager@example.com",
        name: "Location Manager",
        password: hashedPassword,
        phone_number: "0987654321",
        roleId: locationManagerRole.id,
      },
      {
        email: "operational.manager@example.com",
        name: "Operational Manager",
        password: hashedPassword,
        phone_number: "1122334455",
        roleId: operationalManagerRole.id,
      },
    ],
  });

  // console.log("Seeding completed");

  await prisma.tag.createMany({
    data: new Array(10).fill(null).map((tag, index) => ({
      tagId: `Tag ${index}`,
    })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
