import { Investment } from '@/react-query/useInvestments';

const parseDate = (dateStr: string): number => new Date(dateStr).getTime();

export const processCryptoTrackerData = (cryptoTrackerData: Investment[]): Investment[] => {
	if (!cryptoTrackerData.length) return [];

	// First sort alphabetically by tokenName
	const alphabeticallySorted = [...cryptoTrackerData].sort((a, b) => a.tokenName.localeCompare(b.tokenName));

	// Then sort by dateAdded (descending)
	const data = [...alphabeticallySorted].sort((a, b) => parseDate(b.dateAdded) - parseDate(a.dateAdded));

	return data;
};
