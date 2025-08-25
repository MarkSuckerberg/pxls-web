import { defineConfig, globalIgnores } from "eslint/config";
import _import from "eslint-plugin-import";
import node from "eslint-plugin-node";
import promise from "eslint-plugin-promise";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	globalIgnores(["**/*.min.js"]),
	{
		plugins: {
			import: fixupPluginRules(_import),
			node,
			promise,
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				$: "readonly",
				crel: "readonly",
				moment: "readonly",
				EmojiButton: "readonly",
				pxlsMarkdown: "readonly",
				grecaptcha: "readonly",
				twemoji: "readonly",
				App: "writable",
				SLIDEIN: "readonly",
				interact: "readonly",
				__: "writable",
				_p: "writable",
				_c: "writable",
			},
		},

		rules: {
			"no-console": [
				"error",
				{
					allow: ["info", "warn", "error", "debug", "trace"],
				},
			],

			"space-before-function-paren": "off",
		},
	},
]);
