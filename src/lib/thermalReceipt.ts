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
// Some inexpensive ESC/POS clones occasionally render bytes from the first
// raster block as glyphs. Reserve physical paper before the card's content so
// that a stray first line stays outside the designed value card.
const TOP_GUARD_BAND = 72;
// The installed driver advertises a slightly wider page than the physical
// 384-dot head. Keep extra room on the right so bars and symbols cannot be
// clipped by that mismatch.
const RIGHT_PADDING = 40;
const CONTENT_WIDTH = WIDTH - PADDING - RIGHT_PADDING;
const VALUE_LABEL_WIDTH = 150;
const VALUE_GAP = 8;
const VALUE_BAR_WIDTH = CONTENT_WIDTH - VALUE_LABEL_WIDTH - VALUE_GAP;
const VALUE_BAR_X = PADDING + VALUE_LABEL_WIDTH + VALUE_GAP;
const valueKeys = Object.keys(emptyValueProfile) as Array<keyof ValueProfile>;

export function valueProfileScale(profile: ValueProfile): number {
  return Math.max(1, ...valueKeys.map((key) => Math.abs(profile[key])));
}

export function valueBarRatio(score: number, scale: number): number {
  return Math.min(1, Math.abs(score) / Math.max(1, scale));
}

const cardText = {
  da: {
    subtitle: "DIN REJSE · VORES FREMTID",
    profile: "DIN PROFIL FRA 2046",
    passenger: "PASSAGER",
    values: "DINE VÆRDIER",
    less: "−",
    neutral: "NEUTRAL",
    more: "+",
    takeaway: "DET, DER TEGNER DIN REJSE",
    stops: "STOP · VERDEN I 2046",
  },
  en: {
    subtitle: "YOUR JOURNEY · OUR FUTURE",
    profile: "YOUR 2046 PROFILE",
    passenger: "PASSENGER",
    values: "YOUR VALUES",
    less: "−",
    neutral: "NEUTRAL",
    more: "+",
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

function drawValueBar(context: CanvasRenderingContext2D, y: number, score: number, scale: number) {
  const height = 14;
  const center = VALUE_BAR_X + (VALUE_BAR_WIDTH / 2);
  const extent = valueBarRatio(score, scale) * (VALUE_BAR_WIDTH / 2);

  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.strokeRect(VALUE_BAR_X + 0.5, y + 0.5, VALUE_BAR_WIDTH - 1, height - 1);
  context.fillStyle = "black";
  context.fillRect(center - 0.5, y - 2, 1, height + 4);
  if (score < 0) context.fillRect(center - extent, y + 2, extent, height - 4);
  if (score > 0) context.fillRect(center, y + 2, extent, height - 4);
}

async function drawGejstLogo(context: CanvasRenderingContext2D, y: number) {
  const image = new Image();
  const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(gejstStudioLogoSvg)}`;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Gejst Studio logo could not be rendered"));
    image.src = source;
  });
  const logoWidth = 260;
  const logoHeight = Math.round((logoWidth * 62) / 341);
  context.drawImage(image, (WIDTH - logoWidth) / 2, y, logoWidth, logoHeight);
}

/** Builds the finished 58 mm value card as a PNG. The installed macOS driver
 * rasterises this image for the Bluetooth printer, avoiding raw ESC/POS data. */
export async function createThermalReceipt(result: SessionResult, language: Language) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  // At 203 DPI, the old 8–12 px type printed at roughly 3–4 pt. A taller
  // receipt lets the important copy render at 12–16 px without squeezing the
  // ten value rows. The 384 px width remains a one-dot-per-pixel match for the
  // print head.
  canvas.height = 900;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Thermal receipt canvas is unavailable");

  const text = cardText[language];
  const dominant = new Set(getDominantValues(result.valueProfile, 4).map(([key]) => key));
  // Match the on-screen profile: this is a relative value portrait, not a
  // fixed five-stop score. The strongest value therefore reaches an endpoint
  // and the other bars retain their proportion after any journey-length change.
  const valueScale = valueProfileScale(result.valueProfile);
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
  let y = TOP_GUARD_BAND + 35;

  context.font = "700 32px Georgia, serif";
  context.textAlign = "center";
  context.fillText("WORLD 2046", WIDTH / 2, y);
  y += 20;
  context.font = "700 12px ui-monospace, Menlo, monospace";
  context.fillText(text.subtitle, WIDTH / 2, y);
  context.textAlign = "left";
  y += 18;
  context.fillRect(PADDING, y, CONTENT_WIDTH, 2);

  y += 32;
  context.font = "700 12px ui-monospace, Menlo, monospace";
  context.fillText(text.profile, PADDING, y);
  y += 26;
  context.fillText(text.passenger, PADDING, y);
  y += 24;
  context.font = "700 20px Arial, sans-serif";
  context.fillText(passenger, PADDING, y);

  y += 40;
  context.font = "700 12px ui-monospace, Menlo, monospace";
  context.fillText(text.values, PADDING, y);
  y += 20;
  context.font = "700 26px Arial, sans-serif";
  context.fillText(text.less, VALUE_BAR_X, y);
  context.font = "700 16px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText(text.neutral, VALUE_BAR_X + (VALUE_BAR_WIDTH / 2), y);
  context.font = "700 26px Arial, sans-serif";
  context.textAlign = "right";
  context.fillText(text.more, VALUE_BAR_X + VALUE_BAR_WIDTH, y);
  context.textAlign = "left";

  y += 32;
  for (const key of valueKeys) {
    const label = valueLabelsByLanguage[language][key];
    const highlighted = dominant.has(key);
    context.font = `${highlighted ? "700" : "400"} 16px Arial, sans-serif`;
    if (context.measureText(label).width > VALUE_LABEL_WIDTH) context.font = `${highlighted ? "700" : "400"} 14px Arial, sans-serif`;
    context.fillText(label, PADDING, y);
    drawValueBar(context, y - 13, result.valueProfile[key], valueScale);
    y += 31;
  }

  y += 5;
  context.fillRect(PADDING, y, CONTENT_WIDTH, 1);
  y += 27;
  context.font = "700 18px Arial, sans-serif";
  context.fillText(text.takeaway, PADDING, y);
  y += 25;
  context.font = "18px Arial, sans-serif";
  for (const line of wrap(context, summary, CONTENT_WIDTH).slice(0, 4)) {
    context.fillText(line, PADDING, y);
    y += 25;
  }

  y = Math.max(y + 24, 790);
  context.font = "700 12px ui-monospace, Menlo, monospace";
  context.textAlign = "center";
  context.fillText(`${result.completedDilemmas.length} ${text.stops}`, WIDTH / 2, y);
  context.textAlign = "left";
  await drawGejstLogo(context, y + 21);
  // Keep a few millimetres of the raster after the logo. The driver's larger
  // FeedDist settings are not understood by this portable printer and can be
  // emitted as visible glyphs, while its blank-space trimming would otherwise
  // stop before the logo has cleared the tear edge.
  context.fillRect(PADDING, canvas.height - 18, 1, 1);

  return canvas.toDataURL("image/png").split(",", 2)[1];
}
