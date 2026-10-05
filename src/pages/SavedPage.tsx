import React, { useState, useEffect } from 'react';
import { Bookmark, ArrowRight, Layers, BookOpen, Users2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { fetchUserSaves, toggleSave } from '../services/dataService';
import { SaveItem } from '../types';

interface SavedPageProps {
  navigate: (route: string) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({ navigate }) => {
  const { user, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'project' | 'journal' | 'creator'>('project');
  const [saves, setSaves] = useState<SaveItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaves = async () => {
    if (!user) {
      setSaves([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const items = await fetchUserSaves();
    setSaves(items);
    setLoading(false);
  };

  useEffect(() => {
    loadSaves();
  }, [user]);

  const handleRemove = async (save: SaveItem) => {
    try {
      await toggleSave(save.targetId, save.targetType, save.itemData);
      setSaves((prev) => prev.filter((s) => s.id !== save.id));
      showToast('Removed from saved items', 'info');
    } catch {
      showToast('Could not remove item', 'error');
    }
  };

  const projectSaves = saves.filter((s) => s.targetType === 'project');
  const journalSaves = saves.filter((s) => s.targetType === 'journal');
  const creatorSaves = saves.filter((s) => s.targetType === 'creator');

  if (!user) {
    return (
      <div className="min-h-screen py-24 bg-[#FAF8F5] text-center px-4">
        <Bookmark className="w-10 h-10 text-[#847E76] mx-auto mb-3" />
        <h2 className="font-serif-display text-2xl font-bold text-[#191817] mb-2">
          Your Saved Archive
        </h2>
        <p className="text-xs text-[#57524C] mb-6 max-w-sm mx-auto">
          Sign in to bookmark project stories, journal reflections, and creators you want to revisit.
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-6 py-2.5 text-xs font-semibold bg-[#C85A32] text-[#FAF8F5]"
        >
          Sign In to View Saved Work
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-[#FAF8F5]">
      {/* Header Banner */}
      <section className="py-12 border-b border-[#E5DFD4] bg-[#F4EFE6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-mono-meta tracking-wider text-[#C85A32] block mb-1">
            PERSONAL ARCHIVE
          </span>
          <h1 className="font-serif-display text-3xl font-bold text-[#191817]">
            Saved Work
          </h1>
          <p className="text-xs text-[#57524C] mt-1">
            Your collection of referenced case studies, inspiring methodologies, and creator profiles.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-[#E5DFD4] bg-[#FAF8F5] sticky top-16 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-8">
          <button
            onClick={() => setActiveTab('project')}
            className={`py-3.5 text-xs font-semibold tracking-wider border-b-2 transition-colors ${
              activeTab === 'project'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#57524C] hover:text-[#191817]'
            }`}
          >
            PROJECTS ({projectSaves.length})
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`py-3.5 text-xs font-semibold tracking-wider border-b-2 transition-colors ${
              activeTab === 'journal'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#57524C] hover:text-[#191817]'
            }`}
          >
            JOURNAL ({journalSaves.length})
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`py-3.5 text-xs font-semibold tracking-wider border-b-2 transition-colors ${
              activeTab === 'creator'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#57524C] hover:text-[#191817]'
            }`}
          >
            PEOPLE ({creatorSaves.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {loading ? (
          <div className="py-16 text-center text-xs font-mono-meta text-[#847E76] animate-pulse">
            Loading your archive...
          </div>
        ) : activeTab === 'project' ? (
          <div>
            {projectSaves.length === 0 ? (
              <div className="p-16 border border-dashed border-[#D8D2C5] text-center my-8">
                <p className="font-serif-display text-base font-bold text-[#191817]">
                  No saved project stories yet
                </p>
                <p className="text-xs text-[#847E76] mt-1 mb-4">
                  Browse projects to save stories you want to reference later.
                </p>
                <button
                  onClick={() => navigate('/projects')}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#191817] text-[#FAF8F5]"
                >
                  Browse Projects
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectSaves.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 border border-[#E5DFD4] bg-[#FAF8F5] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono-meta px-2 py-0.5 bg-[#F4EFE6] border border-[#D8D2C5] text-[#57524C]">
                          {item.itemData.categoryOrType || 'Project'}
                        </span>
                        <button
                          onClick={() => handleRemove(item)}
                          className="text-[#847E76] hover:text-[#93301B]"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h3
                        onClick={() => navigate(`/projects/${item.itemData.slugOrUsername || item.targetId}`)}
                        className="font-serif-display text-lg font-bold text-[#191817] hover:text-[#C85A32] cursor-pointer transition-colors mb-1"
                      >
                        {item.itemData.title}
                      </h3>
                      <div className="text-xs text-[#847E76] mb-2">
                        by {item.itemData.authorName}
                      </div>
                      <p className="text-xs text-[#57524C] line-clamp-2">
                        {item.itemData.subtitle}
                      </p>
                    </div>
                    <div className="pt-3 mt-4 border-t border-[#ECE7DE] flex items-center justify-between text-xs text-[#C85A32] font-semibold">
                      <span
                        onClick={() => navigate(`/projects/${item.itemData.slugOrUsername || item.targetId}`)}
                        className="cursor-pointer flex items-center gap-1"
                      >
                        Open Story <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'journal' ? (
          <div>
            {journalSaves.length === 0 ? (
              <div className="p-16 border border-dashed border-[#D8D2C5] text-center my-8">
                <p className="font-serif-display text-base font-bold text-[#191817]">
                  No saved journal reflections
                </p>
                <p className="text-xs text-[#847E76] mt-1 mb-4">
                  Save candid lessons and questions to review them later.
                </p>
                <button
                  onClick={() => navigate('/journal')}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#191817] text-[#FAF8F5]"
                >
                  Explore Journal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {journalSaves.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 border border-[#E5DFD4] bg-[#FAF8F5] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono-meta uppercase tracking-wider text-[#C85A32] font-bold">
                          {item.itemData.categoryOrType}
                        </span>
                        <span className="text-xs text-[#847E76]">
                          by {item.itemData.authorName}
                        </span>
                      </div>
                      <h4
                        onClick={() => navigate(`/journal?id=${item.targetId}`)}
                        className="font-serif-display text-base font-bold text-[#191817] hover:text-[#C85A32] cursor-pointer"
                      >
                        {item.itemData.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/journal?id=${item.targetId}`)}
                        className="text-xs text-[#C85A32] font-semibold flex items-center gap-1"
                      >
                        Read <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemove(item)}
                        className="text-[#847E76] hover:text-[#93301B]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {creatorSaves.length === 0 ? (
              <div className="p-16 border border-dashed border-[#D8D2C5] text-center my-8">
                <p className="font-serif-display text-base font-bold text-[#191817]">
                  No bookmarked creators
                </p>
                <button
                  onClick={() => navigate('/explore')}
                  className="mt-3 px-4 py-1.5 text-xs font-semibold bg-[#191817] text-[#FAF8F5]"
                >
                  Find Creators
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {creatorSaves.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/u/${item.itemData.slugOrUsername}`)}
                    className="p-4 border border-[#E5DFD4] bg-[#FAF8F5] hover:border-[#191817] cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-serif-display font-bold text-sm text-[#191817]">
                        {item.itemData.title}
                      </div>
                      <div className="text-xs text-[#847E76]">
                        @{item.itemData.slugOrUsername}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#847E76]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
