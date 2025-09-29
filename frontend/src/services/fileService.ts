import axios from 'axios';
import { Entry, FileStorageStats } from '../types/file';
import { PaginatedData } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const fileService = {
  async uploadFile({ customName, selectedFile }: { customName: string, selectedFile: File }): Promise<Entry> {
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', customName);

    const response = await axios.post(`${API_URL}/files/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getFiles(filters: any = {}): Promise<PaginatedData<Entry>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        // Convert KB to bytes for size filters
        if (key === 'min_size' || key === 'max_size') {
          const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
          if (!isNaN(numValue)) {
            params.append(key, String(numValue * 1024));
          }
        } else {
          params.append(key, String(value));
        }
      }
    });

    // Don't forget to actually use the params!
    const response = await axios.get(`${API_URL}/files/?${params.toString()}`);
    return response.data.data;
  },


  async getStats(): Promise<FileStorageStats> {
    const response = await axios.get(`${API_URL}/files/savings`);
    return response.data.data;
  },

  async deleteFile(id: string): Promise<void> {
    await axios.delete(`${API_URL}/files/${id}/`);
  },

  async downloadFile(fileUrl: string, filename: string): Promise<void> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  },
}; 