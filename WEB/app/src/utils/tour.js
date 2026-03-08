import { driver } from "driver.js";
import "driver.js/dist/driver.css";
// Importamos nuestro diseño premium personalizado
import "./tour.css";

export const startDashboardTour = () => {
    const tour = driver({
        showProgress: true,
        animate: true,
        progressText: 'Paso {{current}} de {{total}}',
        doneBtnText: '¡Entendido!',
        closeBtnText: 'Cerrar',
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        popoverClass: 'driverjs-theme', // Le ponemos una clase para darle estilo CSS
        steps: [
            {
                popover: {
                    title: '✨ ¡Bienvenido al Dashboard!',
                    description: 'Aquí es donde sucede toda la magia. Administra, visualiza y crea tus estudios socioeconómicos de forma profesional y segura.',
                    align: 'center'
                }
            },
            {
                element: '#btn-crear-estudio',
                popover: {
                    title: '📝 Crear tu primer estudio',
                    description: 'Haz clic aquí para iniciar un nuevo reporte. Solo llena los datos del candidato paso a paso hasta completarlo.',
                    side: "bottom", align: 'end'
                }
            },
            {
                element: '#boton-recibir-progreso',
                popover: {
                    title: '🤝 Recibir progreso',
                    description: '¿Alguien te compartió el progreso de un estudio? Usa este botón e ingresa su clave de 6 dígitos para continuarlo.',
                    side: "bottom", align: 'center'
                }
            },
            {
                element: '#seccion-estudios',
                popover: {
                    title: '📂 Tus estudios recientes',
                    description: 'Aquí verás un panel con todos los estudios que has creado. Podrás editarlos, eliminarlos o exportarlos en cualquier momento.',
                    side: "top", align: 'start'
                }
            },
            {
                element: '#boton-codigo-compartir',
                popover: {
                    title: '🔗 Compartir progreso',
                    description: 'Si necesitas que un compañero continúe tu estudio, al crear uno verás un código aquí. Cópialo y envíaselo.',
                    side: "top", align: 'center'
                }
            },
            {
                element: '#btn-reportar-bug',
                popover: {
                    title: '🐞 Reportar un error',
                    description: 'Diseñamos la app para que no falle, pero si algo no cuadra o la web está lenta, da clic aquí para que soporte técnico te ayude.',
                    side: "left", align: 'center'
                }
            },
            {
                element: '#btn-cerrar-sesion',
                popover: {
                    title: '👋 Cerrar sesión',
                    description: 'No te preocupes por guardar, todo tu trabajo se sincroniza con la nube en todo momento. ¡Nos vemos pronto!',
                    side: "bottom", align: 'end'
                }
            }
        ]
    });

    tour.drive();
};
