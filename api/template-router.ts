import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  findDefaultTemplates,
  findAllTemplatesForUser,
  findTemplateById,
  createTemplate,
  deleteTemplate,
  updateTemplate,
} from "./queries/templates";

export const templateRouter = createRouter({
  list: authedQuery.query(({ ctx }) =>
    findAllTemplatesForUser(ctx.user.id)
  ),

  listDefaults: publicQuery.query(() => findDefaultTemplates()),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => findTemplateById(input.id)),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        subject: z.string().min(1, "Subject is required"),
        articleType: z.string().min(1, "Article type is required"),
        volume: z.number().min(1).max(100),
        uniqueness: z.number().min(70).max(100),
        style: z.string().min(1, "Style is required"),
        hasTableOfContents: z.boolean().default(false),
        hasBibliography: z.boolean().default(false),
      })
    )
    .mutation(({ ctx, input }) =>
      createTemplate({
        ...input,
        userId: ctx.user.id,
        isDefault: false,
      })
    ),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        subject: z.string().optional(),
        articleType: z.string().optional(),
        volume: z.number().optional(),
        uniqueness: z.number().optional(),
        style: z.string().optional(),
        hasTableOfContents: z.boolean().optional(),
        hasBibliography: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateTemplate(id, data);
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteTemplate(input.id)),
});
