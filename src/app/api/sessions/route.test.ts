import { readFile, unlink } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const testPath = "/tmp/world2046-vitest-consent.jsonl";
const completedDilemma = { dilemmaId: "test-dilemma", city: "Aarhus", country: "Danmark", question: "How should I choose?", selectedChoiceId: "a", selectedChoiceLabel: "A choice", valueImpacts: {} };
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

async function removeTestFile() {
  await unlink(testPath).catch(() => undefined);
}

describe("consented session storage", () => {
  beforeEach(async () => {
    process.env.SESSION_DATA_PATH = testPath;
    await removeTestFile();
  });

  afterEach(async () => {
    delete process.env.SESSION_DATA_PATH;
    await removeTestFile();
  });

  it("writes an accepted session once across retries", async () => {
    const request = () => new Request("http://localhost/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session }) });
    expect((await POST(request())).status).toBe(200);
    expect((await POST(request())).status).toBe(200);
    const lines = (await readFile(testPath, "utf8")).trim().split("\n");
    expect(lines).toHaveLength(1);
  });

  it("rejects incomplete sessions", async () => {
    const response = await POST(new Request("http://localhost/api/sessions", { method: "POST", body: JSON.stringify({ session: { sessionId: "bad" } }) }));
    expect(response.status).toBe(400);
  });
});
