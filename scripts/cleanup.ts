import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');

  // Delete in order (respect foreign keys)
  await prisma.termsAcceptance.deleteMany();
  await prisma.termsVersion.deleteMany();
  await prisma.adminAssistantMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.eventNews.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log('All users and content deleted.');
  console.log('Database is clean. Run `npm run db:seed` to add fresh data.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
