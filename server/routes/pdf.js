const express = require('express');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const { PDFDocument } = require('pdf-lib');
const { generatePdf, generateCoverPdf } = require('../utils/puppeteer');

const router = express.Router();

// Pre-leer imágenes como base64 para embeber en la plantilla
const cornerLogoPath = path.join(__dirname, '..', '..', 'WEB', 'app', 'src', 'assets', 'nexplea.png');
const xImagePath = path.join(__dirname, '..', '..', 'WEB', 'app', 'src', 'assets', 'x.png');
let cornerLogoBase64 = '';
let xImageBase64 = '';
try {
  const cornerBuffer = fs.readFileSync(cornerLogoPath);
  cornerLogoBase64 = cornerBuffer.toString('base64');
  console.log('✅ Corner logo (nexplea3) loaded');
} catch (err) {
  console.warn('⚠️ Could not load corner logo (nexplea3):', err.message);
}
try {
  const xBuffer = fs.readFileSync(xImagePath);
  xImageBase64 = xBuffer.toString('base64');
  console.log('✅ X image loaded');
} catch (err) {
  console.warn('⚠️ Could not load x image:', err.message);
}

// Pre-leer imagen de portada como base64
const portadaBgPath = path.join(__dirname, '..', '..', 'WEB', 'app', 'src', 'assets', 'portada nexplea.png');
let portadaBgBase64 = '';
try {
  const portadaBuffer = fs.readFileSync(portadaBgPath);
  portadaBgBase64 = portadaBuffer.toString('base64');
  console.log('✅ Portada background image loaded');
} catch (err) {
  console.warn('⚠️ Could not load portada background image:', err.message);
}

// Rutas a las plantillas EJS
const templatePath = path.join(__dirname, '..', 'templates', 'socioeconomico.ejs');
const portadaTemplatePath = path.join(__dirname, '..', 'templates', 'portada.ejs');

/**
 * Normaliza los datos del formulario asegurando que todos los campos
 * tengan valores por defecto para evitar errores en la plantilla EJS.
 */
