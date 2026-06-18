import { useState as _useState } from "react"; // eslint-disable-line
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Sparkles, Zap, Crown, Check, Loader2,
  FileText, Infinity, Shield, BookOpen,
} from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Пробный",
    price: 0,
    period: "",
    icon: Sparkles,
    features: ["3 генерации", "До 10 страниц", "Базовые шаблоны", "Экспорт в TXT"],
    notIncluded: ["История чатов", "Источники", "Экспорт DOCX/PDF", "Приоритетная генерация"],
    highlight: false,
  },
  {
    id: "basic",
    name: "Базовый",
    price: 490,
    period: "/мес",
    icon: Zap,
    features: ["50 генераций", "До 50 страниц", "Все шаблоны", "История работ", "Экспорт DOCX, MD, HTML", "Источники с подсветкой"],
    notIncluded: ["Приоритетная генерация", "API доступ"],
    highlight: false,
  },
  {
    id: "pro",
    name: "Профессиональный",
    price: 990,
    period: "/мес",
    icon: Crown,
    features: ["Безлимитные генерации", "До 100 страниц", "Все шаблоны", "Полная история", "Все форматы экспорта", "Источники + авторитетность", "Приоритетная генерация", "API доступ"],
    notIncluded: [],
    highlight: true,
  },
];

export default function Subscriptions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const localToken = localStorage.getItem("local_auth_token") || "";

  const { data: planData } = trpc.pay.getPlan.useQuery(
    { authToken: user?.authType === "local" ? localToken : undefined },
    { enabled: !!user }
  );

  const subscribeMutation = trpc.pay.subscribe.useMutation({
    onSuccess: () => {
      alert("Подписка оформлена!");
      window.location.reload();
    },
    onError: (err) => alert("Ошибка: " + err.message),
  });

  const currentPlan = planData?.plan || "free";

  return (
    <div className="min-h-screen bg-[#F2F0EA]">
      <div className="border-b border-[#E5E5E5] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1120px] mx-auto px-6 h-14 flex items-center">
          <Button onClick={() => navigate("/dashboard")} variant="ghost" className="text-[#8C8C8C] hover:text-black text-sm">
            <ArrowLeft className="mr-2 w-4 h-4" /> Кабинет
          </Button>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-['Instrument_Serif'] mb-3">
            Выберите <span className="gradient-text">план</span>
          </h1>
          <p className="text-sm text-[#8C8C8C] max-w-[400px] mx-auto">
            Гибкие тарифы для любых задач — от студенческих рефератов до серьёзных исследований
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-[14px] border p-6 ${plan.highlight ? "border-black border-2" : "border-[#E5E5E5]"} ${currentPlan === plan.id ? "ring-2 ring-[#F2C84F]" : ""}`}>
              {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-3 py-1 rounded-full">Популярный</div>}
              {currentPlan === plan.id && <div className="absolute -top-3 right-4 bg-[#F2C84F] text-black text-[10px] px-3 py-1 rounded-full font-medium">Текущий</div>}

              <div className="flex items-center gap-2 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlight ? "bg-black text-white" : "bg-[#F2F0EA] text-[#8C8C8C]"}`}>
                  <plan.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">{plan.name}</h3>
                  <p className="text-xs text-[#8C8C8C]">{plan.id === "free" ? "Навсегда" : plan.period}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-['Instrument_Serif']">{plan.price === 0 ? "Бесплатно" : `${plan.price} ₽`}</span>
                {plan.period && <span className="text-sm text-[#8C8C8C]">{plan.period}</span>}
              </div>

              <div className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#8C8C8C]">
                    <div className="w-3.5 h-3.5 rounded-full border border-[#E5E5E5] flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  if (plan.id === "free") return;
                  if (user?.authType === "local") {
                    subscribeMutation.mutate({ authToken: localToken, plan: plan.id as "basic" | "pro", method: "card" });
                  } else {
                    alert("Для оформления подписки войдите через email/пароль");
                  }
                }}
                disabled={currentPlan === plan.id || plan.id === "free" || subscribeMutation.isPending}
                className={`w-full h-10 rounded-xl text-sm ${plan.highlight ? "bg-black text-white hover:bg-black/90" : "border-[#E5E5E5] hover:bg-[#F2F0EA]"}`}
                variant={plan.highlight ? "default" : "outline"}
              >
                {subscribeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> :
                  currentPlan === plan.id ? "Активен" : plan.id === "free" ? "Бесплатно" : "Подключить"}
              </Button>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-[14px] border border-[#E5E5E5] p-8">
          <h2 className="text-xl font-['Instrument_Serif'] mb-6 text-center">Что включено во все планы</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: "Академическое качество", desc: "Тексты соответствуют стандартам ГОСТ" },
              { icon: Infinity, title: "AI-ассистент 24/7", desc: "Чат для обсуждения и доработки" },
              { icon: Shield, title: "Уникальный контент", desc: "Каждый текст создаётся индивидуально" },
              { icon: BookOpen, title: "Множество форматов", desc: "DOCX, MD, HTML, TXT, PDF" },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-[#F2F0EA] flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-5 h-5 text-[#8C8C8C]" />
                </div>
                <h3 className="text-xs font-medium mb-1">{f.title}</h3>
                <p className="text-[10px] text-[#8C8C8C]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
