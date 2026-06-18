import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, ArrowLeft, Quote, ThumbsUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    name: "Анна Морозова",
    role: "Студентка 4 курса, МГУ",
    avatar: "АМ",
    rating: 5,
    text: "Academix спас меня во время сессии. Курсовая по маркетингу была готова за 15 минут — структурированная, с оглавлением и списком литературы. Преподаватель даже похвалил за глубину анализа!",
    subject: "Экономика",
    date: "12 марта 2025",
  },
  {
    name: "Дмитрий Волков",
    role: "Аспирант, СПбГУ",
    avatar: "ДВ",
    rating: 5,
    text: "Использую для подготовки черновиков научных статей. Отличная база для дальнейшей доработки. Экономит минимум 3-4 часа на каждую работу. Особенно ценю возможность настройки стиля изложения.",
    subject: "Философия",
    date: "28 февраля 2025",
  },
  {
    name: "Екатерина Соколова",
    role: "Студентка магистратуры",
    avatar: "ЕС",
    rating: 5,
    text: "Писала диплом по психологии — генератор выдал 40 страниц качественного текста. Разделы логично связаны между собой, аргументация на высоте. Добавила свои кейсы и получила отлично!",
    subject: "Психология",
    date: "15 января 2025",
  },
  {
    name: "Игорь Петров",
    role: "Инженер-исследователь",
    avatar: "ИП",
    rating: 4,
    text: "Отличный инструмент для быстрого создания аналитических отчетов. Технические термины используются корректно, структура документа соответствует стандартам. Рекомендую коллегам.",
    subject: "Информатика",
    date: "3 марта 2025",
  },
  {
    name: "Мария Кузнецова",
    role: "Студентка 3 курса",
    avatar: "МК",
    rating: 5,
    text: "Не верила, что ИИ может писать научные тексты, но Academix развеяла все сомнения. Реферат по истории получился с конкретными фактами, датами и ссылками на источники. Просто волшебство!",
    subject: "История",
    date: "20 февраля 2025",
  },
  {
    name: "Алексей Новиков",
    role: "Преподаватель университета",
    avatar: "АН",
    rating: 4,
    text: "Рекомендую студентам как стартовую точку для работ. Инструмент генерирует качественные черновики, которые затем можно доработать. Главное — использовать ответственно и дополнять собственным анализом.",
    subject: "Литература",
    date: "8 января 2025",
  },
];

const STATS = [
  { value: "50,000+", label: "Сгенерированных статей" },
  { value: "12,000+", label: "Активных пользователей" },
  { value: "4.8", label: "Средняя оценка" },
  { value: "98%", label: "Довольных клиентов" },
];

export default function Testimonials() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".testimonial-card").forEach((card, i) => {
        gsap.from(card, {
          y: 30,
          opacity: 0,
          duration: 0.5,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F0EA]" ref={sectionRef}>
      {/* Top bar */}
      <div className="border-b border-[#E5E5E5] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1120px] mx-auto px-6 h-14 flex items-center">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-[#8C8C8C] hover:text-black text-sm"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            На главную
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1120px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-full px-4 py-1.5 mb-6">
            <MessageCircle className="w-3.5 h-3.5 text-[#8C8C8C]" />
            <span className="text-xs text-[#8C8C8C]">Отзывы пользователей</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-['Instrument_Serif'] mb-4">
            Что говорят <span className="gradient-text">наши пользователи</span>
          </h1>
          <p className="text-sm text-[#8C8C8C] max-w-[480px] mx-auto mb-12">
            Более 12 000 студентов и исследователей доверяют Academix для
            создания научных работ
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[720px] mx-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white rounded-[10px] p-5 border border-[#E5E5E5]">
                <p className="text-2xl font-['Instrument_Serif'] gradient-text mb-1">
                  {stat.value}
                </p>
                <p className="text-[11px] text-[#8C8C8C]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="pb-24">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="testimonial-card bg-white rounded-[10px] p-6 border border-[#E5E5E5] hover:shadow-lg transition-shadow duration-300"
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`w-3.5 h-3.5 ${
                        j < t.rating
                          ? "fill-[#F2C84F] text-[#F2C84F]"
                          : "text-[#E5E5E5]"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-4">
                  <Quote className="w-6 h-6 text-[#E5E5E5] absolute -top-1 -left-1" />
                  <p className="text-sm leading-relaxed text-black/80 pl-4">
                    {t.text}
                  </p>
                </div>

                {/* Subject tag */}
                <span className="inline-block text-[10px] bg-[#F2F0EA] text-[#8C8C8C] px-2 py-1 rounded-full mb-4">
                  {t.subject}
                </span>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#E5E5E5]">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{t.name}</p>
                    <p className="text-[10px] text-[#8C8C8C]">{t.role}</p>
                  </div>
                  <span className="ml-auto text-[10px] text-[#8C8C8C]">
                    {t.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="bg-white rounded-[14px] p-8 border border-[#E5E5E5]">
            <ThumbsUp className="w-8 h-8 mx-auto mb-4 text-[#F2C84F]" />
            <h2 className="text-2xl font-['Instrument_Serif'] mb-2">
              Присоединяйтесь к нам
            </h2>
            <p className="text-sm text-[#8C8C8C] mb-6">
              Попробуйте Academix бесплатно и оцените все возможности
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="bg-black text-white hover:bg-black/90 rounded-[14px] px-8 h-11"
            >
              Начать бесплатно
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
