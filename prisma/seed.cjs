// prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. Create or update a default college
  const college = await prisma.college.upsert({
    where: { code: 'TESTCOL' },
    update: {},
    create: {
      name: 'Test University',
      code: 'TESTCOL',
    },
  });

  // 2. Hash a default password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Create or update a default host user
  await prisma.user.upsert({
    where: { email: 'host@test.com' },
    update: {},
    create: {
      name: 'Test Host',
      email: 'host@test.com',
      passwordHash: hashedPassword,
      role: 'HOST',
      collegeId: college.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Email: host@test.com');
  console.log('🔑 Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });