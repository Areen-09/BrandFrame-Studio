import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './firebase';

export const createUserDocument = async (user: User) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const { email, displayName, photoURL } = user;

        try {
            await setDoc(userRef, {
                uid: user.uid,
                email,
                displayName,
                photoURL,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error creating user document', error);
        }
    } else {
        // Update last login
        try {
            await setDoc(userRef, {
                lastLogin: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating user document', error);
        }
    }
};
