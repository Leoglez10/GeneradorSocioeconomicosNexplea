import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Lightbulb, Info } from 'lucide-react';

// --- CONTENIDO DE AYUDA POR SECCIÓN ---
const helpContent = {
    dashboard: {
        title: '📋 Dashboard — Mis Estudios',
        sections: [
            {
                icon: '🆕',
                title: 'Crear un estudio nuevo',
                text: 'Haz clic en "Nuevo Estudio" para comenzar un formulario en blanco. Se guardará automáticamente en la nube.'
            },
            {
                icon: '📥',
                title: 'Cargar por código',
                text: 'Si alguien te compartió un código de 6 caracteres, haz clic en "Cargar con Código" para obtener una copia independiente del estudio.'
            },
            {
                icon: '📤',
                title: 'Exportar como JSON',
                text: 'Descarga una copia de seguridad del estudio como archivo JSON. Útil para guardar localmente o enviar a otro usuario.'
            },
            {
                icon: '🗑️',
                title: 'Eliminar un estudio',
                text: 'Haz clic en el ícono de basura para eliminar permanentemente un estudio de tu cuenta.'
            },
            {
                icon: '⏰',
                title: 'Expiración',
                text: 'Los estudios tienen un periodo de vigencia. Cuando estén por expirar verás un aviso amarillo. Puedes renovarlos antes de que se eliminen automáticamente.'
            }
        ]
    },
    step1: {
        title: 'I. Datos Generales',
        sections: [
            {
                icon: '✏️',
                title: '¿Qué llenar?',
                text: 'Captura la información personal del aspirante: nombre completo, fecha de nacimiento, domicilio, estado civil, etc.'
            },
            {
                icon: '📅',
                title: 'Fecha del estudio',
                text: 'La fecha se establece automáticamente al día de hoy, pero puedes cambiarla si necesitas registrar otra fecha.'
            },
            {
                icon: '💡',
                title: 'Tip',
                text: 'El puesto y la empresa son los datos del trabajo al que aplica el candidato, no del investigador.'
            }
        ]
    },
    step2: {
        title: 'II. Documentos Comprobatorios',
        sections: [
            {
                icon: '☑️',
                title: '¿Cómo funciona?',
                text: 'Marca la casilla de cada documento que el aspirante presentó. Si tiene folio, número o clave, captúralo en el campo correspondiente.'
            },
            {
                icon: '💡',
                title: 'Tip',
                text: 'No es obligatorio llenar todos los documentos. Solo marca los que fueron presentados físicamente durante la entrevista.'
            }
        ]
    },
    step3: {
        title: 'III. Historial Académico',
        sections: [
            {
                icon: '🎓',
                title: '¿Qué registrar?',
                text: 'Llena la trayectoria escolar del aspirante: desde primaria hasta el último nivel cursado, con periodos, escuelas, y promedios.'
            },
            {
                icon: '📝',
                title: 'Estudios actuales e inactividad',
                text: 'Abajo de la tabla puedes anotar si el aspirante estudia actualmente, o si tuvo periodos de inactividad escolar y por qué.'
            }
        ]
    },
    step4: {
        title: 'IV. Antecedentes Sociales y Médicos',
        sections: [
            {
                icon: '🏥',
                title: '¿Qué incluir?',
                text: 'Registra hábitos como deporte, consumo de alcohol/tabaco, afiliación sindical o política, y antecedentes médicos (cirugías).'
            },
            {
                icon: '💡',
                title: 'Tip',
                text: 'Selecciona "Sí" o "No" para cada rubro. Si la respuesta es "Sí", describe los detalles y la frecuencia en el campo de texto.'
            }
        ]
    },
    step5: {
        title: 'V. Datos del Grupo Familiar',
        sections: [
            {
                icon: '👨‍👩‍👧‍👦',
                title: '¿Qué registrar?',
                text: 'Agrega a los dependientes económicos y familiares directos del aspirante: padres, pareja, hijos, hermanos, etc.'
            },
            {
                icon: '➕',
                title: 'Agregar familiares',
                text: 'Usa el botón "Agregar" para añadir más filas. Puedes eliminar filas con el ícono de basura rojo.'
            },
            {
                icon: '💡',
                title: 'Tip',
                text: 'Se espera registrar al menos a la pareja, padres e hijos, si los tiene. No olvides incluir los que vivan en el mismo domicilio.'
            }
        ]
    },
    step6: {
        title: 'VII. Situación Económica',
        sections: [
            {
                icon: '💰',
                title: '¿Qué llenar?',
                text: 'Registra todos los ingresos del hogar (sueldos, aportaciones) y los egresos mensuales (renta, servicios, alimentación, etc).'
            },
            {
                icon: '➕',
                title: 'Filas dinámicas',
                text: 'Puedes agregar múltiples fuentes de ingreso y rubros de gasto con los botones "Agregar".'
            },
            {
                icon: '💡',
                title: 'Tip',
                text: 'Si hay déficit (gastos > ingresos), describe en el campo "Solución al déficit" cómo el aspirante cubre la diferencia.'
            }
        ]
    },
    step7: {
        title: 'IX. Habitación y Medio Ambiente',
        sections: [
            {
                icon: '🏠',
                title: '¿Qué describir?',
                text: 'Detalla las características de la vivienda: tipo, tiempo de residencia, nivel de la zona, mobiliario, número de cuartos, etc.'
            },
            {
                icon: '🪑',
                title: 'Mobiliario',
                text: 'Indica la cantidad que tiene de cada tipo de mueble y artículo del hogar.'
            },
            {
                icon: '💡',
                title: 'Tip',
                text: 'El "nivel de la zona" se refiere al entorno donde vive el aspirante (residencial, media, proletaria, etc).'
            }
        ]
    },
    step8: {
        title: 'X. Referencias Personales',
        sections: [
            {
                icon: '👤',
                title: '¿Qué registrar?',
                text: 'Agrega personas que conozcan al aspirante y puedan dar una referencia de su comportamiento y reputación.'
            },
            {
                icon: '➕',
                title: 'Agregar referencias',
                text: 'Agrega tantas referencias como necesites con el botón "Agregar Referencia".'
            },
            {
                icon: '💡',
                title: 'Tip',
                text: 'Las referencias NO deben ser familiares del aspirante. Idealmente vecinos, conocidos, amigos o excompañeros de trabajo.'
            }
        ]
    },
    step9: {
        title: 'XII. Antecedentes Laborales',
        sections: [
            {
                icon: '💼',
                title: '¿Qué registrar?',
                text: 'Captura los empleos anteriores del aspirante con todos los detalles: empresa, puesto, periodo, sueldo, jefe directo, y motivo de salida.'
            },
            {
                icon: '✅',
                title: 'Sección de validación',
                text: 'Cada empleo tiene campos de "validación" donde puedes registrar lo que la empresa confirmó por teléfono: si es recontratable, si recomiendan al aspirante, etc.'
            },
            {
                icon: '💡',
                title: 'Tip',
                text: 'Comienza por el empleo más reciente. Usa "Agregar Empleo" para registrar más. Llena tanto los datos del candidato como la validación con la empresa.'
            }
        ]
    },
    step10: {
        title: '¡Formulario Completado!',
        sections: [
            {
                icon: '📝',
                title: 'Conclusión',
                text: 'Redacta la conclusión del estudio: observaciones personales, laborales, socioeconómicas y el dictamen final.'
            },
            {
                icon: '📷',
                title: 'Fotografías',
                text: 'Sube las fotos del aspirante, la fachada de su domicilio y una foto del interior. Puedes agregar notas debajo de cada foto.'
            },
            {
                icon: '📎',
                title: 'Extras',
                text: 'Agrega fotos o documentos adicionales (INE, comprobante, etc). Puedes reordenarlos con las flechas.'
            },
            {
                icon: '📄',
                title: 'Generar PDF',
                text: 'Cuando todo esté completo, haz clic en "Generar PDF" para obtener el documento final listo para imprimir o enviar.'
            },
            {
                icon: '💡',
                title: 'Tip',
                text: 'La marca de agua y la portada se pueden activar/desactivar. También puedes elegir entre formato Carta y A4.'
            }
        ]
    }
};

