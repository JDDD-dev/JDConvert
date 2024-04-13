import { useTranslations } from "@/i18n/utils"
import type { ui } from "@/i18n/ui"
import { useDragAndDrop } from "@formkit/drag-and-drop/react"
import { animations } from "@formkit/drag-and-drop"
import { FileDown, Trash2 } from "lucide-react"
import {
	PDFDocument,
	PDFEmbeddedPage,
	PDFImage,
	PDFPage,
	PageSizes,
	StandardFonts,
	rgb,
} from "pdf-lib"
import { startTransition, useEffect, useState } from "react"
import { Document, pdfjs, Page } from "react-pdf"
import { Button } from "@/components/ui/button"
import { LoadingPdf } from "@/components/ui/loadingPdf"
import useSize from "@/lib/hooks"

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

	const arrayPdf: File[] = []
	const [pdfUrl, setPdfUrl] = useState("")
	const [numPagesDoc, setNumPagesDoc] = useState(0)
	const [pageNumber, setPageNumber] = useState(1)
	const [pageScale, setPageScale] = useState(1)
	const size = useSize()

	const [ref, pdfs, setPdfs] = useDragAndDrop<HTMLUListElement, File>(arrayPdf, {
		plugins: [animations({ duration: 100 })],
	})

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

	const removeFromList = (pdf: File) => {
		const index = pdfs.indexOf(pdf)

		const newArray = [...pdfs]

		newArray.splice(index, 1)

		setPdfs(() => {
			return newArray
		})
	}

	const calculateScale = (page: PDFPage, embedded: PDFImage | PDFEmbeddedPage) => {
		return Math.min(page.getWidth() / embedded.width, page.getHeight() / embedded.height)
	}

	const calculateScaleScreen = () => {
		const ref = document.querySelector("#pdfDocument")

		if (ref === null) return
		const scale = ref.clientWidth / PageSizes.A4[0]

		if (scale !== pageScale) {
			setPageScale(scale)
		}
	}

	async function createPdf() {
		const pdfDoc = await PDFDocument.create()

		pdfDoc.setTitle("GENERATED-PDF")

		if (pdfs.length === 0) {
			const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
			const page = pdfDoc.addPage(PageSizes.A4)

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
					await Promise.all(
						donorPdf.getPages().map(async (page) => {
							const newPage = pdfDoc.addPage()
							const embedPage = await pdfDoc.embedPage(page)

							const embedPageDims = embedPage.scale(calculateScale(newPage, embedPage))
							newPage.drawPage(embedPage, {
								...embedPageDims,
								x: newPage.getWidth() / 2 - embedPageDims.width / 2,
								y: newPage.getHeight() / 2 - embedPageDims.height / 2,
							})
						})
					)
				} else if (pdf.name.endsWith(".png")) {
					const donorPngBytes = await pdf.arrayBuffer()

					const pngImage = await pdfDoc.embedPng(donorPngBytes)
					const page = pdfDoc.addPage(PageSizes.A4)

					const pngDims = pngImage.scale(calculateScale(page, pngImage))

					page.drawImage(pngImage, {
						x: page.getWidth() / 2 - pngDims.width / 2,
						y: page.getHeight() / 2 - pngDims.height / 2,
						width: pngDims.width,
						height: pngDims.height,
					})
				} else if (pdf.name.endsWith(".jpg") || pdf.name.endsWith(".jpeg")) {
					const donorJpgBytes = await pdf.arrayBuffer()

					const jpgImage = await pdfDoc.embedJpg(donorJpgBytes)
					const page = pdfDoc.addPage()

					const jpgDims = jpgImage.scale(calculateScale(page, jpgImage))

					page.drawImage(jpgImage, {
						x: page.getWidth() / 2 - jpgDims.width / 2,
						y: page.getHeight() / 2 - jpgDims.height / 2,
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
			void setsetPdfUrl()
		})
	}

	function onDocumentLoadSuccess({ numPages }: Pages) {
		setNumPagesDoc(numPages)
		setPageNumber(1)
	}

	function changePage(offset: number) {
		setPageNumber((prevPageNumber) => prevPageNumber + offset)
	}

	function previousPage() {
		changePage(-1)
	}

	function nextPage() {
		changePage(1)
	}

	useEffect(() => {
		const fetchCreatePdf = async () => {
			await createPdf()
		}
		void fetchCreatePdf()
	}, [pdfs, size])

	return (
		<section className="flex h-[92dvh] w-full flex-col gap-10 p-14 pt-16 lg:flex-row">
			<div
				className="relative h-full min-h-72 w-full"
				onDrop={handleDrop}
				onDragOver={(event) => event.preventDefault()}
			>
				<input
					type="file"
					multiple
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
					className="flex h-full w-full flex-col justify-center overflow-y-auto rounded-md border-2 border-sky-300 bg-slate-500 bg-opacity-40 p-4"
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
			<div
				id="pdfDocument"
				className="relative flex h-full w-full flex-col justify-center gap-4 lg:w-[595.28px] lg:min-w-[595.28px]"
			>
				<Document
					file={pdfUrl}
					className="h-80 w-full overflow-y-auto overflow-x-hidden rounded-md border-2 border-sky-300 lg:h-full"
					onLoadSuccess={onDocumentLoadSuccess}
					loading={<LoadingPdf />}
					noData={<LoadingPdf />}
				>
					<Page
						pageNumber={pageNumber}
						onLoadSuccess={calculateScaleScreen}
						scale={pageScale}
						renderAnnotationLayer={false}
						renderTextLayer={false}
					></Page>
				</Document>
				{pdfs.length !== 0 && (
					<div className="absolute bottom-0 z-10 flex w-full gap-2 p-4 opacity-15 hover:opacity-80">
						<Button disabled={pageNumber <= 1} onClick={previousPage} className="w-full bg-red-400">
							Previous
						</Button>
						<Button
							disabled={pageNumber >= numPagesDoc}
							onClick={nextPage}
							className="w-full bg-red-400"
						>
							Next
						</Button>
						<a download="JDCONVERT_GENERATED_PDF.pdf" href={pdfUrl}>
							<Button className="w-full bg-red-400 hover:bg-red-400">Download</Button>
						</a>
					</div>
				)}
			</div>
		</section>
	)
}
