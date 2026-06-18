import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { generateArticle, chatWithAI } from "./ai-adapter";
import type { SourceInfo } from "./ai-adapter";
import { getDb } from "./queries/connection";
import { chatMessages, localUsers as localUsersTable } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { verifySessionToken } from "./kimi/session";
import { findLocalUserById } from "./queries/localUsers";
import { TRPCError } from "@trpc/server";

const subjectColorMap: Record<string, string> = {
  "Естественные науки": "#BBDEFB", "Физика": "#BBDEFB", "Химия": "#BBDEFB",
  "Биология": "#BBDEFB", "Математика": "#BBDEFB",
  "Гуманитарные науки": "#F8BBD0", "История": "#F8BBD0", "Философия": "#F8BBD0",
  "Литература": "#F8BBD0", "Лингвистика": "#F8BBD0",
  "Экономика": "#C8E6C9", "Менеджмент": "#C8E6C9", "Маркетинг": "#C8E6C9", "Финансы": "#C8E6C9",
  "Технические науки": "#FFCCBC", "Информатика": "#FFCCBC", "Инженерия": "#FFCCBC", "Медицина": "#FFCCBC",
  "Право": "#D1C4E9", "Психология": "#F0F4C3",
};

function getColorTag(s: string) { return subjectColorMap[s] || "#BBDEFB"; }

function parseSources(content: string): { cleanContent: string; sources: SourceInfo[] } {
  const sources: SourceInfo[] = [];
  const lines = content.split("\n");
  let cleanContent = "";
  let pos = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { cleanContent += "\n"; pos += 1; continue; }

    const match = line.match(/\[source:(\d+)\](.*)/);
    if (match) {
      const num = parseInt(match[1]);
      const text = match[2].trim();
      const start = pos;
      const end = pos + text.length;
      if (!sources[num - 1]) {
        sources[num - 1] = { url: "", title: "", credibility: 80, color: "#BBDEFB", snippetStart: start, snippetEnd: end };
      } else {
        sources[num - 1].snippetEnd = end;
      }
      cleanContent += text + "\n";
      pos += text.length + 1;
    } else if (trimmed.startsWith("## Источники")) {
      const sourceLines = content.slice(content.indexOf(line)).split("\n").slice(1);
      sourceLines.forEach((sl, i) => {
        const urlMatch = sl.match(/(https?:\/\/[^\s)]+)/);
        if (urlMatch && sources[i]) {
          sources[i].url = urlMatch[1];
          sources[i].title = sl.replace(/^\d+\.\s*/, "").replace(urlMatch[1], "").replace(/[\s—-]+$/, "").trim() || urlMatch[1];
        }
      });
      break;
    } else {
      cleanContent += line + "\n";
      pos += line.length + 1;
    }
  }

  return { cleanContent, sources: sources.filter((s) => s.url) };
}

export const aiRouter = createRouter({
  generate: publicQuery
    .input(
      z.object({
        topic: z.string().min(1),
        subject: z.string().min(1),
        articleType: z.string().min(1),
        volume: z.number().min(1).max(100),
        style: z.string().min(1),
        hasTableOfContents: z.boolean().default(false),
        hasBibliography: z.boolean().default(false),
        chatHistory: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
        authToken: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.authToken) {
        try {
          const payload = await verifySessionToken(input.authToken);
          if (payload?.unionId?.startsWith("local:")) {
            const userId = parseInt(payload.unionId.replace("local:", ""));
            const user = await findLocalUserById(userId);
            if (user && user.generationsLeft <= 0) {
              throw new TRPCError({ code: "FORBIDDEN", message: "Лимит генераций исчерпан. Обновите подписку." });
            }
            if (user) {
              await getDb().update(localUsersTable).set({ generationsLeft: user.generationsLeft - 1 }).where(eq(localUsersTable.id, userId));
            }
          }
        } catch { /* ignore */ }
      }

      const result = await generateArticle({
        topic: input.topic, subject: input.subject, articleType: input.articleType,
        volume: input.volume, style: input.style,
        hasTableOfContents: input.hasTableOfContents, hasBibliography: input.hasBibliography,
        chatHistory: input.chatHistory,
      });

      let cleanContent = result.content;
      let parsedSources = result.sources;

      if (result.fromApi && result.content.includes("[source:")) {
        const parsed = parseSources(result.content);
        cleanContent = parsed.cleanContent;
        if (parsed.sources.length > 0) parsedSources = parsed.sources;
      }

      return { content: cleanContent, sources: parsedSources, colorTag: getColorTag(input.subject), fromApi: result.fromApi };
    }),

  chat: publicQuery
    .input(z.object({
      messages: z.array(z.object({ role: z.string(), content: z.string() })),
      authToken: z.string().optional(),
      userId: z.number().optional(),
      authType: z.enum(["oauth", "local"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const content = await chatWithAI(input.messages);
      if (input.userId) {
        try {
          await getDb().insert(chatMessages).values({
            userId: input.userId, authType: input.authType || "oauth", role: "user",
            content: input.messages[input.messages.length - 1]?.content || "",
          });
          await getDb().insert(chatMessages).values({
            userId: input.userId, authType: input.authType || "oauth", role: "assistant", content,
          });
        } catch { /* ignore */ }
      }
      return { content };
    }),

  getChatHistory: publicQuery
    .input(z.object({ userId: z.number(), authType: z.enum(["oauth", "local"]) }))
    .query(async ({ input }) => {
      return getDb().select().from(chatMessages)
        .where(and(eq(chatMessages.userId, input.userId), eq(chatMessages.authType, input.authType)))
        .orderBy(desc(chatMessages.createdAt)).limit(50);
    }),
});
