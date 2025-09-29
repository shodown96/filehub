import {
    ArrowDownTrayIcon,
    DocumentIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { Entry } from '../types/file';
import { formatFileSize } from '../utils';

interface EntryItemProps {
    item: Entry,
    handleDownload: (url: string, original_filename: string) => void,
    handleDelete: (id: string) => void,
    downloading: boolean,
    deleting: boolean,
}
export default function EntryItem({
    item,
    handleDelete,
    handleDownload,
    downloading,
    deleting,
}: EntryItemProps) {
    return (
        <li className="py-4">
            <div className="flex max-lg:flex-col items-center max-lg:items-start gap-4 max-lg:gap-2">
                <div className="flex-shrink-0">
                    <DocumentIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate max-md:max-w-[300px]">
                        {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                        {item.file.file_type.toUpperCase()} • {formatFileSize(item.file.size)}
                    </p>
                    <p className="text-sm text-gray-500">
                        Uploaded {new Date(item.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleDownload(item.file.file, item.file.original_filename)}
                        disabled={downloading}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        {downloading ? 'Downloading...' : 'Download'}
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </li>
    )
}
