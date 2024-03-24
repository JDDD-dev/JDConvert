import { useTranslations } from "@/i18n/utils"
import type { ui } from "@/i18n/ui"
import { useDragAndDrop } from "@formkit/drag-and-drop/react"
import { animations } from "@formkit/drag-and-drop"
import { FileDown, Trash2 } from "lucide-react"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { useEffect, useState } from "react"

interface Props {
	lang: keyof typeof ui
}

export default function PdfCreatorComponent({ lang }: Props) {
	const t = useTranslations(lang)

	const [pdfUrl, setPdfUrl] = useState("")

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		if (event.dataTransfer === null || event.dataTransfer.files.length === 0) return
		const droppedFiles = event.dataTransfer.files
		const newFiles = Array.from(droppedFiles)
		setPdfs(() => {
			return [...pdfs, ...newFiles]
		})
	}

	const arrayPdf: File[] = []

	const removeFromList = (pdf: File) => {
		const index = pdfs.indexOf(pdf)

		const newArray = [...pdfs]

		newArray.splice(index, 1)

		setPdfs(() => {
			return newArray
		})
	}

	const [ref, pdfs, setPdfs] = useDragAndDrop<HTMLUListElement, File>(arrayPdf, {
		plugins: [animations({ duration: 100 })],
	})

	async function createPdf() {
		const pdfDoc = await PDFDocument.create()

		pdfDoc.setTitle("GENERATED-PDF")

		/*
		const donorPdfBytes = await pdfs[0].arrayBuffer()

		const donorPdf = await PDFDocument.load(donorPdfBytes)
		const [copiedPages] = await pdfDoc.copyPages(donorPdf, [0])

		pdfDoc.addPage(copiedPages)
		*/

		if (pdfs.length === 0) {
			const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
			const page = pdfDoc.addPage()

			const { width, height } = page.getSize()

			const fontSize = 30
			page.drawText(t("pdfCreator.previewPdf"), {
				x: width / 4.5,
				y: height / 2,
				size: fontSize,
				font: timesRomanFont,
				color: rgb(0, 0.53, 0.71),
			})
		} else {
			for (const pdf of pdfs) {
				if (pdf.name.endsWith(".pdf")) {
					const donorPdfBytes = await pdf.arrayBuffer()

					const donorPdf = await PDFDocument.load(donorPdfBytes)
					const copiedPages = await pdfDoc.copyPages(donorPdf, donorPdf.getPageIndices())
					copiedPages.forEach((copiedPage) => {
						pdfDoc.addPage(copiedPage)
					})
				} else if (pdf.name.endsWith(".png")) {
					const donorPngBytes = await pdf.arrayBuffer()

					const pngImage = await pdfDoc.embedPng(donorPngBytes)
					const page = pdfDoc.addPage()

					const pngDims = pngImage.scale(1)

					page.drawImage(pngImage, {
						x: page.getWidth() / 2 - pngDims.width / 2 + 75,
						y: page.getHeight() / 2 - pngDims.height,
						width: pngDims.width,
						height: pngDims.height,
					})
				} else {
					const donorJpgBytes = await pdf.arrayBuffer()

					const JpgImage = await pdfDoc.embedJpg(donorJpgBytes)
					const page = pdfDoc.addPage()

					const jpgDims = JpgImage.scale(0.5)

					page.drawImage(JpgImage, {
						x: page.getWidth() / 2 - jpgDims.width / 2 + 75,
						y: page.getHeight() / 2 - jpgDims.height + 250,
						width: jpgDims.width,
						height: jpgDims.height,
					})
				}
			}
		}

		setPdfUrl(await pdfDoc.saveAsBase64({ dataUri: true }))
	}

	useEffect(() => {
		const fetchCreatePdf = async () => {
			await createPdf()
		}
		fetchCreatePdf()
	}, [pdfs])

	return (
		<section className="flex h-[90dvh] w-full flex-col gap-40 p-14 pt-16 xl:flex-row">
			<div
				className="relative h-full w-full"
				onDrop={handleDrop}
				onDragOver={(event) => event.preventDefault()}
			>
				{pdfs.length === 0 && (
					<div className="absolute inset-0 flex h-auto w-auto animate-pulse flex-col items-center justify-center gap-4 self-center rounded-sm p-4 pt-6 outline-dashed outline-2">
						<FileDown className="scale-150" />
						<span className="text-center">{t("pdfCreator.dropFiles")}</span>
					</div>
				)}
				<ul
					ref={ref}
					className="flex h-full w-full flex-col justify-center rounded-2xl border-2 border-sky-300 bg-slate-500 bg-opacity-40 p-4"
				>
					{pdfs.map((pdf) => (
						<li className="w-full p-2" data-label={pdf} key={pdf.name}>
							<div className="flex w-full flex-row rounded bg-white p-3">
								<span className="w-full font-medium text-red-600">{pdf.name}</span>
								<Trash2
									className="text-black"
									onClick={() => {
										removeFromList(pdf)
									}}
								></Trash2>
							</div>
						</li>
					))}
				</ul>
			</div>
			<iframe src={pdfUrl} className="h-full w-full" title="GENERATED-PDF" />
		</section>
	)
}
