const express = require('express');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
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
    'distribucion', 'mobiliarioCalidad', 'mobiliarioCantidad',
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

    // Enviar PDF como respuesta
    const fileName = `Estudio_Socioeconomico_${(formData.nombre || 'Candidato').replace(/\s+/g, '_')}.pdf`;
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);

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
