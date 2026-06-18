import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findLocalUserByEmail,
  createLocalUser,
  verifyLocalUserPassword,
  findLocalUserById,
} from "./queries/localUsers";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";
import { TRPCError } from "@trpc/server";

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(2, "Имя должно быть минимум 2 символа"),
        email: z
          .string()
          .email("Некорректный email")
          .min(1, "Email обязателен"),
        password: z
          .string()
          .min(6, "Пароль должен быть минимум 6 символов"),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await findLocalUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Пользователь с таким email уже существует",
        });
      }

      const user = await createLocalUser(input);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ошибка при создании пользователя",
        });
      }

      const token = await signSessionToken({
        unionId: `local:${user.id}`,
        clientId: env.appId,
      });
      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const user = await verifyLocalUserPassword(input.email, input.password);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Неверный email или пароль",
        });
      }

      const token = await signSessionToken({
        unionId: `local:${user.id}`,
        clientId: env.appId,
      });
      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("x-local-auth-token");
    if (!authHeader) return null;

    try {
      const { verifySessionToken } = await import("./kimi/session");
      const payload = await verifySessionToken(authHeader);
      if (!payload || !payload.unionId || !payload.unionId.startsWith("local:")) return null;

      const userId = parseInt(payload.unionId.replace("local:", ""));
      const user = await findLocalUserById(userId);
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: null as string | null,
        role: user.role,
      };
    } catch {
      return null;
    }
  }),
});
