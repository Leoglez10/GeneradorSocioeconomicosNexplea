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
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
async function generatePdf(htmlContent) {
  const browser = await getBrowser();
  const page = await browser.newPage();

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
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '18mm',
        bottom: '18mm',
        left: '12mm',
        right: '12mm',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width:100%;text-align:center;font-size:8px;color:#9ca3af;font-family:Arial,sans-serif;padding:0 12mm;">
          Estudio Socioeconómico — Nexplea
        </div>
      `,
      footerTemplate: `
        <div style="width:100%;text-align:center;font-size:8px;color:#9ca3af;font-family:Arial,sans-serif;padding:0 12mm;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `,
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

module.exports = { generatePdf, closeBrowser };
