import { getDb } from "./connection";
import { articles } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

type AuthType = "oauth" | "local";

export async function findArticlesByUser(userId: number, authType: AuthType = "oauth") {
  return getDb()
    .select()
    .from(articles)
    .where(and(eq(articles.userId, userId), eq(articles.authType, authType)))
    .orderBy(desc(articles.createdAt));
}

export async function findArticleById(id: number) {
  return getDb()
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .then((rows) => rows[0] || null);
}

export async function createArticle(data: {
  userId: number;
  authType: AuthType;
  title: string;
  subject: string;
  articleType: string;
  volume: number;
  uniqueness: number;
  style: string;
  content: string;
  hasTableOfContents: boolean;
  hasBibliography: boolean;
  colorTag?: string;
}) {
  const [{ id }] = await getDb()
    .insert(articles)
    .values(data)
    .$returningId();
  return findArticleById(id);
}

export async function deleteArticle(id: number) {
  await getDb().delete(articles).where(eq(articles.id, id));
}

export async function updateArticle(
  id: number,
  data: Partial<{
    title: string;
    content: string;
    subject: string;
    articleType: string;
    volume: number;
    uniqueness: number;
    style: string;
    hasTableOfContents: boolean;
    hasBibliography: boolean;
  }>
) {
  await getDb().update(articles).set(data).where(eq(articles.id, id));
  return findArticleById(id);
}
