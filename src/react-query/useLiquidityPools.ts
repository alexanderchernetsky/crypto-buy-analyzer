import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
    DocumentData,
    Unsubscribe,
    CollectionReference,
} from 'firebase/firestore';
import { db } from '@/database/firebase';

// Define the shape of your Liquidity Pool data
export type Pool = {
    id: string;
    poolName: string;
    startDate: string;
    endDate: string;
    rangeFrom: number;
    rangeTo: number;
    principal: number;
    earnings: number;
    status: 'open' | 'closed';
};

// Type for new Pool input (without id)
export type NewPool = Omit<Pool, 'id'>;

// Firestore collection reference
const poolsRef: CollectionReference<DocumentData> = collection(db, 'liquidity-pools');

// Hook to fetch pools in real-time
export const usePools = () => {
    return useQuery<Pool[]>({
        queryKey: ['liquidity-pools'],
        queryFn: () =>
            new Promise<Pool[]>((resolve) => {
                const unsubscribe: Unsubscribe = onSnapshot(poolsRef, (snapshot) => {
                    const data: Pool[] = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Pool[];
                    resolve(data);
                });

                // Cleanup
                return () => unsubscribe();
            }),
        staleTime: Infinity,
    });
};

// Hook to add a new pool
export const useAddPool = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newPool: NewPool) => addDoc(poolsRef, newPool),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liquidity-pools'] });
        },
    });
};

// Hook to update a pool by ID
export const useUpdatePool = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...updateData }: Partial<NewPool> & { id: string }) => {
            const docRef = doc(db, 'liquidity-pools', id);
            return updateDoc(docRef, updateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liquidity-pools'] });
        },
    });
};

// Hook to remove a pool by ID
export const useRemovePool = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            const docRef = doc(db, 'liquidity-pools', id);
            return deleteDoc(docRef);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liquidity-pools'] });
        },
    });
};
