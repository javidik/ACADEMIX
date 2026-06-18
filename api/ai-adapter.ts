// Universal AI Adapter — easily swap between Kimi, Perplexity, OpenAI, etc.
import { env } from "./lib/env";

export interface SourceInfo {
  url: string;
  title: string;
  credibility: number;
  color: string;
  snippetStart: number;
  snippetEnd: number;
}

export interface AIResponse {
  content: string;
  sources: SourceInfo[];
  fromApi: boolean;
}

// ── Kimi API ──
async function callKimi(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
  const apiKey = env.kimiApiKey;
  if (!apiKey) throw new Error("KIMI_API_KEY not configured");

  const resp = await fetch(`${env.kimiOpenUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "kimi-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Kimi API error: ${resp.status}`);
  }

  const data = await resp.json() as any;
  const content = data.choices?.[0]?.message?.content || "";

  return { content, sources: [], fromApi: true };
}

// ── Perplexity API (ready for future use) ──
async function callPerplexity(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY not configured");

  const resp = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  if (!resp.ok) throw new Error(`Perplexity API error: ${resp.status}`);

  const data = await resp.json() as any;
  const content = data.choices?.[0]?.message?.content || "";

  // Perplexity returns citations
  const citations: SourceInfo[] = (data.citations || []).map((url: string, i: number) => ({
    url,
    title: url.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
    credibility: [90, 85, 80, 88, 82, 95, 78, 92][i % 8],
    color: ["#BBDEFB", "#F8BBD0", "#C8E6C9", "#FFCCBC", "#D1C4E9", "#F0F4C3", "#B2DFDB", "#FFE0B2"][i % 8],
    snippetStart: 0,
    snippetEnd: 0,
  }));

  return { content, sources: citations, fromApi: true };
}

// ── Fallback local generator ──
function generateFallback(topic: string, subject: string, articleType: string, volume: number, style: string, hasTOC: boolean, hasBib: boolean): AIResponse {
  const sections = Math.max(3, Math.min(8, Math.floor(volume / 3)));
  const paras = Math.max(2, Math.floor(volume / sections));
  const colors = ["#BBDEFB", "#F8BBD0", "#C8E6C9", "#FFCCBC", "#D1C4E9", "#F0F4C3", "#B2DFDB", "#FFE0B2"];

  // Source templates
  const sourceTemplates = [
    { url: `https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`, title: "Google Scholar — " + topic, credibility: 95 },
    { url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(topic)}`, title: "PubMed — " + subject, credibility: 92 },
    { url: `https://arxiv.org/search/?query=${encodeURIComponent(topic)}&searchtype=all`, title: "arXiv — " + topic, credibility: 88 },
    { url: `https://www.researchgate.net/search?q=${encodeURIComponent(topic)}`, title: "ResearchGate — " + topic, credibility: 85 },
    { url: `https://core.ac.uk/search?q=${encodeURIComponent(topic)}`, title: "CORE — " + subject, credibility: 82 },
    { url: `https://www.semanticscholar.org/search?q=${encodeURIComponent(topic)}`, title: "Semantic Scholar", credibility: 90 },
  ];

  const sources: SourceInfo[] = sourceTemplates.slice(0, Math.min(4, sections)).map((s, i) => ({
    ...s,
    color: colors[i % colors.length],
    snippetStart: i * 500,
    snippetEnd: (i + 1) * 500,
  }));

  let article = `# ${topic}\n\n`;

  if (hasTOC) {
    article += `## Оглавление\n\n1. Введение\n`;
    for (let i = 1; i <= sections; i++) article += `${i + 1}. ${getTitle(topic, subject, i)}\n`;
    article += `${sections + 2}. Заключение\n`;
    if (hasBib) article += `${sections + 3}. Список литературы\n`;
    article += `\n---\n\n`;
  }

  article += `## Введение\n\n`;
  const sSubj = subject.toLowerCase();
  const sTopic = topic.toLowerCase();
  const sType = articleType.toLowerCase();
  article += mkPara(topic + " представляет собой одно из ключевых направлений современных исследований в области " + sSubj + ". Актуальность данной темы обусловлена необходимостью углубленного анализа теоретических и практических аспектов рассматриваемого явления.");
  article += mkPara("Целью данной " + sType + " является систематический анализ основных концепций и методологических подходов, связанных с " + sTopic + ".");

  for (let i = 1; i <= sections; i++) {
    article += `\n## ${getTitle(topic, subject, i)}\n\n`;
    for (let p = 0; p < paras; p++) {
      const src = sources[p % sources.length];
      article += `<source:${src.color}>${mkPara(generateSection(topic, subject, style, i, p))}</source:${src.color}>\n\n`;
    }
  }

  article += `\n## Заключение\n\n`;
  article += mkPara("Таким образом, в ходе проведенного исследования был выполнен комплексный анализ проблематики " + sTopic + ". Установлено, что данное явление имеет многогранный характер.");
  article += mkPara("Практическая значимость полученных результатов заключается в возможности их использования для разработки рекомендаций по совершенствованию теории и практики в области " + sSubj + ".");

  if (hasBib) {
    article += `\n## Список литературы\n\n`;
    sources.forEach((s, i) => {
      article += `${i + 1}. ${s.title}. — ${s.url}\n`;
    });
  }

  return { content: article, sources, fromApi: false };
}

