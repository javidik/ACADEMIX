import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Loader2,
  FileText,
  BookOpen,
  Calendar,
  Layers,
} from "lucide-react";

export default function ArticleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articleId = parseInt(id || "0");

  const { data: article, isLoading } = trpc.docs.getById.useQuery(
    { id: articleId },
    { enabled: articleId > 0 }
  );

  const handleDownload = () => {
    if (!article) return;

    const content = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${article.title}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { font-size: 18pt; text-align: center; margin-bottom: 30px; }
    h2 { font-size: 16pt; margin-top: 30px; }
    p { text-indent: 1.5cm; margin: 10px 0; text-align: justify; }
  </style>
</head>
<body>
  ${article.content.replace(/\n/g, "<br/>")}
</body>
</html>`;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.title.slice(0, 50)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#8C8C8C]" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <FileText className="w-12 h-12 text-[#E5E5E5] mb-4" />
        <p className="text-[#8C8C8C] mb-4">Статья не найдена</p>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="rounded-[14px]"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Вернуться в кабинет
        </Button>
      </div>
    );
  }

  // Parse markdown-like content to HTML
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-4" />;

      if (trimmed.startsWith("# ")) {
        return (
          <h1
            key={i}
            className="text-2xl font-['Instrument_Serif'] font-bold mt-8 mb-4"
          >
            {trimmed.replace("# ", "")}
          </h1>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2
            key={i}
            className="text-xl font-['Instrument_Serif'] font-semibold mt-6 mb-3"
          >
            {trimmed.replace("## ", "")}
          </h2>
        );
      }
      if (trimmed.startsWith("### ")) {
        return (
          <h3
            key={i}
            className="text-lg font-['Instrument_Serif'] font-medium mt-4 mb-2"
          >
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <li key={i} className="text-sm leading-relaxed ml-4 mb-1">
            {trimmed.replace(/^[-*] /, "")}
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <li key={i} className="text-sm leading-relaxed ml-4 mb-1 list-decimal">
            {trimmed.replace(/^\d+\.\s/, "")}
          </li>
        );
      }
      return (
        <p key={i} className="text-sm leading-relaxed mb-3 text-justify">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-[#E5E5E5] sticky top-0 bg-white z-10">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="text-[#8C8C8C] hover:text-black text-sm"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Назад
          </Button>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="rounded-[14px] text-sm border-[#E5E5E5]"
            >
              <Download className="mr-2 w-4 h-4" />
              Скачать
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-10">
        {/* Meta info */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs text-[#8C8C8C]">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {article.subject}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {article.articleType}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(article.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-['Instrument_Serif'] mb-8">
          {article.title}
        </h1>

        {/* Article params */}
        <div className="flex flex-wrap gap-2 mb-10">
          <span className="text-xs bg-[#F2F0EA] px-3 py-1.5 rounded-full">
            {article.volume} страниц
          </span>
          <span className="text-xs bg-[#F2F0EA] px-3 py-1.5 rounded-full">
            Уникальность: {article.uniqueness}%
          </span>
          <span className="text-xs bg-[#F2F0EA] px-3 py-1.5 rounded-full">
            Стиль: {article.style}
          </span>
          {article.hasTableOfContents && (
            <span className="text-xs bg-[#F2F0EA] px-3 py-1.5 rounded-full">
              С оглавлением
            </span>
          )}
          {article.hasBibliography && (
            <span className="text-xs bg-[#F2F0EA] px-3 py-1.5 rounded-full">
              Со списком литературы
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E5E5] mb-10" />

        {/* Content */}
        <article className="prose max-w-none">
          {renderContent(article.content)}
        </article>
      </div>
    </div>
  );
}
