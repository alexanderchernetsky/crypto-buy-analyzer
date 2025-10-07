import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	collection,
	addDoc,
	deleteDoc,
	updateDoc,
	doc,
	onSnapshot,
	DocumentData,
	QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/database/firebase';

export interface CryptoBuyToken {
	id?: string; // Will be added when fetched
	tokenName: string;
	symbol: string;
	allTimeLow?: number;
	allTimeHigh?: number;
	oneYearLow?: number;
	oneYearHigh?: number;
	oneMonthLow?: number;
	oneMonthHigh?: number;
}

const investmentsRef = collection(db, 'crypto-buy-analyzer-tokens');

// =======================
// Fetch Hook
// =======================
export const useCryptoBuyAnalyzer = () => {
	return useQuery<CryptoBuyToken[]>({
		queryKey: ['crypto-buy-analyzer-token'],
		queryFn: () =>
			new Promise((resolve) => {
				const unsubscribe = onSnapshot(investmentsRef, (snapshot) => {
					const data: CryptoBuyToken[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
						id: doc.id,
						...(doc.data() as Omit<CryptoBuyToken, 'id'>),
					}));
					resolve(data);
				});

				// Cleanup
				return () => unsubscribe();
			}),
		staleTime: Infinity,
	});
};

// =======================
// Add Token Hook
// =======================
export const useAddTokenToBuyAnalyzer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (newInvestment: Omit<CryptoBuyToken, 'id'>) => addDoc(investmentsRef, newInvestment),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crypto-buy-analyzer-token'] }),
	});
};

// =======================
// Update Token Hook
// =======================
export const useUpdateTokenInBuyAnalyzer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updateData }: CryptoBuyToken & { id: string }) =>
			updateDoc(doc(db, 'crypto-buy-analyzer-tokens', id), updateData),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crypto-buy-analyzer-token'] }),
	});
};

// =======================
// Delete Token Hook
// =======================
export const useRemoveTokenFromBuyAnalyzer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteDoc(doc(db, 'crypto-buy-analyzer-tokens', id)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crypto-buy-analyzer-token'] }),
	});
};
