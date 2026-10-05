import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  navigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#FAF8F5]">
      <div className="max-w-md w-full text-center space-y-4">
        <span className="font-mono-meta text-xs tracking-wider text-[#C85A32] block">
          404 ERROR
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#191817]">
          Page not found
        </h1>
        <p className="text-xs sm:text-sm text-[#57524C] leading-relaxed">
          The project story, journal reflection, or creator profile you are looking for may have been moved or archived.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 text-xs font-semibold bg-[#191817] hover:bg-[#C85A32] text-[#FAF8F5] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="px-5 py-2 text-xs font-semibold border border-[#E5DFD4] text-[#57524C] hover:text-[#191817] hover:bg-[#F4EFE6] transition-colors"
          >
            Explore Projects
          </button>
        </div>
      </div>
    </div>
  );
};
