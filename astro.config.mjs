import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"
import vercel from "@astrojs/vercel/serverless"

import sitemap from "@astrojs/sitemap"

const viteServerConfig = {
	name: "log-request-middleware",
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			res.setHeader("Access-Control-Allow-Origin", "*")
			res.setHeader("Access-Control-Allow-Methods", "GET")
			res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
			res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
			next()
		})
	},
}

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
	output: "hybrid",
	adapter: vercel({
		webAnalytics: {
			enabled: true,
		},
	}),
	vite: {
		optimizeDeps: {
			exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
		},
		server: {
			headers: {
				"Cross-Origin-Opener-Policy": "same-origin",
				"Cross-Origin-Embedder-Policy": "require-corp",
			},
		},
		build: {
			chunkSizeWarningLimit: 900,
		},
		plugins: [viteServerConfig],
	},
})
