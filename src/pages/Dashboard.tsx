import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  exportAsDocx, exportAsMarkdown, exportAsHtml, exportAsTxt, exportAsPdf,
} from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings, LogOut, FileText, Loader2, Sparkles, Send,
  Paperclip, Download, X, CheckCircle,
  BookMarked, PanelLeft, MessageSquare, Edit3, Save,
  Clock, BookOpen, Zap, Shield,
} from "lucide-react";

// ── Source type ──
interface Source {
  url: string;
  title: string;
  credibility: number;
  color: string;
  snippetStart: number;
  snippetEnd: number;
}

// ── Chat message ──
interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

// ── Sidebar ──
function Sidebar({ activeTab, onTabChange, onToggle }: { activeTab: string; onTabChange: (t: string) => void; onToggle: () => void }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const tabs = [
    { id: "chat", icon: MessageSquare, label: "Чат" },
    { id: "history", icon: Clock, label: "История" },
    { id: "settings", icon: Settings, label: "Настройки" },
  ];

  return (
    <div className="w-[70px] min-h-screen bg-white border-r border-[#E5E5E5] flex flex-col items-center py-6 fixed left-0 top-0 z-20">
      <div className="mb-8">
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" stroke="black" strokeWidth="1.5" />
          <text x="20" y="28" fontFamily="serif" fontSize="20" textAnchor="middle" fill="black">A</text>
        </svg>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => onTabChange(t.id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === t.id ? "bg-black text-white" : "text-[#8C8C8C] hover:bg-[#F2F0EA] hover:text-black"}`}
            title={t.label}>
            <t.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={onToggle} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8C8C8C] hover:bg-[#F2F0EA] hover:text-black transition-all" title="Свернуть">
          <PanelLeft className="w-4 h-4" />
        </button>
        <button onClick={() => { logout(); navigate("/"); }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8C8C8C] hover:bg-[#F2F0EA] hover:text-black transition-all" title="Выйти">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Source highlighter ──
function HighlightedText({ content, sources, activeSource }: { content: string; sources: Source[]; activeSource: string | null }) {
  if (!sources.length) return <pre className="whitespace-pre-wrap text-sm leading-relaxed">{content}</pre>;

  // Simple approach: wrap source-associated paragraphs with colored border
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // Find matching source based on position
        const pos = content.split("\n").slice(0, i).join("\n").length;
        const source = sources.find((s) => pos >= s.snippetStart && pos < s.snippetEnd);
        const isActive = activeSource && source && source.color === activeSource;

        if (source) {
          return (
            <div key={i} className={`border-l-2 pl-3 py-0.5 transition-all ${isActive ? "border-l-[3px] bg-gray-50" : ""}`}
              style={{ borderLeftColor: isActive ? activeSource : source.color }}>
              <TextLine line={line} />
            </div>
          );
        }
        return <div key={i}><TextLine line={line} /></div>;
      })}
    </div>
  );
}

function TextLine({ line }: { line: string }) {
  const t = line.trim();
  if (t.startsWith("# ") && !t.startsWith("## ")) return <h1 className="text-2xl font-['Instrument_Serif'] font-bold mt-6 mb-3">{t.replace("# ", "")}</h1>;
  if (t.startsWith("## ")) return <h2 className="text-xl font-['Instrument_Serif'] font-semibold mt-4 mb-2">{t.replace("## ", "")}</h2>;
  if (t.startsWith("### ")) return <h3 className="text-lg font-['Instrument_Serif'] font-medium mt-3 mb-1">{t.replace("### ", "")}</h3>;
  if (t.startsWith("- ") || t.startsWith("* ")) return <li className="text-sm ml-4 mb-1">{t.replace(/^[-*] /, "")}</li>;
  return <p className="text-sm leading-relaxed mb-2 text-justify">{t}</p>;
}

// ── Main Dashboard ──
export default function Dashboard() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useAuth();
  const localToken = localStorage.getItem("local_auth_token");
  const utils = trpc.useUtils();

  // Tabs
  const [activeTab, setActiveTab] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Привет! Я ваш академический ассистент. Расскажите мне о теме вашей работы — предмет, тип, объём, стиль — и я подготовлю качественный научный текст. Также вы можете обсудить со мной структуру, аргументацию или отдельные разделы." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generation params (collected through chat)
  const [params, setParams] = useState({
    subject: "", topic: "", articleType: "", volume: [15], uniqueness: [85], style: "",
    hasTOC: false, hasBib: false, step: 0,
  });

  // Result
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedSources, setGeneratedSources] = useState<Source[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  // Article data for save
  const [articleMeta, setArticleMeta] = useState({ title: "", subject: "", articleType: "", style: "" });

  // Mutations
  const chatMutation = trpc.brain.chat.useMutation();
  const generateMutation = trpc.brain.generate.useMutation();
  const createArticleMutation = trpc.docs.create.useMutation({ onSuccess: () => utils.docs.list.invalidate() });
  const createLocalArticleMutation = trpc.docs.createLocal.useMutation({ onSuccess: () => utils.docs.listLocal.invalidate() });
  const updateContentMutation = trpc.docs.updateContent.useMutation();

  // History
  const { data: oauthArticles } = trpc.docs.list.useQuery(undefined, { enabled: user?.authType === "oauth" });
  const { data: localArticles } = trpc.docs.listLocal.useQuery(
    { token: localToken || "" }, { enabled: user?.authType === "local" && !!localToken }
  );
  const articles = user?.authType === "oauth" ? oauthArticles : localArticles;

  // Scroll chat to bottom
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // Auth guard
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#8C8C8C]" /></div>;
  if (!isAuthenticated || !user) { navigate("/login"); return null; }

  const userId = user.id;
  const authType = user.authType;
  const authToken = authType === "local" ? (localToken || "") : "";

  // ── Send chat message ──
  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    // Check if collecting params
    const newParams = { ...params };
    if (params.step === 0 && userMsg) { newParams.topic = userMsg; newParams.step = 1; }
    else if (params.step === 1) { newParams.subject = userMsg; newParams.step = 2; }
    else if (params.step === 2) { newParams.articleType = userMsg; newParams.step = 3; }
    else if (params.step === 3) { const v = parseInt(userMsg); if (!isNaN(v)) newParams.volume = [v]; newParams.step = 4; }
    else if (params.step === 4) { newParams.style = userMsg; newParams.step = 5; }

    if (newParams.step <= 4) {
      const prompts = [
        "Отличная тема! Какой предметной областью она относится? (например: Экономика, Психология, Информатика)",
        `Понятно, ${newParams.subject || "предмет"}. Какой тип работы вам нужен? (Реферат, Курсовая, Диплом, Эссе)`,
        `Какой объём работы в страницах вас интересует? (рекомендуется 10-30)`,
        `Какой стиль изложения предпочитаете? (Научный, Академический, Публицистический, Популярный)`,
      ];
      setParams(newParams);
      setChatMessages((prev) => [...prev, { role: "assistant", content: prompts[newParams.step - 1] || "Генерирую статью..." }]);
      if (newParams.step === 5) await doGenerate(newParams);
      return;
    }

    // Regular chat
    const allMessages = [...chatMessages, { role: "user" as const, content: userMsg }];
    setChatMessages((prev) => [...prev, { role: "assistant", content: "Думаю..." }]);

    try {
      const result = await chatMutation.mutateAsync({ messages: allMessages, userId, authType });
      setChatMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: result.content };
        return next;
      });
    } catch {
      setChatMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: "Извините, произошла ошибка. Попробуйте ещё раз." };
        return next;
      });
    }
  };

  // ── Generate article ──
  const doGenerate = async (p = params) => {
    setIsGenerating(true);
    const chatHistory = chatMessages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const result = await generateMutation.mutateAsync({
        topic: p.topic || "Научное исследование",
        subject: p.subject || "Общие науки",
        articleType: p.articleType || "Научная статья",
        volume: p.volume[0],
        style: p.style || "Научный",
        hasTableOfContents: p.hasTOC,
        hasBibliography: p.hasBib,
        chatHistory,
        authToken: authToken || undefined,
      });

      setGeneratedContent(result.content);
      setGeneratedSources(result.sources);
      setEditedContent(result.content);
      setArticleMeta({ title: p.topic, subject: p.subject, articleType: p.articleType, style: p.style });

      // Save to DB
      const saveData = {
        title: p.topic || "Без названия", subject: p.subject || "Общие науки",
        articleType: p.articleType || "Научная статья", volume: p.volume[0],
        uniqueness: p.uniqueness[0], style: p.style || "Научный",
        content: result.content, hasTableOfContents: p.hasTOC,
        hasBibliography: p.hasBib, colorTag: result.colorTag,
        sources: result.sources,
      };

      if (authType === "local" && localToken) {
        await createLocalArticleMutation.mutateAsync({ token: localToken, ...saveData });
      } else {
        await createArticleMutation.mutateAsync(saveData);
      }

      setChatMessages((prev) => [...prev, { role: "assistant", content: `Готово! Статья "${p.topic}" сгенерирована. Вы можете редактировать текст, посмотреть источники или экспортировать результат.\n\n${result.fromApi ? "Текст сгенерирован ИИ." : "Текст сгенерирован локально (резервный режим)."}` }]);
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: `Ошибка: ${err.message || "Не удалось сгенерировать"}. Попробуйте снова.` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (!params.topic) { setParams((p) => ({ ...p, step: 0 })); setChatMessages((prev) => [...prev, { role: "assistant", content: "Давайте создадим статью. Какая тема вас интересует?" }]); }
    else { doGenerate(); }
  };

  const handleExport = (format: string) => {
    const title = articleMeta.title || "Статья";
    const content = editMode ? editedContent : generatedContent;
    switch (format) {
      case "docx": exportAsDocx(title, content); break;
      case "md": exportAsMarkdown(title, content); break;
      case "html": exportAsHtml(title, content); break;
      case "txt": exportAsTxt(title, content); break;
      case "pdf": exportAsPdf(title, content); break;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // ── RENDER ──
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <main className={`flex-1 flex transition-all duration-300 ${sidebarOpen ? "ml-[70px]" : "ml-0"}`}>

        {/* LEFT: Chat */}
        <div className="w-[420px] border-r border-[#E5E5E5] flex flex-col bg-[#FAFAFA]">
          {/* Chat Header */}
          <div className="h-14 border-b border-[#E5E5E5] flex items-center px-4 bg-white">
            <Sparkles className="w-4 h-4 mr-2 gradient-text" />
            <span className="text-sm font-medium">Academix AI</span>
            {user.plan === "pro" && <span className="ml-2 text-[10px] bg-gradient-to-r from-[#F2C84F] to-[#E85D3F] text-white px-2 py-0.5 rounded-full">PRO</span>}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-black text-white rounded-br-md"
                    : "bg-white border border-[#E5E5E5] rounded-bl-md"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E5E5E5] rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-[#8C8C8C]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#E5E5E5] bg-white">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer p-2 hover:bg-[#F2F0EA] rounded-lg transition-colors" title="Загрузить файл">
                <Paperclip className="w-4 h-4 text-[#8C8C8C]" />
                <input type="file" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setChatMessages((p) => [...p, { role: "assistant", content: `Файл "${file.name}" загружен. Я учту его содержание при генерации.` }]);
                }} />
              </label>
              <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Напишите тему или задайте вопрос..."
                className="flex-1 h-10 rounded-xl border-[#E5E5E5] text-sm bg-[#FAFAFA]" />
              <Button onClick={handleSend} size="icon" className="h-10 w-10 rounded-xl bg-black hover:bg-black/90">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleGenerate}
                className="h-7 text-[11px] rounded-lg border-[#E5E5E5] hover:bg-[#F2F0EA]">
                <Sparkles className="w-3 h-3 mr-1" /> Сгенерировать
              </Button>
              <Button variant="outline" size="sm"
                onClick={() => setChatMessages([{ role: "assistant", content: "Новый чат начат. О чём будем писать?" }])}
                className="h-7 text-[11px] rounded-lg border-[#E5E5E5] hover:bg-[#F2F0EA]">
                <X className="w-3 h-3 mr-1" /> Новый чат
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: Editor / Sources / Export */}
        <div className="flex-1 flex flex-col min-w-0">
          {!generatedContent ? (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-[400px]">
                <div className="w-20 h-20 rounded-full bg-[#F2F0EA] flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-[#8C8C8C]" />
                </div>
                <h2 className="text-xl font-['Instrument_Serif'] mb-2">Готовы к работе?</h2>
                <p className="text-sm text-[#8C8C8C] mb-6">Напишите тему в чат слева, и я создам для вас научную статью. Или задайте вопрос — я помогу с любыми академическими задачами.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: BookOpen, text: "Выберите предмет" },
                    { icon: Zap, text: "Укажите тип работы" },
                    { icon: Shield, text: "Настройте уникальность" },
                    { icon: Sparkles, text: "Получите готовый текст" },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#FAFAFA] rounded-xl p-3 border border-[#E5E5E5] flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-[#8C8C8C]" />
                      <span className="text-[11px] text-[#8C8C8C]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="h-14 border-b border-[#E5E5E5] flex items-center justify-between px-4 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium truncate max-w-[300px]">{articleMeta.title}</h2>
                  <span className="text-[10px] bg-[#F2F0EA] px-2 py-0.5 rounded-full text-[#8C8C8C]">{articleMeta.articleType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditMode(!editMode); if (!editMode) setEditedContent(generatedContent); else { setGeneratedContent(editedContent); } }}
                    className="h-8 text-[11px] rounded-lg">
                    {editMode ? <><CheckCircle className="w-3 h-3 mr-1" /> Готово</> : <><Edit3 className="w-3 h-3 mr-1" /> Редактировать</>}
                  </Button>
                  {editMode && (
                    <Button size="sm" onClick={async () => {
                      // Save edited content
                      const article = articles?.[0];
                      if (article) {
                        await updateContentMutation.mutateAsync({ id: article.id, content: editedContent });
                      }
                      setGeneratedContent(editedContent);
                      setEditMode(false);
                    }} className="h-8 text-[11px] rounded-lg bg-black hover:bg-black/90">
                      <Save className="w-3 h-3 mr-1" /> Сохранить
                    </Button>
                  )}
                  {/* Export dropdown */}
                  <div className="relative group">
                    <Button variant="outline" size="sm" className="h-8 text-[11px] rounded-lg">
                      <Download className="w-3 h-3 mr-1" /> Экспорт
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-[160px] bg-white border border-[#E5E5E5] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      {[
                        { label: "Word (.docx)", format: "docx" },
                        { label: "Markdown (.md)", format: "md" },
                        { label: "HTML (.html)", format: "html" },
                        { label: "Текст (.txt)", format: "txt" },
                        { label: "PDF (печать)", format: "pdf" },
                      ].map((f) => (
                        <button key={f.format} onClick={() => handleExport(f.format)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#F2F0EA] first:rounded-t-xl last:rounded-b-xl">
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor / Preview */}
              <div className="flex-1 flex overflow-hidden">
                {/* Text area */}
                <div className="flex-1 overflow-y-auto p-6">
                  {editMode ? (
                    <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-full min-h-[500px] text-sm leading-relaxed p-4 border border-[#E5E5E5] rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-black font-mono" />
                  ) : (
                    <HighlightedText content={generatedContent} sources={generatedSources} activeSource={activeSource} />
                  )}
                </div>

                {/* Sources panel */}
                {generatedSources.length > 0 && (
                  <div className="w-[260px] border-l border-[#E5E5E5] bg-[#FAFAFA] overflow-y-auto">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <BookMarked className="w-4 h-4 text-[#8C8C8C]" />
                        <h3 className="text-xs font-medium">Источники</h3>
                        <span className="text-[10px] text-[#8C8C8C] ml-auto">{generatedSources.length}</span>
                      </div>
                      <div className="space-y-2">
                        {generatedSources.map((source, i) => (
                          <button key={i} onClick={() => setActiveSource(activeSource === source.color ? null : source.color)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${activeSource === source.color ? "border-black bg-white shadow-sm" : "border-[#E5E5E5] bg-white hover:shadow-sm"}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                              <span className="text-[10px] font-medium">Источник {i + 1}</span>
                            </div>
                            <p className="text-[10px] text-[#8C8C8C] truncate mb-1">{source.title}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${source.credibility}%`, backgroundColor: source.credibility > 85 ? "#C8E6C9" : source.credibility > 70 ? "#F2C84F" : "#E85D3F" }} />
                              </div>
                              <span className="text-[9px] text-[#8C8C8C]">{source.credibility}%</span>
                            </div>
                            {source.url && (
                              <a href={source.url} target="_blank" rel="noopener noreferrer"
                                className="text-[9px] text-blue-500 hover:underline mt-1 block truncate">
                                {source.url}
                              </a>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
