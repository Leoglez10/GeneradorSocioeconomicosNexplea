const puppeteer = require('puppeteer');

let browserInstance = null;

/**
 * Obtiene (o crea) una instancia singleton del browser de Puppeteer.
 */
async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none',
      ],
    };

    // En producción (Docker), usar el Chromium del sistema
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browserInstance = await puppeteer.launch(launchOptions);
    console.log('✅ Puppeteer browser launched');
  }
  return browserInstance;
}

/**
 * Genera un PDF a partir de un string HTML completo.
 * @param {string} htmlContent - HTML completo con estilos embebidos
 * @param {('Letter'|'A4')} [pageFormat='Letter'] - Tamaño de hoja
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
async function generatePdf(htmlContent, pageFormat = 'Letter') {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const safePageFormat = pageFormat === 'A4' ? 'A4' : 'Letter';

  try {
    // Establecer el contenido HTML
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Esperar a que las imágenes base64 carguen
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve; // No fallar si una imagen no carga
          }))
      );
    });

    // Generar PDF (Puppeteer v20+ returns Uint8Array, convert to Buffer for Express)
    const pdfUint8 = await page.pdf({
      format: safePageFormat,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '18mm',
        bottom: '18mm',
        left: '12mm',
        right: '12mm',
      },
      displayHeaderFooter: false,
    });

    return Buffer.from(pdfUint8);
  } finally {
    await page.close();
  }
}

/**
 * Genera un PDF de portada (1 página, sin márgenes, sin header/footer).
 * @param {string} htmlContent - HTML completo de la portada
 * @param {('Letter'|'A4')} [pageFormat='Letter'] - Tamaño de hoja
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
async function generateCoverPdf(htmlContent, pageFormat = 'Letter') {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const safePageFormat = pageFormat === 'A4' ? 'A4' : 'Letter';

  try {
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Esperar a que las imágenes base64 carguen
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          }))
      );
    });

    const pdfUint8 = await page.pdf({
      format: safePageFormat,
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
      displayHeaderFooter: false,
    });

    return Buffer.from(pdfUint8);
  } finally {
    await page.close();
  }
}

/**
 * Cierra el browser de Puppeteer (para limpieza al apagar el server).
 */
async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    console.log('🔒 Puppeteer browser closed');
  }
}

module.exports = { generatePdf, generateCoverPdf, closeBrowser };
