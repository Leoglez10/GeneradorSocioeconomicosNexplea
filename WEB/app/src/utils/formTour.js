import { driver } from "driver.js";
import "driver.js/dist/driver.css";
// Usamos el mismo diseño del dashboard
import "./tour.css";

export const startFormTour = () => {
    const isMobile = window.innerWidth < 640;

    const tour = driver({
        showProgress: true,
        animate: true,
        progressText: 'Paso {{current}} de {{total}}',
        doneBtnText: '¡Entendido!',
        closeBtnText: 'Cerrar',
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        popoverClass: 'driverjs-theme',
        steps: [
            {
                popover: {
                    title: '👋 ¡Bienvenido al Formulario!',
                    description: 'Esta guía rápida te mostrará cómo usar el formulario eficazmente y aprovechar todas las funciones de guardado.',
                    align: 'center'
                }
            },
            {
                element: '#btn-ayuda-seccion',
                popover: {
                    title: '💡 Ayuda Contextual',
                    description: '¿No sabes qué llenar en un paso? Haz clic en este botón en cualquier momento para ver consejos y sugerencias sobre la sección actual.',
                    side: "bottom", align: 'start'
                }
            },
            {
                element: isMobile ? '#barra-progreso-mobile' : '#barra-progreso',
                popover: {
                    title: '📊 Tu avance',
                    description: 'Esta barra te mostrará cuánto has avanzado en el registro del estudio socioeconómico.',
                    side: "bottom", align: 'start'
                }
            },
            {
                element: isMobile ? '#btn-guardar-progreso-mobile' : '#btn-guardar-progreso',
                popover: {
                    title: '💾 Guardar / Cargar',
                    description: 'Puedes descargar un archivo con tu progreso actual o generar un código para que alguien más lo continúe. ¡Nunca perderás datos!',
                    side: isMobile ? "bottom" : "left", align: isMobile ? 'center' : 'end'
                }
            },
            {
                element: isMobile ? '#navegacion-form-mobile' : '#navegacion-form',
                popover: {
                    title: '⏩ Navegación',
                    description: 'Usa estos botones para moverte entre las diferentes secciones del estudio. Al llegar al final, podrás generar el PDF.',
                    side: isMobile ? "bottom" : "top", align: 'center'
                }
            }
        ]
    });

    tour.drive();
};

export const startFinalTour = () => {
    const isMobile = window.innerWidth < 640;

    const tour = driver({
        showProgress: true,
        animate: true,
        progressText: 'Paso {{current}} de {{total}}',
        doneBtnText: '¡Entendido!',
        closeBtnText: 'Cerrar',
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        popoverClass: 'driverjs-theme',
        steps: [
            {
                popover: {
                    title: '🏁 Último Paso',
                    description: 'Has llegado a la sección final. Aquí revisarás la conclusión, agregarás fotos y generarás el documento final.',
                    align: 'center'
                }
            },
            {
                element: '#conclusion-section',
                popover: {
                    title: '⚖️ Conclusión y Dictamen',
                    description: 'Redacta tus conclusiones sobre el candidato en los aspectos personal, laboral y socioeconómico, y selecciona el dictamen final.',
                    side: "bottom", align: 'start'
                }
            },
            {
                element: '#fotos-section',
                popover: {
                    title: '📸 Fotografías Principales',
                    description: 'Sube las fotos obligatorias: del candidato, fachada e interior. También puedes agregar un link a Google Maps si activas la casilla debajo de cada foto.',
                    side: "top", align: 'center'
                }
            },
            {
                element: '#fotos-extra-section',
                popover: {
                    title: '➕ Fotos Extra',
                    description: 'Si tienes más imágenes relevantes (comprobantes, identificación), agrégalas aquí. Puedes cambiarles el orden usando las flechas.',
                    side: "top", align: 'center'
                }
            },
            {
                element: '#docs-extra-section',
                popover: {
                    title: '📄 Documentos Anexos',
                    description: '¡NUEVO! Ahora puedes adjuntar otros archivos PDF al final de tu estudio (por ejemplo, actas, certificados o comprobantes escaneados).',
                    side: "top", align: 'center'
                }
            },
            {
                element: '#generar-pdf-section',
                popover: {
                    title: '🖨️ Generar PDF',
                    description: 'Elige si deseas incluir una portada, el tamaño de hoja, y finalmente presiona "Generar PDF Oficial" para descargar tu estudio terminado.',
                    side: "top", align: 'center'
                }
            }
        ]
    });

    tour.drive();
};
