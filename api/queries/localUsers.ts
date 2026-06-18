import { getDb } from "./connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function findLocalUserByEmail(email: string) {
  return getDb()
    .select()
    .from(localUsers)
    .where(eq(localUsers.email, email))
    .then((rows) => rows[0] || null);
}

export async function findLocalUserById(id: number) {
  return getDb()
    .select()
    .from(localUsers)
    .where(eq(localUsers.id, id))
    .then((rows) => rows[0] || null);
}

export async function createLocalUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const [{ id }] = await getDb()
    .insert(localUsers)
    .values({
      email: data.email,
      passwordHash,
      name: data.name,
    })
    .$returningId();
  return findLocalUserById(id);
}

export async function verifyLocalUserPassword(
  email: string,
  password: string
): Promise<typeof localUsers.$inferSelect | null> {
  const user = await findLocalUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  // Update last sign in
  await getDb()
    .update(localUsers)
    .set({ lastSignInAt: new Date() })
    .where(eq(localUsers.id, user.id));

  return user;
}

export async function updateLocalUserPassword(
  userId: number,
  newPassword: string
) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await getDb()
    .update(localUsers)
    .set({ passwordHash })
    .where(eq(localUsers.id, userId));
}
