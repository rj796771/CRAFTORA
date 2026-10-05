import React from 'react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-[#E5DFD4] bg-[#F4EFE6] text-[#191817] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif-display text-xl font-bold tracking-tight text-[#191817]">
                CRAFTORA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
            </div>
            <p className="text-xs text-[#57524C] max-w-sm leading-relaxed">
              A professional creative project and portfolio community where people document the real work behind what they make. Show the process, not just the result.
            </p>
            <div className="text-[11px] font-mono-meta text-[#847E76] pt-1">
              Turn ideas into stories worth sharing.
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-mono-meta tracking-wider text-[#847E76] uppercase mb-3">
              NAVIGATION
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="text-[#57524C] hover:text-[#C85A32] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/explore')}
                  className="text-[#57524C] hover:text-[#C85A32] transition-colors"
                >
                  Explore Work
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-[#57524C] hover:text-[#C85A32] transition-colors"
                >
                  Project Stories
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/journal')}
                  className="text-[#57524C] hover:text-[#C85A32] transition-colors"
                >
                  The Journal
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/collaborate')}
                  className="text-[#57524C] hover:text-[#C85A32] transition-colors"
                >
                  Collaboration Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Topics */}
          <div>
            <h4 className="text-xs font-mono-meta tracking-wider text-[#847E76] uppercase mb-3">
              CATEGORIES
            </h4>
            <ul className="space-y-2 text-xs text-[#57524C]">
              <li>Design Systems</li>
              <li>Web Architecture</li>
              <li>Mobile & Touch UX</li>
              <li>Creative Audio & GLSL</li>
              <li>Hardware & LoRa IoT</li>
              <li>Research & Geospatial</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#ECE7DE] flex flex-col sm:flex-row items-center justify-between text-xs text-[#847E76]">
          <span>&copy; {new Date().getFullYear()} CRAFTORA. Built for creators documenting real work.</span>
          <span className="font-mono-meta text-[11px] mt-2 sm:mt-0">
            Process &middot; Projects &middot; Community
          </span>
        </div>
      </div>
    </footer>
  );
};
