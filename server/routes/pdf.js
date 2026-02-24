const express = require('express');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const { PDFDocument } = require('pdf-lib');
const { generatePdf } = require('../utils/puppeteer');

const router = express.Router();

// Pre-leer el logo como base64 para embeber en la plantilla
const logoPath = path.join(__dirname, '..', '..', 'WEB', 'app', 'src', 'assets', 'nexplea.png');
let logoBase64 = '';
try {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = logoBuffer.toString('base64');
  console.log('✅ Logo loaded for PDF watermark');
} catch (err) {
  console.warn('⚠️ Could not load logo:', err.message);
}

// Ruta a la plantilla EJS
const templatePath = path.join(__dirname, '..', 'templates', 'socioeconomico.ejs');

/**
 * Normaliza los datos del formulario asegurando que todos los campos
 * tengan valores por defecto para evitar errores en la plantilla EJS.
 */
function normalizeFormData(raw) {
  const d = { ...raw };

  // Strings simples
  const stringFields = [
    'fecha', 'puesto', 'nombre', 'lugarNacimiento', 'fechaNacimiento',
    'edad', 'sexo', 'estadoCivil', 'calle', 'colonia', 'municipio',
    'cp', 'estado', 'entreCalles', 'gradoEstudios', 'telefonos',
    'estudiosActuales', 'periodosInactivos', 'motivosInactivos',
    'religion', 'enfermedadesFamilia', 'planes', 'notasLaboralesFamiliares',
    'solucionDeficit', 'tiempoResidencia', 'nivelZona', 'tipoVivienda',
    'mobiliarioCalidad', 'mobiliarioCantidad',
    'tamanoVivienda', 'condicionesVivienda',
    'conclusionPersonal', 'conclusionLaboral', 'conclusionSocio', 'dictamen'
  ];
  stringFields.forEach(f => { if (!d[f]) d[f] = ''; });

  // Documentos
  const docDefault = { checked: false, folio: '' };
  const docKeys = [
    'actaNacimiento', 'ine', 'cartillaMilitar', 'actaMatrimonio', 'curp',
    'licenciaConducir', 'actaNacConyuge', 'imss', 'recibosNomina',
    'actaNacHijos', 'compImpuestos', 'vigenciaMigratoria', 'compDomicilio',
    'rfc', 'visaNorteamericana'
  ];
  if (!d.docs || typeof d.docs !== 'object') d.docs = {};
  docKeys.forEach(k => {
    if (!d.docs[k] || typeof d.docs[k] !== 'object') {
      d.docs[k] = { ...docDefault };
    } else {
      d.docs[k] = { ...docDefault, ...d.docs[k] };
    }
  });

  // Estudios
  const estDefault = { periodo: '', escuela: '', certificado: '', promedio: '' };
  const estKeys = ['primaria', 'secundaria', 'carreraComercial', 'bachillerato', 'licenciatura', 'cedulaProfesional', 'otros'];
  if (!d.estudios || typeof d.estudios !== 'object') d.estudios = {};
  estKeys.forEach(k => {
    if (!d.estudios[k] || typeof d.estudios[k] !== 'object') {
      d.estudios[k] = { ...estDefault };
    } else {
      d.estudios[k] = { ...estDefault, ...d.estudios[k] };
    }
  });

  // Objetos sociales
  const socialDefaults = {
    deporte: { respuesta: 'No', detalles: '' },
    sindicato: { respuesta: 'No', detalles: '', cargo: '' },
    partidoPolitico: { respuesta: 'No', detalles: '', cargo: '' },
    alcohol: { respuesta: 'No', detalles: '' },
    tabaco: { respuesta: 'No', detalles: '' },
    cirugias: { respuesta: 'No', detalles: '' },
  };
  Object.entries(socialDefaults).forEach(([key, def]) => {
    if (!d[key] || typeof d[key] !== 'object') {
      d[key] = { ...def };
    } else {
      d[key] = { ...def, ...d[key] };
    }
  });

  // Distribución (objeto estructurado)
  const distDefault = { recamaras: '0', banos: '0', cocina: '0', comedor: '0', sala: '0', patioServicio: '0', cuartoServicio: '0', jardin: '0', garaje: '0' };
  if (!d.distribucion || typeof d.distribucion !== 'object') {
    d.distribucion = { ...distDefault };
  } else {
    d.distribucion = { ...distDefault, ...d.distribucion };
  }

  // Arrays dinámicos
  if (!Array.isArray(d.familiares)) d.familiares = [];
  if (!Array.isArray(d.laboralesFamiliares)) d.laboralesFamiliares = [];
  if (!Array.isArray(d.ingresos)) d.ingresos = [];
  if (!Array.isArray(d.egresos)) d.egresos = [];
  if (!Array.isArray(d.bienes)) d.bienes = [];
  if (!Array.isArray(d.referencias)) d.referencias = [];
  if (!Array.isArray(d.referenciasVecinales)) d.referenciasVecinales = [];
  if (!Array.isArray(d.empleos)) d.empleos = [];

  // Fotos
  if (!d.fotos || typeof d.fotos !== 'object') {
    d.fotos = { candidato: '', fachada: '', interior: '' };
  }

  // Fotos extras
  if (!Array.isArray(d.fotosExtras)) d.fotosExtras = [];
  d.fotosExtras = d.fotosExtras.map(f => ({
    imagen: f.imagen || '',
    pieDeFoto: f.pieDeFoto || ''
  }));

  // Documentos extras
  if (!Array.isArray(d.documentosExtras)) d.documentosExtras = [];
  d.documentosExtras = d.documentosExtras.map(doc => ({
    archivo: doc.archivo || '',
    nombre: doc.nombre || ''
  }));

  // Marca de agua en extras
  if (typeof d.marcaDeAguaEnExtras !== 'boolean') d.marcaDeAguaEnExtras = true;

  return d;
}

