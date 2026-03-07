import { db, storage, auth } from './firebaseConfig';
import {
    collection, doc, setDoc, getDoc, getDocs, deleteDoc,
    query, where, orderBy, Timestamp, updateDoc
} from 'firebase/firestore';
import {
    ref, uploadBytes, getDownloadURL, deleteObject, listAll
} from 'firebase/storage';

// --- CODE GENERATION ---
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I,O,0,1 para evitar confusión

export function generateCode(length = 6) {
    let code = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        code += CODE_CHARS[array[i] % CODE_CHARS.length];
    }
    return code;
}

// --- PHOTO COMPRESSION ---
export function compressImage(base64DataUrl, maxWidth = 1200, quality = 0.75) {
    return new Promise((resolve) => {
        if (!base64DataUrl || !base64DataUrl.startsWith('data:')) {
            resolve(null);
            return;
        }
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
        };
        img.onerror = () => resolve(null);
        img.src = base64DataUrl;
    });
}

function base64ToBlob(base64DataUrl) {
    const parts = base64DataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
}

// --- SEPARATE DATA FROM PHOTOS ---
function extractPhotos(formData) {
    const data = { ...formData };
    const photos = {};

    // Main photos
    if (data.fotos) {
        ['candidato', 'fachada', 'interior'].forEach(key => {
            if (data.fotos[key]) {
                photos[`foto_${key}`] = data.fotos[key];
                data.fotos = { ...data.fotos, [key]: '' };
            }
        });
    }

    // Extra photos
    if (data.fotosExtras?.length > 0) {
        data.fotosExtras = data.fotosExtras.map((extra, i) => {
            if (extra.imagen) {
                photos[`extra_foto_${i}`] = extra.imagen;
                return { ...extra, imagen: '' };
            }
            return extra;
        });
    }

    // Extra documents (PDFs as base64)
    if (data.documentosExtras?.length > 0) {
        data.documentosExtras = data.documentosExtras.map((doc, i) => {
            if (doc.archivo) {
                photos[`extra_doc_${i}`] = doc.archivo;
                return { ...doc, archivo: '' };
            }
            return doc;
        });
    }

    return { data, photos };
}

// --- UPLOAD PHOTOS TO STORAGE ---
async function uploadPhotos(userId, docId, photos) {
    const uploadPromises = [];

    for (const [key, base64Data] of Object.entries(photos)) {
        if (!base64Data) continue;

        // Compress images (not PDFs)
        let dataToUpload = base64Data;
        if (!key.startsWith('extra_doc_') && base64Data.startsWith('data:image')) {
            const compressed = await compressImage(base64Data);
            if (compressed) dataToUpload = compressed;
        }

        const blob = base64ToBlob(dataToUpload);
        const storageRef = ref(storage, `estudios/${userId}/${docId}/${key}`);
        uploadPromises.push(
            uploadBytes(storageRef, blob).then(() => ({ key, success: true }))
                .catch(err => {
                    console.warn(`Failed to upload ${key}:`, err);
                    return { key, success: false };
                })
        );
    }

    return Promise.all(uploadPromises);
}

// --- DOWNLOAD PHOTOS FROM STORAGE ---
async function downloadPhotos(userId, docId) {
    const photos = {};
    try {
        const folderRef = ref(storage, `estudios/${userId}/${docId}`);
        const result = await listAll(folderRef);

        const downloadPromises = result.items.map(async (itemRef) => {
            try {
                const url = await getDownloadURL(itemRef);
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        photos[itemRef.name] = reader.result;
                        resolve();
                    };
                    reader.readAsDataURL(blob);
                });
            } catch (err) {
                console.warn(`Failed to download ${itemRef.name}:`, err);
            }
        });

        await Promise.all(downloadPromises);
    } catch (err) {
        console.warn('Failed to list photos:', err);
    }
    return photos;
}

// --- REINSERT PHOTOS INTO DATA ---
function reinsertPhotos(formData, photos) {
    const data = { ...formData };

    // Main photos
    ['candidato', 'fachada', 'interior'].forEach(key => {
        if (photos[`foto_${key}`]) {
            data.fotos = { ...data.fotos, [key]: photos[`foto_${key}`] };
        }
    });

    // Extra photos
    if (data.fotosExtras?.length > 0) {
        data.fotosExtras = data.fotosExtras.map((extra, i) => {
            if (photos[`extra_foto_${i}`]) {
                return { ...extra, imagen: photos[`extra_foto_${i}`] };
            }
            return extra;
        });
    }

    // Extra documents
    if (data.documentosExtras?.length > 0) {
        data.documentosExtras = data.documentosExtras.map((doc, i) => {
            if (photos[`extra_doc_${i}`]) {
                return { ...doc, archivo: photos[`extra_doc_${i}`] };
            }
            return doc;
        });
    }

    return data;
}

// --- DELETE PHOTOS FROM STORAGE ---
async function deletePhotos(userId, docId) {
    try {
        const folderRef = ref(storage, `estudios/${userId}/${docId}`);
        const result = await listAll(folderRef);
        await Promise.all(result.items.map(item => deleteObject(item)));
    } catch (err) {
        console.warn('Failed to delete photos:', err);
    }
}

// --- MAIN CRUD OPERATIONS ---

/**
 * Save a study to the cloud. Creates or updates.
 * Returns { code, docId }
 */
