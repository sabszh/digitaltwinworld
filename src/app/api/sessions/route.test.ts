import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const testDirectory = "/tmp/world2046-vitest-consent";
const completedDilemma = {
  dilemmaId: "test-dilemma",
  city: "Aarhus",
  country: "Danmark",
  question: "How should I choose?",
  presented: {
    title: "A real choice",
    scene: "A concrete scene in 2046.",
    choices: ["a", "b", "c", "d"].map((id) => ({ id, label: `Choice ${id}` })),
  },
  selectedChoiceId: "a",
  selectedChoiceLabel: "A choice",
  valueImpacts: {},
};
const session = {
  sessionId: "world2046-test-session",
  createdAt: "2026-08-14T10:00:00.000Z",
  year: 2046,
  language: "en",
  role: "Borger",
  completedDilemmas: Array.from({ length: 5 }, (_, index) => ({ ...completedDilemma, dilemmaId: `${completedDilemma.dilemmaId}-${index}` })),
  valueProfile: { trust: 0, freedom: 0, equality: 0, efficiency: 0, humanContact: 0, safety: 0, innovation: 0, sustainability: 0, localControl: 0, transparency: 0 },
  generatedSummary: "Test",
};

async function removeTestDirectory() {
  await rm(testDirectory, { recursive: true, force: true });
}

describe("consented session storage", () => {
  beforeEach(async () => {
    process.env.SESSION_DATA_PATH = testDirectory;
    await removeTestDirectory();
  });

  afterEach(async () => {
    delete process.env.SESSION_DATA_PATH;
    await removeTestDirectory();
  });

  it("writes an accepted session once across retries", async () => {
    const request = () => new Request("http://localhost/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session }) });
    expect((await POST(request())).status).toBe(200);
    expect((await POST(request())).status).toBe(200);
    const record = JSON.parse(await readFile(path.join(testDirectory, `${session.sessionId}.json`), "utf8")) as { session: { sessionId: string } };
    expect(record.session.sessionId).toBe(session.sessionId);
  });

  it("rejects incomplete sessions", async () => {
    const response = await POST(new Request("http://localhost/api/sessions", { method: "POST", body: JSON.stringify({ session: { sessionId: "bad" } }) }));
    expect(response.status).toBe(400);
  });
});
