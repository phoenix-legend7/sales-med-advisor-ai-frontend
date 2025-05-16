
import React from 'react';
import Header from '@/components/Header';
import ChatInterface from '@/components/ChatInterface';
import InfoPanel from '@/components/InfoPanel';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-medical-neutral to-medical-light">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjZmZmZmZmMjAiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMjRhNiA2IDAgMTEwIDEyIDYgNiAwIDAxMC0xMnoiIGZpbGw9IiNmZmZmZmYxMCIvPjwvZz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
      
      <Header />
      
      <main className="flex-1 container max-w-5xl py-6 px-4 relative z-10">
        <div className="grid grid-cols-1 gap-6">
          {/* Main chat interface */}
          <div className="col-span-1 h-[calc(100vh-220px)] min-h-[500px]">
            <div className="h-full transform transition-all duration-500 hover:scale-[1.01]">
              <ChatInterface />
            </div>
            {!isMobile && (
              <div className="mt-4 flex justify-center">
                <div className="text-xs text-center bg-white/80 px-4 py-2 rounded-full shadow-sm">
                  <span className="text-medical-secondary">Tap the mic button or type your question to begin</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Resources panel - shown below chat on mobile, beside chat on desktop */}
          {isMobile ? (
            <div className="col-span-1 mt-8 pb-16">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-8 bg-gradient-to-b from-medical-primary to-medical-secondary rounded-full"></div>
                <h2 className="text-xl font-medium text-medical-secondary">Resources</h2>
              </div>
              <div className="transform transition-all duration-500 hover:scale-[1.02]">
                <InfoPanel />
              </div>
              
              {/* Mobile instruction text - moved below resources */}
              <div className="mt-8 flex justify-center">
                <div className="text-xs text-center bg-white/80 px-4 py-2 rounded-full shadow-sm">
                  <span className="text-medical-secondary">Tap the mic button or type your question to begin</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed top-32 right-8 w-64 lg:w-80 space-y-3 hidden lg:block">
              <div className="flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-medical-primary to-medical-secondary rounded-full"></div>
                <h2 className="text-xl font-medium text-medical-secondary">Resources</h2>
              </div>
              <div className="transform transition-all duration-500 hover:scale-[1.02]">
                <InfoPanel />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
