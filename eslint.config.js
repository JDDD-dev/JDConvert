import js from "@eslint/js"
import ts from "typescript-eslint"
import eslintPluginAstro from "eslint-plugin-astro"

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	...eslintPluginAstro.configs["flat/jsx-a11y-recommended"],
	{
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
