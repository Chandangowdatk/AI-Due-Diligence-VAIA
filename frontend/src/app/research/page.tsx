'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Upload, X, Check, Loader2, FileText, ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { api, UploadedFileReference } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Navbar, Footer } from '@/components/layout';
import { BackgroundOrbs } from '@/components/ui';

// File upload status
type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadedFile {
  file: File;
  status: FileStatus;
  geminiFileName?: string;
  error?: string;
}

export default function ResearchPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file types
  const allowedExtensions = '.pdf,.ppt,.pptx,.csv,.xls,.xlsx';

  // Check if all files are uploaded successfully
  const allFilesUploaded = uploadedFiles.length === 0 || 
    uploadedFiles.every(f => f.status === 'success');
  
  // Check if any file is currently uploading
  const isUploading = uploadedFiles.some(f => f.status === 'uploading');

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Add files to state with pending status
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      status: 'pending' as FileStatus,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload each file
    for (const uploadFile of newFiles) {
      await uploadSingleFile(uploadFile.file);
    }

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload a single file
  const uploadSingleFile = async (file: File) => {
    // Update status to uploading
    setUploadedFiles(prev => 
      prev.map(f => f.file === file ? { ...f, status: 'uploading' as FileStatus } : f)
    );

    try {
      const result = await api.uploadFile(file);
      
      if (result.success && result.gemini_file_name) {
        setUploadedFiles(prev => 
          prev.map(f => f.file === file ? { 
            ...f, 
            status: 'success' as FileStatus,
            geminiFileName: result.gemini_file_name!,
          } : f)
        );
      } else {
        setUploadedFiles(prev => 
          prev.map(f => f.file === file ? { 
            ...f, 
            status: 'error' as FileStatus,
            error: result.error || 'Upload failed',
          } : f)
        );
      }
    } catch (err) {
      setUploadedFiles(prev => 
        prev.map(f => f.file === file ? { 
          ...f, 
          status: 'error' as FileStatus,
          error: err instanceof Error ? err.message : 'Upload failed',
        } : f)
      );
    }
  };

  // Remove a file from the list
  const removeFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    if (!allFilesUploaded) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Prepare uploaded file references
      const fileRefs: UploadedFileReference[] = uploadedFiles
        .filter(f => f.status === 'success' && f.geminiFileName)
        .map(f => ({
          filename: f.file.name,
          gemini_file_name: f.geminiFileName!,
        }));

      const response = await api.startResearch(companyName, fileRefs.length > 0 ? fileRefs : undefined);
      router.push(`/report/${response.research_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start research');
      setIsLoading(false);
    }
  };

  // Get file icon based on status
  const getFileStatusIcon = (status: FileStatus) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-neutral-400" />;
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      status: 'pending' as FileStatus,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);

    for (const uploadFile of newFiles) {
      await uploadSingleFile(uploadFile.file);
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-neutral-900 dark:text-white selection:bg-brand-orange selection:text-white">
      <BackgroundOrbs isDark={isDark} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        
        <main className="flex-grow flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-2xl">
            {/* Back button */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to home</span>
            </button>

            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-orange/10 mb-6">
                <Building2 className="w-8 h-8 text-brand-orange" />
              </div>
              <h1 className="text-3xl font-bold mb-3 text-neutral-900 dark:text-white">
                Start Your Research
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Enter a company name and optionally upload supporting documents
              </p>
            </div>

            {/* Research Form */}
            <div className="glass-panel p-8 rounded-3xl backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name Input with File Upload Icon */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="e.g., Reliance Industries, Tesla Inc, OpenAI"
                      className="w-full pl-12 pr-14 py-3.5 rounded-xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-neutral-200/50 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={isLoading}
                    />
                    {/* File Upload Icon Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange transition-colors"
                      title="Upload supporting documents"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={allowedExtensions}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    Click the <Upload className="w-3 h-3 inline" /> icon to upload pitch decks, investment memos, or financials (optional)
                  </p>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Uploaded Files ({uploadedFiles.length})
                    </label>
                    {uploadedFiles.map((uploadedFile, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-neutral-200/50 dark:border-white/10"
                      >
                        <FileText className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                            {uploadedFile.file.name}
                          </p>
                          {uploadedFile.error && (
                            <p className="text-xs text-red-500 truncate">{uploadedFile.error}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getFileStatusIcon(uploadedFile.status)}
                          {uploadedFile.status !== 'uploading' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(uploadedFile.file);
                              }}
                              className="p-1 hover:bg-neutral-200/50 dark:hover:bg-white/10 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-neutral-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit Button - Smaller */}
                <button
                  type="submit"
                  disabled={!companyName.trim() || isLoading || !allFilesUploaded || isUploading}
                  className="w-full bg-brand-orange text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-orange/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Starting Research...</span>
                    </>
                  ) : isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading Files...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Research</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
