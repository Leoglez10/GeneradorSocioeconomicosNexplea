const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Plus, Trash2, Printer, FileText, CheckCircle, RotateCcw, Upload, ImagePlus, FilePlus2, Download, Save, FileUp, X, ArrowRight, ArrowUp, ArrowDown, FolderOpen, Home, AlertTriangle, Info, XCircle, BookOpen, Cloud, CloudOff, Loader2, LogOut } from 'lucide-react';
import nexpleaLogo from './assets/nexplea2.png';
import HelpButton from './HelpButton';
import { useAuth } from './AuthProvider';
import LoginScreen from './LoginScreen';
import Dashboard from './Dashboard';
import { saveStudy, loadStudyById, loadStudyByCode, getUserStudies } from './cloudSaveService';
import { startFormTour, startFinalTour } from './utils/formTour';

// --- ESTADO INICIAL ---
const initialData = {
  // 1. Datos Generales
  fecha: new Date().toISOString().split('T')[0],
  puesto: '', empresa: '', nombre: '', lugarNacimiento: '', fechaNacimiento: '', edad: '', sexo: '', estadoCivil: '',
  calle: '', colonia: '', municipio: '', cp: '', estado: '',
  entreCalles: '', gradoEstudios: '', telefonos: '',

  // 2. Documentos
  docs: {
    actaNacimiento: { checked: false, folio: '' },
    ine: { checked: false, folio: '' },
    cartillaMilitar: { checked: false, folio: '' },
    actaMatrimonio: { checked: false, folio: '' },
    curp: { checked: false, folio: '' },
    licenciaConducir: { checked: false, folio: '' },
    actaNacConyuge: { checked: false, folio: '' },
    imss: { checked: false, folio: '' },
    recibosNomina: { checked: false, folio: '' },
    actaNacHijos: { checked: false, folio: '' },
    compImpuestos: { checked: false, folio: '' },
    vigenciaMigratoria: { checked: false, folio: '' },
    compDomicilio: { checked: false, folio: '' },
    rfc: { checked: false, folio: '' },
    visaNorteamericana: { checked: false, folio: '' }
  },

  // 3. Historial Academico
  estudios: {
    primaria: { periodo: '', escuela: '', certificado: '', promedio: '' },
    secundaria: { periodo: '', escuela: '', certificado: '', promedio: '' },
    carreraComercial: { periodo: '', escuela: '', certificado: '', promedio: '' },
    bachillerato: { periodo: '', escuela: '', certificado: '', promedio: '' },
    licenciatura: { periodo: '', escuela: '', certificado: '', promedio: '' },
    cedulaProfesional: { periodo: '', escuela: '', certificado: '', promedio: '' },
    otros: { periodo: '', escuela: '', certificado: '', promedio: '' },
  },
  estudiosActuales: '', periodosInactivos: '', motivosInactivos: '',

  // 4. Salud y Social
  deporte: { respuesta: 'No', detalles: '' },
  sindicato: { respuesta: 'No', detalles: '', cargo: '' },
  partidoPolitico: { respuesta: 'No', detalles: '', cargo: '' },
  religion: '',
  alcohol: { respuesta: 'No', detalles: '' },
  tabaco: { respuesta: 'No', detalles: '' },
  cirugias: { respuesta: 'No', detalles: '' },
  enfermedadesFamilia: '', planes: '',

  // 5. Grupo Familiar (Dinámico)
  familiares: [{ id: 1, nombre: '', parentesco: '', edad: '', edoCivil: '', celular: '', viveConUd: 'Sí' }],

  // 6. Laborales Familiares (Dinámico)
  laboralesFamiliares: [{ id: 1, nombre: '', empresa: '', puesto: '', antiguedad: '' }],
  notasLaboralesFamiliares: '',

  // 7. Economía
  ingresos: [{ id: 1, nombre: '', sueldo: '', aportacion: '' }],
  egresos: [{ id: 1, concepto: '', monto: '' }],
  solucionDeficit: '',

  // 8. Bienes
  bienes: [{ id: 1, propietario: '', tipo: '', adeudo: '' }],

  // 9. Vivienda
  tiempoResidencia: '', nivelZona: '', tipoVivienda: '',
  distribucion: { recamaras: '0', banos: '0', cocina: '0', comedor: '0', sala: '0', patioServicio: '0', cuartoServicio: '0', jardin: '0', garaje: '0' },
  mobiliarioCalidad: '', mobiliarioCantidad: [], tamanoVivienda: '', condicionesVivienda: [],

  // 10. Referencias Personales
  referencias: [{ id: 1, nombre: '', tiempo: '', telefono: '', comentarios: '' }],

  // 11. Referencias Vecinales
  referenciasVecinales: [{ id: 1, nombre: '', telefono: '', domicilio: '', conceptoAspirante: '', conceptoFamilia: '', estadoCivilVecinal: '', tieneHijos: '', sabeDondeTrabaja: '', notas: '' }],

  // 12. Laboral (Dinámico)
  empleos: [{
    id: 1,
    // Candidato
    empresa: '', area: '', domicilio: '', colonia: '', cp: '', telefono: '', tipoEmpresa: '', puesto: '', periodo: '', sueldoInicial: '', sueldoFinal: '', jefe: '', puestoJefe: '', descripcionTrabajo: '', motivoSalida: '',
    // Validación
    empresaValidada: '', telefonoValidado: '', contactoValidado: '', puestoContacto: '', tiempoLaboradoValidado: '', puestoInicialValidado: '', puestoFinalValidado: '', jefeValidado: '', sueldoInicialValidado: '', sueldoFinalValidado: '', motivoSalidaValidado: '', recomendable: '', recontratable: '',
    // Gráfica
    calidadTrabajo: '', puntualidad: '', honradez: '', responsabilidad: '', adaptacion: '', actitudJefes: '', actitudCompaneros: '',
    // Comentarios
    comentariosReferencia: ''
  }],

  // 13. Conclusión y Fotos
  conclusionPersonal: '', conclusionLaboral: '', conclusionSocio: '', dictamen: '',
  fotos: { candidato: '', fachada: '', interior: '' },
  fotosNotas: { candidato: { mostrar: false, texto: '' }, fachada: { mostrar: false, texto: '' }, interior: { mostrar: false, texto: '' } },

  // 14. Extras (fotos y documentos adicionales)
  fotosExtras: [],
  documentosExtras: [],
  marcaDeAguaEnExtras: true,
  incluirPortada: true,
  pageFormat: 'Letter'
};

