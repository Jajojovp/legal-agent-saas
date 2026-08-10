import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, lawFirms } from '@/lib/db/schema';
import { hash } from 'bcryptjs';
import { registerSchema } from '@/lib/auth/registration';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, firmName } = parsed.data;

    const hashedPassword = await hash(password, 12);
    const user = await db.transaction(async (tx: any) => {
      const existing: any[] = await tx.query.users.findMany({
        where: (users: any, { eq }: any) => eq(users.email, email),
        limit: 1,
      });

      if (existing.length > 0) {
        throw new Error('EmailAlreadyInUse');
      }

      const [firm] = await tx
        .insert(lawFirms)
        .values({ name: firmName, email })
        .returning({ id: lawFirms.id });

      const [createdUser] = await tx
        .insert(users)
        .values({
          name,
          email,
          hashedPassword,
          firmId: firm.id,
          role: 'owner',
        })
        .returning({ id: users.id, email: users.email, name: users.name });

      return createdUser;
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'EmailAlreadyInUse') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
