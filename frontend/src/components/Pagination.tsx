import { PaginatedData } from '../types';
import { PaginationFilters } from '../types/file';

interface PaginationProps {
    paginatedData: PaginatedData,
    filters: PaginationFilters,
    handleFilterChange: (field: keyof PaginationFilters, value: string | number) => void
}
export default function Pagination({ paginatedData, filters, handleFilterChange }: PaginationProps) {
    return (
        <>
            {paginatedData && paginatedData.total_pages > 1 ? (
                <div className="mt-6 flex max-lg:flex-col gap-2 items-center justify-between border-t border-gray-200 pt-4">
                    <div className="flex items-center">
                        <p className="text-sm text-gray-700">
                            Showing{' '}
                            {/* <span className="font-medium">
                                {((filters.page - 1) * filters.page_size) + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                                {Math.min(filters.page * filters.page_size, paginatedData.total)}
                            </span>{' '} */}
                            <span className="font-medium">
                                {filters.page_size}{' '}
                            </span>
                            of{' '}
                            <span className="font-medium">{paginatedData.total}</span> items
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* First Page */}
                        <button
                            onClick={() => handleFilterChange('page', 1)}
                            disabled={filters.page === 1}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">First page</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M21 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Previous Page */}
                        <button
                            onClick={() => handleFilterChange('page', filters.page - 1)}
                            disabled={filters.page === 1}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous page</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                            {(() => {
                                const totalPages = paginatedData.total_pages;
                                const currentPage = filters.page;
                                const pages = [];

                                // Calculate which pages to show
                                let startPage = Math.max(1, currentPage - 2);
                                let endPage = Math.min(totalPages, currentPage + 2);

                                // Adjust if we're near the beginning or end
                                if (endPage - startPage < 4) {
                                    if (startPage === 1) {
                                        endPage = Math.min(totalPages, startPage + 4);
                                    } else {
                                        startPage = Math.max(1, endPage - 4);
                                    }
                                }

                                // Show first page and ellipsis if needed
                                if (startPage > 1) {
                                    pages.push(
                                        <button
                                            key={1}
                                            onClick={() => handleFilterChange('page', 1)}
                                            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        >
                                            1
                                        </button>
                                    );
                                    if (startPage > 2) {
                                        pages.push(
                                            <span key="start-ellipsis" className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                                                ...
                                            </span>
                                        );
                                    }
                                }

                                // Show page range
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => handleFilterChange('page', i)}
                                            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium border ${i === currentPage
                                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                // Show last page and ellipsis if needed
                                if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                        pages.push(
                                            <span key="end-ellipsis" className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                                                ...
                                            </span>
                                        );
                                    }
                                    pages.push(
                                        <button
                                            key={totalPages}
                                            onClick={() => handleFilterChange('page', totalPages)}
                                            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        >
                                            {totalPages}
                                        </button>
                                    );
                                }

                                return pages;
                            })()}
                        </div>

                        {/* Next Page */}
                        <button
                            onClick={() => handleFilterChange('page', filters.page + 1)}
                            disabled={filters.page === paginatedData.total_pages}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next page</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Last Page */}
                        <button
                            onClick={() => handleFilterChange('page', paginatedData.total_pages)}
                            disabled={filters.page === paginatedData.total_pages}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Last page</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            ):null}
        </>
    )
}
