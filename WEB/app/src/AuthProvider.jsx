import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from './firebaseConfig';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return unsub;
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            if (err?.code === 'auth/popup-blocked') {
                await signInWithRedirect(auth, googleProvider);
                return;
            }
            console.error('Login failed:', err);
            throw err;
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const value = { user, loading, loginWithGoogle, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
