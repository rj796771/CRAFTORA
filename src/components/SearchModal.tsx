import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FolderGit2, BookOpen, User, ArrowRight, Wrench } from 'lucide-react';
import { ProjectStory, JournalEntry, UserProfile } from '../types';
import { fetchProjectStories, fetchJournalEntries, fetchFeaturedCreators } from '../services/dataService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, navigate }) => {
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectStory[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [creators, setCreators] = useState<UserProfile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: `/` or `⌘K` to open, `Escape` to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQueryText('');
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!queryText.trim()) {
      setProjects([]);
      setJournals([]);
      setCreators([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const q = queryText.toLowerCase().trim();

      const [allProjects, allJournals, allCreators] = await Promise.all([
        fetchProjectStories(),
        fetchJournalEntries(),
        fetchFeaturedCreators(),
      ]);

      const matchedProjects = allProjects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortSummary.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tools?.some((t) => t.toLowerCase().includes(q)) ||
          p.ownerName.toLowerCase().includes(q)
      );

      const matchedJournals = allJournals.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.content.toLowerCase().includes(q) ||
          j.type.toLowerCase().includes(q) ||
          j.tags?.some((t) => t.toLowerCase().includes(q)) ||
          j.ownerName.toLowerCase().includes(q)
      );

      const matchedCreators = allCreators.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.identityStatement?.toLowerCase().includes(q) ||
          c.creatorType?.toLowerCase().includes(q) ||
          c.currently?.exploring?.toLowerCase().includes(q) ||
          c.currently?.workingOn?.toLowerCase().includes(q)
      );

      setProjects(matchedProjects);
      setJournals(matchedJournals);
      setCreators(matchedCreators);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [queryText]);

  if (!isOpen) return null;

  const totalResults = projects.length + journals.length + creators.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 bg-[#191817]/60 backdrop-blur-sm flex items-start justify-center animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E5DFD4] shadow-2xl overflow-hidden mt-8">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E5DFD4] bg-[#F4EFE6]">
          <Search className="w-5 h-5 text-[#847E76] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search projects, tools (Figma, Rust), creators, reflections..."
            className="w-full bg-transparent text-[#191817] placeholder-[#847E76] text-sm focus:outline-none"
          />
          {queryText && (
            <button
              onClick={() => setQueryText('')}
              className="p-1 text-[#847E76] hover:text-[#191817] mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono-meta text-[#847E76] hover:text-[#191817] px-2 py-1 bg-[#FAF8F5] border border-[#D8D2C5]"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {loading ? (
            <div className="py-8 text-center text-xs font-mono-meta text-[#847E76]">
              Searching CRAFTORA knowledge base...
            </div>
          ) : queryText.trim() === '' ? (
            <div className="py-6">
              <span className="text-[11px] font-mono-meta tracking-wider text-[#847E76] block mb-3">
                FREQUENTLY EXPLORED TOOLS & TOPICS
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Design System',
                  'Figma',
                  'TypeScript',
                  'WebAssembly',
                  'Web Audio',
                  'Geospatial',
                  'Local-First',
                  'CRDTs',
                  'Hardware & IoT',
                  'Rust',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQueryText(tag)}
                    className="px-2.5 py-1 text-xs bg-[#F4EFE6] border border-[#E5DFD4] hover:border-[#C85A32] text-[#57524C] hover:text-[#191817] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-serif-display text-[#191817]">No results found</p>
              <p className="text-xs text-[#847E76] mt-1">
                We couldn't find anything matching &quot;{queryText}&quot;. Try exploring broader tools or categories.
              </p>
            </div>
          ) : (
            <>
              {/* Project Stories */}
              {projects.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#ECE7DE]">
                    <FolderGit2 className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span className="text-xs font-semibold tracking-wider text-[#57524C]">
                      PROJECT STORIES ({projects.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {projects.slice(0, 5).map((project) => (
                      <div
                        key={project.id}
                        onClick={() => {
                          onClose();
                          navigate(`/projects/${project.slug}`);
                        }}
                        className="p-2.5 hover:bg-[#F4EFE6] cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif-display font-medium text-sm text-[#191817] group-hover:text-[#C85A32] transition-colors">
                              {project.title}
                            </span>
                            <span className="text-[10px] font-mono-meta px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E5DFD4] text-[#847E76]">
                              {project.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#57524C] line-clamp-1 mt-0.5">
                            {project.shortSummary}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#847E76] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creators */}
              {creators.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#ECE7DE]">
                    <User className="w-3.5 h-3.5 text-[#56725F]" />
                    <span className="text-xs font-semibold tracking-wider text-[#57524C]">
                      CREATORS ({creators.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {creators.slice(0, 4).map((creator) => (
                      <div
                        key={creator.userId}
                        onClick={() => {
                          onClose();
                          navigate(`/u/${creator.username}`);
                        }}
                        className="p-2 hover:bg-[#F4EFE6] cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={creator.avatarUrl}
                            alt={creator.displayName}
                            className="w-8 h-8 rounded-full object-cover border border-[#D8D2C5]"
                          />
                          <div>
                            <div className="font-medium text-xs text-[#191817] group-hover:text-[#C85A32] transition-colors">
                              {creator.displayName}{' '}
                              <span className="text-[#847E76] font-mono-meta">
                                @{creator.username}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#57524C] line-clamp-1">
                              {creator.identityStatement}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#847E76] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Journal Reflections */}
              {journals.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#ECE7DE]">
                    <BookOpen className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span className="text-xs font-semibold tracking-wider text-[#57524C]">
                      JOURNAL ENTRIES ({journals.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {journals.slice(0, 4).map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => {
                          onClose();
                          navigate(`/journal?id=${entry.id}`);
                        }}
                        className="p-2.5 hover:bg-[#F4EFE6] cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono-meta uppercase tracking-wider text-[#C85A32]">
                              {entry.type}
                            </span>
                            <span className="font-medium text-xs text-[#191817] group-hover:text-[#C85A32] transition-colors line-clamp-1">
                              {entry.title}
                            </span>
                          </div>
                          <p className="text-xs text-[#57524C] line-clamp-1 mt-0.5">
                            by {entry.ownerName}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#847E76] group-hover:text-[#C85A32] transition-colors shrink-0 ml-3" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
