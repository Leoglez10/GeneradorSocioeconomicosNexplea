const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus, Trash2, Printer, FileText, CheckCircle, RotateCcw, Upload, ImagePlus, FilePlus2, Download, Save } from 'lucide-react';
import nexpleaLogo from './assets/nexplea2.png';

// --- ESTADO INICIAL ---
const initialData = {
  // 1. Datos Generales
  fecha: new Date().toISOString().split('T')[0],
  puesto: '', nombre: '', lugarNacimiento: '', fechaNacimiento: '', edad: '', sexo: '', estadoCivil: '',
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
  mobiliarioCalidad: '', mobiliarioCantidad: '', tamanoVivienda: '', condicionesVivienda: '',

  // 10. Referencias Personales
  referencias: [{ id: 1, nombre: '', tiempo: '', telefono: '', comentarios: '' }],

  // 11. Referencias Vecinales
  referenciasVecinales: [{ id: 1, nombre: '', domicilio: '', conceptoAspirante: '', conceptoFamilia: '', estadoCivilHijos: '', sabeDondeTrabaja: '', notas: '' }],

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

  // 14. Extras (fotos y documentos adicionales)
  fotosExtras: [],
  documentosExtras: [],
  marcaDeAguaEnExtras: true
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProgressMenu, setShowProgressMenu] = useState(false);
  const totalSteps = 10;

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const resetForm = () => {
    if (window.confirm('¿Estás seguro de borrar todos los datos?')) {
      setFormData(initialData);
      setCurrentStep(1);
    }
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

  const importProgress = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (imported && typeof imported === 'object' && !Array.isArray(imported)) {
            setFormData({ ...initialData, ...imported });
            setCurrentStep(1);
            alert('Progreso cargado correctamente.');
          } else {
            alert('El archivo no tiene un formato válido.');
          }
        } catch {
          alert('Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

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
      alert(`Hubo un error al generar el PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- COMPONENTES DE PASOS ---
  const Step1 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">I. Datos Generales</h2>
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
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">II. Documentos Comprobatorios</h2>
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
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">III. Historial Académico</h2>
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
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">IV. Antecedentes Sociales y Médicos</h2>
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
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-2xl font-bold text-blue-800">V. Datos del Grupo Familiar</h2>
        <button onClick={() => addDynamicItem('familiares', { nombre: '', parentesco: '', edad: '', edoCivil: '', celular: '', viveConUd: 'Sí' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar Familiar</button>
      </div>
      <div className="space-y-4">
        {formData.familiares.map((fam, index) => (
          <div key={fam.id} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end p-4 border rounded-md bg-gray-50 relative">
            <div className="absolute top-2 right-2"><button onClick={() => removeDynamicItem('familiares', fam.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
            <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-700">Nombre</label><input type="text" value={fam.nombre} onChange={(e) => handleDynamicChange('familiares', fam.id, 'nombre', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Parentesco</label><input type="text" value={fam.parentesco} onChange={(e) => handleDynamicChange('familiares', fam.id, 'parentesco', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Edad</label><input type="text" value={fam.edad} onChange={(e) => handleDynamicChange('familiares', fam.id, 'edad', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Edo. Civil</label><input type="text" value={fam.edoCivil} onChange={(e) => handleDynamicChange('familiares', fam.id, 'edoCivil', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Teléfono</label><input type="text" value={fam.celular} onChange={(e) => handleDynamicChange('familiares', fam.id, 'celular', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Vive con Ud.</label><select value={fam.viveConUd} onChange={(e) => handleDynamicChange('familiares', fam.id, 'viveConUd', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"><option value="Sí">Sí</option><option value="No">No</option></select></div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-b pb-2 mt-8">
        <h2 className="text-2xl font-bold text-blue-800">VI. Antecedentes Laborales Familiares</h2>
        <button onClick={() => addDynamicItem('laboralesFamiliares', { nombre: '', empresa: '', puesto: '', antiguedad: '' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar</button>
      </div>
      <div className="space-y-4">
        {formData.laboralesFamiliares.map((lab) => (
          <div key={lab.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-4 border rounded-md bg-gray-50 relative">
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
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">VII. Situación Económica</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Ingresos Mensuales</h3>
            <button onClick={() => addDynamicItem('ingresos', { nombre: '', sueldo: '', aportacion: '' })} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">+ Ingreso</button>
          </div>
          {formData.ingresos.map(ing => (
            <div key={ing.id} className="flex space-x-2 mb-2 relative pr-6">
              <input type="text" placeholder="Nombre" value={ing.nombre} onChange={(e) => handleDynamicChange('ingresos', ing.id, 'nombre', e.target.value)} className="w-1/3 rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
              <input type="text" placeholder="Sueldo" value={ing.sueldo} onChange={(e) => handleDynamicChange('ingresos', ing.id, 'sueldo', e.target.value)} className="w-1/3 rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
              <input type="text" placeholder="Aportación" value={ing.aportacion} onChange={(e) => handleDynamicChange('ingresos', ing.id, 'aportacion', e.target.value)} className="w-1/3 rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
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
            <div key={egr.id} className="flex space-x-2 mb-2 relative pr-6">
              <input type="text" placeholder="Concepto" value={egr.concepto} onChange={(e) => handleDynamicChange('egresos', egr.id, 'concepto', e.target.value)} className="w-1/2 rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
              <input type="number" placeholder="Monto" value={egr.monto} onChange={(e) => handleDynamicChange('egresos', egr.id, 'monto', e.target.value)} className="w-1/2 rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
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
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">IX. Habitación y Medio Ambiente</h2>
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
        <div><label className="block text-sm font-medium text-gray-700">Mobiliario (Cantidad)</label><select name="mobiliarioCantidad" value={formData.mobiliarioCantidad} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"><option value="">Seleccione...</option><option value="Holgado">Holgado</option><option value="Completo">Completo</option><option value="Incompleto">Incompleto</option><option value="Deficiente">Deficiente</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700">La vivienda es</label><select name="tamanoVivienda" value={formData.tamanoVivienda} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"><option value="">Seleccione...</option><option value="Amplia">Amplia</option><option value="Suficiente">Suficiente</option><option value="Insuficiente">Insuficiente</option><option value="Precaria">Precaria</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700">Condiciones</label><select name="condicionesVivienda" value={formData.condicionesVivienda} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"><option value="">Seleccione...</option><option value="Limpias">Limpias</option><option value="Sucias">Sucias</option><option value="Desordenadas">Desordenadas</option><option value="Ordenadas">Ordenadas</option></select></div>
      </div>
    </div>
  );

  const Step8 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-2xl font-bold text-blue-800">X. Referencias Personales</h2>
        <button onClick={() => addDynamicItem('referencias', { nombre: '', tiempo: '', telefono: '', comentarios: '' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar Referencia</button>
      </div>
      <div className="space-y-4">
        {formData.referencias.map((ref) => (
          <div key={ref.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end p-4 border rounded-md bg-gray-50 relative">
            <div className="absolute top-2 right-2"><button onClick={() => removeDynamicItem('referencias', ref.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
            <div><label className="block text-xs font-medium text-gray-700">Nombre</label><input type="text" value={ref.nombre} onChange={(e) => handleDynamicChange('referencias', ref.id, 'nombre', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Tiempo de conocerlo</label><input type="text" value={ref.tiempo} onChange={(e) => handleDynamicChange('referencias', ref.id, 'tiempo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Teléfono</label><input type="text" value={ref.telefono} onChange={(e) => handleDynamicChange('referencias', ref.id, 'telefono', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div className="md:col-span-3"><label className="block text-xs font-medium text-gray-700">Comentarios</label><textarea value={ref.comentarios} onChange={(e) => handleDynamicChange('referencias', ref.id, 'comentarios', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" rows="2"></textarea></div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-b pb-2 mt-8">
        <h2 className="text-2xl font-bold text-blue-800">XI. Referencias Vecinales</h2>
        <button onClick={() => addDynamicItem('referenciasVecinales', { nombre: '', domicilio: '', conceptoAspirante: '', conceptoFamilia: '', estadoCivilHijos: '', sabeDondeTrabaja: '', notas: '' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar Vecino</button>
      </div>
      <div className="space-y-4">
        {formData.referenciasVecinales.map((vec) => (
          <div key={vec.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end p-4 border rounded-md bg-gray-50 relative">
            <div className="absolute top-2 right-2"><button onClick={() => removeDynamicItem('referenciasVecinales', vec.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
            <div><label className="block text-xs font-medium text-gray-700">Nombre</label><input type="text" value={vec.nombre} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'nombre', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Domicilio</label><input type="text" value={vec.domicilio} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'domicilio', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">¿Cómo conceptúa al aspirante?</label><input type="text" value={vec.conceptoAspirante} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'conceptoAspirante', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">¿Cómo conceptúa a la familia?</label><input type="text" value={vec.conceptoFamilia} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'conceptoFamilia', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">Estado civil / ¿Tiene hijos?</label><input type="text" value={vec.estadoCivilHijos} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'estadoCivilHijos', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-700">¿Sabe en donde trabaja?</label><input type="text" value={vec.sabeDondeTrabaja} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'sabeDondeTrabaja', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" /></div>
            <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-700">Notas</label><textarea value={vec.notas} onChange={(e) => handleDynamicChange('referenciasVecinales', vec.id, 'notas', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" rows="2"></textarea></div>
          </div>
        ))}
      </div>
    </div>
  );

  const Step9 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-2xl font-bold text-blue-800">XII. Antecedentes Laborales</h2>
        <button onClick={() => addDynamicItem('empleos', { empresa: '', area: '', domicilio: '', colonia: '', cp: '', telefono: '', tipoEmpresa: '', puesto: '', periodo: '', sueldoInicial: '', sueldoFinal: '', jefe: '', puestoJefe: '', descripcionTrabajo: '', motivoSalida: '', empresaValidada: '', telefonoValidado: '', contactoValidado: '', puestoContacto: '', tiempoLaboradoValidado: '', puestoInicialValidado: '', puestoFinalValidado: '', jefeValidado: '', sueldoInicialValidado: '', sueldoFinalValidado: '', motivoSalidaValidado: '', recomendable: '', recontratable: '', calidadTrabajo: '', puntualidad: '', honradez: '', responsabilidad: '', adaptacion: '', actitudJefes: '', actitudCompaneros: '', comentariosReferencia: '' })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"><Plus className="w-4 h-4 mr-1" /> Agregar Empleo</button>
      </div>
      <div className="space-y-8">
        {formData.empleos.map((emp, index) => (
          <div key={emp.id} className="border-2 border-blue-200 rounded-lg p-4 bg-white relative">
            <div className="absolute top-2 right-2"><button onClick={() => removeDynamicItem('empleos', emp.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button></div>
            <h3 className="text-lg font-bold text-blue-700 mb-4">Empleo {index + 1}</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 border-b mb-2">Datos proporcionados por candidato</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                <div className="md:col-span-3"><label className="block text-xs font-medium text-gray-700">¿Describa en qué consistía su trabajo?</label><textarea value={emp.descripcionTrabajo} onChange={(e) => handleDynamicChange('empleos', emp.id, 'descripcionTrabajo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" rows="2"></textarea></div>
                <div className="md:col-span-3"><label className="block text-xs font-medium text-gray-700">¿Por qué dejó el empleo?</label><textarea value={emp.motivoSalida} onChange={(e) => handleDynamicChange('empleos', emp.id, 'motivoSalida', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" rows="2"></textarea></div>
              </div>
            </div>

            <div className="mb-6 bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-700 border-b mb-2">Información validada con empresa</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                  <div key={graf} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                    <span className="text-sm font-medium capitalize">{graf.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <select value={emp[graf]} onChange={(e) => handleDynamicChange('empleos', emp.id, graf, e.target.value)} className="rounded-md border-gray-300 shadow-sm p-1 border text-sm">
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
        <h2 className="text-3xl font-bold text-gray-800">¡Formulario Completado!</h2>
        <p className="text-gray-600 mt-2">Por favor, complete la conclusión y suba las fotos antes de generar el PDF.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 space-y-4">
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

      <div className="bg-gray-50 p-6 rounded-lg border space-y-4">
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
            </div>
          ))}
        </div>
      </div>

      {/* FOTOS EXTRAS */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 space-y-4">
        <div className="flex justify-between items-center border-b border-yellow-200 pb-2">
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
            <div key={foto.id} className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-md bg-white relative">
              <div className="absolute top-2 right-2">
                <button onClick={() => removeFotoExtra(foto.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-w-[150px]">
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
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 space-y-4">
        <div className="flex justify-between items-center border-b border-purple-200 pb-2">
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
            <div key={doc.id} className="flex items-center gap-4 p-3 border rounded-md bg-white relative">
              <div className="absolute top-2 right-2">
                <button onClick={() => removeDocExtra(doc.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
              </div>
              <label className="cursor-pointer flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 bg-gray-50 hover:bg-gray-100">
                <FilePlus2 className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-medium text-gray-600">Seleccionar PDF</span>
                <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => handleDocExtraUpload(doc.id, e)} />
              </label>
              {doc.nombre && (
                <span className="text-sm text-gray-700 truncate max-w-xs">📄 {doc.nombre}</span>
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

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <button onClick={resetForm} className="flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          <RotateCcw className="w-5 h-5 mr-2" /> Nuevo Formato
        </button>
        <button onClick={generatePDF} disabled={isGenerating} className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50">
          <Printer className="w-5 h-5 mr-2" /> {isGenerating ? 'Generando...' : 'Generar PDF Oficial'}
        </button>
      </div>
    </div>
  );

  // --- RENDER PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-blue-800 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={nexpleaLogo} alt="Nexplea" className="h-10 object-contain" />
            <h1 className="text-2xl font-bold text-white flex items-center"><FileText className="mr-2" /> Generador ESE</h1>
          </div>
          <div className="text-blue-100 text-sm">Paso {currentStep} de {totalSteps}</div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="w-full bg-gray-200 h-2">
          <div className="bg-blue-500 h-2 transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
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
          <div className="mt-10 flex justify-between border-t pt-6">
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
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        {showProgressMenu && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-64 animate-fade-in">
            <p className="text-sm font-semibold text-gray-800 mb-3">Progreso del formulario</p>
            <p className="text-xs text-gray-500 mb-3">Guarda tu avance como archivo y compártelo para que otra persona lo continúe.</p>
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
        <button onClick={() => setShowProgressMenu(prev => !prev)} className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${showProgressMenu ? 'bg-gray-700 hover:bg-gray-800' : 'bg-green-600 hover:bg-green-700'} text-white`} title="Guardar / Cargar Progreso">
          <Save className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
