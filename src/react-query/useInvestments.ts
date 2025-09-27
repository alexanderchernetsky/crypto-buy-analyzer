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

// Define the shape of your investment data
export type Investment = {
    id: string;
    tokenName: string;
    dateAdded: string;
    status: string;
    symbol: string;
    currentPrice: number;
    quantity: number;
    amountPaid: number;
    closePrice: number;
    purchasePrice: number;
    sold: number;
    notes: string;
    currentValue: number;
    profitLossPercentage: number;
    profitLoss: number;
    closedAt?: string;
    // Add more fields as needed
};

// Type for new investment input (without id)
type NewInvestment = Omit<Investment, 'id'>;

const investmentsRef: CollectionReference<DocumentData> = collection(db, 'crypto-investments');

// Hook to fetch investments in real-time using onSnapshot
export const useInvestments = () => {
    return useQuery<Investment[]>({
        queryKey: ['crypto-investments'],
        queryFn: () =>
            new Promise<Investment[]>((resolve) => {
                const unsubscribe: Unsubscribe = onSnapshot(investmentsRef, (snapshot) => {
                    const data: Investment[] = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Investment[];
                    resolve(data);
                });

                // Cleanup
                return () => unsubscribe();
            }),
        staleTime: Infinity,
    });
};

// Hook to add a new investment
export const useAddInvestment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newInvestment: NewInvestment) => addDoc(investmentsRef, newInvestment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crypto-investments'] });
        },
    });
};

// Hook to update an investment by ID
export const useUpdateInvestment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...updateData }: Investment) => {
            const docRef = doc(db, 'crypto-investments', id);
            return updateDoc(docRef, updateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crypto-investments'] });
        },
    });
};

// Hook to remove an investment by ID
export const useRemoveInvestment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            const docRef = doc(db, 'crypto-investments', id);
            return deleteDoc(docRef);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crypto-investments'] });
        },
    });
};
