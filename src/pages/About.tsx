import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Target,
  Users,
  Zap,
  Shield,
  Sparkles,
  BookOpen,
  Code2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-генерация",
    desc: "Используем передовые языковые модели для создания качественного академического контента. Каждая статья генерируется индивидуально под ваши требования.",
  },
  {
    icon: BookOpen,
    title: "Академическая строгость",
    desc: "Тексты соответствуют стандартам оформления научных работ: правильная структура, терминология, ссылки и аргументация.",
  },
  {
    icon: Zap,
    title: "Скорость",
    desc: "Получите готовую статью за считанные минуты вместо дней работы. Быстрая генерация без потери качества.",
  },
  {
    icon: Shield,
    title: "Уникальность",
    desc: "Каждый текст создается с нуля специально для вас. Нет шаблонных фраз — только оригинальный контент.",
  },
  {
    icon: Code2,
    title: "Открытый API",
    desc: "Интегрируйте генерацию статей в свои приложения. Полная документация и поддержка разработчиков.",
  },
  {
    icon: Users,
    title: "Для всех",
    desc: "Студенты, аспиранты, преподаватели, исследователи — сервис адаптируется под любые задачи и уровень сложности.",
  },
];

const TEAM = [
  {
    name: "Александр Петров",
    role: "Основатель & CEO",
    desc: "Более 10 лет в EdTech. Видение создания доступного инструмента для академического письма.",
  },
  {
    name: "Мария Васильева",
    role: "Главный редактор",
    desc: "Кандидат филологических наук. Отвечает за качество и академическую строгость генерируемых текстов.",
  },
  {
    name: "Никита Смирнов",
    role: "Lead Developer",
    desc: "Full-stack разработчик с фокусом на AI-интеграции. Строит архитектуру платформы.",
  },
];

const TIMELINE = [
  { date: "Январь 2024", event: "Запуск MVP версии Academix" },
  { date: "Март 2024", event: "10,000 сгенерированных статей" },
  { date: "Июнь 2024", event: "Добавление локальной авторизации" },
  { date: "Сентябрь 2024", event: "Запуск API для разработчиков" },
  { date: "Январь 2025", event: "50,000 пользователей по всему миру" },
  { date: "Март 2025", event: "Интеграция с Kimi AI для улучшенной генерации" },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F2F0EA]">
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
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-full px-4 py-1.5 mb-6">
                <Heart className="w-3.5 h-3.5 text-[#8C8C8C]" />
                <span className="text-xs text-[#8C8C8C]">О проекте</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-['Instrument_Serif'] mb-6">
                Мы делаем академическое письмо{" "}
                <span className="gradient-text">доступным</span>
              </h1>
              <p className="text-sm text-[#8C8C8C] leading-relaxed mb-6">
                Academix — это интеллектуальная платформа для генерации научных
                статей, созданная командой энтузиастов в области образования и
                искусственного интеллекта. Наша миссия — помочь студентам и
                исследователям сосредоточиться на главном: анализе, критическом
                мышлении и создании новых знаний.
              </p>
              <p className="text-sm text-[#8C8C8C] leading-relaxed">
                Мы верим, что технологии должны работать на человека, а не
                заменять его. Academix — это инструмент, который берет на себя
                рутину формального письма, освобождая время для творческой и
                интеллектуальной работы.
              </p>
            </div>

            {/* Logo mark */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-[240px] h-[240px] md:w-[300px] md:h-[300px] rounded-full border-2 border-[#E5E5E5] flex items-center justify-center bg-white">
                  <svg width="120" height="120" viewBox="0 0 40 40" fill="none">
                    <circle
                      cx="20"
                      cy="20"
                      r="19"
                      stroke="black"
                      strokeWidth="1"
                    />
                    <text
                      x="20"
                      y="28"
                      fontFamily="'Instrument Serif', serif"
                      fontSize="22"
                      textAnchor="middle"
                      fill="black"
                    >
                      A
                    </text>
                  </svg>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#F2C84F]" />
                <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#E85D3F] opacity-60" />
                <div className="absolute top-1/2 -right-6 w-3 h-3 rounded-full bg-[#C247BC] opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-24 bg-white">
        <div className="max-w-[1120px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Instrument_Serif'] mb-3">
              Возможности платформы
            </h2>
            <p className="text-sm text-[#8C8C8C] max-w-[400px] mx-auto">
              Всё, что нужно для создания качественных научных работ
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="p-6 border border-[#E5E5E5] rounded-[10px] hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-[#F2F0EA] flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-sm font-medium mb-2">{f.title}</h3>
                <p className="text-xs text-[#8C8C8C] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24">
        <div className="max-w-[700px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Instrument_Serif'] mb-3">
              История развития
            </h2>
            <p className="text-sm text-[#8C8C8C]">
              Ключевые этапы становления Academix
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-[1px] bg-[#E5E5E5]" />

            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex items-start gap-6 relative">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0 z-10">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs text-[#8C8C8C] mb-1">{item.date}</p>
                    <p className="text-sm">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="pb-24 bg-white">
        <div className="max-w-[1120px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Instrument_Serif'] mb-3">Команда</h2>
            <p className="text-sm text-[#8C8C8C] max-w-[400px] mx-auto">
              Люди, стоящие за созданием Academix
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-[720px] mx-auto">
            {TEAM.map((member, i) => (
              <div
                key={i}
                className="text-center p-6 border border-[#E5E5E5] rounded-[10px]"
              >
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-lg font-['Instrument_Serif'] mx-auto mb-4">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-sm font-medium mb-1">{member.name}</h3>
                <p className="text-[11px] text-[#8C8C8C] mb-3">
                  {member.role}
                </p>
                <p className="text-xs text-[#8C8C8C] leading-relaxed">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="bg-white rounded-[14px] p-8 border border-[#E5E5E5]">
            <Target className="w-8 h-8 mx-auto mb-4 gradient-text" />
            <h2 className="text-2xl font-['Instrument_Serif'] mb-2">
              Присоединяйтесь к нам
            </h2>
            <p className="text-sm text-[#8C8C8C] mb-6">
              Станьте частью сообщества Academix и начните создавать научные
              работы нового уровня
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
