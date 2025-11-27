import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    query,
    where,
} from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import { Note } from '../types';

export const notesService = {
    addNote: async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
        const col = collection(firestore, 'notes');
        const payload = {
            ...note,
            createdAt: serverTimestamp(),
        } as any;
        const ref = await addDoc(col, payload);
        return { id: ref.id, ...note } as Note;
    },

    fetchNotes: async (uid: string): Promise<Note[]> => {
        const q = query(
            collection(firestore, 'notes'),
            where('uid', '==', uid)
        );
        const snapshot = await getDocs(q);
        const notes: Note[] = snapshot.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) } as Note))
            .sort((a, b) => (b.createdAt as any) - (a.createdAt as any)); // Sort client-side instead
        return notes;
    },

    deleteNote: async (id: string): Promise<void> => {
        await deleteDoc(doc(firestore, 'notes', id));
    },

    updateNote: async (id: string, data: Partial<Note>): Promise<void> => {
        await updateDoc(doc(firestore, 'notes', id), { ...data, updatedAt: serverTimestamp() } as any);
    },
};
