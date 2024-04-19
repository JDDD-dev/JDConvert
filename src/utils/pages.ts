import { ArrowDown01, FilePlus2, FileVideoIcon } from "lucide-react"

export const pages = {
	bytesToString: {
		url: "bytesToString",
		i18n: "bytesToString",
		icon: ArrowDown01,
		name: "Bytes to String",
	},
	pdfCreator: {
		url: "pdfCreator",
		i18n: "pdfCreator",
		icon: FilePlus2,
		name: "PDF Creator",
	},
	videoConverter: {
		url: "videoConverter",
		i18n: "videoConverter",
		icon: FileVideoIcon,
		name: "Video/Audio Converter",
	},
} as const
