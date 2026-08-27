"use client";

import { emptyValueProfile, valueLabelsByLanguage } from "@/data/taxonomies";
import { gejstStudioLogoSvg } from "@/lib/gejstStudioLogo";
import type { Language } from "@/lib/i18n";
import { roleLabels } from "@/lib/i18n";
import { getDominantValues } from "@/lib/profileScoring";
import type { SessionResult, ValueProfile } from "@/types/world2046";

// The printer has a 384-dot (48 mm) print head. A 57/58 mm paper roll only
// changes the paper edges, not the image width this printer can render.
const WIDTH = 384;
const PADDING = 12;
const CONTENT_WIDTH = WIDTH - (PADDING * 2);
const VALUE_LABEL_WIDTH = 118;
const VALUE_GAP = 8;
const VALUE_BAR_WIDTH = CONTENT_WIDTH - VALUE_LABEL_WIDTH - VALUE_GAP;
const VALUE_BAR_X = PADDING + VALUE_LABEL_WIDTH + VALUE_GAP;
const SCORE_LIMIT = 10;
const valueKeys = Object.keys(emptyValueProfile) as Array<keyof ValueProfile>;

const cardText = {
  da: {
    subtitle: "DIN REJSE · VORES FREMTID",
    profile: "DIN PROFIL FRA 2046",
    passenger: "PASSAGER",
    values: "DINE VÆRDIER",
    less: "MINDRE",
    neutral: "NEUTRAL",
    more: "MERE",
    takeaway: "DET, DER TEGNER DIN REJSE",
    stops: "STOP · VERDEN I 2046",
  },
  en: {
    subtitle: "YOUR JOURNEY · OUR FUTURE",
    profile: "YOUR 2046 PROFILE",
    passenger: "PASSENGER",
    values: "YOUR VALUES",
    less: "LESS",
    neutral: "NEUTRAL",
    more: "MORE",
    takeaway: "WHAT SHAPED YOUR JOURNEY",
    stops: "STOPS · THE WORLD IN 2046",
  },
} satisfies Record<Language, Record<string, string>>;

function wrap(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawValueBar(context: CanvasRenderingContext2D, y: number, score: number) {
  const height = 10;
  const center = VALUE_BAR_X + (VALUE_BAR_WIDTH / 2);
  const boundedScore = Math.max(-SCORE_LIMIT, Math.min(SCORE_LIMIT, score));
  const extent = Math.abs(boundedScore / SCORE_LIMIT) * (VALUE_BAR_WIDTH / 2);

  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.strokeRect(VALUE_BAR_X + 0.5, y + 0.5, VALUE_BAR_WIDTH - 1, height - 1);
  context.fillStyle = "black";
  context.fillRect(center - 0.5, y - 2, 1, height + 4);
  if (boundedScore < 0) context.fillRect(center - extent, y + 1, extent, height - 2);
  if (boundedScore > 0) context.fillRect(center, y + 1, extent, height - 2);
}

async function drawGejstLogo(context: CanvasRenderingContext2D, y: number) {
  const image = new Image();
  const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(gejstStudioLogoSvg)}`;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Gejst Studio logo could not be rendered"));
    image.src = source;
  });
  const logoWidth = 192;
  const logoHeight = Math.round((logoWidth * 62) / 341);
  context.drawImage(image, (WIDTH - logoWidth) / 2, y, logoWidth, logoHeight);
}

/** Builds the finished 58 mm value card as a PNG. The installed macOS driver
 * rasterises this image for the Bluetooth printer, avoiding raw ESC/POS data. */
export async function createThermalReceipt(result: SessionResult, language: Language) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = 710;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Thermal receipt canvas is unavailable");

  const text = cardText[language];
  const dominant = new Set(getDominantValues(result.valueProfile, 4).map(([key]) => key));
  const ageIn2046 = result.personaAnswers?.age === undefined ? undefined : result.personaAnswers.age + 20;
  const passenger = ageIn2046 === undefined
    ? roleLabels[language][result.role]
    : language === "da"
      ? `${roleLabels.da[result.role]} · ${ageIn2046} år i 2046`
      : `${roleLabels.en[result.role]} · ${ageIn2046} in 2046`;
  const summary = result.futureReport?.reflectionNote ?? result.futureReport?.headline ?? result.generatedSummary;

  context.fillStyle = "white";
  context.fillRect(0, 0, WIDTH, canvas.height);
  context.fillStyle = "black";
  let y = 31;

  context.font = "700 28px Georgia, serif";
  context.fillText("WORLD 2046", PADDING, y);
  y += 15;
  context.font = "700 10px ui-monospace, Menlo, monospace";
  context.fillText(text.subtitle, PADDING, y);
  y += 15;
  context.fillRect(PADDING, y, CONTENT_WIDTH, 2);

  y += 28;
  context.font = "700 10px ui-monospace, Menlo, monospace";
  context.fillText(text.profile, PADDING, y);
  y += 22;
  context.fillText(text.passenger, PADDING, y);
  y += 19;
  context.font = "700 16px Arial, sans-serif";
  context.fillText(passenger, PADDING, y);

  y += 32;
  context.font = "700 10px ui-monospace, Menlo, monospace";
  context.fillText(text.values, PADDING, y);
  y += 16;
  context.font = "700 8px ui-monospace, Menlo, monospace";
  context.fillText(text.less, VALUE_BAR_X, y);
  context.textAlign = "center";
  context.fillText(text.neutral, VALUE_BAR_X + (VALUE_BAR_WIDTH / 2), y);
  context.textAlign = "right";
  context.fillText(text.more, VALUE_BAR_X + VALUE_BAR_WIDTH, y);
  context.textAlign = "left";

  y += 21;
  for (const key of valueKeys) {
    const label = valueLabelsByLanguage[language][key];
    const highlighted = dominant.has(key);
    context.font = `${highlighted ? "700" : "400"} 12px Arial, sans-serif`;
    if (context.measureText(label).width > VALUE_LABEL_WIDTH) context.font = `${highlighted ? "700" : "400"} 11px Arial, sans-serif`;
    context.fillText(label, PADDING, y);
    drawValueBar(context, y - 11, result.valueProfile[key]);
    y += 23;
  }

  y += 3;
  context.fillRect(PADDING, y, CONTENT_WIDTH, 1);
  y += 22;
  context.font = "700 10px ui-monospace, Menlo, monospace";
  context.fillText(text.takeaway, PADDING, y);
  y += 20;
  context.font = "12px Arial, sans-serif";
  for (const line of wrap(context, summary, CONTENT_WIDTH).slice(0, 4)) {
    context.fillText(line, PADDING, y);
    y += 17;
  }

  y = Math.max(y + 19, 616);
  context.font = "700 10px ui-monospace, Menlo, monospace";
  context.textAlign = "center";
  context.fillText(`${result.completedDilemmas.length} ${text.stops}`, WIDTH / 2, y);
  context.textAlign = "left";
  await drawGejstLogo(context, y + 21);

  return canvas.toDataURL("image/png").split(",", 2)[1];
}
