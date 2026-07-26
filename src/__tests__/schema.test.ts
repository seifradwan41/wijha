import { prisma } from '@/lib/prisma';

describe('Database connectivity', () => {
  it('should connect to the database', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toBeDefined();
  });

  it('should have User table accessible', async () => {
    const count = await prisma.user.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should have Course table accessible', async () => {
    const count = await prisma.course.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should have EventNews table accessible', async () => {
    const count = await prisma.eventNews.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should have Category table accessible', async () => {
    const count = await prisma.category.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

describe('Seed data verification', () => {
  it('should have seeded teacher accounts', async () => {
    const teachers = await prisma.user.findMany({ where: { role: 'teacher' } });
    expect(teachers.length).toBeGreaterThanOrEqual(4);
  });

  it('should have seeded admin account', async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    expect(admin).not.toBeNull();
    expect(admin?.name).toBe('Admin User');
  });

  it('should have seeded courses', async () => {
    const courses = await prisma.course.findMany();
    expect(courses.length).toBeGreaterThanOrEqual(7);
  });

  it('should have seeded categories', async () => {
    const categories = await prisma.category.findMany();
    expect(categories.length).toBeGreaterThanOrEqual(3);
  });

  it('should have hashed passwords (not plaintext)', async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    const passwordField = admin as unknown as { password?: string };
    expect(passwordField.password).toBeDefined();
    expect(passwordField.password).not.toBe('password123');
    expect(passwordField.password?.length).toBeGreaterThan(20);
  });
});
