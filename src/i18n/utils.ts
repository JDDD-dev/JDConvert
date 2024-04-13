import { ui, defaultLang, languages } from "@/i18n/ui"

export function getLangFromUrl(url: URL) {
	const [, lang] = url.pathname.split("/")
	if (lang in ui) return lang as keyof typeof ui
	return defaultLang
}

export function useTranslations(lang: keyof typeof ui) {
	return function t(key: keyof (typeof ui)[typeof defaultLang]) {
		return ui[lang][key] || ui[defaultLang][key]
	}
}

export function useTranslatedPath(lang: keyof typeof ui) {
	return function translatePath(path: string, l: string = lang) {
		if (l === defaultLang) {
			return "/" + path
		}
		return `/${l}/${path}`
	}
}

export function getCurrentRoute(url: URL): string {
	const pathname = url.pathname
	const parts = pathname.split("/")
	const res = parts.pop() || parts.pop()

	if (Object.values(languages).some((language) => language.code === res)) {
		return ""
	}
	return res + ""
}
