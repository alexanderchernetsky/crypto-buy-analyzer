type FearGreedStatus = {
    text: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed' | 'Loading';
    color: string;
    bgColor: string;
};

export const getFearGreedStatus = (index: number | undefined): FearGreedStatus => {
    if (!index) {
        return {
            text: 'Loading',
            color: '#9ca3af',
            bgColor: 'rgba(107, 114, 128, 0.1)',
        }
    }
    if (index <= 25) {
        return {
            text: 'Extreme Fear',
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)',
        };
    }
    if (index <= 45) {
        return {
            text: 'Fear',
            color: '#34d399',
            bgColor: 'rgba(52, 211, 153, 0.1)',
        };
    }
    if (index <= 55) {
        return {
            text: 'Neutral',
            color: '#9ca3af',
            bgColor: 'rgba(107, 114, 128, 0.1)',
        };
    }
    if (index <= 75) {
        return {
            text: 'Greed',
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)',
        };
    }
    return {
        text: 'Extreme Greed',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
    };
};
