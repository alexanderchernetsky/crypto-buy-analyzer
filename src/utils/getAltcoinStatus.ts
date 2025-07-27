type AltcoinPhase =
    | 'Altcoin Winter'
    | 'Accumulation'
    | 'Growth Phase'
    | 'Alt Season'
    | 'Euphoria';

interface AltcoinStatus {
    text: AltcoinPhase;
    color: string;
    bgColor: string;
}

export const getAltcoinStatus = (index: number): AltcoinStatus => {
    if (index <= 30) {
        return {
            text: 'Altcoin Winter',
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)',
        };
    }
    if (index <= 50) {
        return {
            text: 'Accumulation',
            color: '#34d399',
            bgColor: 'rgba(52, 211, 153, 0.1)',
        };
    }
    if (index <= 70) {
        return {
            text: 'Growth Phase',
            color: '#fbbf24',
            bgColor: 'rgba(251, 191, 36, 0.1)',
        };
    }
    if (index <= 85) {
        return {
            text: 'Alt Season',
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)',
        };
    }
    return {
        text: 'Euphoria',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
    };
};
