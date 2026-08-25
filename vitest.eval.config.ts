import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** The live-model evaluation runs, so it is deliberately kept out of the default
 *  `npm test` include pattern and given its own config and long timeout. */
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.eval.ts"], testTimeout: 1_800_000, hookTimeout: 1_800_000 },
});
