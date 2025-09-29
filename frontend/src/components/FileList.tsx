import {
  DocumentIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fileService } from '../services/fileService';
import { FileFilters } from '../types/file';
import { getAxiosError } from '../utils';
import EntryItem from './FileItem';
import { FileListSkeleton } from './FileListSkeleton';
import Pagination from './Pagination';
import { DEFAULT_PAGE_SIZE } from '../constants';


export const FileList: React.FC = () => {
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FileFilters>({
    search: '',
    file_type: '',
    min_size: '',
    max_size: '',
    uploaded_after: '',
    uploaded_before: '',
    page: 1,
    page_size: DEFAULT_PAGE_SIZE
  });

  // Debounced search to avoid too many API calls
  const [debouncedFilters, setDebouncedFilters] = useState<FileFilters>(filters);

  // Query for fetching files with filters
  const { data: entries, isLoading, error, } = useQuery({
    queryKey: ['files', debouncedFilters],
    queryFn: () => fileService.getFiles(debouncedFilters),
    placeholderData: (previousData) => previousData,
  });

  // Mutation for deleting files
  const deleteMutation = useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error) => {
      const message = getAxiosError(error, "Failed to delete file. Please try again.")
      toast.error(message)
    },
  });

  // Mutation for downloading files
  const downloadMutation = useMutation({
    mutationFn: ({ fileUrl, filename }: { fileUrl: string; filename: string }) =>
      fileService.downloadFile(fileUrl, filename),
  });

  const handleFilterChange = (field: keyof FileFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      // Reset to first page when filters change (except for page/page_size changes)
      page: field === 'page' || field === 'page_size' ? Number(value) : 1
    }));
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      file_type: '',
      min_size: '',
      max_size: '',
      uploaded_after: '',
      uploaded_before: '',
      page: 1, // Reset to first page
      page_size: filters.page_size // Keep current page size
    });
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'page' || key === 'page_size') return false;
    return value !== '' && value !== 1;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDownload = async (fileUrl: string, filename: string) => {
    try {
      await downloadMutation.mutateAsync({ fileUrl, filename });
    } catch (err) {
      console.error('Download error:', err);
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <FileListSkeleton loading={isLoading} error={error?.cause}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Uploaded Files</h2>
          <div className="flex items-center space-x-3">
            {entries && entries.total ? (
              <span className="text-sm text-gray-500">
                {entries.total} file{entries.total !== 1 ? 's' : ''}
              </span>
            ) : null}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${hasActiveFilters || showFilters
                ? 'text-primary-700 bg-primary-50 border-primary-300'
                : 'text-gray-700 bg-white hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters ? (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Active
                </span>
              ):null}
            </button>
          </div>
        </div>

        {/* Search Bar - Always Visible */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search files by name..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters ? (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Filters</h3>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Clear all
                </button>
              ):null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* File Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Type
                </label>
                <select
                  value={filters.file_type}
                  onChange={(e) => handleFilterChange('file_type', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All types</option>
                  <option value="pdf">PDF</option>
                  <option value="jpg">JPG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="gif">GIF</option>
                  <option value="doc">DOC</option>
                  <option value="docx">DOCX</option>
                  <option value="txt">TXT</option>
                  <option value="mp4">MP4</option>
                  <option value="avi">AVI</option>
                </select>
              </div>

              {/* Size Range - Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Size (KB)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.min_size}
                  onChange={(e) => handleFilterChange('min_size', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Size Range - Max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Size (KB)
                </label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={filters.max_size}
                  onChange={(e) => handleFilterChange('max_size', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Upload Date - From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uploaded After
                </label>
                <input
                  type="date"
                  value={filters.uploaded_after}
                  onChange={(e) => handleFilterChange('uploaded_after', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Upload Date - To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uploaded Before
                </label>
                <input
                  type="date"
                  value={filters.uploaded_before}
                  onChange={(e) => handleFilterChange('uploaded_before', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items per page
                </label>
                <select
                  value={filters.page_size}
                  onChange={(e) => handleFilterChange('page_size', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        ) : null}

        {/* Results */}
        {!entries || entries.items.length === 0 ? (
          <div className="text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {hasActiveFilters ? 'No files match your filters' : 'No files'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your search criteria'
                : 'Get started by uploading a file'
              }
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Clear filters
              </button>
            ):null}
          </div>
        ) : (
          <div className="mt-6 flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {entries.items.map((entry) => (
                <EntryItem
                  key={entry.id}
                  item={entry}
                  handleDelete={handleDelete}
                  handleDownload={handleDownload}
                  deleting={deleteMutation.isPending}
                  downloading={downloadMutation.isPending}
                />
              ))}
            </ul>

            {/* Pagination */}
            <Pagination
              paginatedData={entries}
              filters={filters}
              handleFilterChange={handleFilterChange} />
          </div>
        )}
      </div>
    </FileListSkeleton>
  );
};