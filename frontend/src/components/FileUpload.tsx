'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onFileContent: (content: string, filename: string) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileContent, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = async (file: File) => {
    // Check if file is markdown or text
    const validTypes = ['.md', '.txt', '.markdown'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validTypes.includes(extension) && !file.type.includes('text')) {
      alert('Please upload a markdown (.md) or text (.txt) file');
      return;
    }

    try {
      const content = await file.text();
      setFileName(file.name);
      onFileContent(content, file.name);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileRead(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileRead(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <motion.div
      className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${fileName ? 'bg-green-50 border-green-400' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt,.markdown,text/plain,text/markdown"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <div className="text-center">
        <svg
          className={`mx-auto h-12 w-12 ${fileName ? 'text-green-500' : 'text-gray-400'}`}
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d={fileName
              ? "M9 12l2 2 4-4 6 6L31 6"
              : "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p className="mt-2 text-sm text-gray-600">
          {fileName ? (
            <span className="font-semibold text-green-600">
              📄 {fileName} loaded
            </span>
          ) : (
            <>
              <span className="font-semibold">Drop a document here</span> or{' '}
              <span className="text-blue-600">click to browse</span>
            </>
          )}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Supports .md and .txt files
        </p>
      </div>
    </motion.div>
  );
}