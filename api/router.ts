import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { articleRouter } from "./article-router";
import { templateRouter } from "./template-router";
import { aiRouter } from "./ai-router";
import { paymentRouter } from "./payment-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  session: authRouter,
  account: localAuthRouter,
  docs: articleRouter,
  templates: templateRouter,
  brain: aiRouter,
  pay: paymentRouter,
});

export type AppRouter = typeof appRouter;