export async function saveStudy(formData, existingDocId = null, existingCode = null) {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión para guardar');

    const { data, photos } = extractPhotos(formData);
    const code = existingCode || generateCode();
    const docId = existingDocId || `${user.uid}_${Date.now()}`;
    const now = Timestamp.now();

    const docData = {
        code,
        userId: user.uid,
        userEmail: user.email,
        datos: data,
        nombreCandidato: formData.nombre || 'Sin nombre',
        empresa: formData.empresa || '',
        currentStep: formData._currentStep || 1,
        createdAt: existingDocId ? undefined : now,
        updatedAt: now,
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        hasFotos: Object.keys(photos).length > 0,
        fotosCount: Object.keys(photos).length,
    };

    // Remove undefined fields
    Object.keys(docData).forEach(key => {
        if (docData[key] === undefined) delete docData[key];
    });

    const docRef = doc(db, 'estudios', docId);
    await setDoc(docRef, docData, { merge: true });

    // Upload photos
    if (Object.keys(photos).length > 0) {
        await uploadPhotos(user.uid, docId, photos);
    }

    return { code, docId };
}

/**
 * Load a study by code. Returns full formData with photos reinserted.
 */
export async function loadStudyByCode(code) {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const q = query(collection(db, 'estudios'), where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        throw new Error('No se encontró un estudio con ese código');
    }

    const docSnap = snapshot.docs[0];
    const study = docSnap.data();

    // Check expiration
    if (study.expiresAt && study.expiresAt.toDate() < new Date()) {
        throw new Error('Este estudio ha expirado. Contacta al dueño para renovarlo.');
    }

    // Download photos
    const photos = await downloadPhotos(study.userId, docSnap.id);
    const fullData = reinsertPhotos(study.datos, photos);

    return {
        formData: fullData,
        meta: {
            code: study.code,
            docId: docSnap.id,
            isOwner: study.userId === user.uid,
            nombreCandidato: study.nombreCandidato,
            empresa: study.empresa,
            createdAt: study.createdAt?.toDate(),
            expiresAt: study.expiresAt?.toDate(),
        }
    };
}

/**
 * Copy a study to the current user's account.
 * Returns { code, docId } of the new copy.
 */
export async function copyStudy(code) {
    const { formData } = await loadStudyByCode(code);
    return await saveStudy(formData);
}

/**
 * Load a study by docId (for the owner continuing their own work).
 */
export async function loadStudyById(docId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const docRef = doc(db, 'estudios', docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error('Estudio no encontrado');
    }

    const study = docSnap.data();

    // Download photos
    const photos = await downloadPhotos(study.userId, docId);
    const fullData = reinsertPhotos(study.datos, photos);

    return {
        formData: fullData,
        meta: {
            code: study.code,
            docId,
            isOwner: study.userId === user.uid,
            nombreCandidato: study.nombreCandidato,
            empresa: study.empresa,
            currentStep: study.currentStep,
            createdAt: study.createdAt?.toDate(),
            updatedAt: study.updatedAt?.toDate(),
            expiresAt: study.expiresAt?.toDate(),
        }
    };
}

/**
 * Get all studies for the current user.
 */
export async function getUserStudies() {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    let snapshot;
    try {
        // Try the indexed query first (requires composite index: userId + updatedAt)
        const q = query(
            collection(db, 'estudios'),
            where('userId', '==', user.uid),
            orderBy('updatedAt', 'desc')
        );
        snapshot = await getDocs(q);
    } catch (indexError) {
        // Fallback: query without orderBy (no composite index needed)
        console.warn('Indexed query failed, falling back to unordered query:', indexError.message);
        const fallbackQ = query(
            collection(db, 'estudios'),
            where('userId', '==', user.uid)
        );
        snapshot = await getDocs(fallbackQ);
    }

    const studies = snapshot.docs.map(d => {
        const data = d.data();
        return {
            docId: d.id,
            code: data.code,
            nombreCandidato: data.nombreCandidato,
            empresa: data.empresa,
            currentStep: data.currentStep || 1,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            expiresAt: data.expiresAt?.toDate(),
            hasFotos: data.hasFotos,
            fotosCount: data.fotosCount || 0,
        };
    });

    // Sort client-side (ensures correct order even with fallback query)
    studies.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return studies;
}

/**
 * Delete a study and its photos.
 */
export async function deleteStudy(docId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const docRef = doc(db, 'estudios', docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return;

    const study = docSnap.data();
    if (study.userId !== user.uid) {
        throw new Error('Solo puedes borrar tus propios estudios');
    }

    await deletePhotos(user.uid, docId);
    await deleteDoc(docRef);
}

/**
 * Renew a study's expiration by 30 more days from now.
 */
export async function renewStudy(docId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const docRef = doc(db, 'estudios', docId);
    await updateDoc(docRef, {
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        updatedAt: Timestamp.now(),
    });
}

/**
 * Clean up expired studies (called on dashboard load).
 */
export async function cleanupExpiredStudies() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const q = query(
            collection(db, 'estudios'),
            where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const now = new Date();
        const graceMs = 7 * 24 * 60 * 60 * 1000; // 7 days grace period

        for (const d of snapshot.docs) {
            const data = d.data();
            const expiresAt = data.expiresAt?.toDate();
            if (expiresAt && (now - expiresAt) > graceMs) {
                // Past grace period — auto-delete
                try {
                    await deletePhotos(user.uid, d.id);
                    await deleteDoc(d.ref);
                } catch (err) {
                    console.warn('Failed to cleanup:', d.id, err);
                }
            }
        }
    } catch (err) {
        console.warn('Cleanup query failed (non-blocking):', err.message);
    }
}
