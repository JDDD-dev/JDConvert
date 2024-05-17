import js from "@eslint/js"
import ts from "typescript-eslint"
import eslintPluginAstro from "eslint-plugin-astro"
import react from "eslint-plugin-react"

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommendedTypeChecked,
	{
		files: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.astro"],
		plugins: { react },
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	...eslintPluginAstro.configs["flat/recommended"],
	{
		files: ["src/**/*.astro"],
		languageOptions: {
			parserOptions: {
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
