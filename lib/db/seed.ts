import { db } from './index';
import { users, lawFirms } from './schema';
import { hash } from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  const [firm] = await db.insert(lawFirms).values({
    name: 'Demo Law Firm',
    email: 'admin@example.com',
    locale: 'en',
  }).returning({ id: lawFirms.id });

  const hashedPassword = await hash('password123', 12);

  await db.insert(users).values({
    firmId: firm.id,
    email: 'admin@example.com',
    name: 'John Doe',
    hashedPassword,
    role: 'owner',
    locale: 'en',
  });

  console.log(`Seed complete. Login: admin@example.com / password123`);
}

seed().catch(console.error);
