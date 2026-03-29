export type ScrapeJobPayload = {
    taskId: string;
    link: string;
    shop: string;
    minimalCartPrice: string | null;
    minPrice: string | null;
    maxPrice: string | null;
    count: string | null;
    commision: string | null;
    currency: string | null;
};

export type ScrapeEnqueueInput = Omit<ScrapeJobPayload, 'taskId'>;
