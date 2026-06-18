import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { articles, articleSources } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { verifySessionToken } from "./kimi/session";
import { findLocalUserById } from "./queries/localUsers";

type AuthType = "oauth" | "local";

async function getUserIdFromToken(token: string): Promise<{ userId: number; authType: AuthType } | null> {
  try {
    const payload = await verifySessionToken(token);
    if (!payload?.unionId) return null;
    if (payload.unionId.startsWith("local:")) {
      const userId = parseInt(payload.unionId.replace("local:", ""));
      const user = await findLocalUserById(userId);
      if (!user) return null;
      return { userId, authType: "local" };
    }
    return null;
  } catch { return null; }
}

export const articleRouter = createRouter({
  list: authedQuery.query(({ ctx }) =>
    getDb().select().from(articles)
      .where(and(eq(articles.userId, ctx.user.id), eq(articles.authType, "oauth")))
      .orderBy(desc(articles.createdAt)),
  ),

  listLocal: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const auth = await getUserIdFromToken(input.token);
      if (!auth) return [];
      return getDb().select().from(articles)
        .where(and(eq(articles.userId, auth.userId), eq(articles.authType, "local")))
        .orderBy(desc(articles.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const article = await getDb().select().from(articles).where(eq(articles.id, input.id)).then((r) => r[0] || null);
      if (!article) return null;
      const sources = await getDb().select().from(articleSources).where(eq(articleSources.articleId, input.id));
      return { ...article, sources };
    }),

  create: authedQuery
    .input(z.object({
      title: z.string().min(1), subject: z.string().min(1), articleType: z.string().min(1),
      volume: z.number().min(1).max(100), uniqueness: z.number().min(70).max(100),
      style: z.string().min(1), content: z.string().min(1),
      hasTableOfContents: z.boolean().default(false), hasBibliography: z.boolean().default(false),
      colorTag: z.string().optional(), sources: z.array(z.object({
        url: z.string(), title: z.string(), credibility: z.number().default(80),
        color: z.string(), snippetStart: z.number().default(0), snippetEnd: z.number().default(0),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { sources, ...articleData } = input;
      const [{ id }] = await getDb().insert(articles).values({
        ...articleData, userId: ctx.user.id, authType: "oauth",
        colorTag: input.colorTag || "#BBDEFB",
      }).$returningId();

      if (sources?.length) {
        await getDb().insert(articleSources).values(sources.map((s) => ({ ...s, articleId: id })));
      }
      return getDb().select().from(articles).where(eq(articles.id, id)).then((r) => r[0]);
    }),

  createLocal: publicQuery
    .input(z.object({
      token: z.string(), title: z.string().min(1), subject: z.string().min(1),
      articleType: z.string().min(1), volume: z.number().min(1).max(100),
      uniqueness: z.number().min(70).max(100), style: z.string().min(1),
      content: z.string().min(1), hasTableOfContents: z.boolean().default(false),
      hasBibliography: z.boolean().default(false), colorTag: z.string().optional(),
      sources: z.array(z.object({
        url: z.string(), title: z.string(), credibility: z.number().default(80),
        color: z.string(), snippetStart: z.number().default(0), snippetEnd: z.number().default(0),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const { token, sources, ...data } = input;
      const auth = await getUserIdFromToken(token);
      if (!auth) throw new Error("Invalid token");

      const [{ id }] = await getDb().insert(articles).values({
        ...data, userId: auth.userId, authType: "local",
        colorTag: data.colorTag || "#BBDEFB",
      }).$returningId();

      if (sources?.length) {
        await getDb().insert(articleSources).values(sources.map((s) => ({ ...s, articleId: id })));
      }
      return getDb().select().from(articles).where(eq(articles.id, id)).then((r) => r[0]);
    }),

  updateContent: publicQuery
    .input(z.object({ id: z.number(), content: z.string() }))
    .mutation(async ({ input }) => {
      await getDb().update(articles).set({ editedContent: input.content }).where(eq(articles.id, input.id));
      return getDb().select().from(articles).where(eq(articles.id, input.id)).then((r) => r[0] || null);
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(articleSources).where(eq(articleSources.articleId, input.id));
      await getDb().delete(articles).where(eq(articles.id, input.id));
    }),
});
