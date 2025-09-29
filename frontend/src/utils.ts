import { isAxiosError } from "axios";

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getAxiosError = (error: any, defaultMessage = 'Unexpected error. Please try again.') => {
    if (isAxiosError(error)) {
        if (error.response?.data.message) {
            return error.response.data?.message
        } else {
            return defaultMessage
        }
    } else {
        return defaultMessage
    }
}