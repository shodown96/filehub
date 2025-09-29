export interface PaginatedData<T = any> {
    items: T[];
    page: number;
    total: number;
    total_pages: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface APIResponse<T = any> {
    code: number;
    message: string;
    data: T
}