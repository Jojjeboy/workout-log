import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesService } from '../services/notesService';
import { Note } from '../types';
import { useAuth } from './useAuth';

export function useNotes() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const uid = user?.uid;

    console.log('useNotes hook - user:', user?.email, 'uid:', uid);

    const notesQuery = useQuery({
        queryKey: ['notes', uid],
        queryFn: async () => {
            console.log('Fetching notes for uid:', uid);
            if (!uid) {
                console.log('No uid, returning empty array');
                return [] as Note[];
            }
            try {
                const result = await notesService.fetchNotes(uid);
                console.log('Fetched notes:', result);
                return result;
            } catch (error) {
                console.error('Failed to fetch notes:', error);
                throw error;
            }
        },
        enabled: !!uid,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const addMutation = useMutation({
        mutationFn: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
            if (!uid) throw new Error('Not authenticated');
            return notesService.addNote({ ...note, uid });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', uid] });
        },
        onError: (error) => {
            console.error('Failed to add note:', error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => notesService.deleteNote(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', uid] }),
        onError: (error) => {
            console.error('Failed to delete note:', error);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) => notesService.updateNote(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', uid] }),
        onError: (error) => {
            console.error('Failed to update note:', error);
        },
    });

    return {
        ...notesQuery,
        addNote: addMutation.mutate,
        isAdding: addMutation.isPending,
        deleteNote: deleteMutation.mutate,
        updateNote: updateMutation.mutate,
    };
}
