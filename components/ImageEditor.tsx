import React, { useState } from 'react';
import { ImageInput, ImageFile } from './ImageInput';
import { editImage } from '../services/geminiService';
import { SpinnerIcon, PhotoIcon } from './icons';

export const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSet = (file: ImageFile) => {
    setOriginalImage(file);
    setEditedImage(null);
    setError(null);
  };
  
  const handleSubmit = async () => {
    if (!originalImage || !prompt) {
      setError('Please provide an image and a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const result = await editImage(originalImage.data, originalImage.mimeType, prompt);
      setEditedImage(result);
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">1. Upload or Paste Your Image</h2>
        <ImageInput onImageSet={handleImageSet} />
      </div>

      {originalImage && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg space-y-6">
          <h2 className="text-2xl font-bold mb-4 text-center">2. Describe Your Edit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex justify-center">
                <img src={`data:${originalImage.mimeType};base64,${originalImage.data}`} alt="Original" className="rounded-lg max-h-80 shadow-lg" />
            </div>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a retro filter', 'Make the background a cityscape at night', 'Remove the person in the background'"
                className="w-full h-32 p-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#3c52b8] focus:border-[#3c52b8] transition-colors text-gray-800 placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt}
                className="w-full bg-[#6edbab] hover:bg-[#5bbd9a] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Apply Edit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="text-center text-red-700 bg-red-100 border border-red-200 p-3 rounded-lg">{error}</div>}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg min-h-[300px] flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-4 text-center">3. View Result</h2>
          {isLoading && (
              <div className="flex flex-col items-center justify-center text-gray-600">
                  <SpinnerIcon className="w-12 h-12 animate-spin mb-4 text-[#3c52b8]" />
                  <p>Editing in progress... Please wait.</p>
              </div>
          )}
          {editedImage && !isLoading && (
              <div className="flex justify-center">
                  <img src={`data:image/png;base64,${editedImage}`} alt="Edited" className="rounded-lg max-h-96 shadow-lg" />
              </div>
          )}
          {!editedImage && !isLoading && (
            <div className="text-center text-gray-500">
                <PhotoIcon className="w-16 h-16 mx-auto mb-2" />
                <p>Your edited image will appear here.</p>
            </div>
          )}
      </div>
    </div>
  );
};