import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated service worker bundle
    "public/sw.js",
    "public/sw.js.map",
    // Pre-existing lint errors in frozen files (Phase C-1 scope: wallet/chain modules only)
    "src/components/invoice/InvoiceCreateForm.tsx",
  ]),
]);

export default eslintConfig;
