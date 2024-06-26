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
	"pdfjs-dist/build/pdf.worker.min.mjs",
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
	const [pdf, setPdf] = useState("")
	const [numPagesDoc, setNumPagesDoc] = useState(0)
	const [pageNumber, setPageNumber] = useState(1)
	const [pageScale, setPageScale] = useState(1)
	const size = useSize()

	const [ref, pdfs, setPdfs] = useDragAndDrop<HTMLUListElement, File>(arrayPdf, {
		plugins: [animations({ duration: 300 })],
	})

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()

		const droppedFiles = event.dataTransfer.files

		if (droppedFiles.length === 0) {
			return
		}

		const newFilesChecked = [...droppedFiles].filter(
			(file) =>
				file.name.endsWith(".jpeg") ||
				file.name.endsWith(".jpg") ||
				file.name.endsWith(".pdf") ||
				file.name.endsWith(".png")
		)

		setPdfs([...pdfs, ...newFilesChecked])
	}

	const addFile = (file: React.ChangeEvent<HTMLInputElement>) => {
		const droppedFiles = file.currentTarget.files

		if (droppedFiles === null) {
			return
		}

		const newFilesChecked = [...droppedFiles].filter(
			(file) =>
				file.name.endsWith(".jpeg") ||
				file.name.endsWith(".jpg") ||
				file.name.endsWith(".pdf") ||
				file.name.endsWith(".png")
		)

		setPdfs([...pdfs, ...newFilesChecked])

		// Reset input for firing onChange always
		file.target.value = ""
	}

	const removeFromList = (pdf: File) => {
		const index = pdfs.indexOf(pdf)

		const newArray = [...pdfs]

		newArray.splice(index, 1)

		setPdfs(newArray)
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
			const embed = {
				pdf: async ({ donor, recipient }: { donor: File; recipient: PDFDocument }) => {
					const donorPdfBytes = await donor.arrayBuffer()

					const donorPdf = await PDFDocument.load(donorPdfBytes)
					await Promise.all(
						donorPdf.getPages().map(async (page) => {
							const newPage = recipient.addPage()
							const embedPage = await recipient.embedPage(page)

							const embedPageDims = embedPage.scale(calculateScale(newPage, embedPage))
							newPage.drawPage(embedPage, {
								...embedPageDims,
								x: newPage.getWidth() / 2 - embedPageDims.width / 2,
								y: newPage.getHeight() / 2 - embedPageDims.height / 2,
							})
						})
					)
				},
				images: async ({ donor, recipient }: { donor: File; recipient: PDFDocument }) => {
					const donorBytes = await donor.arrayBuffer()

					const pngImage = await (donor.name.endsWith(".jpg") || donor.name.endsWith(".jpeg")
						? recipient.embedJpg(donorBytes)
						: recipient.embedPng(donorBytes))

					const page = recipient.addPage(PageSizes.A4)

					const pngDims = pngImage.scale(calculateScale(page, pngImage))

					page.drawImage(pngImage, {
						x: page.getWidth() / 2 - pngDims.width / 2,
						y: page.getHeight() / 2 - pngDims.height / 2,
						width: pngDims.width,
						height: pngDims.height,
					})
				},
			}

			for (const file of pdfs) {
				if (file.name.endsWith(".pdf")) {
					await embed.pdf({ donor: file, recipient: pdfDoc })
				} else {
					await embed.images({ donor: file, recipient: pdfDoc })
				}
			}
		}

		startTransition(() => {
			const setsetPdfUrl = async () => {
				const docUrl = URL.createObjectURL(
					new Blob([await pdfDoc.save()], { type: "application/pdf" })
				)
				setPdf(docUrl)
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
							<div className="flex w-full flex-row justify-between rounded bg-white p-3">
								<span className="max-w-sm truncate font-medium text-red-600">{pdf.name}</span>
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
					file={pdf}
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
							{t("pdfCreator.previous")}
						</Button>
						<Button
							disabled={pageNumber >= numPagesDoc}
							onClick={nextPage}
							className="w-full bg-red-400"
						>
							{t("pdfCreator.next")}
						</Button>
						<a download="JDCONVERT_GENERATED_PDF.pdf" href={pdf}>
							<Button className="w-full bg-red-400 hover:bg-red-400">
								{t("pdfCreator.download")}
							</Button>
						</a>
					</div>
				)}
			</div>
		</section>
	)
}
