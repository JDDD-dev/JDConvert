import { ui, defaultLang } from "@/i18n/ui"

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
		const pathName = path.replaceAll("/", "")
		const hasTranslation = defaultLang !== l
		const translatedPath = hasTranslation ? "/" : path

		return l === defaultLang ? translatedPath : `/${l}${translatedPath}`
	}
}
