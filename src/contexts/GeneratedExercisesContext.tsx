import { createContext, useContext, useState, ReactNode } from 'react';
import { Exercise } from '../types';

interface GeneratedExercisesContextType {
    generatedExercises: Exercise[];
    setGeneratedExercises: (exercises: Exercise[]) => void;
}

const GeneratedExercisesContext = createContext<GeneratedExercisesContextType | undefined>(undefined);

export const GeneratedExercisesProvider = ({ children }: { children: ReactNode }) => {
    const [generatedExercises, setGeneratedExercises] = useState<Exercise[]>([]);

    return (
        <GeneratedExercisesContext.Provider value={{ generatedExercises, setGeneratedExercises }}>
            {children}
        </GeneratedExercisesContext.Provider>
    );
};

export const useGeneratedExercises = () => {
    const context = useContext(GeneratedExercisesContext);
    if (context === undefined) {
        throw new Error('useGeneratedExercises must be used within a GeneratedExercisesProvider');
    }
    return context;
};
