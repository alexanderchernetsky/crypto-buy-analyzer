// Define the shape of your Liquidity Pool data
export type Pool = {
    id: string;
    poolName: string;
    rangeFrom: number;
    rangeTo: number;
    status: 'open' | 'closed';
    earningRows: EarningRow[];
    tokenSymbol: string;
};

// Type for new Pool input (without id)
export type NewPool = Omit<Pool, 'id'>;

export interface EarningRow {
    id: string;
    principal: number;
    startDate: string;
    endDate: string;
    earnings: number;
    gathered: "yes" | "no";
}

export interface Calculations {
    days: number;
    earningPerDay: number;
    apr: number;
}
