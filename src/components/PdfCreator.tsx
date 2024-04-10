import { useTranslations } from "@/i18n/utils"
import type { ui } from "@/i18n/ui"
import { useDragAndDrop } from "@formkit/drag-and-drop/react"
import { animations } from "@formkit/drag-and-drop"
import { FileDown, Trash2 } from "lucide-react"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { startTransition, useEffect, useState } from "react"
import { Document, pdfjs, Page } from "react-pdf"
import { Button } from "./ui/button"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.js",
	import.meta.url
).toString()

interface Props {
	lang: keyof typeof ui
}

interface Pages {
	numPages: number
}

export default function PdfCreatorComponent({ lang }: Props) {
	const t = useTranslations(lang)

	const [pdfUrl, setPdfUrl] = useState("")
	const [numPages, setNumPages] = useState(0)
	const [pageNumber, setPageNumber] = useState(1)

	function onDocumentLoadSuccess({ numPages }: Pages) {
		setNumPages(numPages)
		setPageNumber(1)
	}

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		if (event.dataTransfer === null || event.dataTransfer.files.length === 0) return
		const droppedFiles = event.dataTransfer.files
		const newFiles = Array.from(droppedFiles)
		setPdfs(() => {
			return [...pdfs, ...newFiles]
		})
	}

	const addFile = (file: React.ChangeEvent<HTMLInputElement>) => {
		const droppedFiles = file.currentTarget.files
		if (droppedFiles !== null) {
			const newFiles = Array.from(droppedFiles)
			setPdfs(() => {
				return [...pdfs, ...newFiles]
			})
		}
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
		plugins: [animations({ duration: 50 })],
	})

	async function createPdf() {
		const pdfDoc = await PDFDocument.create()

		pdfDoc.setTitle("GENERATED-PDF")

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

		startTransition(() => {
			const setsetPdfUrl = async () => {
				const docUrl = URL.createObjectURL(
					new Blob([await pdfDoc.save()], { type: "application/pdf" })
				)
				setPdfUrl(docUrl)
			}
			setsetPdfUrl()
		})
	}

	useEffect(() => {
		const fetchCreatePdf = async () => {
			await createPdf()
		}
		fetchCreatePdf()
	}, [pdfs])

	function changePage(offset: number) {
		setPageNumber((prevPageNumber) => prevPageNumber + offset)
	}

	function previousPage() {
		changePage(-1)
	}

	function nextPage() {
		changePage(1)
	}

	return (
		<section className="flex h-[90dvh] w-full flex-col gap-40 p-14 pt-16 lg:flex-row">
			<div
				className="relative h-full w-full"
				onDrop={handleDrop}
				onDragOver={(event) => event.preventDefault()}
			>
				<input
					type="file"
					className="absolute left-0 top-0 z-20 h-full w-full opacity-0"
					onChange={(value) => addFile(value)}
				></input>
				{pdfs.length === 0 && (
					<div className="absolute bottom-0 left-0 right-0 top-0 z-10 mb-auto ml-auto mr-auto mt-auto flex h-auto w-1/4 animate-pulse flex-col items-center justify-center gap-4 self-center rounded-sm p-4 pt-6 outline-dashed outline-2">
						<FileDown className="scale-150" />
						<span className="text-center">{t("pdfCreator.dropFiles")}</span>
					</div>
				)}
				<ul
					ref={ref}
					className="flex h-full w-full flex-col justify-center rounded-2xl border-2 border-sky-300 bg-slate-500 bg-opacity-40 p-4"
				>
					{pdfs.map((pdf) => (
						<li className="z-30 w-full p-2" data-label={pdf} key={pdf.name}>
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
			<div className="flex h-auto flex-col gap-4 pb-14">
				<Document
					file={pdfUrl}
					className="h-auto w-auto overflow-scroll"
					onLoadSuccess={onDocumentLoadSuccess}
				>
					<Page pageNumber={pageNumber}></Page>
				</Document>
				<div className="flex w-auto gap-3">
					<p>
						Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
					</p>
					<Button disabled={pageNumber <= 1} onClick={previousPage} className="w-full">
						Previous
					</Button>
					<Button disabled={pageNumber >= numPages} onClick={nextPage} className="w-full">
						Next
					</Button>
				</div>
				<a download="JDCONVERT_GENERATED_PDF.pdf" href={pdfUrl}>
					<Button className="w-full">Download</Button>
				</a>
			</div>
		</section>
	)
}
