import { useEffect, useRef, useState, type ChangeEvent } from "react"
import type { ui } from "@/i18n/ui"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { useTranslations } from "@/i18n/utils"
import { LoaderCircleIcon, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

interface Props {
	lang: keyof typeof ui
}

export default function VideoConverterComponent({ lang }: Props) {
	const t = useTranslations(lang)

	const [loaded, setLoaded] = useState(false)
	const ffmpegRef = useRef(new FFmpeg())
	const [file, setFile] = useState("")
	const [endFile, setEndFile] = useState("")
	const [transpiling, setTranspiling] = useState(false)

	const addFile = (value: ChangeEvent<HTMLInputElement>) => {
		const newFileArray = value.currentTarget.files

		if (newFileArray === null) {
			return
		}

		if (newFileArray.length === 0) {
			return
		}

		const newFile = newFileArray[0]

		setFile(URL.createObjectURL(new Blob([newFile], { type: "video/mp4" })))
	}

	useEffect(() => {
		const loadFfmpeg = async () => {
			await load()
		}
		void loadFfmpeg()
	}, [])

	const load = async () => {
		const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm"
		const ffmpeg = ffmpegRef.current

		ffmpeg.on("progress", ({ progress, time }) => {
			console.log(`${progress * 100} % (transcoded time: ${time / 1000000} s)`)
		})

		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
			workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
		})
		setLoaded(true)
	}

	const transpile = async () => {
		setTranspiling(true)
		const ffmpeg = ffmpegRef.current

		await ffmpeg.writeFile("input.mp4", await fetchFile(file))
		console.log("test2")
		await ffmpeg.exec(["-i", "input.mp4", "output.avi"])
		const data = await ffmpeg.readFile("output.avi")
		console.log("test3")
		setEndFile(URL.createObjectURL(new Blob([data], { type: "video/avi" })))
		setTranspiling(false)
	}

	return loaded ? (
		<div className="mt-16 flex h-full w-full flex-row">
			{file ? (
				<>
					<video src={file} controls className="w-1/2"></video>
					<video src={endFile} controls className="w-1/2"></video>
					<Button onClick={transpile} disabled={transpiling}>
						Transpile
					</Button>
				</>
			) : (
				<>
					<label htmlFor="upload-button" className="flex cursor-pointer flex-row gap-2">
						<UploadIcon />
						<span>{t("videoConverter.insertFile")}</span>
					</label>
					<input
						id="upload-button"
						type="file"
						className="sr-only"
						name="upload-button"
						onChange={(value) => {
							addFile(value)
						}}
					></input>
				</>
			)}
		</div>
	) : (
		<LoaderCircleIcon className="mt-16 h-7 w-7 animate-spin"></LoaderCircleIcon>
	)
}