export default function HelpButton({ stepKey, className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const content = helpContent[stepKey];

    // Close with Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!content) return null;

    return (
        <>
            {/* Help Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`group flex items-center justify-center h-9 min-w-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full text-white cursor-pointer shadow-sm border border-white/20 hover:shadow-md transition-all duration-300 overflow-hidden px-2 hover:px-3 focus:outline-none ${className}`}
                title="Ayuda sobre esta sección"
                type="button"
            >
                <HelpCircle className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 group-hover:ml-1.5 font-bold text-[13px] transition-all duration-300 ease-in-out">
                    Ayuda
                </span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    className="help-overlay"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                >
                    <div className="help-modal" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="help-modal-header">
                            <div className="help-modal-title-row">
                                <div className="help-modal-icon-wrapper">
                                    <Lightbulb className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="help-modal-title">{content.title}</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="help-modal-close" type="button">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="help-modal-body">
                            {content.sections.map((section, i) => (
                                <div key={i} className="help-section">
                                    <div className="help-section-header">
                                        <span className="help-section-icon">{section.icon}</span>
                                        <span className="help-section-title">{section.title}</span>
                                    </div>
                                    <p className="help-section-text">{section.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="help-modal-footer">
                            <button onClick={() => setIsOpen(false)} className="help-modal-footer-btn" type="button">
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scoped Styles */}
            <style>{`
        .help-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3);
        }
        .help-btn:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 14px rgba(99,102,241,0.45);
        }

        .help-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          animation: helpFadeIn 0.2s ease;
          padding: 16px;
        }

        .help-modal {
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05);
          width: 100%;
          max-width: 480px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          animation: helpSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .help-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .help-modal-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .help-modal-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
        }

        .help-modal-title {
          font-size: 17px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .help-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .help-modal-close:hover {
          background: #e2e8f0;
          color: #334155;
        }

        .help-modal-body {
          padding: 16px 24px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .help-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
          transition: border-color 0.15s ease;
        }
        .help-section:hover {
          border-color: #cbd5e1;
        }

        .help-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .help-section-icon {
          font-size: 16px;
          line-height: 1;
        }

        .help-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        .help-section-text {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
          padding-left: 24px;
        }

        .help-modal-footer {
          padding: 12px 24px 20px;
          border-top: 1px solid #f1f5f9;
        }

        .help-modal-footer-btn {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3);
        }
        .help-modal-footer-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(99,102,241,0.4);
        }

        @keyframes helpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes helpSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </>
    );
}
