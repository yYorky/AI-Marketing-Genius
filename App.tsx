import React, { useState } from 'react';
import { MarketingGenius } from './components/MarketingGenius';
import { ImageEditor } from './components/ImageEditor';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marketing' | 'editor'>('marketing');

  return (
    <div className="min-h-screen bg-white text-[#3c52b8] font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#3c52b8] to-[#6edbab]">
            AI Marketing Genius
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Instantly generate compelling marketing materials for your products using the power of Gemini AI.
          </p>
        </header>

        <div className="flex justify-center mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('marketing')}
            className={`px-6 py-3 font-medium text-lg transition-colors ${
              activeTab === 'marketing'
                ? 'text-[#3c52b8] border-b-2 border-[#3c52b8]'
                : 'text-gray-500 hover:text-[#3c52b8]'
            }`}
          >
            Marketing Kit Generator
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-6 py-3 font-medium text-lg transition-colors ${
              activeTab === 'editor'
                ? 'text-[#3c52b8] border-b-2 border-[#3c52b8]'
                : 'text-gray-500 hover:text-[#3c52b8]'
            }`}
          >
            Image Editor
          </button>
        </div>

        <main>
          {activeTab === 'marketing' && <MarketingGenius />}
          {activeTab === 'editor' && <ImageEditor />}
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by Gemini AI. Instantly create marketing that sells.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;