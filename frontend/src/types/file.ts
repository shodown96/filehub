export interface DBFile {
  id: string;
  original_filename: string;
  file_type: string;
  size: number;
  created_at: string;
  file: string;
  // upload_count: number;
}

export interface Entry {
  id: string;
  name: string;
  file: DBFile;
  created_at: string
  updated_at: string
}


export interface PaginationFilters {
  page: number;
  page_size: number;

}

export interface FileFilters extends PaginationFilters {
  search: string;
  file_type: string;
  min_size: string;
  max_size: string;
  uploaded_after: string;
  uploaded_before: string;
}

export interface FileStorageStats {
  actual_space: string;
  space_saved: string;
  would_be_space: string;
  savings_percentage: string;
  deduplication_ratio: string;
  total_files: number;
  total_entries: number;
}