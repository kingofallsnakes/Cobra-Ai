import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts text from a File object (.txt, .csv, or .pdf)
 */
export const extractTextFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'txt' || fileType === 'csv' || fileType === 'md') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("Failed to read text file"));
      reader.readAsText(file);
    } else if (fileType === 'pdf') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
          }
          
          resolve(fullText);
        } catch (error) {
          reject(new Error("Failed to parse PDF: " + error.message));
        }
      };
      reader.onerror = (e) => reject(new Error("Failed to read PDF file"));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error("Unsupported file type. Please upload PDF, TXT, or CSV."));
    }
  });
};

/**
 * Performs a web search using DuckDuckGo HTML via a CORS proxy.
 */
export const performWebSearch = async (query) => {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    // Using a public CORS proxy. In production, you should use your own backend endpoint.
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) throw new Error("No search results returned from proxy");

    // Very basic HTML parsing to extract snippet results
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    const resultElements = doc.querySelectorAll('.result__snippet');
    
    let combinedSnippets = "WEB SEARCH RESULTS:\n";
    let count = 0;
    resultElements.forEach(el => {
      if (count < 5) { // Limit to top 5 results to save context window
        combinedSnippets += `- ${el.textContent.trim()}\n`;
        count++;
      }
    });

    if (count === 0) return "WEB SEARCH RESULTS: No results found for this query.";
    return combinedSnippets;

  } catch (error) {
    console.error("Web search failed:", error);
    return `WEB SEARCH RESULTS: Failed to fetch live data (${error.message}). Rely on internal knowledge.`;
  }
};
