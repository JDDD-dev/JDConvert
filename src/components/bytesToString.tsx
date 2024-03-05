import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "@/i18n/utils"
import type { ui } from "@/i18n/ui"

interface Props {
	lang: keyof typeof ui
}

export default function BytesToString({ lang }: Props) {
	const [decoded, setDecoded] = useState("")
	const [inputFormat, setInputFormat] = useState("hex")
	const [encodedText, setEncodedText] = useState("")

	const t = useTranslations(lang)

	useEffect(() => {
		convertBytesToString(encodedText)
	}, [inputFormat, encodedText])

	const convertBytesToString = (bytesText: string) => {
		if (inputFormat === "hex") {
			convertBytesToStringHexadecimal(bytesText)
		} else if (inputFormat === "decimal") {
			convertBytesToStringDecimal(bytesText)
		}
	}

	const convertBytesToStringHexadecimal = (bytesText: string) => {
		let str = ""
		bytesText = bytesText.replaceAll(" ", "")

		for (let n = 0; n < bytesText.length; n += 2) {
			str += String.fromCharCode(parseInt(bytesText.substring(n, 2), 16))
		}
		setDecoded(str)
	}

	const convertBytesToStringDecimal = (bytesText: string) => {
		const arrayBytes = bytesText.split(" ")
		const arrayBytesInt = arrayBytes.map(Number)
		const u8arr = new Uint8Array(arrayBytesInt)

		const textDecoder = new TextDecoder("utf-8")

		const decodedText = textDecoder.decode(u8arr)

		setDecoded(decodedText)
	}

	return (
		<>
			<Textarea
				placeholder={t("bytesToString.input")}
				onChangeCapture={(e) => setEncodedText(e.currentTarget.value)}
			/>
			<Textarea value={decoded} readOnly />
			<Select defaultValue="hex" onValueChange={(value) => setInputFormat(value)}>
				<SelectTrigger className="w-[180px]">
					<SelectValue></SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>{t("bytesToString.selectLabel")}</SelectLabel>
						<SelectItem value="hex">{t("bytesToString.hex")}</SelectItem>
						<SelectItem value="decimal">{t("bytesToString.decimal")}</SelectItem>
						<SelectItem value="octal">{t("bytesToString.octal")}</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</>
	)
}
