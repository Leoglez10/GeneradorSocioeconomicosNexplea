import React, { useRef, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../AuthProvider";
import nexpleaLogo from "../../assets/x.png";

const DotMap = () => {
    const canvasRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Set up routes that will animate across the map
    const routes = [
        { start: { x: 100, y: 150, delay: 0 }, end: { x: 200, y: 80, delay: 2 }, color: "#63D1FF" },
        { start: { x: 200, y: 80, delay: 2 }, end: { x: 260, y: 120, delay: 4 }, color: "#63D1FF" },
        { start: { x: 50, y: 50, delay: 1 }, end: { x: 150, y: 180, delay: 3 }, color: "#63D1FF" },
        { start: { x: 280, y: 60, delay: 0.5 }, end: { x: 180, y: 180, delay: 2.5 }, color: "#63D1FF" },
    ];

    // Create dots for the world map
    const generateDots = (width, height) => {
        const dots = [];
        const gap = 12;
        const dotRadius = 1;

        for (let x = 0; x < width; x += gap) {
            for (let y = 0; y < height; y += gap) {
                const isInMapShape =
                    ((x < width * 0.25 && x > width * 0.05) && (y < height * 0.4 && y > height * 0.1)) ||
                    ((x < width * 0.25 && x > width * 0.15) && (y < height * 0.8 && y > height * 0.4)) ||
                    ((x < width * 0.45 && x > width * 0.3) && (y < height * 0.35 && y > height * 0.15)) ||
                    ((x < width * 0.5 && x > width * 0.35) && (y < height * 0.65 && y > height * 0.35)) ||
                    ((x < width * 0.7 && x > width * 0.45) && (y < height * 0.5 && y > height * 0.1)) ||
                    ((x < width * 0.8 && x > width * 0.65) && (y < height * 0.8 && y > height * 0.6));

                if (isInMapShape && Math.random() > 0.3) {
                    dots.push({
                        x,
                        y,
                        radius: dotRadius,
                        opacity: Math.random() * 0.5 + 0.2,
                    });
                }
            }
        }
        return dots;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
            canvas.width = width;
            canvas.height = height;
        });

        resizeObserver.observe(canvas.parentElement);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!dimensions.width || !dimensions.height) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dots = generateDots(dimensions.width, dimensions.height);
        let animationFrameId;
        let startTime = Date.now();

        function drawDots() {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);
            dots.forEach(dot => {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 209, 255, ${dot.opacity})`; // #63D1FF (brand-secondary)
                ctx.fill();
            });
        }

        function drawRoutes() {
            const currentTime = (Date.now() - startTime) / 1000;
            routes.forEach(route => {
                const elapsed = currentTime - route.start.delay;
                if (elapsed <= 0) return;

                const duration = 3;
                const progress = Math.min(elapsed / duration, 1);

                const x = route.start.x + (route.end.x - route.start.x) * progress;
                const y = route.start.y + (route.end.y - route.start.y) * progress;

                ctx.beginPath();
                ctx.moveTo(route.start.x, route.start.y);
                ctx.lineTo(x, y);
                ctx.strokeStyle = route.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = route.color;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#63D1FF";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(99, 209, 255, 0.4)";
                ctx.fill();

                if (progress === 1) {
                    ctx.beginPath();
                    ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = route.color;
                    ctx.fill();
                }
            });
        }

        function animate() {
            drawDots();
            drawRoutes();
            if ((Date.now() - startTime) / 1000 > 15) {
                startTime = Date.now();
            }
            animationFrameId = requestAnimationFrame(animate);
        }

        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, [dimensions]);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

export default function SignInCard() {
    const { loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getFirebaseErrorMessage = (err) => {
        switch (err?.code) {
            case 'auth/unauthorized-domain':
                return 'Dominio no autorizado en Firebase Auth. Agrega tu dominio de producción en Authentication > Settings > Authorized domains.';
            case 'auth/popup-blocked':
                return 'El navegador bloqueó la ventana emergente. Permite popups para este sitio e intenta de nuevo.';
            case 'auth/operation-not-allowed':
                return 'Google Sign-In no está habilitado en Firebase Authentication.';
            case 'auth/network-request-failed':
                return 'Error de red al conectar con Firebase. Verifica conexión, SSL y bloqueadores de contenido.';
            default:
                return `Error al iniciar sesión (${err?.code || 'desconocido'}). Intenta de nuevo.`;
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await loginWithGoogle();
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(getFirebaseErrorMessage(err));
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full h-full items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-white border-2 border-brand-primary/20 ring-1 ring-brand-secondary/30 shadow-2xl"
            >
                {/* Left side - Map & Logo */}
                <div className="hidden md:block w-1/2 h-[600px] relative overflow-hidden border-r border-gray-100">
                    <div className="absolute inset-0 bg-brand-primary">
                        <DotMap />

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="mb-6"
                            >
                                <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center p-2 shadow-[0_0_30px_rgba(99,209,255,0.3)]">
                                    <img src={nexpleaLogo} alt="Nexplea" className="h-full object-contain" />
                                </div>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                                className="text-3xl font-bold mb-2 text-center text-white"
                            >
                                Estudio Socioeconómico
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="text-sm text-center text-brand-secondary max-w-xs font-medium"
                            >
                                Generador oficial de estudios socioeconómicos en formato PDF
                            </motion.p>
                        </div>
                    </div>
                </div>

                {/* Right side - Sign In Form */}
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="md:hidden flex justify-center mb-8">
                            <img src={nexpleaLogo} alt="Nexplea" className="h-16 object-contain" />
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-brand-navy text-center md:text-left">Bienvenido de nuevo</h1>
                        <p className="text-gray-700 font-semibold mb-8 text-center md:text-left">Inicia sesión en tu cuenta</p>

                        {error && (
                            <div className="bg-red-500/10 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 text-center">
                                {error}
                            </div>
                        )}

                        <div className="mb-6">
                            <button
                                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-3.5 px-4 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-300 text-gray-800 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fillOpacity=".54"
                                        />
                                        <path
                                            fill="#4285F4"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                        <path fill="#EA4335" d="M1 1h22v22H1z" fillOpacity="0" />
                                    </svg>
                                )}
                                <span className="font-medium text-[15px]">{loading ? 'Iniciando sesión...' : 'Continuar con Google'}</span>
                            </button>
                        </div>

                        <p className="text-gray-400 text-xs text-center mt-6">
                            Compatible con cuentas @gmail.com, @nexplea.com y cualquier cuenta de Google
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
