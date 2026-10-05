import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowRight, Layers, Heart, MessageSquare } from 'lucide-react';
import { ProjectStory, ProjectStatus } from '../types';

interface ProjectsPageProps {
  projects: ProjectStory[];
  navigate: (route: string) => void;
  openCreateModal: (type: 'project') => void;
}

const CATEGORIES = [
  'All',
  'Design System',
  'Web Architecture',
  'Mobile App',
  'AI & ML',
  'Hardware & IoT',
  'Open Source',
  'Research',
  'Creative Tool',
];

const STATUSES: ('All' | ProjectStatus)[] = [
  'All',
  'RELEASED',
  'IN DEVELOPMENT',
  'TESTING',
  'EXPLORING',
  'CONCEPT',
];

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  navigate,
  openCreateModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'appreciated'>('newest');

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchSummary = p.shortSummary.toLowerCase().includes(q);
          const matchOwner = p.ownerName.toLowerCase().includes(q);
          const matchTools = p.tools?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchSummary && !matchOwner && !matchTools) return false;
        }
        return p.visibility === 'PUBLIC';
      })
      .sort((a, b) => {
        if (sortBy === 'appreciated') {
          return (b.appreciationsCount || 0) - (a.appreciationsCount || 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [projects, selectedCategory, selectedStatus, searchQuery, sortBy]);

  return (
    <div className="min-h-screen pb-20 bg-[#FAF8F5]">
      {/* Header Banner */}
      <section className="py-12 border-b border-[#E5DFD4] bg-[#F4EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono-meta tracking-wider text-[#C85A32] block mb-1">
                INDEX OF WORK
              </span>
              <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#191817]">
                Project Stories
              </h1>
              <p className="text-xs sm:text-sm text-[#57524C] max-w-xl mt-1 leading-relaxed">
                Explore in-depth documentation of real tools, research experiments, and applications built by creators.
              </p>
            </div>
            <button
              onClick={() => openCreateModal('project')}
              className="px-5 py-2.5 text-xs font-semibold bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-colors self-start md:self-auto shrink-0"
            >
              + Publish Project Story
            </button>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="border-b border-[#E5DFD4] bg-[#FAF8F5] sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#847E76] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title, tool, or creator..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F4EFE6] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
              />
            </div>

            {/* Sort & Status Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD4] text-[#191817] focus:outline-none"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD4] text-[#191817] focus:outline-none"
              >
                <option value="newest">Sort: Recently Published</option>
                <option value="appreciated">Sort: Most Appreciated</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-[#191817] text-[#FAF8F5] border-[#191817]'
                    : 'bg-[#F4EFE6] text-[#57524C] border-[#E5DFD4] hover:border-[#191817] hover:text-[#191817]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6 text-xs text-[#847E76] font-mono-meta">
          <span>SHOWING {filteredProjects.length} PROJECT STORIES</span>
          {(selectedCategory !== 'All' || selectedStatus !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="text-[#C85A32] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-16 border border-dashed border-[#D8D2C5] text-center my-8">
            <Layers className="w-8 h-8 text-[#847E76] mx-auto mb-2" />
            <p className="font-serif-display text-base font-bold text-[#191817]">
              No project stories match your selection
            </p>
            <p className="text-xs text-[#847E76] mt-1 mb-4">
              Try adjusting the category or search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="px-4 py-1.5 text-xs font-semibold bg-[#191817] text-[#FAF8F5]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.slug}`)}
                className="group cursor-pointer border border-[#E5DFD4] bg-[#FAF8F5] hover:border-[#191817] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F4EFE6] border-b border-[#E5DFD4]">
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[9px] font-mono-meta uppercase tracking-wider bg-[#FAF8F5]/95 text-[#191817] border border-[#E5DFD4]">
                        {p.category}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-mono-meta uppercase tracking-wider bg-[#191817]/90 text-[#FAF8F5]">
                        {p.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={p.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={p.ownerName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-[#57524C]">
                        {p.ownerName}
                      </span>
                    </div>

                    <h3 className="font-serif-display text-lg font-bold text-[#191817] group-hover:text-[#C85A32] transition-colors mb-1.5">
                      {p.title}
                    </h3>

                    <p className="text-xs text-[#57524C] leading-relaxed line-clamp-2 mb-3">
                      {p.shortSummary}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {p.tools?.slice(0, 3).map((tool) => (
                        <span
                          key={tool}
                          className="px-1.5 py-0.5 text-[10px] font-mono-meta bg-[#F4EFE6] border border-[#E5DFD4] text-[#57524C]"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-2.5 border-t border-[#ECE7DE] bg-[#F4EFE6]/40 flex items-center justify-between text-xs text-[#847E76] font-mono-meta">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-[#C85A32]" />
                      {p.appreciationsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {p.commentsCount}
                    </span>
                  </div>
                  <span className="text-[#C85A32] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Read Story <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
