import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { payments, localUsers } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { verifySessionToken } from "./kimi/session";
import { findLocalUserById } from "./queries/localUsers";

const PLAN_PRICES: Record<string, number> = {
  basic: 490,
  pro: 990,
};

const PLAN_GENERATIONS: Record<string, number> = {
  free: 3,
  basic: 50,
  pro: 9999,
};

export const paymentRouter = createRouter({
  getPlan: publicQuery
    .input(z.object({ authToken: z.string().optional() }))
    .query(async ({ input }) => {
      if (!input.authToken) return { plan: "free", generationsLeft: 3, price: 0 };

      try {
        const payload = await verifySessionToken(input.authToken);
        if (payload?.unionId?.startsWith("local:")) {
          const userId = parseInt(payload.unionId.replace("local:", ""));
          const user = await findLocalUserById(userId);
          if (!user) return { plan: "free", generationsLeft: 3, price: 0 };
          return {
            plan: user.plan,
            generationsLeft: user.generationsLeft,
            price: PLAN_PRICES[user.plan] || 0,
          };
        }
      } catch { /* ignore */ }
      return { plan: "free", generationsLeft: 3, price: 0 };
    }),

  subscribe: publicQuery
    .input(z.object({ authToken: z.string(), plan: z.enum(["basic", "pro"]), method: z.string().default("card") }))
    .mutation(async ({ input }) => {
      const payload = await verifySessionToken(input.authToken);
      if (!payload?.unionId?.startsWith("local:")) {
        throw new Error("Invalid token");
      }
      const userId = parseInt(payload.unionId.replace("local:", ""));
      const user = await findLocalUserById(userId);
      if (!user) throw new Error("User not found");

      const amount = PLAN_PRICES[input.plan];

      // Create payment record
      await getDb().insert(payments).values({
        userId,
        authType: "local",
        amount: String(amount),
        plan: input.plan,
        status: "completed",
        method: input.method,
      });

      // Update user plan
      await getDb()
        .update(localUsers)
        .set({
          plan: input.plan,
          generationsLeft: PLAN_GENERATIONS[input.plan],
        })
        .where(eq(localUsers.id, userId));

      return { success: true, plan: input.plan, generationsLeft: PLAN_GENERATIONS[input.plan] };
    }),

  getHistory: publicQuery
    .input(z.object({ authToken: z.string() }))
    .query(async ({ input }) => {
      try {
        const payload = await verifySessionToken(input.authToken);
        if (!payload?.unionId?.startsWith("local:")) return [];
        const userId = parseInt(payload.unionId.replace("local:", ""));
        return getDb()
          .select()
          .from(payments)
          .where(and(eq(payments.userId, userId), eq(payments.authType, "local")))
          .orderBy(desc(payments.createdAt));
      } catch { return []; }
    }),
});
