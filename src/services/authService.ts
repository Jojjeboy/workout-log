import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export const authService = {
    login: async (): Promise<User> => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout failed', error);
            throw error;
        }
    },

    getCurrentUser: (): User | null => {
        return auth.currentUser;
    }
};
