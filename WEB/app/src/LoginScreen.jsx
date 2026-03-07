import React from 'react';
import SignInCard from '@/components/ui/travel-connect-signin';

export default function LoginScreen() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 relative overflow-hidden">
            {/* Soft ambient background effects using brand colors */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-primary/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/10 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full flex justify-center">
                <SignInCard />
            </div>
        </div>
    );
}
