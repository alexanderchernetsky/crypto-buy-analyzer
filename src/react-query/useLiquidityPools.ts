import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    DocumentData,
    CollectionReference,
} from 'firebase/firestore';
import { db } from '@/database/firebase';
import { getDocs } from 'firebase/firestore';
import {NewPool, Pool} from "@/types/liquidity-pools";

// Firestore collection reference
const poolsRef: CollectionReference<DocumentData> = collection(db, 'liquidity-pools');

export const usePools = () => {
    return useQuery<Pool[]>({
        queryKey: ['liquidity-pools'],
        queryFn: async () => {
            const snapshot = await getDocs(poolsRef);
            const data: Pool[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Pool[];
            return data;
        },
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
