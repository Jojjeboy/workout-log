import { useEffect } from 'react';
import { queueService } from '../services/queueService';

export function useQueueProcessor() {
    useEffect(() => {
        const handleOnline = () => {
            console.log('App is online. Processing queue...');
            queueService.processQueue();
        };

        window.addEventListener('online', handleOnline);

        // Initial check
        if (navigator.onLine) {
            queueService.processQueue();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, []);
}