function normalizeFormData(raw) {
  const d = { ...raw };

  const normalizeYesNoValue = (value, fallback = 'No') => {
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value !== 'string') return fallback;

    const normalized = value.trim().toLowerCase();
    if (!normalized) return fallback;

    if (['si', 'sí', 's', 'yes', 'y', 'true', '1'].includes(normalized)) return 'Sí';
    if (['no', 'n', 'false', '0'].includes(normalized)) return 'No';

    return fallback;
  };

  // Strings simples
  const stringFields = [
    'fecha', 'puesto', 'nombre', 'lugarNacimiento', 'fechaNacimiento',
    'edad', 'sexo', 'estadoCivil', 'calle', 'colonia', 'municipio',
    'cp', 'estado', 'entreCalles', 'gradoEstudios', 'telefonos',
    'estudiosActuales', 'periodosInactivos', 'motivosInactivos',
    'religion', 'enfermedadesFamilia', 'planes', 'notasLaboralesFamiliares',
    'solucionDeficit', 'tiempoResidencia', 'nivelZona', 'tipoVivienda',
    'mobiliarioCalidad',
    'tamanoVivienda',
    'conclusionPersonal', 'conclusionLaboral', 'conclusionSocio', 'dictamen'
  ];
  stringFields.forEach(f => { if (!d[f]) d[f] = ''; });

  // Mobiliario (Cantidad) puede ser selección múltiple
  if (Array.isArray(d.mobiliarioCantidad)) {
    d.mobiliarioCantidad = d.mobiliarioCantidad.filter(v => typeof v === 'string' && v.trim() !== '');
  } else if (typeof d.mobiliarioCantidad === 'string' && d.mobiliarioCantidad.trim() !== '') {
    d.mobiliarioCantidad = [d.mobiliarioCantidad];
  } else {
    d.mobiliarioCantidad = [];
  }

  // Condiciones de vivienda puede ser selección múltiple
  if (Array.isArray(d.condicionesVivienda)) {
    d.condicionesVivienda = d.condicionesVivienda.filter(v => typeof v === 'string' && v.trim() !== '');
  } else if (typeof d.condicionesVivienda === 'string' && d.condicionesVivienda.trim() !== '') {
    d.condicionesVivienda = [d.condicionesVivienda];
  } else {
    d.condicionesVivienda = [];
  }

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

    const responseSource =
      d[key].respuesta ??
      d[key].siNo ??
      d[key].respuestaSiNo ??
      d[key].valor ??
      d[key].value ??
      d[key].checked;

    d[key].respuesta = normalizeYesNoValue(responseSource, def.respuesta);
    d[key].detalles = typeof d[key].detalles === 'string' ? d[key].detalles : '';

    if (Object.prototype.hasOwnProperty.call(def, 'cargo')) {
      d[key].cargo = typeof d[key].cargo === 'string' ? d[key].cargo : '';
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

  // Notas/links de fotos
  if (!d.fotosNotas || typeof d.fotosNotas !== 'object') {
    d.fotosNotas = {};
  }
  ['candidato', 'fachada', 'interior'].forEach(k => {
    if (!d.fotosNotas[k] || typeof d.fotosNotas[k] !== 'object') {
      d.fotosNotas[k] = { mostrar: false, texto: '' };
    } else {
      d.fotosNotas[k] = { mostrar: !!d.fotosNotas[k].mostrar, texto: d.fotosNotas[k].texto || '' };
    }
  });

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

  // Portada
  if (typeof d.incluirPortada !== 'boolean') d.incluirPortada = true;
  if (typeof d.empresa !== 'string') d.empresa = '';

  // Tamaño de hoja del PDF
  const allowedPageFormats = ['Letter', 'A4'];
  if (!allowedPageFormats.includes(d.pageFormat)) d.pageFormat = 'Letter';

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

    // Inyectar imágenes base64 en los datos
    formData._cornerLogoBase64 = cornerLogoBase64;
    formData._xImageBase64 = xImageBase64;

    // Renderizar la plantilla HTML con EJS
    const html = await ejs.renderFile(templatePath, { data: formData }, {
      async: true,
    });

    // Generar PDF con Puppeteer
    const pdfBuffer = await generatePdf(html, formData.pageFormat);

    // --- Generar portada si está activada ---
    let coverPdfBuffer = null;
    if (formData.incluirPortada && portadaBgBase64) {
      try {
        formData._portadaBgBase64 = portadaBgBase64;
        const coverHtml = await ejs.renderFile(portadaTemplatePath, { data: formData }, { async: true });
        coverPdfBuffer = await generateCoverPdf(coverHtml, formData.pageFormat);
        console.log('✅ Cover page generated');
      } catch (coverErr) {
        console.warn('⚠️ Could not generate cover page:', coverErr.message);
      }
    }

    // --- Fusionar portada + estudio + documentos extras ---
    const docsExtras = formData.documentosExtras.filter(d => d.archivo);
    let finalPdfBuffer = pdfBuffer;

    // Si hay portada, anteponerla al estudio
    if (coverPdfBuffer) {
      try {
        const mergedDoc = await PDFDocument.create();

        // Copiar página de portada (sin watermark)
        const coverDoc = await PDFDocument.load(coverPdfBuffer);
        const [coverPage] = await mergedDoc.copyPages(coverDoc, [0]);
        mergedDoc.addPage(coverPage);

        // Copiar todas las páginas del estudio
        const studyDoc = await PDFDocument.load(pdfBuffer);
        const studyPages = await mergedDoc.copyPages(studyDoc, studyDoc.getPageIndices());
        for (const page of studyPages) {
          mergedDoc.addPage(page);
        }

        const mergedBytes = await mergedDoc.save();
        finalPdfBuffer = Buffer.from(mergedBytes);
        console.log('✅ Cover page prepended to study');
      } catch (prependErr) {
        console.warn('⚠️ Could not prepend cover page, using study PDF only:', prependErr.message);
      }
    }

    if (docsExtras.length > 0) {
      try {
        const basePdf = await PDFDocument.load(finalPdfBuffer);

        // Preparar la imagen del logo para marca de agua si es necesario
        let cornerImage = null;
        let cornerDims = null;
        let xImage = null;
        let xDims = null;
        if (formData.marcaDeAguaEnExtras) {
          if (cornerLogoBase64) {
            const cornerBytes = Buffer.from(cornerLogoBase64, 'base64');
            cornerImage = await basePdf.embedPng(cornerBytes).catch(() => null);
            if (cornerImage) cornerDims = cornerImage.scale(1);
          }
          if (xImageBase64) {
            const xBytes = Buffer.from(xImageBase64, 'base64');
            xImage = await basePdf.embedPng(xBytes).catch(() => null);
            if (xImage) xDims = xImage.scale(1);
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

              // Agregar imágenes decorativas si están habilitadas
              const { width, height } = page.getSize();

              // X image - esquina inferior derecha (grande, ~95% del ancho)
              if (xImage && xDims) {
                const xWidth = width * 0.95;
                const xScale = xWidth / xDims.width;
                const xHeight = xDims.height * xScale;
                page.drawImage(xImage, {
                  x: width - xWidth,
                  y: 0,
                  width: xWidth,
                  height: xHeight,
                  opacity: 0.07,
                });
              }

              // Corner logo (nexplea) - esquina superior derecha
              if (cornerImage && cornerDims) {
                const cWidth = 140;
                const cScale = cWidth / cornerDims.width;
                const cHeight = cornerDims.height * cScale;
                page.drawImage(cornerImage, {
                  x: width - cWidth - 18,
                  y: height - cHeight - 18,
                  width: cWidth,
                  height: cHeight,
                  opacity: 0.45,
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
    cornerLogoLoaded: !!cornerLogoBase64,
    xImageLoaded: !!xImageBase64,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
