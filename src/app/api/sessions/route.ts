import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { ConsentedSessionRecord, SessionResult } from "@/types/world2046";
import { userRoles } from "@/data/taxonomies";

export const runtime = "nodejs";

const POLICY_VERSION = "2026-08-14" as const;
let writeQueue = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isValidSession(value: unknown): value is SessionResult {
  if (!isRecord(value)) return false;
  const valueProfile = value.valueProfile;
  const dilemmas = value.completedDilemmas;
  const validProfile = isRecord(valueProfile) && ["trust", "freedom", "equality", "efficiency", "humanContact", "safety", "innovation", "sustainability", "localControl", "transparency"].every((key) => typeof valueProfile[key] === "number" && Number.isFinite(valueProfile[key]));
  const validDilemmas = Array.isArray(dilemmas) && dilemmas.length === 5 && dilemmas.every((item) => isRecord(item)
    && typeof item.dilemmaId === "string"
    && typeof item.city === "string"
    && typeof item.country === "string"
    && typeof item.question === "string"
    && typeof item.selectedChoiceId === "string"
    && typeof item.selectedChoiceLabel === "string"
    && isRecord(item.valueImpacts));
  return typeof value.sessionId === "string"
    && value.sessionId.startsWith("world2046-")
    && typeof value.createdAt === "string"
    && value.year === 2046
    && (value.language === "da" || value.language === "en")
    && userRoles.includes(value.role as SessionResult["role"])
    && typeof value.generatedSummary === "string"
    && value.generatedSummary.length <= 2000
    && validDilemmas
    && validProfile;
}

function storagePath() {
  const configured = process.env.SESSION_DATA_PATH;
  return configured ? path.resolve(configured) : path.join(process.cwd(), ".data", "consented-sessions.jsonl");
}

async function alreadySaved(filePath: string, sessionId: string) {
  try {
    const content = await readFile(filePath, "utf8");
    return content.split("\n").some((line) => {
      if (!line.trim()) return false;
      try {
        const record = JSON.parse(line) as Partial<ConsentedSessionRecord>;
        return record.session?.sessionId === sessionId;
      } catch {
        return false;
      }
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const session = isRecord(body) ? body.session : undefined;
  if (!isValidSession(session)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const filePath = storagePath();
  let duplicate = false;
  try {
    writeQueue = writeQueue.then(async () => {
      await mkdir(path.dirname(filePath), { recursive: true });
      duplicate = await alreadySaved(filePath, session.sessionId);
      if (duplicate) return;
      const record: ConsentedSessionRecord = {
        schemaVersion: 1,
        consentPolicyVersion: POLICY_VERSION,
        acceptedAt: new Date().toISOString(),
        session,
      };
      await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
    });
    await writeQueue;
    return NextResponse.json({ saved: true, duplicate });
  } catch {
    return NextResponse.json({ error: "Session could not be saved" }, { status: 500 });
  }
}
