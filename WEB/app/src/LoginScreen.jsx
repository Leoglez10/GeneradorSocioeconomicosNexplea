import React from 'react';
import SignInCard from '@/components/ui/travel-connect-signin';

export default function LoginScreen() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-200 p-4 relative overflow-hidden">
            {/* Soft ambient background effects using brand colors */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-primary/15 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/15 blur-[120px]" />
                <div className="absolute inset-0 m-auto w-[70%] h-[70%] rounded-full bg-slate-500/15 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full flex justify-center">
                <SignInCard />
            </div>
        </div>
    );
}
