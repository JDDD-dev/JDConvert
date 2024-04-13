import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"
import vercel from "@astrojs/vercel/static"

import sitemap from "@astrojs/sitemap"

// https://astro.build/config
export default defineConfig({
	prefetch: {
		prefetchAll: true,
	},
	integrations: [
		react(),
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap({
			i18n: {
				defaultLocale: "en",
				locales: {
					en: "en-US",
					es: "es-ES",
				},
			},
		}),
	],
	site: "https://jddd.dev",
	i18n: {
		defaultLocale: "en",
		locales: ["en", "es"],
		fallback: {
			es: "en",
		},
	},
	output: "static",
	adapter: vercel({
		webAnalytics: {
			enabled: true,
		},
	}),
})
