import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText,
  Zap,
  Download,
  Shield,
  Sparkles,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-[#E5E5E5]">
      <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="black" strokeWidth="1.5" />
            <text x="20" y="28" fontFamily="serif" fontSize="22" textAnchor="middle" fill="black">
              A
            </text>
          </svg>
          <span className="font-['Instrument_Serif'] text-xl">Academix</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate("/about")} className="text-sm text-[#8C8C8C] hover:text-black transition-colors">
            О проекте
          </button>
          <button onClick={() => navigate("/testimonials")} className="text-sm text-[#8C8C8C] hover:text-black transition-colors">
            Отзывы
          </button>
          <button onClick={() => navigate("/subscriptions")} className="text-sm text-[#8C8C8C] hover:text-black transition-colors">
            Тарифы
          </button>
          <a href="#features" className="text-sm text-[#8C8C8C] hover:text-black transition-colors">
            Преимущества
          </a>
          <a href="#pricing" className="text-sm text-[#8C8C8C] hover:text-black transition-colors">
            Стоимость
          </a>
        </nav>

        <Button
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
          className="bg-black text-white hover:bg-black/90 rounded-[14px] px-5 py-2 text-sm"
        >
          {isAuthenticated ? "Рабочий кабинет" : "Войти"}
        </Button>
      </div>
    </header>
  );
}

