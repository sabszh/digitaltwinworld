import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { ConsentedSessionRecord, SessionResult } from "@/types/world2046";
import { userRoles } from "@/data/taxonomies";

export const runtime = "nodejs";

const POLICY_VERSION = "2026-08-25" as const;
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
    && isRecord(item.presented)
    && typeof item.presented.title === "string"
    && typeof item.presented.scene === "string"
    && Array.isArray(item.presented.choices)
    && item.presented.choices.length === 4
    && item.presented.choices.every((choice) => isRecord(choice)
      && typeof choice.id === "string"
      && typeof choice.label === "string")
    && typeof item.selectedChoiceId === "string"
    && typeof item.selectedChoiceLabel === "string"
    && isRecord(item.valueImpacts));
  return typeof value.sessionId === "string"
    && /^world2046-[a-z0-9-]+$/.test(value.sessionId)
    && typeof value.createdAt === "string"
    && value.year === 2046
    && (value.language === "da" || value.language === "en")
    && userRoles.includes(value.role as SessionResult["role"])
    && typeof value.generatedSummary === "string"
    && value.generatedSummary.length <= 2000
    && validDilemmas
    && validProfile;
}

function storageDirectory() {
  const configured = process.env.SESSION_DATA_PATH;
  return configured ? path.resolve(configured) : path.join(process.cwd(), ".data", "sessions");
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

  const directory = storageDirectory();
  const filePath = path.join(directory, `${session.sessionId}.json`);
  let duplicate = false;
  try {
    writeQueue = writeQueue.then(async () => {
      await mkdir(directory, { recursive: true });
      const record: ConsentedSessionRecord = {
        schemaVersion: 2,
        consentPolicyVersion: POLICY_VERSION,
        acceptedAt: new Date().toISOString(),
        session,
      };
      try {
        await writeFile(filePath, `${JSON.stringify(record, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") {
          duplicate = true;
          return;
        }
        throw error;
      }
    });
    await writeQueue;
    return NextResponse.json({ saved: true, duplicate });
  } catch {
    return NextResponse.json({ error: "Session could not be saved" }, { status: 500 });
  }
}
