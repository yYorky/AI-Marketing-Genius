import React, { useState } from 'react';
import { ImageInput, ImageFile } from './ImageInput';
import { generateMarketingMaterials } from '../services/geminiService';
import { SpinnerIcon, PhotoIcon } from './icons';

export const MarketingGenius: React.FC = () => {
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [price, setPrice] = useState<string>('');
  const [generatedMaterials, setGeneratedMaterials] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('');

  const handleImageSet = (file: ImageFile) => {
    setProductImage(file);
    setGeneratedMaterials([]);
    setError(null);
  };
  
  const handleSubmit = async () => {
    if (!productImage || !price) {
      setError('Please provide a product image and a price.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedMaterials([]);
    try {
      setLoadingStep('Analyzing product image...');
      const results = await generateMarketingMaterials(productImage.data, productImage.mimeType, price, (step) => setLoadingStep(step));
      setGeneratedMaterials(results);
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">1. Upload Your Product Image</h2>
        <ImageInput onImageSet={handleImageSet} />
      </div>

      {productImage && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg space-y-6">
          <h2 className="text-2xl font-bold mb-4 text-center">2. Enter Product Details</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
             <div className="flex justify-center">
                 <img src={`data:${productImage.mimeType};base64,${productImage.data}`} alt="Product" className="rounded-lg max-h-80 shadow-lg" />
             </div>
             <div className="space-y-4">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Product Price</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                        <input
                          type="text"
                          id="price"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g., 29.99"
                          className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#3c52b8] focus:border-[#3c52b8] transition-colors text-gray-800 placeholder-gray-400"
                          disabled={isLoading}
                        />
                    </div>
                </div>
               <button
                 onClick={handleSubmit}
                 disabled={isLoading || !price}
                 className="w-full bg-[#6edbab] hover:bg-[#5bbd9a] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
               >
                 {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Generate Marketing Kit'}
               </button>
             </div>
           </div>
        </div>
      )}

      {error && <div className="text-center text-red-700 bg-red-100 border border-red-200 p-3 rounded-lg">{error}</div>}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg min-h-[300px] flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-4 text-center">3. View Your Marketing Kit</h2>
          {isLoading && (
              <div className="flex flex-col items-center justify-center text-gray-600">
                  <SpinnerIcon className="w-12 h-12 animate-spin mb-4 text-[#3c52b8]" />
                  <p>{loadingStep || 'Generation in progress...'}</p>
              </div>
          )}
          {generatedMaterials.length > 0 && !isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedMaterials.map((imgData, index) => (
                      <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                           <img src={`data:image/png;base64,${imgData}`} alt={`Marketing material ${index + 1}`} className="w-full h-full object-cover"/>
                      </div>
                  ))}
              </div>
          )}
          {generatedMaterials.length === 0 && !isLoading && (
            <div className="text-center text-gray-500">
                <PhotoIcon className="w-16 h-16 mx-auto mb-2" />
                <p>Your generated marketing materials will appear here.</p>
            </div>
          )}
      </div>
    </div>
  );
};