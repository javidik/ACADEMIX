import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from "docx";
import { saveAs } from "file-saver";

export function exportAsMarkdown(title: string, content: string) {
  const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/markdown" });
  saveAs(blob, `${title.slice(0, 50)}.md`);
}

export async function exportAsDocx(title: string, content: string) {
  const lines = content.split("\n");
  const children: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      children.push(new Paragraph({ text: "" }));
      continue;
    }
    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      children.push(new Paragraph({
        text: trimmed.replace("# ", ""),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }));
    } else if (trimmed.startsWith("## ")) {
      children.push(new Paragraph({
        text: trimmed.replace("## ", ""),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }));
    } else if (trimmed.startsWith("### ")) {
      children.push(new Paragraph({
        text: trimmed.replace("### ", ""),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 150, after: 80 },
      }));
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      children.push(new Paragraph({
        text: trimmed.replace(/^[-*] /, ""),
        bullet: { level: 0 },
      }));
    } else if (/^\d+\.\s/.test(trimmed)) {
      children.push(new Paragraph({
        text: trimmed.replace(/^\d+\.\s/, ""),
        numbering: { reference: "my-numbering", level: 0 },
      }));
    } else {
      // Remove HTML tags
      const cleanText = trimmed.replace(/<source:[^>]*>/g, "").replace(/<\/source:[^>]*>/g, "");
      children.push(new Paragraph({
        children: [new TextRun({ text: cleanText, size: 24 })],
        spacing: { after: 120 },
      }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.slice(0, 50)}.docx`);
}

export function exportAsHtml(title: string, content: string) {
  let html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>${title}</title>`;
  html += `<style>body{font-family:'Times New Roman',serif;font-size:14pt;line-height:1.5;max-width:800px;margin:0 auto;padding:40px;}h1{font-size:18pt;text-align:center;}h2{font-size:16pt;}p{text-indent:1.5cm;text-align:justify;}</style></head><body>`;

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { html += "<br/>"; continue; }
    const clean = trimmed.replace(/<source:[^>]*>/g, "").replace(/<\/source:[^>]*>/g, "");
    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) html += `<h1>${clean.replace("# ", "")}</h1>`;
    else if (trimmed.startsWith("## ")) html += `<h2>${clean.replace("## ", "")}</h2>`;
    else if (trimmed.startsWith("### ")) html += `<h3>${clean.replace("### ", "")}</h3>`;
    else if (trimmed.startsWith("- ")) html += `<li>${clean.replace("- ", "")}</li>`;
    else html += `<p>${clean}</p>`;
  }
  html += "</body></html>";

  const blob = new Blob([html], { type: "text/html" });
  saveAs(blob, `${title.slice(0, 50)}.html`);
}

export function exportAsTxt(title: string, content: string) {
  const clean = content.replace(/<source:[^>]*>/g, "").replace(/<\/source:[^>]*>/g, "");
  const blob = new Blob([`${title}\n\n${clean}`], { type: "text/plain" });
  saveAs(blob, `${title.slice(0, 50)}.txt`);
}

export function exportAsPdf(title: string, content: string) {
  // Open print dialog with styled content
  const clean = content.replace(/<source:[^>]*>/g, "").replace(/<\/source:[^>]*>/g, "");
  const lines = clean.split("\n");
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>`;
  html += `<style>@page{size:A4;margin:2cm;}body{font-family:'Times New Roman',serif;font-size:14pt;line-height:1.5;}h1{font-size:18pt;text-align:center;}h2{font-size:16pt;margin-top:20px;}p{text-indent:1.5cm;text-align:justify;margin:8px 0;}</style></head><body>`;
  for (const line of lines) {
    const t = line.trim();
    if (!t) { html += "<br/>"; continue; }
    if (t.startsWith("# ") && !t.startsWith("## ")) html += `<h1>${t.replace("# ", "")}</h1>`;
    else if (t.startsWith("## ")) html += `<h2>${t.replace("## ", "")}</h2>`;
    else if (t.startsWith("### ")) html += `<h3>${t.replace("### ", "")}</h3>`;
    else html += `<p>${t}</p>`;
  }
  html += `</body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }
}
