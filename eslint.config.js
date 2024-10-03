import js from "@eslint/js"
import ts from "typescript-eslint"
import eslintPluginAstro from "eslint-plugin-astro"

export default ts.config(
	{ ignores: [".astro/", "node_modules/", "src/env.d.ts"] },
	js.configs.recommended,
	...ts.configs.recommended,
	{
		files: ["*.ts", "*.tsx"],
		languageOptions: {
			parser: "@typescript-eslint/parser",
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	...eslintPluginAstro.configs["flat/recommended"],
	{
		files: ["*.astro"],
		languageOptions: {
			parser: "astro-eslint-parser",
			parserOptions: {
				extraFileExtensions: ["*.astro"],
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		files: ["**/*.js"],
		extends: [ts.configs.disableTypeChecked],
	}
)
