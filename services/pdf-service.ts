export interface PDFParseResult {
  text: string;
  pages: number;
  info?: any;
}

export class PDFService {
  /**
   * Parse a PDF file and extract text content
   * @param file - PDF file from input
   * @returns Promise with parsed text and metadata
   */
  static async parseFile(file: File): Promise<PDFParseResult> {
    // Ensure we're in the browser
    if (typeof window === 'undefined') {
      throw new Error('PDF parsing is only available in the browser');
    }

    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }
      
      if (file.type !== 'application/pdf') {
        throw new Error('File must be a PDF');
      }
      
      if (file.size === 0) {
        throw new Error('File is empty');
      }

      // Dynamically import pdfjs-dist only when needed
      const pdfjsLib = await import('pdfjs-dist');
      
      // Try to set worker source if not already set
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer
      });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const pages = pdf.numPages;
      
      // Extract text from each page
      for (let i = 1; i <= pages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      // Get metadata if available
      let metadata = {};
      try {
        metadata = await pdf.getMetadata();
      } catch (metaError) {
        // Metadata extraction failed, continue without it
      }
      
      return {
        text: fullText.trim(),
        pages: pages,
        info: metadata
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 