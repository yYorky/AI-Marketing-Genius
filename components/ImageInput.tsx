import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons';

export interface ImageFile {
  data: string;
  mimeType: string;
}

interface ImageInputProps {
  onImageSet: (file: ImageFile) => void;
}

const fileToBase64 = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ data: base64Data, mimeType: file.type });
    };
    reader.onerror = error => reject(error);
  });
};

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSet }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const imageFile = await fileToBase64(file);
        onImageSet(imageFile);
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  }, [onImageSet]);

  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        await processFile(file);
        break;
      }
    }
  }, [processFile]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      await processFile(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      processFile(event.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`cursor-pointer p-8 border-2 border-dashed rounded-lg text-center transition-colors duration-300 ${isDragging ? 'border-[#3c52b8] bg-[#3c52b8]/10' : 'border-gray-300 hover:border-[#3c52b8] hover:bg-gray-100'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <UploadIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
      <p className="font-semibold text-gray-700">Click to upload, drag & drop, or paste an image</p>
      <p className="text-sm text-gray-500">Supports PNG, JPG, WEBP, etc.</p>
    </div>
  );
};