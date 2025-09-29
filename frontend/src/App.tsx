import { Toaster } from 'react-hot-toast';
import { FileList } from './components/FileList';
import { FileStorageStats } from './components/FileStorageStats';
import { FileUpload } from './components/FileUpload';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Abnormal Security - File Hub</h1>
          <p className="mt-1 text-sm text-gray-500">
            File management system
          </p>
        </div>
      </header>
      <main className="max-w-7xl lg:mx-32 py-6 sm:px-6 lg:px-8 flex-1">
        <div className="flex gap-6 flex-col">
          <div className="px-4 py-6 sm:px-0">
            <FileStorageStats />
          </div>
          <div className="px-4 py-6 sm:px-0">
            <div className="space-y-6">
              <div className="bg-white shadow sm:rounded-lg">
                <FileUpload />
              </div>
              <div className="bg-white shadow sm:rounded-lg">
                <FileList />
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-white shadow mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 File Hub. All rights reserved.
          </p>
        </div>
      </footer>
      <Toaster position='top-right' />
    </div>
  );
}

export default App;