export default function App() {
  const { user, loading: authLoading } = useAuth();

  const normalizeArray = useCallback((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') return [value];
    return [];
  }, []);
  const normalizeMobiliarioCantidad = normalizeArray;

  // Restaurar datos de localStorage al iniciar
  const [currentStep, setCurrentStep] = useState(() => {
    try { const s = localStorage.getItem('ese_step'); return s ? Number(s) : 1; } catch { return 1; }
  });
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('ese_formData');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialData,
          ...parsed,
          mobiliarioCantidad: normalizeArray(parsed.mobiliarioCantidad),
          condicionesVivienda: normalizeArray(parsed.condicionesVivienda)
        };
      }
    } catch { }
    return initialData;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProgressMenu, setShowProgressMenu] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true); // Always start at dashboard
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [modal, setModal] = useState(null);
  const fileInputRef = useRef(null);
  const totalSteps = 10;
  const stepTitles = {
    1: 'Datos Generales',
    2: 'Documentación y Escolaridad',
    3: 'Antecedentes Laborales',
    4: 'Sociales y Médicos',
    5: 'Grupo Familiar',
    6: 'Situación Económica',
    7: 'Habitación y Ambiente',
    8: 'Referencias',
    9: 'Empleos',
    10: 'Conclusión y PDF'
  };
  const stepProgress = Math.round((currentStep / totalSteps) * 100);

  // --- CLOUD SAVE STATE ---
  const [cloudDocId, setCloudDocId] = useState(null);
  const [cloudCode, setCloudCode] = useState(null);
  const [cloudSaveStatus, setCloudSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }
  const autoSaveTimer = useRef(null);
  const lastSavedData = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auto-guardar en localStorage cada vez que cambian los datos o el paso
  useEffect(() => {
    try {
      localStorage.setItem('ese_formData', JSON.stringify(formData));
      localStorage.setItem('ese_step', String(currentStep));
    } catch { }
  }, [formData, currentStep]);

  // --- CLOUD AUTO-SAVE (debounced 5s) ---
  useEffect(() => {
    if (!user || showWelcome || !cloudDocId) return;

    // Don't auto-save if data hasn't changed
    const dataStr = JSON.stringify(formData);
    if (lastSavedData.current === dataStr) return;

    // Show pending immediately when data changes
    setCloudSaveStatus('pending');

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      try {
        setCloudSaveStatus('saving');
        const dataToSave = { ...formData, _currentStep: currentStep };
        const result = await saveStudy(dataToSave, cloudDocId, cloudCode);
        setCloudDocId(result.docId);
        setCloudCode(result.code);
        lastSavedData.current = dataStr;
        setCloudSaveStatus('saved');
        setTimeout(() => setCloudSaveStatus('idle'), 3000);
      } catch (err) {
        console.error('Auto-save failed:', err);
        setCloudSaveStatus('error');
        setTimeout(() => setCloudSaveStatus('idle'), 5000);
      }
    }, 5000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formData, currentStep, user, showWelcome, cloudDocId, cloudCode]);



  // --- DASHBOARD HANDLERS ---
  const handleNewStudy = async () => {
    const newData = { ...initialData, fecha: new Date().toISOString().split('T')[0] };
    setFormData(newData);
    setCurrentStep(1);
    setCloudDocId(null);
    setCloudCode(null);
    lastSavedData.current = null;
    setShowWelcome(false);
    // Save immediately to get docId/code
    try {
      setCloudSaveStatus('saving');
      const result = await saveStudy({ ...newData, _currentStep: 1 });
      setCloudDocId(result.docId);
      setCloudCode(result.code);
      lastSavedData.current = JSON.stringify(newData);
      setCloudSaveStatus('saved');
      setTimeout(() => setCloudSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Initial save failed:', err);
      setCloudSaveStatus('error');
    }
  };

  const handleLoadStudy = async (docId) => {
    try {
      const result = await loadStudyById(docId);
      setFormData({ ...initialData, ...result.formData });
      setCurrentStep(result.meta.currentStep || 1);
      setCloudDocId(result.meta.docId);
      setCloudCode(result.meta.code);
      lastSavedData.current = JSON.stringify(result.formData);
      setShowWelcome(false);
    } catch (err) {
      console.error('Load study failed:', err);
      alert('Error al cargar el estudio: ' + err.message);
    }
  };

  const handleExportStudy = async (docId) => {
    try {
      const result = await loadStudyById(docId);
      const dataStr = JSON.stringify(result.formData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ESE_Progreso_${(result.formData.nombre || 'Candidato').replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Error al exportar: ' + err.message);
    }
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxToggle = (field, value) => {
    setFormData(prev => {
      const current = normalizeArray(prev[field]);
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleDocChange = (docName, field, value) => {
    setFormData(prev => ({
      ...prev,
      docs: { ...prev.docs, [docName]: { ...prev.docs[docName], [field]: value } }
    }));
  };

  const handleEstudioChange = (nivel, field, value) => {
    setFormData(prev => ({
      ...prev,
      estudios: { ...prev.estudios, [nivel]: { ...prev.estudios[nivel], [field]: value } }
    }));
  };

  const handleSocialChange = (campo, field, value) => {
    setFormData(prev => ({
      ...prev,
      [campo]: { ...prev[campo], [field]: value }
    }));
  };

  const handleDistribucionChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      distribucion: { ...prev.distribucion, [key]: value }
    }));
  };

  const handleDynamicChange = (arrayName, id, field, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addDynamicItem = (arrayName, defaultObj) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { id: Date.now(), ...defaultObj }]
    }));
  };

  const removeDynamicItem = (arrayName, id) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter(item => item.id !== id)
    }));
  };

  const handlePhotoUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          fotos: { ...prev.fotos, [type]: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFotoNotaToggle = (tipo) => {
    setFormData(prev => ({
      ...prev,
      fotosNotas: {
        ...prev.fotosNotas,
        [tipo]: { ...prev.fotosNotas?.[tipo], mostrar: !prev.fotosNotas?.[tipo]?.mostrar }
      }
    }));
  };

  const handleFotoNotaTexto = (tipo, valor) => {
    setFormData(prev => ({
      ...prev,
      fotosNotas: {
        ...prev.fotosNotas,
        [tipo]: { ...prev.fotosNotas?.[tipo], texto: valor }
      }
    }));
  };

  // --- EXTRAS HANDLERS ---
  const totalExtras = formData.fotosExtras.length + formData.documentosExtras.length;
  const MAX_EXTRAS = 10;

  const addFotoExtra = () => {
    if (totalExtras >= MAX_EXTRAS) return;
    setFormData(prev => ({
      ...prev,
      fotosExtras: [...prev.fotosExtras, { id: Date.now(), imagen: '', pieDeFoto: '' }]
    }));
  };

  const removeFotoExtra = (id) => {
    setFormData(prev => ({
      ...prev,
      fotosExtras: prev.fotosExtras.filter(f => f.id !== id)
    }));
  };

  const handleFotoExtraUpload = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        fotosExtras: prev.fotosExtras.map(f => f.id === id ? { ...f, imagen: reader.result } : f)
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFotoExtraPie = (id, value) => {
    setFormData(prev => ({
      ...prev,
      fotosExtras: prev.fotosExtras.map(f => f.id === id ? { ...f, pieDeFoto: value } : f)
    }));
  };

  const addDocExtra = () => {
    if (totalExtras >= MAX_EXTRAS) return;
    setFormData(prev => ({
      ...prev,
      documentosExtras: [...prev.documentosExtras, { id: Date.now(), archivo: '', nombre: '' }]
    }));
  };

  const removeDocExtra = (id) => {
    setFormData(prev => ({
      ...prev,
      documentosExtras: prev.documentosExtras.filter(d => d.id !== id)
    }));
  };

  const handleDocExtraUpload = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        documentosExtras: prev.documentosExtras.map(d => d.id === id ? { ...d, archivo: reader.result, nombre: file.name } : d)
      }));
    };
    reader.readAsDataURL(file);
  };

  // --- REORDENAR EXTRAS ---
  const moveFotoExtra = (index, direction) => {
    setFormData(prev => {
      const arr = [...prev.fotosExtras];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= arr.length) return prev;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return { ...prev, fotosExtras: arr };
    });
  };

  const moveDocExtra = (index, direction) => {
    setFormData(prev => {
      const arr = [...prev.documentosExtras];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= arr.length) return prev;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return { ...prev, documentosExtras: arr };
    });
  };

  const resetForm = () => {
    setModal({
      type: 'confirm',
      variant: 'danger',
      title: 'Borrar todos los datos',
      message: '¿Estás seguro de que deseas borrar todos los datos del formulario? Esta acción no se puede deshacer.',
      confirmText: 'Sí, borrar todo',
      onConfirm: () => {
        setFormData(initialData);
        setCurrentStep(1);
        setShowWelcome(true);
        try { localStorage.removeItem('ese_formData'); localStorage.removeItem('ese_step'); } catch { }
        setModal(null);
      }
    });
  };

  const goHome = () => {
    setModal({
      type: 'confirm',
      variant: 'info',
      title: 'Volver al Dashboard',
      message: 'Tu progreso se guarda automáticamente en la nube. ¿Deseas volver al panel principal?',
      confirmText: 'Sí, ir al Dashboard',
      onConfirm: () => {
        setShowWelcome(true);
        setShowProgressMenu(false);
        setCloudDocId(null);
        setCloudCode(null);
        lastSavedData.current = null;
        setModal(null);
      }
    });
  };

  const exportProgress = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ESE_Progreso_${(formData.nombre || 'Candidato').replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processFile = useCallback((file) => {
    setLoadError('');
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setLoadError('Por favor selecciona un archivo con extensión .json');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported && typeof imported === 'object' && !Array.isArray(imported)) {
          setFormData({ ...initialData, ...imported });
          setCurrentStep(1);
          setShowWelcome(false);
          setShowLoadModal(false);
          setLoadError('');
        } else {
          setLoadError('El archivo no tiene un formato válido. Asegúrate de que sea un archivo generado por esta app.');
        }
      } catch {
        setLoadError('Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.');
      }
    };
    reader.readAsText(file);
  }, []);

  const importProgress = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      processFile(file);
    };
    input.click();
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  // --- AUTH LOADING ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // --- LOGIN GATE ---
  if (!user) {
    return <LoginScreen />;
  }

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.details || `Error del servidor: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Estudio_Socioeconomico_${(formData.nombre || 'Candidato').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      setModal({
        type: 'alert',
        variant: 'error',
        title: 'Error al generar PDF',
        message: `Hubo un error al generar el PDF: ${error.message}`,
        onConfirm: () => setModal(null)
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- COMPONENTES DE PASOS ---
  const Step1 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 flex items-center gap-2">I. Datos Generales <HelpButton stepKey="step1" id="btn-ayuda-seccion" /></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700">Fecha</label><input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Puesto que solicita</label><input type="text" name="puesto" value={formData.puesto} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Nombre del aspirante</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Lugar de nacimiento</label><input type="text" name="lugarNacimiento" value={formData.lugarNacimiento} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label><input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Edad</label><input type="text" name="edad" value={formData.edad} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Sexo</label><select name="sexo" value={formData.sexo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"><option value="">Seleccione...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700">Estado Civil</label><input type="text" name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Domicilio (Calle, No. Ext e Int)</label><input type="text" name="calle" value={formData.calle} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Colonia</label><input type="text" name="colonia" value={formData.colonia} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Municipio</label><input type="text" name="municipio" value={formData.municipio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Código Postal</label><input type="text" name="cp" value={formData.cp} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Ciudad / Estado</label><input type="text" name="estado" value={formData.estado} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Entre la calle de</label><input type="text" name="entreCalles" value={formData.entreCalles} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Grado máximo de estudios</label><input type="text" name="gradoEstudios" value={formData.gradoEstudios} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Teléfonos</label><input type="text" name="telefonos" value={formData.telefonos} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" /></div>
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 flex items-center gap-2">II. Documentos Comprobatorios <HelpButton stepKey="step2" /></h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(formData.docs).map(([key, doc]) => (
          <div key={key} className="flex flex-col space-y-2 p-3 border rounded-md bg-gray-50">
            <label className="flex items-center space-x-2 font-medium text-gray-700 capitalize">
              <input type="checkbox" checked={doc.checked} onChange={(e) => handleDocChange(key, 'checked', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
              <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </label>
            <input type="text" placeholder="No. / Folio" value={doc.folio} onChange={(e) => handleDocChange(key, 'folio', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1 text-sm border" disabled={!doc.checked} />
          </div>
        ))}
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 flex items-center gap-2">III. Historial Académico <HelpButton stepKey="step3" /></h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nivel Escolar</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Escuela y Domicilio</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Certificado S/N</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(formData.estudios).map(([nivel, datos]) => (
              <tr key={nivel}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{nivel.replace(/([A-Z])/g, ' $1').trim()}</td>
                <td className="px-4 py-2"><input type="text" value={datos.periodo} onChange={(e) => handleEstudioChange(nivel, 'periodo', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-1 border text-sm" /></td>
                <td className="px-4 py-2"><input type="text" value={datos.escuela} onChange={(e) => handleEstudioChange(nivel, 'escuela', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-1 border text-sm" /></td>
                <td className="px-4 py-2"><input type="text" value={datos.certificado} onChange={(e) => handleEstudioChange(nivel, 'certificado', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-1 border text-sm" /></td>
                <td className="px-4 py-2"><input type="text" value={datos.promedio} onChange={(e) => handleEstudioChange(nivel, 'promedio', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-1 border text-sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium text-gray-700">Estudios actuales</label><input type="text" name="estudiosActuales" value={formData.estudiosActuales} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Periodos inactivos</label><input type="text" name="periodosInactivos" value={formData.periodosInactivos} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Motivos</label><input type="text" name="motivosInactivos" value={formData.motivosInactivos} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" /></div>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 flex items-center gap-2">IV. Antecedentes Sociales y Médicos <HelpButton stepKey="step4" /></h2>
      <div className="grid grid-cols-1 gap-4">
        {['deporte', 'sindicato', 'partidoPolitico', 'alcohol', 'tabaco', 'cirugias'].map(campo => (
          <div key={campo} className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 p-3 border rounded-md bg-gray-50">
            <span className="w-48 font-medium text-gray-700 capitalize">{campo.replace(/([A-Z])/g, ' $1').trim()}</span>
            <select value={formData[campo].respuesta} onChange={(e) => handleSocialChange(campo, 'respuesta', e.target.value)} className="rounded-md border-gray-300 shadow-sm p-2 border">
              <option value="No">No</option>
              <option value="Sí">Sí</option>
            </select>
            <input type="text" placeholder="¿Cuál? / Frecuencia" value={formData[campo].detalles} onChange={(e) => handleSocialChange(campo, 'detalles', e.target.value)} className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border" />
            {(campo === 'sindicato' || campo === 'partidoPolitico') && (
              <input type="text" placeholder="Cargo" value={formData[campo].cargo} onChange={(e) => handleSocialChange(campo, 'cargo', e.target.value)} className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border" />
            )}
          </div>
        ))}
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 p-3 border rounded-md bg-gray-50">
          <span className="w-48 font-medium text-gray-700">Religión</span>
          <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700">Antecedentes de enfermedades en familia directa</label><textarea name="enfermedadesFamilia" value={formData.enfermedadesFamilia} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows="2"></textarea></div>
        <div><label className="block text-sm font-medium text-gray-700">Planes a corto y mediano plazo</label><textarea name="planes" value={formData.planes} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows="2"></textarea></div>
      </div>
    </div>
  );

  const Step5 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b pb-2">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">V. Datos del Grupo Familiar <HelpButton stepKey="step5" /></h2>
        <button onClick={() => addDynamicItem('familiares', { nombre: '', parentesco: '', edad: '', edoCivil: '', celular: '', viveConUd: 'Sí' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar Familiar</button>
      </div>
      <div className="space-y-4">
        {formData.familiares.map((fam, index) => (
          <div key={fam.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 items-end p-4 pr-10 border rounded-md bg-gray-50 relative">
            <div className="absolute top-2 right-2"><button onClick={() => removeDynamicItem('familiares', fam.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
            <div className="sm:col-span-2 lg:col-span-2"><label className="block text-xs font-medium text-gray-700">Nombre</label><input type="text" value={fam.nombre} onChange={(e) => handleDynamicChange('familiares', fam.id, 'nombre', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Parentesco</label><input type="text" value={fam.parentesco} onChange={(e) => handleDynamicChange('familiares', fam.id, 'parentesco', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Edad</label><input type="text" value={fam.edad} onChange={(e) => handleDynamicChange('familiares', fam.id, 'edad', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Edo. Civil</label><input type="text" value={fam.edoCivil} onChange={(e) => handleDynamicChange('familiares', fam.id, 'edoCivil', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Teléfono</label><input type="text" value={fam.celular} onChange={(e) => handleDynamicChange('familiares', fam.id, 'celular', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Vive con Ud.</label><select value={fam.viveConUd} onChange={(e) => handleDynamicChange('familiares', fam.id, 'viveConUd', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"><option value="Sí">Sí</option><option value="No">No</option></select></div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b pb-2 mt-8">
        <h2 className="text-2xl font-bold text-blue-800">VI. Antecedentes Laborales Familiares</h2>
        <button onClick={() => addDynamicItem('laboralesFamiliares', { nombre: '', empresa: '', puesto: '', antiguedad: '' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar</button>
      </div>
      <div className="space-y-4">
        {formData.laboralesFamiliares.map((lab) => (
          <div key={lab.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-end p-4 pr-10 border rounded-md bg-gray-50 relative">
            <div className="absolute top-2 right-2"><button onClick={() => removeDynamicItem('laboralesFamiliares', lab.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
            <div><label className="block text-xs font-medium text-gray-700">Nombre</label><input type="text" value={lab.nombre} onChange={(e) => handleDynamicChange('laboralesFamiliares', lab.id, 'nombre', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Empresa</label><input type="text" value={lab.empresa} onChange={(e) => handleDynamicChange('laboralesFamiliares', lab.id, 'empresa', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Puesto</label><input type="text" value={lab.puesto} onChange={(e) => handleDynamicChange('laboralesFamiliares', lab.id, 'puesto', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Antigüedad</label><input type="text" value={lab.antiguedad} onChange={(e) => handleDynamicChange('laboralesFamiliares', lab.id, 'antiguedad', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
          </div>
        ))}
        <div><label className="block text-sm font-medium text-gray-700">Notas</label><textarea name="notasLaboralesFamiliares" value={formData.notasLaboralesFamiliares} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows="2"></textarea></div>
      </div>
    </div>
  );

  const Step6 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 flex items-center gap-2">VII. Situación Económica <HelpButton stepKey="step6" /></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Ingresos Mensuales</h3>
            <button onClick={() => addDynamicItem('ingresos', { nombre: '', sueldo: '', aportacion: '' })} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">+ Ingreso</button>
          </div>
          {formData.ingresos.map(ing => (
            <div key={ing.id} className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-2 relative pr-8 sm:pr-6">
              <input type="text" placeholder="Nombre" value={ing.nombre} onChange={(e) => handleDynamicChange('ingresos', ing.id, 'nombre', e.target.value)} className="w-full sm:w-1/3 rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
              <input type="text" placeholder="Sueldo" value={ing.sueldo} onChange={(e) => handleDynamicChange('ingresos', ing.id, 'sueldo', e.target.value)} className="w-full sm:w-1/3 rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
              <input type="text" placeholder="Aportación" value={ing.aportacion} onChange={(e) => handleDynamicChange('ingresos', ing.id, 'aportacion', e.target.value)} className="w-full sm:w-1/3 rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
              <button onClick={() => removeDynamicItem('ingresos', ing.id)} className="absolute right-0 top-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Egresos Mensuales</h3>
            <button onClick={() => addDynamicItem('egresos', { concepto: '', monto: '' })} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">+ Egreso</button>
          </div>
          {formData.egresos.map(egr => (
            <div key={egr.id} className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-2 relative pr-8 sm:pr-6">
              <input type="text" placeholder="Concepto" value={egr.concepto} onChange={(e) => handleDynamicChange('egresos', egr.id, 'concepto', e.target.value)} className="w-full sm:w-1/2 rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
              <input type="number" placeholder="Monto" value={egr.monto} onChange={(e) => handleDynamicChange('egresos', egr.id, 'monto', e.target.value)} className="w-full sm:w-1/2 rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
              <button onClick={() => removeDynamicItem('egresos', egr.id)} className="absolute right-0 top-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700">¿Cuándo los egresos son mayores a los ingresos, cómo los solventa?</label><textarea name="solucionDeficit" value={formData.solucionDeficit} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows="2"></textarea></div>

      <div className="flex justify-between items-center border-b pb-2 mt-8">
        <h2 className="text-2xl font-bold text-blue-800">VIII. Bienes (Muebles e Inmuebles)</h2>
        <button onClick={() => addDynamicItem('bienes', { propietario: '', tipo: '', adeudo: '' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar Bien</button>
      </div>
      <div className="space-y-4">
        {formData.bienes.map((bien) => (
          <div key={bien.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end p-4 border rounded-md bg-gray-50 relative">
            <div className="absolute top-2 right-2"><button onClick={() => removeDynamicItem('bienes', bien.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
            <div><label className="block text-xs font-medium text-gray-700">Nombre del propietario</label><input type="text" value={bien.propietario} onChange={(e) => handleDynamicChange('bienes', bien.id, 'propietario', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Muebles e inmuebles</label><input type="text" value={bien.tipo} onChange={(e) => handleDynamicChange('bienes', bien.id, 'tipo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Adeudo</label><input type="text" value={bien.adeudo} onChange={(e) => handleDynamicChange('bienes', bien.id, 'adeudo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
          </div>
        ))}
      </div>
    </div>
  );

  const Step7 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 flex items-center gap-2">IX. Habitación y Medio Ambiente <HelpButton stepKey="step7" /></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700">Tiempo de residencia actual</label><input type="text" name="tiempoResidencia" value={formData.tiempoResidencia} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Nivel de la zona</label><select name="nivelZona" value={formData.nivelZona} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"><option value="">Seleccione...</option><option value="Residencial">Residencial</option><option value="Media alta">Media alta</option><option value="Media">Media</option><option value="Media baja">Media baja</option><option value="Proletaria">Proletaria</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700">Tipo de vivienda</label><select name="tipoVivienda" value={formData.tipoVivienda} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"><option value="">Seleccione...</option><option value="Casa sola">Casa sola</option><option value="Dúplex">Dúplex</option><option value="Depto.">Depto.</option><option value="C. Huéspedes">C. Huéspedes</option><option value="Vecindad">Vecindad</option></select></div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Distribución</label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { key: 'recamaras', label: 'Recámaras' },
              { key: 'banos', label: 'Baños' },
              { key: 'cocina', label: 'Cocina' },
              { key: 'comedor', label: 'Comedor' },
              { key: 'sala', label: 'Sala' },
              { key: 'patioServicio', label: 'Patio de Servicio' },
              { key: 'cuartoServicio', label: 'Cuarto de Servicio' },
              { key: 'jardin', label: 'Jardín' },
              { key: 'garaje', label: 'Garaje' },
            ].map(item => (
              <div key={item.key} className="flex flex-col items-center">
                <label className="text-xs text-gray-600 mb-1 text-center">{item.label}</label>
                <input type="text" value={formData.distribucion[item.key]} onChange={(e) => handleDistribucionChange(item.key, e.target.value)} className="w-16 text-center rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
              </div>
            ))}
          </div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700">Mobiliario (Calidad)</label><select name="mobiliarioCalidad" value={formData.mobiliarioCalidad} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"><option value="">Seleccione...</option><option value="Lujoso">Lujoso</option><option value="Buena calidad">Buena calidad</option><option value="Calidad media">Calidad media</option><option value="Modesto">Modesto</option></select></div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobiliario (Cantidad)</label>
          <div className="flex flex-wrap gap-3 mt-1">
            {['Holgado', 'Completo', 'Incompleto', 'Deficiente'].map(opt => {
              const checked = normalizeMobiliarioCantidad(formData.mobiliarioCantidad).includes(opt);
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm transition-colors ${checked
                    ? 'bg-blue-100 border-blue-500 text-blue-800 font-medium'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxToggle('mobiliarioCantidad', opt)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700">La vivienda es</label><select name="tamanoVivienda" value={formData.tamanoVivienda} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"><option value="">Seleccione...</option><option value="Amplia">Amplia</option><option value="Suficiente">Suficiente</option><option value="Insuficiente">Insuficiente</option><option value="Precaria">Precaria</option></select></div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condiciones</label>
          <div className="flex flex-wrap gap-3 mt-1">
            {['Limpias', 'Sucias', 'Desordenadas', 'Ordenadas'].map(opt => {
              const checked = normalizeArray(formData.condicionesVivienda).includes(opt);
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm transition-colors ${checked
                    ? 'bg-blue-100 border-blue-500 text-blue-800 font-medium'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxToggle('condicionesVivienda', opt)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const Step8 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b pb-2">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">X. Referencias Personales <HelpButton stepKey="step8" /></h2>
        <button onClick={() => addDynamicItem('referencias', { nombre: '', tiempo: '', telefono: '', comentarios: '' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar Referencia</button>
      </div>
      <div className="space-y-4">
        {formData.referencias.map((ref) => (
          <div key={ref.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-end p-4 pr-10 border rounded-md bg-gray-50 relative">
            <div className="absolute top-2 right-2"><button onClick={() => removeDynamicItem('referencias', ref.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
            <div><label className="block text-xs font-medium text-gray-700">Nombre</label><input type="text" value={ref.nombre} onChange={(e) => handleDynamicChange('referencias', ref.id, 'nombre', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Tiempo de conocerlo</label><input type="text" value={ref.tiempo} onChange={(e) => handleDynamicChange('referencias', ref.id, 'tiempo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Teléfono</label><input type="text" value={ref.telefono} onChange={(e) => handleDynamicChange('referencias', ref.id, 'telefono', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div className="sm:col-span-2 lg:col-span-3"><label className="block text-xs font-medium text-gray-700">Comentarios</label><textarea value={ref.comentarios} onChange={(e) => handleDynamicChange('referencias', ref.id, 'comentarios', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" rows="2"></textarea></div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b pb-2 mt-8">
        <h2 className="text-2xl font-bold text-blue-800">XI. Referencias Vecinales</h2>
        <button onClick={() => addDynamicItem('referenciasVecinales', { nombre: '', telefono: '', domicilio: '', conceptoAspirante: '', conceptoFamilia: '', estadoCivilVecinal: '', tieneHijos: '', sabeDondeTrabaja: '', notas: '' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar Vecino</button>
      </div>
      <div className="space-y-4">
        {formData.referenciasVecinales.map((vec) => (
          <div key={vec.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end p-4 pr-10 border rounded-md bg-gray-50 relative">
            <div className="absolute top-2 right-2"><button onClick={() => removeDynamicItem('referenciasVecinales', vec.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
            <div><label className="block text-xs font-medium text-gray-700">Nombre</label><input type="text" value={vec.nombre} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'nombre', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Teléfono</label><input type="text" value={vec.telefono || ''} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'telefono', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Domicilio</label><input type="text" value={vec.domicilio} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'domicilio', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">¿Cómo conceptúa al aspirante?</label><input type="text" value={vec.conceptoAspirante} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'conceptoAspirante', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">¿Cómo conceptúa a la familia?</label><input type="text" value={vec.conceptoFamilia} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'conceptoFamilia', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Estado civil del aspirante</label><input type="text" value={vec.estadoCivilVecinal || vec.estadoCivilHijos || ''} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'estadoCivilVecinal', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">¿Tiene hijos?</label><input type="text" value={vec.tieneHijos || ''} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'tieneHijos', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">¿Sabe en donde trabaja?</label><input type="text" value={vec.sabeDondeTrabaja} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'sabeDondeTrabaja', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-medium text-gray-700">Notas</label><textarea value={vec.notas} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'notas', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" rows="2"></textarea></div>
          </div>
        ))}
      </div>
    </div>
  );

  const Step9 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b pb-2">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">XII. Antecedentes Laborales <HelpButton stepKey="step9" /></h2>
        <button onClick={() => addDynamicItem('empleos', { empresa: '', area: '', domicilio: '', colonia: '', cp: '', telefono: '', tipoEmpresa: '', puesto: '', periodo: '', sueldoInicial: '', sueldoFinal: '', jefe: '', puestoJefe: '', descripcionTrabajo: '', motivoSalida: '', empresaValidada: '', telefonoValidado: '', contactoValidado: '', puestoContacto: '', tiempoLaboradoValidado: '', puestoInicialValidado: '', puestoFinalValidado: '', jefeValidado: '', sueldoInicialValidado: '', sueldoFinalValidado: '', motivoSalidaValidado: '', recomendable: '', recontratable: '', calidadTrabajo: '', puntualidad: '', honradez: '', responsabilidad: '', adaptacion: '', actitudJefes: '', actitudCompaneros: '', comentariosReferencia: '' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar Empleo</button>
      </div>
      <div className="space-y-8">
        {formData.empleos.map((emp, index) => (
          <div key={emp.id} className="border-2 border-blue-200 rounded-lg p-4 pr-10 bg-white relative">
            <div className="absolute top-2 right-2"><button onClick={() => removeDynamicItem('empleos', emp.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button></div>
            <h3 className="text-lg font-bold text-blue-700 mb-4">Empleo {index + 1}</h3>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 border-b mb-2">Datos proporcionados por candidato</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <div><label className="block text-xs font-medium text-gray-700">Empresa</label><input type="text" value={emp.empresa} onChange={(e) => handleDynamicChange('empleos', emp.id, 'empresa', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Área o departamento</label><input type="text" value={emp.area} onChange={(e) => handleDynamicChange('empleos', emp.id, 'area', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Domicilio</label><input type="text" value={emp.domicilio} onChange={(e) => handleDynamicChange('empleos', emp.id, 'domicilio', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Colonia</label><input type="text" value={emp.colonia} onChange={(e) => handleDynamicChange('empleos', emp.id, 'colonia', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">C.P.</label><input type="text" value={emp.cp} onChange={(e) => handleDynamicChange('empleos', emp.id, 'cp', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Teléfono</label><input type="text" value={emp.telefono} onChange={(e) => handleDynamicChange('empleos', emp.id, 'telefono', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Tipo de empresa</label><input type="text" value={emp.tipoEmpresa} onChange={(e) => handleDynamicChange('empleos', emp.id, 'tipoEmpresa', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Puesto desempeñado</label><input type="text" value={emp.puesto} onChange={(e) => handleDynamicChange('empleos', emp.id, 'puesto', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Periodo trabajado</label><input type="text" value={emp.periodo} onChange={(e) => handleDynamicChange('empleos', emp.id, 'periodo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Sueldo inicial</label><input type="text" value={emp.sueldoInicial} onChange={(e) => handleDynamicChange('empleos', emp.id, 'sueldoInicial', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Sueldo final</label><input type="text" value={emp.sueldoFinal} onChange={(e) => handleDynamicChange('empleos', emp.id, 'sueldoFinal', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Nombre último jefe</label><input type="text" value={emp.jefe} onChange={(e) => handleDynamicChange('empleos', emp.id, 'jefe', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Puesto del jefe</label><input type="text" value={emp.puestoJefe} onChange={(e) => handleDynamicChange('empleos', emp.id, 'puestoJefe', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div className="sm:col-span-2 lg:col-span-3"><label className="block text-xs font-medium text-gray-700">¿Describa en qué consistía su trabajo?</label><textarea value={emp.descripcionTrabajo} onChange={(e) => handleDynamicChange('empleos', emp.id, 'descripcionTrabajo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" rows="2"></textarea></div>
                <div className="sm:col-span-2 lg:col-span-3"><label className="block text-xs font-medium text-gray-700">¿Por qué dejó el empleo?</label><textarea value={emp.motivoSalida} onChange={(e) => handleDynamicChange('empleos', emp.id, 'motivoSalida', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" rows="2"></textarea></div>
              </div>
            </div>

            <div className="mb-6 bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-700 border-b mb-2">Información validada con empresa</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <div><label className="block text-xs font-medium text-gray-700">Empresa</label><input type="text" value={emp.empresaValidada} onChange={(e) => handleDynamicChange('empleos', emp.id, 'empresaValidada', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Teléfono</label><input type="text" value={emp.telefonoValidado} onChange={(e) => handleDynamicChange('empleos', emp.id, 'telefonoValidado', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Nombre del contacto</label><input type="text" value={emp.contactoValidado} onChange={(e) => handleDynamicChange('empleos', emp.id, 'contactoValidado', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Puesto</label><input type="text" value={emp.puestoContacto} onChange={(e) => handleDynamicChange('empleos', emp.id, 'puestoContacto', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Tiempo laborado</label><input type="text" value={emp.tiempoLaboradoValidado} onChange={(e) => handleDynamicChange('empleos', emp.id, 'tiempoLaboradoValidado', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Puesto inicial</label><input type="text" value={emp.puestoInicialValidado} onChange={(e) => handleDynamicChange('empleos', emp.id, 'puestoInicialValidado', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Puesto final</label><input type="text" value={emp.puestoFinalValidado} onChange={(e) => handleDynamicChange('empleos', emp.id, 'puestoFinalValidado', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Jefe directo</label><input type="text" value={emp.jefeValidado} onChange={(e) => handleDynamicChange('empleos', emp.id, 'jefeValidado', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Sueldo inicial</label><input type="text" value={emp.sueldoInicialValidado} onChange={(e) => handleDynamicChange('empleos', emp.id, 'sueldoInicialValidado', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Sueldo final</label><input type="text" value={emp.sueldoFinalValidado} onChange={(e) => handleDynamicChange('empleos', emp.id, 'sueldoFinalValidado', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">Motivo de salida</label><input type="text" value={emp.motivoSalidaValidado} onChange={(e) => handleDynamicChange('empleos', emp.id, 'motivoSalidaValidado', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700">¿Es recomendable?</label><select value={emp.recomendable} onChange={(e) => handleDynamicChange('empleos', emp.id, 'recomendable', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm"><option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option></select></div>
                <div><label className="block text-xs font-medium text-gray-700">¿Es recontratable?</label><select value={emp.recontratable} onChange={(e) => handleDynamicChange('empleos', emp.id, 'recontratable', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm"><option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option></select></div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 border-b mb-2">Gráfica de Actualización Laboral</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['calidadTrabajo', 'puntualidad', 'honradez', 'responsabilidad', 'adaptacion', 'actitudJefes', 'actitudCompaneros'].map(graf => (
                  <div key={graf} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-50 p-2 rounded border">
                    <span className="text-sm font-medium capitalize">{graf.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <select value={emp[graf]} onChange={(e) => handleDynamicChange('empleos', emp.id, graf, e.target.value)} className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm p-1 border text-sm">
                      <option value="">Seleccione...</option>
                      <option value="MALA">Mala</option>
                      <option value="REGULAR">Regular</option>
                      <option value="BUENA">Buena</option>
                      <option value="EXCELENTE">Excelente</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Comentarios y Observaciones Generales de la Referencia</label>
              <textarea value={emp.comentariosReferencia} onChange={(e) => handleDynamicChange('empleos', emp.id, 'comentariosReferencia', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows="3"></textarea>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Step10 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex flex-wrap items-center justify-center gap-3">¡Formulario Completado! <HelpButton stepKey="step10" /></h2>
        <p className="text-gray-600 mt-2">Por favor, complete la conclusión y suba las fotos antes de generar el PDF.</p>
      </div>

      <div id="conclusion-section" className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-100 space-y-4">
        <h3 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-2">Conclusión de la Investigación</h3>
        <div><label className="block text-sm font-medium text-gray-700">Personal</label><textarea name="conclusionPersonal" value={formData.conclusionPersonal} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows="2"></textarea></div>
        <div><label className="block text-sm font-medium text-gray-700">Laboral</label><textarea name="conclusionLaboral" value={formData.conclusionLaboral} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows="2"></textarea></div>
        <div><label className="block text-sm font-medium text-gray-700">Socioeconómica</label><textarea name="conclusionSocio" value={formData.conclusionSocio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows="2"></textarea></div>

        <div className="mt-4">
          <label className="block text-sm font-bold text-gray-800">Dictamen Final: Por lo anterior, el investigado es considerado una persona...</label>
          <select name="dictamen" value={formData.dictamen} onChange={handleChange} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-3 border font-semibold text-lg">
            <option value="">Seleccione un dictamen...</option>
            <option value="RECOMENDABLE">Recomendable</option>
            <option value="RECOMENDABLE CON RESERVAS">Recomendable con reservas</option>
            <option value="NO RECOMENDABLE">No recomendable</option>
          </select>
        </div>
      </div>

      <div id="fotos-section" className="bg-gray-50 p-4 sm:p-6 rounded-lg border space-y-4">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Fotografías</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['candidato', 'fachada', 'interior'].map(tipo => (
            <div key={tipo} className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600 capitalize">Foto {tipo}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, tipo)} />
              </label>
              {formData.fotos[tipo] && <img src={formData.fotos[tipo]} alt={tipo} className="mt-2 h-24 object-cover rounded" />}
              <label className="flex items-center gap-2 mt-3 cursor-pointer text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.fotosNotas?.[tipo]?.mostrar || false}
                  onChange={() => handleFotoNotaToggle(tipo)}
                  className="accent-blue-600 w-3.5 h-3.5"
                />
                Añadir link / nota
              </label>
              {formData.fotosNotas?.[tipo]?.mostrar && (
                <input
                  type="text"
                  placeholder="Ej: https://maps.google.com/..."
                  value={formData.fotosNotas?.[tipo]?.texto || ''}
                  onChange={(e) => handleFotoNotaTexto(tipo, e.target.value)}
                  className="mt-1 w-full text-xs rounded-md border-gray-300 shadow-sm p-1.5 border"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FOTOS EXTRAS */}
      <div id="fotos-extra-section" className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-yellow-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-yellow-200 pb-2">
          <h3 className="text-xl font-bold text-yellow-800">Fotos Extra</h3>
          <button
            onClick={addFotoExtra}
            disabled={totalExtras >= MAX_EXTRAS}
            className="flex items-center text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImagePlus className="w-4 h-4 mr-1" /> Agregar Foto Extra
          </button>
        </div>
        {totalExtras >= MAX_EXTRAS && (
          <p className="text-xs text-red-500">Se alcanzó el límite de {MAX_EXTRAS} elementos extra (fotos + documentos).</p>
        )}
        {formData.fotosExtras.length === 0 && (
          <p className="text-sm text-gray-500 italic">No se han agregado fotos extra.</p>
        )}
        <div className="space-y-4">
          {formData.fotosExtras.map((foto, index) => (
            <div key={foto.id} className="flex flex-col md:flex-row items-start gap-4 p-4 pr-24 border rounded-md bg-white relative">
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  onClick={() => moveFotoExtra(index, -1)}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-yellow-700 disabled:opacity-30 disabled:cursor-not-allowed p-0.5 rounded hover:bg-yellow-100 transition-colors"
                  title="Mover arriba"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveFotoExtra(index, 1)}
                  disabled={index === formData.fotosExtras.length - 1}
                  className="text-gray-400 hover:text-yellow-700 disabled:opacity-30 disabled:cursor-not-allowed p-0.5 rounded hover:bg-yellow-100 transition-colors"
                  title="Mover abajo"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button onClick={() => removeFotoExtra(foto.id)} className="text-red-500 hover:text-red-700 p-0.5"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="w-full sm:w-auto sm:min-w-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <label className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs font-medium text-gray-600">Foto Extra {index + 1}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFotoExtraUpload(foto.id, e)} />
                </label>
                {foto.imagen && <img src={foto.imagen} alt={`Extra ${index + 1}`} className="mt-2 h-24 object-cover rounded" />}
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700">Pie de foto / Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Comprobante de domicilio, Identificación oficial..."
                  value={foto.pieDeFoto}
                  onChange={(e) => handleFotoExtraPie(foto.id, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENTOS EXTRAS */}
      <div id="docs-extra-section" className="bg-purple-50 p-4 sm:p-6 rounded-lg border border-purple-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-purple-200 pb-2">
          <h3 className="text-xl font-bold text-purple-800">Documentos Extra (PDF)</h3>
          <button
            onClick={addDocExtra}
            disabled={totalExtras >= MAX_EXTRAS}
            className="flex items-center text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FilePlus2 className="w-4 h-4 mr-1" /> Agregar Documento Extra
          </button>
        </div>
        {totalExtras >= MAX_EXTRAS && (
          <p className="text-xs text-red-500">Se alcanzó el límite de {MAX_EXTRAS} elementos extra (fotos + documentos).</p>
        )}
        {formData.documentosExtras.length === 0 && (
          <p className="text-sm text-gray-500 italic">No se han agregado documentos extra.</p>
        )}
        <div className="space-y-3">
          {formData.documentosExtras.map((doc, index) => (
            <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 pr-24 border rounded-md bg-white relative">
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  onClick={() => moveDocExtra(index, -1)}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-purple-700 disabled:opacity-30 disabled:cursor-not-allowed p-0.5 rounded hover:bg-purple-100 transition-colors"
                  title="Mover arriba"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveDocExtra(index, 1)}
                  disabled={index === formData.documentosExtras.length - 1}
                  className="text-gray-400 hover:text-purple-700 disabled:opacity-30 disabled:cursor-not-allowed p-0.5 rounded hover:bg-purple-100 transition-colors"
                  title="Mover abajo"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button onClick={() => removeDocExtra(doc.id)} className="text-red-500 hover:text-red-700 p-0.5"><Trash2 className="w-4 h-4" /></button>
              </div>
              <label className="w-full sm:w-auto cursor-pointer flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 bg-gray-50 hover:bg-gray-100">
                <FilePlus2 className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-medium text-gray-600">Seleccionar PDF</span>
                <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => handleDocExtraUpload(doc.id, e)} />
              </label>
              {doc.nombre && (
                <span className="w-full sm:w-auto text-sm text-gray-700 break-all sm:break-normal sm:truncate sm:max-w-xs">📄 {doc.nombre}</span>
              )}
            </div>
          ))}
        </div>

        {/* Checkbox marca de agua */}
        {formData.documentosExtras.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="marcaDeAguaEnExtras"
              checked={formData.marcaDeAguaEnExtras}
              onChange={(e) => setFormData(prev => ({ ...prev, marcaDeAguaEnExtras: e.target.checked }))}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="marcaDeAguaEnExtras" className="text-sm text-gray-700">
              Agregar marca de agua a los documentos PDF extra
            </label>
          </div>
        )}
      </div>

      <div id="generar-pdf-section" className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, incluirPortada: !prev.incluirPortada }))}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${formData.incluirPortada
            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
            : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
            }`}
        >
          <BookOpen className={`w-4 h-4 ${formData.incluirPortada ? 'text-blue-500' : 'text-gray-400'}`} />
          <span>Portada</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${formData.incluirPortada
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-500'
            }`}>
            {formData.incluirPortada ? 'SÍ' : 'NO'}
          </span>
        </button>
        <div className="w-full sm:max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño de hoja del PDF</label>
          <select
            name="pageFormat"
            value={formData.pageFormat || 'Letter'}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="Letter">Carta (Letter)</option>
            <option value="A4">A4</option>
          </select>
        </div>
        <button onClick={resetForm} className="flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          <RotateCcw className="w-5 h-5 mr-2" /> Nuevo Formato
        </button>
        <button onClick={generatePDF} disabled={isGenerating} className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50">
          <Printer className="w-5 h-5 mr-2" /> {isGenerating ? 'Generando...' : 'Generar PDF Oficial'}
        </button>
      </div>

      {/* --- Datos de la Portada (debajo de los botones) --- */}
      {formData.incluirPortada && (
        <div className="mt-6 p-5 border-2 border-blue-200 bg-blue-50/50 rounded-xl transition-all duration-300 animate-fade-in">
          <h3 className="text-base font-semibold text-blue-800 flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5" />
            Datos de la Portada
          </h3>
          <p className="text-xs text-gray-500 mb-4">Estos datos aparecerán en la portada del PDF generado.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Empresa solicitante</label>
              <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Ej. Grupo Bimbo, Femsa, etc." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Puesto / Vacante</label>
              <input type="text" disabled value={formData.puesto || '—'} className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 text-gray-500 p-2 border cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Se toma del campo "Puesto que solicita" (Paso 1)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Candidato</label>
              <input type="text" disabled value={formData.nombre || '—'} className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 text-gray-500 p-2 border cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Se toma del campo "Nombre del aspirante" (Paso 1)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha del estudio</label>
              <input type="text" disabled value={formData.fecha || '—'} className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 text-gray-500 p-2 border cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Se toma del campo "Fecha" (Paso 1)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- MODAL DE ALERTAS/CONFIRMACIÓN PERSONALIZADO ---
  const CustomModal = () => {
    if (!modal) return null;
    const variantConfig = {
      warning: { bg: 'bg-yellow-100', iconBg: 'bg-yellow-500', icon: <AlertTriangle className="w-6 h-6 text-white" />, btnColor: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400' },
      danger: { bg: 'bg-red-100', iconBg: 'bg-red-500', icon: <Trash2 className="w-6 h-6 text-white" />, btnColor: 'bg-red-500 hover:bg-red-600 focus:ring-red-400' },
      error: { bg: 'bg-red-100', iconBg: 'bg-red-500', icon: <XCircle className="w-6 h-6 text-white" />, btnColor: 'bg-red-500 hover:bg-red-600 focus:ring-red-400' },
      info: { bg: 'bg-blue-100', iconBg: 'bg-blue-500', icon: <Info className="w-6 h-6 text-white" />, btnColor: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400' },
    };
    const v = variantConfig[modal.variant] || variantConfig.info;

    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4" onClick={() => setModal(null)}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"></div>
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
          {/* Franja superior de color */}
          <div className={`${v.bg} px-6 pt-6 pb-4 flex items-start gap-4`}>
            <div className={`${v.iconBg} w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md`}>
              {v.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900">{modal.title}</h3>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{modal.message}</p>
            </div>
            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white/50 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Botones */}
          <div className="px-6 py-4 flex justify-end gap-3 bg-gray-50">
            {modal.type === 'confirm' && (
              <button onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">
                Cancelar
              </button>
            )}
            <button onClick={modal.onConfirm} className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm ${v.btnColor}`}>
              {modal.type === 'confirm' ? (modal.confirmText || 'Confirmar') : 'Entendido'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- MODAL DE CARGAR PROGRESO ---
  const LoadModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowLoadModal(false); setLoadError(''); }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Cargar Progreso Guardado</h2>
          </div>
          <button onClick={() => { setShowLoadModal(false); setLoadError(''); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explicación */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium mb-2">¿Qué archivo debo subir?</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-start gap-2"><span className="mt-1">•</span> Un archivo <strong>.json</strong> generado previamente por esta app.</li>
            <li className="flex items-start gap-2"><span className="mt-1">•</span> Se llama algo como <strong>ESE_Progreso_Nombre.json</strong></li>
            <li className="flex items-start gap-2"><span className="mt-1">•</span> Lo puedes haber recibido por WhatsApp, email o USB.</li>
          </ul>
        </div>

        {/* Zona Drag & Drop */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
            }`}
        >
          <FileUp className={`w-12 h-12 mx-auto mb-3 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className={`text-base font-semibold mb-1 ${isDragging ? 'text-blue-600' : 'text-gray-700'}`}>
            {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
          </p>
          <p className="text-sm text-gray-500">
            o <span className="text-blue-600 font-medium hover:underline">haz clic para seleccionar</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">Solo archivos .json</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => { if (e.target.files[0]) processFile(e.target.files[0]); e.target.value = ''; }}
          />
        </div>

        {/* Error */}
        {loadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{loadError}</p>
          </div>
        )}

        {/* Botón cancelar */}
        <div className="mt-6 flex justify-end">
          <button onClick={() => { setShowLoadModal(false); setLoadError(''); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  // --- DASHBOARD (reemplaza la pantalla de bienvenida) ---
  if (showWelcome) {
    return (
      <>
        <Dashboard
          onNewStudy={handleNewStudy}
          onLoadStudy={handleLoadStudy}
          onExportStudy={handleExportStudy}
        />
        {modal && CustomModal()}
      </>
    );
  }

  // --- RENDER PRINCIPAL (FORMULARIO) ---
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="bg-brand-primary px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-8 sm:h-12 flex items-center justify-center overflow-hidden">
              <img src={nexpleaLogo} alt="Nexplea" className="h-full w-auto object-contain brightness-0 invert drop-shadow-sm" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-white flex items-center"><FileText className="mr-2 text-brand-secondary hidden sm:block" /> <span className="hidden sm:inline">Generador</span> ESE</h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end">
            {/* Cloud save indicator */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              {cloudSaveStatus === 'pending' && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-200 text-xs font-medium" style={{ animation: 'saveIndicatorIn 0.3s ease' }}>
                  <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse"></span> Editando...
                </span>
              )}
              {cloudSaveStatus === 'saving' && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-secondary/20 text-brand-secondary text-xs font-medium" style={{ animation: 'saveIndicatorIn 0.3s ease' }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
                </span>
              )}
              {cloudSaveStatus === 'saved' && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-accent/20 text-brand-accent text-xs font-medium" style={{ animation: 'saveIndicatorIn 0.3s ease' }}>
                  <Cloud className="w-3.5 h-3.5" /> ¡Guardado!
                </span>
              )}
              {cloudSaveStatus === 'error' && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-400/20 text-red-300 text-xs font-medium" style={{ animation: 'saveIndicatorIn 0.3s ease' }}>
                  <CloudOff className="w-3.5 h-3.5" /> Error al guardar
                </span>
              )}
            </div>
            {/* Mobile-only cloud status icon */}
            <div className="flex sm:hidden items-center">
              {cloudSaveStatus === 'saving' && <Loader2 className="w-4 h-4 text-brand-secondary animate-spin" />}
              {cloudSaveStatus === 'saved' && <Cloud className="w-4 h-4 text-brand-accent" />}
              {cloudSaveStatus === 'error' && <CloudOff className="w-4 h-4 text-red-300" />}
              {cloudSaveStatus === 'pending' && <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse"></span>}
            </div>
            {/* Share code - prominent badge */}
            {cloudCode && (
              <button
                onClick={() => { navigator.clipboard.writeText(cloudCode); showToast('¡Código copiado al portapapeles! 📋'); }}
                className="hidden sm:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-brand-secondary text-brand-primary hover:bg-brand-secondary/90 shadow-md transition-all hover:scale-105 cursor-pointer"
                title="Clic para copiar y compartir el progreso"
              >
                📋 <span className="hidden sm:inline">Comparte progreso: </span>{cloudCode}
              </button>
            )}
            <span className="hidden sm:inline-flex text-white text-xs sm:text-sm font-medium bg-brand-navy px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">{currentStep}/{totalSteps}</span>
            <button onClick={() => currentStep === 10 ? startFinalTour() : startFormTour()} className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-white text-brand-navy border border-brand-secondary hover:bg-brand-secondary hover:text-white shadow-sm transition-colors" title="Iniciar Tour de Ayuda">
              <BookOpen className="w-4 h-4 text-brand-primary group-hover:text-white transition-colors" /><span className="hidden sm:inline"> Tour</span>
            </button>
            <button onClick={goHome} className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-white text-brand-navy border border-brand-secondary hover:bg-brand-secondary hover:text-white shadow-sm transition-colors" title="Volver al Inicio">
              <Home className="w-4 h-4 text-brand-primary group-hover:text-white transition-colors" /><span className="hidden sm:inline"> Inicio</span>
            </button>
          </div>
        </div>

        {/* HEADER STICKY MOBILE */}
        <div className="sm:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-blue-700">Paso {currentStep} de {totalSteps} · {stepProgress}%</p>
              <h2 className="text-sm font-bold text-gray-900 truncate">{stepTitles[currentStep]}</h2>
            </div>
            <button
              id="btn-guardar-progreso-mobile"
              onClick={() => setShowProgressMenu(prev => !prev)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-green-700 bg-green-50 border border-green-200"
              title="Guardar / Cargar Progreso"
            >
              <Save className="w-4 h-4" /> Progreso
            </button>
          </div>
          <div id="barra-progreso-mobile" className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-1.5 transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
          </div>
          <div id="navegacion-form-mobile" className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="h-11 flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <button
              onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
              disabled={currentStep === totalSteps}
              className="h-11 flex items-center justify-center gap-1.5 rounded-lg border border-transparent bg-blue-600 text-sm font-semibold text-white disabled:opacity-50"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {showProgressMenu && (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm animate-fade-in">
              <p className="text-xs font-semibold text-gray-800 mb-1">Progreso del formulario</p>
              <p className="text-xs text-gray-500 mb-2">Guardar o cargar un archivo de avance (.json).</p>
              {cloudCode && (
                <div className="mb-2 rounded-md border border-blue-200 bg-blue-50 p-2">
                  <p className="text-[11px] font-semibold text-blue-800">Comparte este código para continuar el progreso:</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(cloudCode); showToast('¡Código copiado al portapapeles! 📋'); }}
                    className="mt-1 w-full flex items-center justify-between rounded border border-blue-300 bg-white px-2 py-1 text-xs font-bold text-blue-700"
                    title="Copiar código de progreso"
                  >
                    <span className="truncate">{cloudCode}</span>
                    <span className="ml-2">Copiar</span>
                  </button>
                </div>
              )}
              <div className="space-y-2">
                <button onClick={() => { exportProgress(); setShowProgressMenu(false); }} className="w-full flex items-center px-3 py-2 text-sm rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                  <Download className="w-4 h-4 mr-2" /> Guardar Progreso
                </button>
                <button onClick={() => { importProgress(); setShowProgressMenu(false); }} className="w-full flex items-center px-3 py-2 text-sm rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors">
                  <Upload className="w-4 h-4 mr-2" /> Cargar Progreso
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BARRA DE PROGRESO */}
        <div id="barra-progreso" className="hidden sm:block w-full bg-brand-navy h-2">
          <div className="bg-brand-secondary h-2 transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>

        {/* CONTENIDO DEL FORMULARIO */}
        <div className="p-6 sm:p-10">
          {currentStep === 1 && Step1()}
          {currentStep === 2 && Step2()}
          {currentStep === 3 && Step3()}
          {currentStep === 4 && Step4()}
          {currentStep === 5 && Step5()}
          {currentStep === 6 && Step6()}
          {currentStep === 7 && Step7()}
          {currentStep === 8 && Step8()}
          {currentStep === 9 && Step9()}
          {currentStep === 10 && Step10()}

          {/* NAVEGACIÓN */}
          <div id="navegacion-form" className="mt-10 hidden sm:flex justify-between border-t pt-6">
            <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1} className="flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </button>
            {currentStep < totalSteps ? (
              <button onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))} className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <div className="w-24"></div>
            )}
          </div>
        </div>
      </div>

      {/* BOTÓN FLOTANTE DE PROGRESO */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-50 print:hidden">
        {showProgressMenu && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-64 animate-fade-in">
            <p className="text-sm font-semibold text-gray-800 mb-3">Progreso del formulario</p>
            <p className="text-xs text-gray-500 mb-3">Guarda tu avance como archivo y compártelo para que otra persona lo continúe.</p>
            {cloudCode && (
              <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 p-2.5">
                <p className="text-[11px] font-semibold text-blue-800">Comparte este código para continuar el progreso:</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(cloudCode); showToast('¡Código copiado al portapapeles! 📋'); }}
                  className="mt-1 w-full flex items-center justify-between rounded border border-blue-300 bg-white px-2 py-1 text-xs font-bold text-blue-700"
                  title="Copiar código de progreso"
                >
                  <span className="truncate">{cloudCode}</span>
                  <span className="ml-2">Copiar</span>
                </button>
              </div>
            )}
            <div className="space-y-2">
              <button onClick={() => { exportProgress(); setShowProgressMenu(false); }} className="w-full flex items-center px-3 py-2 text-sm rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                <Download className="w-4 h-4 mr-2" /> Guardar Progreso
              </button>
              <button onClick={() => { importProgress(); setShowProgressMenu(false); }} className="w-full flex items-center px-3 py-2 text-sm rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors">
                <Upload className="w-4 h-4 mr-2" /> Cargar Progreso
              </button>
            </div>
          </div>
        )}
        <button id="btn-guardar-progreso" onClick={() => setShowProgressMenu(prev => !prev)} className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${showProgressMenu ? 'bg-gray-700 hover:bg-gray-800' : 'bg-green-600 hover:bg-green-700'} text-white`} title="Guardar / Cargar Progreso">
          <Save className="w-6 h-6" />
        </button>
      </div>

      {/* Modal de carga (disponible también desde el formulario) */}
      {showLoadModal && LoadModal()}
      {modal && CustomModal()}

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999 animate-bounce-in">
          <div className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold backdrop-blur-sm border ${toast.type === 'success' ? 'bg-green-500/90 text-white border-green-400/50' :
            toast.type === 'error' ? 'bg-red-500/90 text-white border-red-400/50' :
              'bg-blue-500/90 text-white border-blue-400/50'
            }`}
            style={{
              animation: 'toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
            <span className="text-lg">{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastSlideIn {
          0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes saveIndicatorIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
