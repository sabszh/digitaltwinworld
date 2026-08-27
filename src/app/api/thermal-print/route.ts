import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 160_000;

function decodePng(value: unknown) {
  if (typeof value !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return undefined;
  const bytes = Buffer.from(value, "base64");
  const pngSignature = "89504e470d0a1a0a";
  return bytes.length > 8 && bytes.length <= MAX_IMAGE_BYTES && bytes.subarray(0, 8).toString("hex") === pngSignature
    ? bytes
    : undefined;
}

function setPrintDensity(imagePath: string) {
  return new Promise<void>((resolve, reject) => {
    // Canvas PNGs do not carry the printer's native density. macOS ignores the
    // lp `ppi` option for this driver and otherwise treats them as 72 DPI,
    // creating an oversized intermediate raster that is clipped and can make
    // the printer lose command synchronisation.
    const child = spawn("sips", [
      "--setProperty", "dpiWidth", "203",
      "--setProperty", "dpiHeight", "203",
      imagePath,
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `sips exited with ${code}`)));
  });
}

function printValueCard(printer: string, imagePath: string) {
  return new Promise<void>((resolve, reject) => {
    // Use the installed Rongta/GEZHI driver. Its Bluetooth transport is reliable
    // for images; sending raw ESC/POS bytes to this queue drops data.
    const child = spawn("lp", [
      "-d", printer,
      "-o", "media=X58mmY210mm",
      // The file itself is tagged as 203 DPI above. Avoid fit-to-page: the
      // driver's 58 mm page width is wider than the 384-dot print head and can
      // otherwise scale, centre and clip the value card.
      "-o", "position=top-left",
      "-o", "BlankSpace=0Print",
      "-o", "FeedDist=0feed3mm",
      // The generic driver enables cash-drawer, cutter and beeper commands by
      // default. This portable printer has none of those peripherals and may
      // render unsupported command bytes as stray glyphs before the image.
      "-o", "CashDrawer=0NoCashDrawer",
      "-o", "Cutting=0NoCutting",
      "-o", "Beeper=0NoBeeping",
      imagePath,
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `lp exited with ${code}`)));
  });
}

export async function POST(request: Request) {
  const printer = process.env.THERMAL_PRINTER_NAME;
  if (!printer) return NextResponse.json({ error: "thermal_printer_not_configured" }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_print_request" }, { status: 400 });
  }
  const image = decodePng(typeof body === "object" && body !== null ? (body as { image?: unknown }).image : undefined);
  if (!image) return NextResponse.json({ error: "invalid_value_card" }, { status: 400 });

  const directory = await mkdtemp(join(tmpdir(), "world2046-value-card-"));
  const imagePath = join(directory, "value-card.png");
  try {
    await writeFile(imagePath, image);
    await setPrintDensity(imagePath);
    await printValueCard(printer, imagePath);
    return NextResponse.json({ printed: true });
  } catch {
    return NextResponse.json({ error: "thermal_print_failed" }, { status: 502 });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