function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const leftFloralRef = useRef<HTMLDivElement>(null);
  const rightFloralRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(leftFloralRef.current, {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      gsap.to(rightFloralRef.current, {
        yPercent: -25,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="min-h-screen pt-16 relative overflow-hidden flex items-center"
    >
      {/* Left Floral */}
      <div
        ref={leftFloralRef}
        className="absolute left-0 top-1/4 w-[280px] lg:w-[380px] opacity-90 pointer-events-none"
      >
        <img
          src="/hero-left.png"
          alt=""
          className="w-full h-auto"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>

      {/* Right Floral */}
      <div
        ref={rightFloralRef}
        className="absolute right-0 top-20 w-[280px] lg:w-[380px] opacity-90 pointer-events-none"
      >
        <img
          src="/hero-right.png"
          alt=""
          className="w-full h-auto"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>

      <div className="max-w-[1120px] mx-auto px-6 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl lg:text-[84px] font-['Instrument_Serif'] leading-[1.05] mb-6">
          Генератор научных
          <br />
          <span className="gradient-text">статей с ИИ</span>
        </h1>

        <p className="text-base md:text-lg text-[#8C8C8C] max-w-[540px] mx-auto mb-10 leading-relaxed">
          Создавайте уникальные научные работы в несколько кликов. Выбирайте
          параметры — от темы до стиля изложения.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
            className="bg-black text-white hover:bg-black/90 rounded-[14px] px-8 py-6 text-base font-medium"
          >
            Начать работу
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
          <a
            href="#features"
            className="text-sm text-[#8C8C8C] hover:text-black transition-colors underline underline-offset-4"
          >
            Узнать больше
          </a>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      num: "01",
      title: "Скажите ИИ, что вам нужно",
      desc: "Выберите предмет, тему, объем и тип работы. Настройте все параметры под свои требования.",
      icon: Sparkles,
    },
    {
      num: "02",
      title: "Получите уникальный текст",
      desc: "Нейросеть создаст структурированный текст с научной аргументацией и примерами.",
      icon: FileText,
    },
    {
      num: "03",
      title: "Скачайте готовую работу",
      desc: "Скопируйте текст или выгрузите в Word. Работа готова к сдаче.",
      icon: Download,
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card, i) => {
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-24 md:py-32 bg-white"
    >
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-['Instrument_Serif'] mb-4">
            Как это работает
          </h2>
          <p className="text-[#8C8C8C] text-sm max-w-[400px] mx-auto">
            Три простых шага от идеи до готовой научной статьи
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-0">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card p-8 md:p-10 border-t md:border-t-0 md:border-l border-[#E5E5E5] first:border-l-0 group hover:bg-[#FAFAFA] transition-colors duration-300"
            >
              <span className="gradient-text text-3xl font-['Instrument_Serif'] font-bold mb-6 block">
                {f.num}
              </span>

              <div className="mb-6">
                <f.icon className="w-8 h-8 text-black group-hover:scale-110 transition-transform duration-300" />
              </div>

              <h3 className="text-lg font-medium mb-3">{f.title}</h3>
              <p className="text-sm text-[#8C8C8C] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const benefits = [
    {
      icon: Zap,
      title: "Быстрая генерация",
      desc: "Получите готовую статью за считанные минуты, а не дни.",
    },
    {
      icon: Shield,
      title: "Уникальный контент",
      desc: "Каждый текст создается с нуля специально для вас.",
    },
    {
      icon: BookOpen,
      title: "Академический стиль",
      desc: "Соблюдение всех требований к научным работам.",
    },
    {
      icon: FileText,
      title: "Гибкие настройки",
      desc: "Выбирайте объем, стиль, предметную область и многое другое.",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".benefit-card").forEach((card, i) => {
        gsap.from(card, {
          y: 30,
          opacity: 0,
          duration: 0.5,
          delay: i * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-[#F2F0EA]">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-['Instrument_Serif'] mb-4">
            Преимущества
          </h2>
          <p className="text-[#8C8C8C] text-sm max-w-[400px] mx-auto">
            Всё, что нужно для создания качественных научных работ
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="benefit-card bg-white rounded-[10px] p-6 border border-[#E5E5E5] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-[#F2F0EA] flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-sm font-medium mb-2">{b.title}</h3>
              <p className="text-xs text-[#8C8C8C] leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".pricing-card").forEach((card, i) => {
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-24 md:py-32 bg-white">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-['Instrument_Serif'] mb-4">
            Стоимость
          </h2>
          <p className="text-[#8C8C8C] text-sm max-w-[400px] mx-auto">
            Выберите подходящий тариф для ваших задач
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-[720px] mx-auto">
          {/* Trial */}
          <div className="pricing-card border border-[#E5E5E5] rounded-[10px] p-8">
            <h3 className="text-lg font-medium mb-2">Пробный</h3>
            <p className="text-3xl font-['Instrument_Serif'] mb-6">
              Бесплатно
            </p>
            <ul className="space-y-3 mb-8">
              <li className="text-sm text-[#8C8C8C] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-black" /> 3 генерации
              </li>
              <li className="text-sm text-[#8C8C8C] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-black" /> До 10 страниц
              </li>
              <li className="text-sm text-[#8C8C8C] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-black" /> Базовые шаблоны
              </li>
            </ul>
            <Button
              variant="outline"
              className="w-full rounded-[14px] border-black text-black hover:bg-black hover:text-white"
              onClick={() => navigate("/login")}
            >
              Начать
            </Button>
          </div>

          {/* Unlimited */}
          <div className="pricing-card border-2 border-black rounded-[10px] p-8 relative">
            <div className="absolute -top-3 right-6 bg-black text-white text-xs px-3 py-1 rounded-full">
              Популярный
            </div>
            <h3 className="text-lg font-medium mb-2 gradient-text">Безлимитный</h3>
            <p className="text-3xl font-['Instrument_Serif'] mb-6">
              990 ₽<span className="text-sm text-[#8C8C8C]">/мес</span>
            </p>
            <ul className="space-y-3 mb-8">
              <li className="text-sm text-[#8C8C8C] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-black" /> Безлимитные генерации
              </li>
              <li className="text-sm text-[#8C8C8C] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-black" /> До 100 страниц
              </li>
              <li className="text-sm text-[#8C8C8C] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-black" /> Все шаблоны
              </li>
              <li className="text-sm text-[#8C8C8C] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-black" /> История работ
              </li>
              <li className="text-sm text-[#8C8C8C] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-black" /> Экспорт в Word
              </li>
            </ul>
            <Button
              className="w-full rounded-[14px] bg-black text-white hover:bg-black/90"
              onClick={() => navigate("/login")}
            >
              Подключить
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="py-16 bg-[#F2F0EA] border-t border-[#E5E5E5]">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="black" strokeWidth="1.5" />
              <text x="20" y="28" fontFamily="serif" fontSize="20" textAnchor="middle" fill="black">
                A
              </text>
            </svg>
            <span className="font-['Instrument_Serif'] text-lg">Academix</span>
          </div>

          <div className="flex gap-8 text-sm text-[#8C8C8C]">
            <button onClick={() => navigate("/about")} className="hover:text-black transition-colors">О проекте</button>
            <button onClick={() => navigate("/testimonials")} className="hover:text-black transition-colors">Отзывы</button>
            <button onClick={() => navigate("/subscriptions")} className="hover:text-black transition-colors">Тарифы</button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E5E5E5] text-xs text-[#8C8C8C]">
          © 2025 Academix. Все права защищены.
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="bg-[#F2F0EA] min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
