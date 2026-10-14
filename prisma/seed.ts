const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({ where: { email: "admin@organize" } });

  const email = "admin@organize.com";
  const password = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password,
      role: "ADMIN",
      licenseStatus: "Ativo",
    },
    create: {
      email,
      password,
      name: "Administrador",
      companyName: "Organize App",
      role: "ADMIN",
      licenseStatus: "Ativo",
    },
  });

  console.log(`Usuário criado/atualizado: ${user.email} (Senha: admin123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
