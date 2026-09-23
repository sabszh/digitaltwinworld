import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["src/lib/dilemmaContentVerification.eval.ts"],
    testTimeout: 600_000,
    hookTimeout: 600_000,
  },
});
