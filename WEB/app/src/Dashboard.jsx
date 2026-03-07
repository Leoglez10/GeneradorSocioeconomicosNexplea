import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { getUserStudies, deleteStudy, renewStudy, cleanupExpiredStudies, loadStudyByCode, copyStudy } from './cloudSaveService';
import { FileText, Plus, Trash2, Search, LogOut, Copy, Check, ChevronRight, AlertTriangle, Clock, RotateCcw, Download, X, MoreVertical, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import nexpleaLogo from './assets/nexplea2.png';
import HelpButton from './HelpButton';

export default function Dashboard({ onNewStudy, onLoadStudy, onExportStudy }) {
    const { user, logout } = useAuth();
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [showBugModal, setShowBugModal] = useState(false);
    const [code, setCode] = useState('');
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeError, setCodeError] = useState('');
    const [copiedCode, setCopiedCode] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    const fetchStudies = useCallback(async () => {
        try {
            setLoading(true);
            setFetchError(null);
            try { await cleanupExpiredStudies(); } catch (e) { console.warn('Cleanup skipped:', e.message); }
            const data = await getUserStudies();
            setStudies(data);
        } catch (err) {
            console.error('Failed to fetch studies:', err);
            setFetchError(err.message || 'Error al cargar los estudios');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudies();
    }, [fetchStudies]);

    const handleDelete = async (docId) => {
        try {
            await deleteStudy(docId);
            setStudies(prev => prev.filter(s => s.docId !== docId));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleRenew = async (docId) => {
        try {
            await renewStudy(docId);
            await fetchStudies();
        } catch (err) {
            console.error('Renew failed:', err);
        }
    };

    const handleCopyCode = (studyCode) => {
        navigator.clipboard.writeText(studyCode);
        setCopiedCode(studyCode);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleLoadCode = async () => {
        if (!code.trim()) return;
        setCodeLoading(true);
        setCodeError('');
        try {
            const result = await copyStudy(code.trim().toUpperCase());
            setShowCodeModal(false);
            setCode('');
            onLoadStudy(result.docId);
        } catch (err) {
            setCodeError(err.message);
        } finally {
            setCodeLoading(false);
        }
    };

    const getExpirationStatus = (expiresAt) => {
        if (!expiresAt) return { label: 'Sin límite', color: 'text-slate-400', urgent: false, badge: 'bg-slate-100 text-slate-600' };
        const now = new Date();
        const diff = expiresAt - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return { label: `Expirado`, color: 'text-red-600', urgent: true, badge: 'bg-red-50 text-red-600 border-red-200' };
        if (days <= 7) return { label: `${days} días`, color: 'text-amber-600', urgent: true, badge: 'bg-amber-50 text-amber-600 border-amber-200' };
        return { label: `${days} días`, color: 'text-emerald-600', urgent: false, badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Elegant Header */}
            <header className="sticky top-0 z-40 w-full bg-brand-primary text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 sm:h-12 flex items-center justify-center overflow-hidden">
                            <img src={nexpleaLogo} alt="Nexplea" className="h-full w-auto object-contain brightness-0 invert drop-shadow-sm" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-white leading-tight">Generador ESE</h1>
                            <p className="text-[11px] font-medium text-brand-secondary uppercase tracking-wider">Nexplea Workspace</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowBugModal(true)}
                            className="group hidden sm:flex items-center justify-center bg-orange-500/20 hover:bg-orange-500 text-orange-50 hover:text-white rounded-full transition-all duration-300 border border-orange-400/30 hover:border-orange-500 overflow-hidden h-9 px-2 hover:px-3 focus:outline-none"
                            title="Reportar problema con la app"
                        >
                            <Bug className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 group-hover:ml-1.5 font-bold text-[13px] transition-all duration-300 ease-in-out">
                                Reportar app
                            </span>
                        </button>
                        <HelpButton stepKey="dashboard" className="hidden sm:flex" />

                        <div className="h-8 w-px bg-white/20 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-white">{user?.displayName || 'Usuario'}</p>
                                <p className="text-xs text-brand-secondary">{user?.email}</p>
                            </div>
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full ring-2 ring-white/20 shadow-sm" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-brand-secondary/20 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white/20">
                                    {(user?.displayName || 'U')[0].toUpperCase()}
                                </div>
                            )}
                            <button
                                onClick={logout}
                                className="ml-2 p-2 rounded-lg text-brand-secondary hover:text-white hover:bg-white/10 transition-colors"
                                title="Cerrar sesión"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

                {/* Hero / Action Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between"
                >
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-brand-navy mb-2">Tus Documentos</h2>
                        <p className="text-slate-500 max-w-md">Administra y crea estudios socioeconómicos aprobados. Todo tu trabajo se guarda y sincroniza automáticamente.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                        <button
                            onClick={() => { setShowCodeModal(true); setCode(''); setCodeError(''); }}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-brand-secondary hover:border-brand-primary text-brand-navy font-medium rounded-xl transition-all duration-200 shadow-sm"
                        >
                            <Search className="w-4 h-4 text-brand-primary" />
                            Recibir por Código
                        </button>
                        <button
                            onClick={onNewStudy}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-navy text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 text-brand-secondary" />
                            Crear Estudio
                        </button>
                    </div>
                </motion.div>

                {/* Dashboard Grid & List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-brand-navy">Estudios Recientes</h3>
                            {!loading && studies.length > 0 && (
                                <span className="bg-brand-secondary/20 text-brand-primary text-xs font-bold px-2 py-0.5 rounded-full">
                                    {studies.length}
                                </span>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-500 font-medium">Sincronizando con la nube...</p>
                        </div>
                    ) : fetchError ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 rounded-2xl p-8 text-center border border-red-100">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <p className="text-red-800 font-bold mb-1">Problema de Conexión</p>
                            <p className="text-red-600 text-sm mb-5 max-w-sm mx-auto">{fetchError}</p>
                            <button
                                onClick={fetchStudies}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-sm hover:shadow-md"
                            >
                                Intentar Nuevamente
                            </button>
                        </motion.div>
                    ) : studies.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-16 text-center border border-slate-200 border-dashed">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-slate-50/50">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Aún no hay estudios</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Comienza creando tu primer reporte socioeconómico o pide a un compañero que te comparta su código.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            <AnimatePresence>
                                {studies.map(study => {
                                    const exp = getExpirationStatus(study.expiresAt);

                                    return (
                                        <motion.div
                                            key={study.docId}
                                            variants={itemVariants}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group bg-white rounded-2xl border-2 border-slate-300 overflow-hidden hover:border-brand-secondary hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                                        >
                                            <div className="p-5 flex-1 cursor-pointer" onClick={() => onLoadStudy(study.docId)}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${exp.badge}`}>
                                                        {exp.label}
                                                    </div>

                                                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                                        {exp.urgent && (
                                                            <button
                                                                onClick={() => handleRenew(study.docId)}
                                                                className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                                title="Renovar +30 días"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setDeleteConfirm(study.docId)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-brand-navy line-clamp-1 mb-1 group-hover:text-brand-primary transition-colors">
                                                    {study.nombreCandidato || 'Estudio sin nombre'}
                                                </h3>

                                                <div className="flex items-center text-sm text-slate-700 font-medium mb-4 h-5">
                                                    {study.empresa ? (
                                                        <span className="truncate flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                            {study.empresa}
                                                        </span>
                                                    ) : (
                                                        <span className="italic text-slate-500">Sin empresa asignada</span>
                                                    )}
                                                </div>

                                                {/* Progress Bar Mockup */}
                                                <div className="mt-auto">
                                                    <div className="flex justify-between text-xs mb-1.5">
                                                        <span className="text-slate-700 font-bold">Progreso</span>
                                                        <span className="text-brand-navy font-bold">{Math.round((study.currentStep || 1) / 10 * 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-brand-primary h-1.5 rounded-full"
                                                            style={{ width: `${((study.currentStep || 1) / 10) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="bg-slate-50 p-3 px-4 border-t border-slate-100 flex items-center justify-between">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCopyCode(study.code); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors font-medium shadow-sm"
                                                    title="Copiar código"
                                                >
                                                    {copiedCode === study.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                                                    <span className="font-mono tracking-wider">{study.code}</span>
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onExportStudy(study.docId); }}
                                                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-secondary/20 rounded-lg transition-colors"
                                                        title="Exportar JSON"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Delete Overlay */}
                                            {deleteConfirm === study.docId && (
                                                <motion.div
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center border-2 border-red-500 rounded-2xl"
                                                >
                                                    <Trash2 className="w-10 h-10 text-red-500 mb-3" />
                                                    <p className="text-slate-800 font-bold mb-1">¿Eliminar estudio?</p>
                                                    <p className="text-red-500 text-xs mb-4">Esta acción no se puede deshacer.</p>
                                                    <div className="flex gap-2 w-full">
                                                        <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium">
                                                            Cancelar
                                                        </button>
                                                        <button onClick={() => handleDelete(study.docId)} className="flex-1 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors font-bold shadow-sm hover:shadow-md">
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Fancy Load Code Modal */}
            <AnimatePresence>
                {showCodeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setShowCodeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-brand-primary p-6 text-white relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-secondary/20 rounded-full blur-2xl"></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="w-10 h-10 bg-brand-secondary/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                            <Search className="w-5 h-5 text-brand-secondary" />
                                        </div>
                                        <button onClick={() => setShowCodeModal(false)} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h2 className="text-xl font-bold mt-4">Importar Estudio</h2>
                                    <p className="text-brand-secondary text-sm mt-1">Ingresa el código único de 6 dígitos.</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="relative mb-6">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                                        placeholder="······"
                                        maxLength={6}
                                        className="w-full text-center text-4xl font-mono font-bold tracking-[0.5em] border-none bg-slate-50 text-brand-navy rounded-2xl px-4 py-6 focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all uppercase outline-none shadow-inner"
                                        autoFocus
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleLoadCode(); }}
                                    />
                                    {code.length > 0 && code.length < 6 && (
                                        <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-amber-500 font-medium">
                                            Faltan {6 - code.length} caracteres
                                        </div>
                                    )}
                                </div>

                                {codeError && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-6 text-center border border-red-100">
                                        {codeError}
                                    </motion.div>
                                )}

                                <button
                                    onClick={handleLoadCode}
                                    disabled={code.length < 6 || codeLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-primary hover:bg-brand-navy text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
                                >
                                    {codeLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                                            Desencriptando...
                                        </>
                                    ) : (
                                        <>
                                            Continuar Importación
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bug Report Modal */}
            <AnimatePresence>
                {showBugModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setShowBugModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-orange-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-300/30 rounded-full blur-2xl"></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-sm">
                                            <Bug className="w-5 h-5 text-white" />
                                        </div>
                                        <button onClick={() => setShowBugModal(false)} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h2 className="text-xl font-bold mt-4">¿Hay problemas con la app?</h2>
                                    <p className="text-orange-100 text-sm mt-1">Repórtalo para solucionarlo cuanto antes.</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="text-slate-600 text-sm mb-6 text-center leading-relaxed">
                                    Si encontraste algún error, la aplicación está lenta o tienes problemas para exportar, descríbelo en un correo para soporte técnico.
                                </p>

                                <a
                                    href="mailto:leoeligr10@gmail.com?subject=Problema%20con%20SE%20Nexplea&body=Hola%20equipo%20de%20soporte%2C%0A%0AEstoy%20experimentando%20el%20siguiente%20problema%20en%20el%20Generador%20Socioeconómico%3A%0A%0A%5BDescribe%20tu%20problema%20aquí%5D"
                                    onClick={() => setShowBugModal(false)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mb-3"
                                >
                                    <Bug className="w-5 h-5" />
                                    Enviar a soporte
                                </a>
                                <button
                                    onClick={() => setShowBugModal(false)}
                                    className="w-full py-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
