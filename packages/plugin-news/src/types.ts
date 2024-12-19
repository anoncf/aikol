export interface CryptoNews {
    kind: string;
    title: string;
    published_at: string;
    url: string;
    currencies: Array<{ code: string; title: string }>;
    metadata: {
        description: string;
    };
    votes: {
        liked: number;
        disliked: number;
        important: number;
        toxic: number;
        saved: number;
        comments: number;
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
    fullContent?: {
        title: string;
        description: string;
        bodyContent: string;
    };
}
