import React, { useState } from 'react';
import {
  Search,
  Compass,
  Sparkles,
  ArrowRight,
  Heart,
  Layers,
  Wrench,
  Users2,
  Handshake,
} from 'lucide-react';
import { ProjectStory, UserProfile, JournalEntry } from '../types';

interface ExplorePageProps {
  projects: ProjectStory[];
  creators: UserProfile[];
  journals: JournalEntry[];
  initialQuery?: string;
  navigate: (route: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  projects,
  creators,
  journals,
  initialQuery = '',
  navigate,
}) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'released' | 'collaborations' | 'creators'>('featured');
  const [query, setQuery] = useState(initialQuery);

  const filteredProjects = projects.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.shortSummary.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tools?.some((t) => t.toLowerCase().includes(q)) ||
      p.ownerName.toLowerCase().includes(q)
    );
  });

  const releasedProjects = projects.filter((p) => p.status === 'RELEASED');
  const collabProjects = projects.filter((p) => p.lookingForCollaborators);

  return (
    <div className="min-h-screen pb-20 bg-[#FAF8F5]">
      {/* Search Header Banner */}
      <section className="py-12 border-b border-[#E5DFD4] bg-[#F4EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono-meta tracking-wider text-[#C85A32] block mb-1">
              DISCOVERY & CURATION
            </span>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#191817]">
              Explore CRAFTORA
            </h1>
            <p className="text-xs sm:text-sm text-[#57524C] mt-1 mb-6 leading-relaxed">
              Find works in progress, released systems, and the people behind them.
            </p>

            <div className="relative">
              <Search className="w-4 h-4 text-[#847E76] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across projects, tools (e.g. WebRTC, Figma, Rust), or creators..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-[#E5DFD4] bg-[#FAF8F5] sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('featured')}
            className={`py-3.5 text-xs font-semibold tracking-wider transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'featured'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#57524C] hover:text-[#191817]'
            }`}
          >
            EDITORIAL PICKS ({projects.filter((p) => p.isFeatured).length})
          </button>
          <button
            onClick={() => setActiveTab('released')}
            className={`py-3.5 text-xs font-semibold tracking-wider transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'released'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#57524C] hover:text-[#191817]'
            }`}
          >
            RECENTLY RELEASED ({releasedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('collaborations')}
            className={`py-3.5 text-xs font-semibold tracking-wider transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'collaborations'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#57524C] hover:text-[#191817]'
            }`}
          >
            SEEKING COLLABORATORS ({collabProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('creators')}
            className={`py-3.5 text-xs font-semibold tracking-wider transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'creators'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#57524C] hover:text-[#191817]'
            }`}
          >
            DISCOVER CREATORS ({creators.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: EDITORIAL PICKS */}
        {activeTab === 'featured' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProjects
                .filter((p) => p.isFeatured)
                .map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.slug}`)}
                    className="border border-[#E5DFD4] bg-[#FAF8F5] hover:border-[#191817] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#F4EFE6] border-b border-[#E5DFD4]">
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 text-[9px] font-mono-meta uppercase tracking-wider bg-[#FAF8F5]/95 text-[#191817] border border-[#E5DFD4]">
                            {p.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={p.ownerAvatar}
                            alt={p.ownerName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs font-medium text-[#57524C]">
                            {p.ownerName}
                          </span>
                        </div>
                        <h3 className="font-serif-display text-xl font-bold text-[#191817] mb-2 hover:text-[#C85A32] transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#57524C] line-clamp-3 mb-4 leading-relaxed">
                          {p.shortSummary}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {p.tools?.map((tool) => (
                            <span
                              key={tool}
                              className="px-2 py-0.5 text-[10px] font-mono-meta bg-[#F4EFE6] border border-[#E5DFD4] text-[#57524C]"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-3 border-t border-[#ECE7DE] bg-[#F4EFE6]/40 flex items-center justify-between text-xs text-[#847E76] font-mono-meta">
                      <span>{p.appreciationsCount} appreciations</span>
                      <span className="text-[#C85A32] font-semibold flex items-center gap-1">
                        Read Story <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 2: RECENTLY RELEASED */}
        {activeTab === 'released' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {releasedProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.slug}`)}
                className="border border-[#E5DFD4] bg-[#FAF8F5] hover:border-[#191817] transition-all cursor-pointer p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono-meta px-2 py-0.5 bg-[#FAF8F5] border border-[#D8D2C5] text-[#191817]">
                      {p.category}
                    </span>
                    <span className="text-[10px] font-mono-meta text-[#56725F] font-bold">
                      RELEASED
                    </span>
                  </div>
                  <h3 className="font-serif-display text-lg font-bold text-[#191817] mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#57524C] line-clamp-3 mb-3">
                    {p.shortSummary}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#ECE7DE] flex items-center justify-between text-xs text-[#C85A32] font-semibold">
                  <span>View Case Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: SEEKING COLLABORATORS */}
        {activeTab === 'collaborations' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collabProjects.map((p) => (
              <div
                key={p.id}
                className="border border-[#E5DFD4] bg-[#FAF8F5] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono-meta px-2 py-0.5 bg-[#F4EFE6] text-[#C85A32] font-bold">
                      OPEN FOR COLLABORATION
                    </span>
                    <span className="text-[11px] font-mono-meta text-[#847E76]">
                      {p.collaborationDuration}
                    </span>
                  </div>
                  <h3 className="font-serif-display text-lg font-bold text-[#191817] mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#57524C] line-clamp-2 mb-3">
                    {p.shortSummary}
                  </p>
                  <div className="p-3 bg-[#F4EFE6] border border-[#E5DFD4] mb-3">
                    <span className="text-[10px] font-mono-meta text-[#847E76] block">
                      SEEKING ROLE:
                    </span>
                    <span className="text-xs font-bold text-[#191817]">
                      {p.collaborationRole}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/projects/${p.slug}`)}
                  className="w-full py-2 text-xs font-semibold bg-[#191817] hover:bg-[#C85A32] text-[#FAF8F5] transition-colors"
                >
                  View Details & Apply
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: DISCOVER CREATORS */}
        {activeTab === 'creators' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((c) => (
              <div
                key={c.userId}
                onClick={() => navigate(`/u/${c.username}`)}
                className="border border-[#E5DFD4] bg-[#FAF8F5] hover:border-[#191817] transition-all cursor-pointer p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={c.avatarUrl}
                      alt={c.displayName}
                      className="w-12 h-12 rounded-full object-cover border border-[#D8D2C5]"
                    />
                    <div>
                      <h4 className="font-serif-display font-bold text-base text-[#191817]">
                        {c.displayName}
                      </h4>
                      <span className="text-xs font-mono-meta text-[#847E76]">
                        @{c.username} &middot; {c.creatorType}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#57524C] line-clamp-2 mb-4 leading-relaxed">
                    {c.identityStatement}
                  </p>

                  {c.currently?.workingOn && (
                    <div className="p-2.5 bg-[#F4EFE6] border border-[#E5DFD4] text-xs space-y-0.5">
                      <span className="text-[10px] font-mono-meta text-[#847E76] block">
                        FOCUS:
                      </span>
                      <span className="text-[#191817] font-medium block">
                        {c.currently.workingOn}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-[#ECE7DE] flex items-center justify-between text-xs text-[#C85A32] font-semibold">
                  <span>View Creator Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
