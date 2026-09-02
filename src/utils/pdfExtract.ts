import * as pdfjsLib from 'pdfjs-dist'
// Vite serves the worker as a URL-imported asset; this keeps extraction off the main thread.
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker

export interface PdfExtractProgress {
  currentPage: number
  totalPages: number
}

export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: PdfExtractProgress) => void
): Promise<string> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  let fullText = ''
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ')
    fullText += pageText + '\n\n'
    onProgress?.({ currentPage: pageNum, totalPages: pdf.numPages })
  }
  return fullText.trim()
}