/**
 * POST /api/generate-pdf
 * Body: formData JSON completo del estudio socioeconómico
 * Response: PDF file buffer
 */
router.post('/generate-pdf', async (req, res) => {
  try {
    const rawData = req.body;

    if (!rawData || typeof rawData !== 'object') {
      return res.status(400).json({ error: 'Se requiere el JSON del formulario en el body.' });
    }

    // Normalizar datos para evitar errores de propiedades undefined
    const formData = normalizeFormData(rawData);

    // Inyectar logo base64 en los datos
    formData._logoBase64 = logoBase64;

    // Renderizar la plantilla HTML con EJS
    const html = await ejs.renderFile(templatePath, { data: formData }, {
      async: true,
    });

    // Generar PDF con Puppeteer
    const pdfBuffer = await generatePdf(html);

    // --- Fusionar documentos PDF extra si existen ---
    const docsExtras = formData.documentosExtras.filter(d => d.archivo);
    let finalPdfBuffer = pdfBuffer;

    if (docsExtras.length > 0) {
      try {
        const basePdf = await PDFDocument.load(pdfBuffer);

        // Preparar la imagen del logo para marca de agua si es necesario
        let logoImage = null;
        let logoDims = null;
        if (formData.marcaDeAguaEnExtras && logoBase64) {
          const logoBytes = Buffer.from(logoBase64, 'base64');
          logoImage = await basePdf.embedPng(logoBytes).catch(() => null);
          if (logoImage) {
            logoDims = logoImage.scale(1);
          }
        }

        for (const docExtra of docsExtras) {
          try {
            // Extraer bytes del base64 data URL
            const base64Data = docExtra.archivo.replace(/^data:[^;]+;base64,/, '');
            const docBytes = Buffer.from(base64Data, 'base64');
            const externalPdf = await PDFDocument.load(docBytes, { ignoreEncryption: true });
            const copiedPages = await basePdf.copyPages(externalPdf, externalPdf.getPageIndices());

            for (const page of copiedPages) {
              basePdf.addPage(page);

              // Agregar marca de agua si está habilitado
              if (logoImage && logoDims) {
                const { width, height } = page.getSize();

                // Marca de agua diagonal central (opacidad ~0.07)
                const wmWidth = width * 0.65;
                const wmScale = wmWidth / logoDims.width;
                const wmHeight = logoDims.height * wmScale;
                page.drawImage(logoImage, {
                  x: (width - wmWidth) / 2,
                  y: (height - wmHeight) / 2,
                  width: wmWidth,
                  height: wmHeight,
                  opacity: 0.07,
                });

                // Logo esquina inferior derecha (opacidad ~0.65)
                const cornerWidth = 90;
                const cornerScale = cornerWidth / logoDims.width;
                const cornerHeight = logoDims.height * cornerScale;
                page.drawImage(logoImage, {
                  x: width - cornerWidth - 18,
                  y: 18,
                  width: cornerWidth,
                  height: cornerHeight,
                  opacity: 0.65,
                });
              }
            }
          } catch (docErr) {
            console.warn(`⚠️ Could not merge extra document "${docExtra.nombre}":`, docErr.message);
          }
        }

        const mergedBytes = await basePdf.save();
        finalPdfBuffer = Buffer.from(mergedBytes);
      } catch (mergeErr) {
        console.error('⚠️ Error merging extra documents, returning base PDF:', mergeErr.message);
        // Si falla la fusión, devolver el PDF base
      }
    }

    // Enviar PDF como respuesta
    const fileName = `Estudio_Socioeconomico_${(formData.nombre || 'Candidato').replace(/\s+/g, '_')}.pdf`;
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': finalPdfBuffer.length,
    });

    res.send(finalPdfBuffer);

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Error al generar el PDF.',
      details: error.message 
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ESE PDF Generator',
    logoLoaded: !!logoBase64,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
