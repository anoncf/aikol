export interface CryptoNews {
    id: number;
    title: string;
    published_at: string;
    url: string;
    currencies: Array<{ code: string; title: string }>;
    metadata: {
        description: string;
    };
    votes: {
        liked: number;
        important: number;
        saved: number;
        negative: number;
        positive: number;
        comments: number;
        total: number;
    };
}

export interface NewsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: CryptoNews[];
}

export interface FormattedNews {
    title: string;
    description: string;
    published: string;
    url: string;
    likes: number;
    relevance: number;
    fullContent?: string;
}
