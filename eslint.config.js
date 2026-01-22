import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import config from "./.eslintrc.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,ts,tsx}"]},
  {ignores: ["**/node_modules/**", "tailwind.config.js"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.config(config)
];