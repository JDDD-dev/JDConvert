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
} from "./ui/select"

export default function BytesToString() {
	const [decoded, setDecoded] = useState("")
	const [inputFormat, setInputFormat] = useState("hex")
	const [encodedText, setEncodedText] = useState("")

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
				placeholder="Type your encoded message here."
				onChangeCapture={(e) => setEncodedText(e.currentTarget.value)}
			/>
			<Textarea value={decoded} readOnly />
			<Select defaultValue="hex" onValueChange={(value) => setInputFormat(value)}>
				<SelectTrigger className="w-[180px]">
					<SelectValue></SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Select input format</SelectLabel>
						<SelectItem value="hex">Hexadecimal</SelectItem>
						<SelectItem value="decimal">Decimal</SelectItem>
						<SelectItem value="octal">Octal</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</>
	)
}
