import { getDb } from "./connection";
import { articleTemplates } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function findTemplatesByUser(userId: number) {
  return getDb()
    .select()
    .from(articleTemplates)
    .where(
      and(
        eq(articleTemplates.userId, userId),
        eq(articleTemplates.isDefault, false)
      )
    )
    .orderBy(desc(articleTemplates.createdAt));
}

export async function findDefaultTemplates() {
  return getDb()
    .select()
    .from(articleTemplates)
    .where(eq(articleTemplates.isDefault, true))
    .orderBy(desc(articleTemplates.createdAt));
}

export async function findAllTemplatesForUser(userId: number) {
  const userTemplates = await findTemplatesByUser(userId);
  const defaults = await findDefaultTemplates();
  return [...defaults, ...userTemplates];
}

export async function findTemplateById(id: number) {
  return getDb()
    .select()
    .from(articleTemplates)
    .where(eq(articleTemplates.id, id))
    .then((rows) => rows[0] || null);
}

export async function createTemplate(data: {
  userId: number;
  name: string;
  subject: string;
  articleType: string;
  volume: number;
  uniqueness: number;
  style: string;
  hasTableOfContents: boolean;
  hasBibliography: boolean;
  isDefault?: boolean;
}) {
  const [{ id }] = await getDb()
    .insert(articleTemplates)
    .values(data)
    .$returningId();
  return findTemplateById(id);
}

export async function deleteTemplate(id: number) {
  await getDb().delete(articleTemplates).where(eq(articleTemplates.id, id));
}

export async function updateTemplate(
  id: number,
  data: Partial<{
    name: string;
    subject: string;
    articleType: string;
    volume: number;
    uniqueness: number;
    style: string;
    hasTableOfContents: boolean;
    hasBibliography: boolean;
  }>
) {
  await getDb()
    .update(articleTemplates)
    .set(data)
    .where(eq(articleTemplates.id, id));
  return findTemplateById(id);
}