function getTitle(topic: string, subject: string, i: number): string {
  const titles = [
    "Теоретические основы " + topic.toLowerCase(),
    "Методологические подходы к исследованию",
    "Анализ современного состояния проблематики",
    "Ключевые аспекты и факторы влияния",
    "Практическое применение результатов",
    "Сравнительный анализ и обобщение",
    "Проблемы и перспективы развития",
    "Интеграция подходов в " + subject.toLowerCase(),
  ];
  return titles[(i - 1) % titles.length];
}

function generateSection(topic: string, subject: string, style: string, section: number, paragraph: number): string {
  const templates = [
    "В современной научной литературе по " + subject.toLowerCase() + " уделяется значительное внимание проблеме " + topic.toLowerCase() + ". Различные авторы предлагают разнообразные подходы к пониманию данного явления, что свидетельствует о его сложности и многогранности.",
    "Анализ эмпирических данных позволяет выявить определенные закономерности в развитии " + topic.toLowerCase() + ". На основании проведенных исследований можно утверждать, что существует тесная взаимосвязь между теоретическими концепциями и практическими результатами.",
    "В контексте " + style.toLowerCase() + "го изложения материала особое значение приобретает систематизация полученных данных. Структурирование информации позволяет выделить ключевые компоненты исследуемого явления.",
    "Следует подчеркнуть, что " + topic.toLowerCase() + " не существует изолированно от других явлений в области " + subject.toLowerCase() + ". Напротив, оно тесно связано с широким спектром теоретических и практических вопросов.",
    "Практический опыт показывает, что эффективность методов анализа значительно повышается при использовании современных инструментальных средств. Внедрение инновационных технологий позволяет не только ускорить процесс исследования, но и повысить достоверность полученных результатов.",
    "Важным аспектом исследования является анализ критических подходов к пониманию " + topic.toLowerCase() + ". Рассмотрение альтернативных точек зрения способствует формированию более полной и объективной картины изучаемого явления.",
  ];
  return templates[(section + paragraph) % templates.length];
}

function mkPara(text: string): string {
  return text;
}

// ── Main entry point ──
export async function generateArticle(params: {
  topic: string;
  subject: string;
  articleType: string;
  volume: number;
  style: string;
  hasTableOfContents: boolean;
  hasBibliography: boolean;
  chatHistory?: Array<{ role: string; content: string }>;
}): Promise<AIResponse> {
  const systemPrompt = `Ты — профессиональный академический писатель. Пиши научные статьи на русском языке высшего качества.
- Академическая строгость, логическая последовательность, глубина анализа
- Markdown: # заголовок, ## раздел, ### подраздел
- Каждый абзац содержательный (5-8 предложений)
- В начале каждого абзаца, который основан на конкретном источнике, добавь маркер [source:N] где N — номер источника
- В конце статьи добавь раздел ## Источники со списком URL`;

  let userPrompt = `Напиши подробную научную статью на тему "${params.topic}".\n\n`;
  userPrompt += `**Предмет:** ${params.subject}\n**Тип:** ${params.articleType}\n**Объем:** ${params.volume} стр.\n**Стиль:** ${params.style}\n`;
  if (params.hasTableOfContents) userPrompt += `**Требование:** Включи оглавление.\n`;
  if (params.hasBibliography) userPrompt += `**Требование:** Включи список литературы (12-15 источников) по ГОСТ.\n`;
  userPrompt += `\n**Важно:** В начале каждого абзаца, основанного на источнике, поставь [source:N]. В конце — раздел ## Источники с полными URL.\n`;

  if (params.chatHistory && params.chatHistory.length > 0) {
    userPrompt += `\n**Контекст из предыдущего обсуждения:**\n`;
    params.chatHistory.forEach((m) => {
      userPrompt += `${m.role === "user" ? "Пользователь" : "Ассистент"}: ${m.content}\n`;
    });
  }

  // Try Perplexity first (future), then Kimi, then fallback
  const provider = process.env.AI_PROVIDER || "kimi";

  try {
    if (provider === "perplexity") {
      return await callPerplexity(systemPrompt, userPrompt);
    }
    return await callKimi(systemPrompt, userPrompt);
  } catch (err) {
    console.warn(`[ai] API failed (${provider}), using fallback:`, err);
    return generateFallback(
      params.topic,
      params.subject,
      params.articleType,
      params.volume,
      params.style,
      params.hasTableOfContents,
      params.hasBibliography
    );
  }
}

export async function chatWithAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  const systemPrompt = `Ты — академический ассистент. Помогаешь с научными статьями: структурированием, анализом, редактированием, поиском источников. Пиши по-русски.`;

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.slice(-10), // last 10 messages
  ];

  try {
    const resp = await fetch(`${env.kimiOpenUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.kimiApiKey}`,
      },
      body: JSON.stringify({
        model: "kimi-latest",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!resp.ok) throw new Error(`API error: ${resp.status}`);
    const data = await resp.json() as any;
    return data.choices?.[0]?.message?.content || "Извините, произошла ошибка.";
  } catch {
    // Fallback response
    const lastMsg = messages[messages.length - 1]?.content || "";
    return `Я проанализировал ваш запрос: "${lastMsg.slice(0, 100)}..."

На основе обсуждения рекомендую:
1. Уточнить основную гипотезу исследования
2. Добавить больше первичных источников
3. Усилить аргументацию эмпирическими данными
4. Проверить соответствие выбранной методологии целям работы

Если нужна помощь с конкретным разделом — напишите, я помогу.`;
  }
}
