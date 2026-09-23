import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["src/lib/dilemmaContentFollowup.eval.ts"],
    testTimeout: 1_200_000,
    hookTimeout: 1_200_000,
  },
});
