import { db, storage } from './firebase';
import { collection, addDoc, getDocs, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface BrandKitData {
    name: string;
    colors: string[];
    stylePreset: string;
    stylePrompt: string;
    logoUrl?: string;
    assetUrls?: string[];
    createdAt?: any;
    userId: string;
    id?: string;
}

const MAX_FILE_SIZE = 1048576; // 1MB in bytes

export const uploadBrandKitAsset = async (file: File, userId: string, brandKitId: string, type: 'logo' | 'asset') => {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File ${file.name} exceeds the 1MB limit.`);
    }

    const path = `users/${userId}/brandkits/${brandKitId}/${type}s/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
};

export const createBrandKit = async (userId: string, data: Omit<BrandKitData, 'userId' | 'createdAt' | 'logoUrl' | 'assetUrls'>, logo: File | null, assets: File[]) => {
    try {
        // 1. Create initial document to get an ID
        const brandKitCollection = collection(db, 'users', userId, 'brandkits');
        const docRef = await addDoc(brandKitCollection, {
            ...data,
            userId,
            createdAt: Timestamp.now(),
        });

        // 2. Upload Logo
        let logoUrl = '';
        if (logo) {
            logoUrl = await uploadBrandKitAsset(logo, userId, docRef.id, 'logo');
        }

        // 3. Upload Assets
        const assetUrls = [];
        for (const asset of assets) {
            const url = await uploadBrandKitAsset(asset, userId, docRef.id, 'asset');
            assetUrls.push(url);
        }

        // 4. Update document with URLs (We need to use setDoc with merge or updateDoc, but since we are just adding fields, let's re-create/update logic if we had updateDoc. 
        // Actually, importing updateDoc is better. Let's assume consistent imports.)
        // Re-import updateDoc at the top if needed, or use setDoc with merge.
        const { updateDoc, doc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', userId, 'brandkits', docRef.id), {
            logoUrl,
            assetUrls
        });

        return docRef.id;
    } catch (error) {
        console.error("Error creating brand kit:", error);
        throw error;
    }
};

export const getUserBrandKits = async (userId: string) => {
    try {
        const brandKitCollection = collection(db, 'users', userId, 'brandkits');
        const q = query(brandKitCollection, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        })) as BrandKitData[];
    } catch (error) {
        console.error("Error fetching brand kits:", error);
        return [];
    }
};

export const getBrandKit = async (userId: string, brandKitId: string) => {
    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'users', userId, 'brandkits', brandKitId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as BrandKitData;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching brand kit:", error);
        throw error;
    }
};

export const updateBrandKit = async (userId: string, brandKitId: string, data: Partial<BrandKitData>, logo: File | null, assets: File[]) => {
    try {
        const { updateDoc, doc } = await import('firebase/firestore');

        // 1. Upload Logo if new one provided
        let logoUrl = data.logoUrl;
        if (logo) {
            logoUrl = await uploadBrandKitAsset(logo, userId, brandKitId, 'logo');
        }

        // 2. Upload new Assets
        let assetUrls = data.assetUrls || [];
        if (assets && assets.length > 0) {
            for (const asset of assets) {
                const url = await uploadBrandKitAsset(asset, userId, brandKitId, 'asset');
                assetUrls.push(url);
            }
        }

        // 3. Update Firestore
        const updateData = {
            ...data,
            logoUrl,
            assetUrls,
        };
        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]);

        await updateDoc(doc(db, 'users', userId, 'brandkits', brandKitId), updateData);

        return brandKitId;
    } catch (error) {
        console.error("Error updating brand kit:", error);
        throw error;
    }
};

export const deleteBrandKit = async (userId: string, brandKitId: string) => {
    try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', userId, 'brandkits', brandKitId));
        return true;
    } catch (error) {
        console.error("Error deleting brand kit:", error);
        throw error;
    }
};
