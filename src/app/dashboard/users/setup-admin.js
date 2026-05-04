const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = "admin@organize.com"; // Você pode mudar isso depois
  const password = "admin123"; // Mude imediatamente após o primeiro login!

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
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
    console.log(`Sucesso! Usuário administrador criado:`);
    console.log(`Email: ${email}`);
    console.log(`Senha: ${password}`);
  } else {
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", licenseStatus: "Ativo" }
    });
    console.log(`Usuário ${email} já existia e foi promovido a ADMIN.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
