import { defineConfig } from "vitest/config";

// replica los paths del tsconfig para que los tests resuelvan los mismos alias
const r = (p: string) => new URL(p, import.meta.url).pathname;

export default defineConfig({
  resolve: {
    alias: {
      "@client/prisma": r("./prisma/prisma.client.ts"),
      "@generated": r("./prisma/generated"),
      "@": r("./app"),
    },
  },
  test: {
    environment: "node",
  },
});
