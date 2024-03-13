export const languages = {
	en: "English",
	es: "Spanish",
}

export const defaultLang = "en"

export const ui = {
	en: {
		"index.title": "JDConvert",
		"index.description": "Convert anything you need!",
		"bytesToString.input": "Type your encoded message here.",
		"bytesToString.selectLabel": "Select input format",
		"bytesToString.hex": "Hexadecimal",
		"bytesToString.decimal": "Decimal",
		"bytesToString.octal": "Octal",
		"index.bytesToString.title": "Bytes to Text",
		"index.bytesToString.description": "Decode hex, decimal or octal messages",
	},
	es: {
		"index.title": "JDConvert",
		"index.description": "Convierte cualquier cosa!",
		"bytesToString.input": "Escribe tu mensaje cifrado aquí.",
		"bytesToString.selectLabel": "Selecciona un formato",
		"bytesToString.hex": "Hexadecimal",
		"bytesToString.decimal": "Decimal",
		"bytesToString.octal": "Octal",
		"index.bytesToString.title": "Bytes a Texto",
		"index.bytesToString.description": "Traduce mensajes en hexadecimal, decimal o octal",
	},
} as const
