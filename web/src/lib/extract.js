import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_PAGES = 30;

export async function readLearningFile(file) {
  if (!file) throw new Error("Choose a file.");
  if (file.size > MAX_BYTES) {
    throw new Error("That file is over 2 MB. Paste the section you need, or split the file.");
  }
  if (file.type.startsWith("image/")) {
    throw new Error("Images need OCR, which isn't in this version. Paste the text instead.");
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md")) {
    const text = (await file.text()).trim();
    if (text.length < 40) throw new Error("That file doesn't have enough text to learn from.");
    return { text, note: "" };
  }

  if (name.endsWith(".pdf")) {
    const data = new Uint8Array(await file.arrayBuffer());
    const text = await extractPdf(data);
    const body = text.replace(/\[Page \d+\]/g, "").trim();
    if (body.length < 40) {
      throw new Error(
        "This PDF has no selectable text. Scanned pages aren't supported yet. Paste the text instead."
      );
    }
    const pages = (text.match(/\[Page \d+\]/g) || []).length;
    return {
      text,
      note: pages >= MAX_PAGES ? `Only the first ${MAX_PAGES} pages were read.` : "",
    };
  }

  throw new Error("Use a .txt, .md, or text-based PDF, or paste the text.");
}

async function extractPdf(data) {
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const last = Math.min(doc.numPages, MAX_PAGES);
  const parts = [];
  for (let i = 1; i <= last; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (line) parts.push(`[Page ${i}]\n${line}`);
  }
  return parts.join("\n\n");
}
