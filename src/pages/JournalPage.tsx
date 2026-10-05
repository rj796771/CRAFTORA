import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  FolderGit2,
  Filter,
  Plus,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  fetchJournalEntries,
  toggleAppreciation,
  checkAppreciation,
  toggleSave,
  checkSaved,
  fetchComments,
  addComment,
} from '../services/dataService';
import { JournalEntry, JournalType, Comment } from '../types';

interface JournalPageProps {
  initialSelectedId?: string | null;
  navigate: (route: string) => void;
  openCreateModal: (type: 'journal') => void;
}

const JOURNAL_TYPES: ('All' | JournalType)[] = [
  'All',
  'Reflection',
  'Lesson',
  'Case Study',
  'Question',
  'Experiment',
  'Announcement',
];

export const JournalPage: React.FC<JournalPageProps> = ({
  initialSelectedId,
  navigate,
  openCreateModal,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [activeCommentsEntryId, setActiveCommentsEntryId] = useState<string | null>(
    initialSelectedId || null
  );
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchJournalEntries(selectedType)
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedType]);

  const loadCommentsForEntry = async (entryId: string) => {
    if (activeCommentsEntryId === entryId) {
      setActiveCommentsEntryId(null);
      return;
    }
    setActiveCommentsEntryId(entryId);
    if (!commentsMap[entryId]) {
      const cms = await fetchComments(entryId);
      setCommentsMap((prev) => ({ ...prev, [entryId]: cms }));
    }
  };

  const handleAppreciate = async (entry: JournalEntry) => {
    if (!user) {
      showToast('Please sign in to appreciate reflections.', 'info');
      await signInWithGoogle();
      return;
    }

    try {
      const appreciated = await toggleAppreciation(entry.id, 'journal');
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? {
                ...e,
                appreciationsCount: appreciated
                  ? (e.appreciationsCount || 0) + 1
                  : Math.max(0, (e.appreciationsCount || 0) - 1),
              }
            : e
        )
      );
      showToast(appreciated ? 'Appreciated' : 'Unappreciated', 'info');
    } catch {
      showToast('Failed to toggle appreciation.', 'error');
    }
  };

  const handleSave = async (entry: JournalEntry) => {
    if (!user) {
      showToast('Please sign in to save reflections.', 'info');
      await signInWithGoogle();
      return;
    }

    try {
      const saved = await toggleSave(entry.id, 'journal', {
        title: entry.title,
        subtitle: entry.content.slice(0, 100),
        authorName: entry.ownerName,
        categoryOrType: entry.type,
      });
      showToast(saved ? 'Saved reflection' : 'Removed from saved', 'info');
    } catch {
      showToast('Failed to update bookmark.', 'error');
    }
  };

  const handlePostComment = async (entryId: string, entryTitle: string) => {
    if (!user) {
      showToast('Please sign in to comment.', 'info');
      await signInWithGoogle();
      return;
    }
    if (!commentInput.trim()) return;

    setPostingComment(true);
    try {
      const newComment = await addComment({
        targetType: 'journal',
        targetId: entryId,
        targetTitle: entryTitle,
        content: commentInput.trim(),
      });

      setCommentsMap((prev) => ({
        ...prev,
        [entryId]: [...(prev[entryId] || []), newComment],
      }));
      setCommentInput('');
      showToast('Comment published.', 'success');
    } catch (err: any) {
      showToast('Could not post comment: ' + (err.message || 'Error'), 'error');
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#FAF8F5]">
      {/* Header Banner */}
      <section className="py-12 border-b border-[#E5DFD4] bg-[#F4EFE6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono-meta tracking-wider text-[#56725F] block mb-1">
                CREATIVE REFLECTIONS & LESSONS
              </span>
              <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#191817]">
                The Journal
              </h1>
              <p className="text-xs sm:text-sm text-[#57524C] max-w-lg mt-1 leading-relaxed">
                Short essays, architectural experiments, and candid lessons written directly by builders during active development.
              </p>
            </div>
            <button
              onClick={() => openCreateModal('journal')}
              className="px-5 py-2.5 text-xs font-semibold bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-colors shrink-0"
            >
              + Write Journal Entry
            </button>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="border-b border-[#E5DFD4] bg-[#FAF8F5] sticky top-16 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 overflow-x-auto scrollbar-none flex items-center gap-2">
          {JOURNAL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedType === t
                  ? 'bg-[#191817] text-[#FAF8F5] border-[#191817]'
                  : 'bg-[#F4EFE6] text-[#57524C] border-[#E5DFD4] hover:border-[#191817] hover:text-[#191817]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Journal Feed */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {loading ? (
          <div className="py-16 text-center text-xs font-mono-meta text-[#847E76] animate-pulse">
            Loading journal reflections...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-16 border border-dashed border-[#D8D2C5] text-center my-8">
            <BookOpen className="w-8 h-8 text-[#847E76] mx-auto mb-2" />
            <p className="font-serif-display text-base font-bold text-[#191817]">
              No entries found in this category
            </p>
            <p className="text-xs text-[#847E76] mt-1 mb-4">
              Be the first to publish a reflection or question.
            </p>
            <button
              onClick={() => openCreateModal('journal')}
              className="px-4 py-1.5 text-xs font-semibold bg-[#191817] text-[#FAF8F5]"
            >
              Write First Reflection
            </button>
          </div>
        ) : (
          entries.map((entry) => {
            const isCommentsOpen = activeCommentsEntryId === entry.id;
            const entryComments = commentsMap[entry.id] || [];

            return (
              <article
                key={entry.id}
                className="p-6 sm:p-8 bg-[#FAF8F5] border border-[#E5DFD4] space-y-4 hover:border-[#D8D2C5] transition-colors"
              >
                {/* Meta Byline */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#ECE7DE]">
                  <div
                    onClick={() => navigate(`/u/${entry.ownerUsername || entry.ownerId}`)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <img
                      src={entry.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={entry.ownerName}
                      className="w-7 h-7 rounded-full object-cover border border-[#D8D2C5]"
                    />
                    <span className="text-xs font-semibold text-[#191817] group-hover:text-[#C85A32] transition-colors">
                      {entry.ownerName}
                    </span>
                    <span className="text-[11px] font-mono-meta text-[#847E76]">
                      @{entry.ownerUsername}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono-meta uppercase tracking-wider bg-[#F4EFE6] border border-[#D8D2C5] text-[#C85A32] font-semibold">
                      {entry.type}
                    </span>
                    <span className="text-[11px] font-mono-meta text-[#847E76]">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#191817] leading-snug">
                  {entry.title}
                </h2>

                {/* Content */}
                <div className="text-sm text-[#191817] leading-relaxed whitespace-pre-line font-normal space-y-3">
                  {entry.content}
                </div>

                {/* Connected Project Story Link (if attached) */}
                {entry.projectTitle && (
                  <div
                    onClick={() =>
                      entry.projectSlug && navigate(`/projects/${entry.projectSlug}`)
                    }
                    className="p-3 bg-[#F4EFE6] border border-[#E5DFD4] flex items-center justify-between cursor-pointer hover:border-[#C85A32] transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <FolderGit2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span className="text-[#847E76]">Related Project Story:</span>
                      <span className="font-semibold text-[#191817]">
                        {entry.projectTitle}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#847E76]" />
                  </div>
                )}

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {entry.tags.map((tg) => (
                      <span
                        key={tg}
                        className="px-2 py-0.5 text-[10px] font-mono-meta bg-[#F4EFE6] text-[#57524C]"
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions Bar */}
                <div className="pt-4 border-t border-[#ECE7DE] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleAppreciate(entry)}
                      className="flex items-center gap-1.5 text-[#57524C] hover:text-[#C85A32] transition-colors"
                      title="Appreciate"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{entry.appreciationsCount || 0}</span>
                    </button>

                    <button
                      onClick={() => loadCommentsForEntry(entry.id)}
                      className="flex items-center gap-1.5 text-[#57524C] hover:text-[#191817] transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{entry.commentsCount || 0} Comments</span>
                    </button>

                    <button
                      onClick={() => handleSave(entry)}
                      className="text-[#57524C] hover:text-[#191817] transition-colors"
                      title="Save reflection"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/journal?id=${entry.id}`
                        );
                        showToast('Journal link copied to clipboard!', 'success');
                      }
                    }}
                    className="text-[#847E76] hover:text-[#191817]"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline Comment Thread */}
                {isCommentsOpen && (
                  <div className="pt-4 border-t border-[#ECE7DE] space-y-3 bg-[#F4EFE6]/40 p-4">
                    <div className="font-mono-meta text-[11px] text-[#57524C] font-semibold">
                      COMMENTS ({entryComments.length})
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Add a constructive thought or question..."
                        className="flex-1 px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handlePostComment(entry.id, entry.title);
                          }
                        }}
                      />
                      <button
                        onClick={() => handlePostComment(entry.id, entry.title)}
                        disabled={postingComment || !commentInput.trim()}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#191817] text-[#FAF8F5] hover:bg-[#C85A32] disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      {entryComments.map((cm) => (
                        <div key={cm.id} className="p-3 bg-[#FAF8F5] border border-[#E5DFD4] text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-[#191817]">{cm.authorName}</span>
                            <span className="font-mono-meta text-[10px] text-[#847E76]">
                              {new Date(cm.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[#57524C]">{cm.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </main>
    </div>
  );
};
