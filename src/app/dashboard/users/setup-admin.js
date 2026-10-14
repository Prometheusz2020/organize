const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = "admin@organize.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Administrador",
        companyName: "Organize App",
        role: "ADMIN",
        licenseStatus: "Ativo"
      }
    });
    console.log(`Sucesso! Usuário administrador criado: ${email}`);
  } else {
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: "ADMIN",
        licenseStatus: "Ativo"
      }
    });
    console.log(`Usuário ${email} atualizado com senha resetada para ${password}.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
