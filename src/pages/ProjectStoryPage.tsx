import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  ExternalLink,
  Github,
  FileText,
  Clock,
  Layers,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Trash2,
  UserPlus,
  Edit3,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  fetchProjectBySlug,
  fetchMilestones,
  fetchComments,
  addComment,
  deleteComment,
  checkAppreciation,
  toggleAppreciation,
  checkSaved,
  toggleSave,
  deleteProjectStory,
} from '../services/dataService';
import { ProjectStory, ProjectMilestone, Comment as CommentType } from '../types';
import { CollaborateModal } from '../components/CollaborateModal';
import { ProjectProgressTimelineD3 } from '../components/ProjectProgressTimelineD3';

interface ProjectStoryPageProps {
  slug: string;
  navigate: (route: string) => void;
  openCreateModal: (type: 'milestone') => void;
}

export const ProjectStoryPage: React.FC<ProjectStoryPageProps> = ({
  slug,
  navigate,
  openCreateModal,
}) => {
  const { user, profile, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState<ProjectStory | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reaction states
  const [isAppreciated, setIsAppreciated] = useState(false);
  const [appreciationsCount, setAppreciationsCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Collab modal
  const [collabModalOpen, setCollabModalOpen] = useState(false);

  // Load project details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchProjectBySlug(slug)
      .then(async (data) => {
        if (!isMounted) return;
        if (!data) {
          setError('Project story could not be found.');
          setLoading(false);
          return;
        }

        setProject(data);
        setAppreciationsCount(data.appreciationsCount || 0);

        // Fetch milestones, comments, appreciation & saved status
        const [ms, cms, appState, saveState] = await Promise.all([
          fetchMilestones(data.id),
          fetchComments(data.id),
          checkAppreciation(data.id),
          checkSaved(data.id),
        ]);

        if (isMounted) {
          setMilestones(ms);
          setComments(cms);
          setIsAppreciated(appState);
          setIsSaved(saveState);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError('Failed to load project story.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, user]);

  const handleAppreciateToggle = async () => {
    if (!user) {
      showToast('Please sign in to appreciate this story.', 'info');
      await signInWithGoogle();
      return;
    }
    if (!project) return;

    // Optimistic toggle
    const nextState = !isAppreciated;
    setIsAppreciated(nextState);
    setAppreciationsCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const persisted = await toggleAppreciation(project.id, 'project');
      setIsAppreciated(persisted);
    } catch (err) {
      // Rollback on failure
      setIsAppreciated(!nextState);
      setAppreciationsCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      showToast('Could not save appreciation. State rolled back.', 'error');
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      showToast('Please sign in to save this project.', 'info');
      await signInWithGoogle();
      return;
    }
    if (!project) return;

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      const persisted = await toggleSave(project.id, 'project', {
        title: project.title,
        subtitle: project.shortSummary,
        authorName: project.ownerName,
        categoryOrType: project.category,
        slugOrUsername: project.slug,
        imageUrl: project.coverImage,
      });
      setIsSaved(persisted);
      showToast(persisted ? 'Saved to your collection' : 'Removed from saved items', 'info');
    } catch {
      setIsSaved(!nextSaved);
      showToast('Could not update saved items. Rolled back.', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Project link copied to clipboard!', 'success');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to join the discussion.', 'info');
      await signInWithGoogle();
      return;
    }
    if (!commentInput.trim() || !project) return;

    setSubmittingComment(true);
    try {
      const newComment = await addComment({
        targetType: 'project',
        targetId: project.id,
        targetTitle: project.title,
        content: commentInput.trim(),
      });

      setComments([...comments, newComment]);
      setCommentInput('');
      showToast('Comment posted.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to post comment: ' + (err.message || 'Error'), 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!project) return;
    if (!window.confirm('Delete this comment?')) return;

    const prevList = [...comments];
    setComments(comments.filter((c) => c.id !== commentId));

    try {
      await deleteComment(commentId, 'project', project.id);
      showToast('Comment deleted.', 'info');
    } catch {
      setComments(prevList);
      showToast('Could not delete comment. Rolled back.', 'error');
    }
  };

  const handleDeleteStory = async () => {
    if (!project) return;
    if (!window.confirm('Are you sure you want to permanently delete this project story?')) return;

    try {
      await deleteProjectStory(project.id);
      showToast('Project story deleted.', 'info');
      navigate('/projects');
    } catch (err: any) {
      showToast('Failed to delete story: ' + (err.message || 'Error'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="font-mono-meta text-xs text-[#847E76] animate-pulse">
          Loading project story & journey...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif-display text-2xl font-bold text-[#191817] mb-2">
          Project Not Found
        </h2>
        <p className="text-sm text-[#57524C] mb-6">
          {error || 'This project story may have been removed or moved.'}
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 text-xs font-semibold bg-[#191817] text-[#FAF8F5]"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const isOwner = user?.uid === project.ownerId;

  return (
    <div className="min-h-screen pb-24 bg-[#FAF8F5]">
      {/* Top Breadcrumb & Action Header */}
      <div className="border-b border-[#E5DFD4] bg-[#FAF8F5]/80 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#57524C] hover:text-[#191817] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ALL STORIES</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAppreciateToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors ${
                isAppreciated
                  ? 'bg-[#F7EDE8] border-[#C85A32] text-[#C85A32]'
                  : 'bg-[#FAF8F5] border-[#E5DFD4] text-[#57524C] hover:text-[#191817]'
              }`}
              title="Appreciate this work"
              aria-label="Appreciate"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isAppreciated ? 'fill-[#C85A32] text-[#C85A32]' : ''
                }`}
              />
              <span>{appreciationsCount}</span>
            </button>

            <button
              onClick={handleSaveToggle}
              className={`p-1.5 text-xs border transition-colors ${
                isSaved
                  ? 'bg-[#F7EDE8] border-[#C85A32] text-[#C85A32]'
                  : 'bg-[#FAF8F5] border-[#E5DFD4] text-[#57524C] hover:text-[#191817]'
              }`}
              title="Save project"
              aria-label="Save project"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C85A32]' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 text-xs border border-[#E5DFD4] bg-[#FAF8F5] text-[#57524C] hover:text-[#191817]"
              title="Share story"
              aria-label="Share story"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {isOwner && (
              <button
                onClick={handleDeleteStory}
                className="p-1.5 text-xs border border-[#F2B8AC] text-[#93301B] hover:bg-[#FDF4F2]"
                title="Delete this project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Editorial Content Container */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        {/* Story Header */}
        <header className="mb-10 pb-8 border-b border-[#E5DFD4] space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-mono-meta uppercase tracking-wider bg-[#F4EFE6] border border-[#E5DFD4] text-[#57524C]">
              {project.category}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono-meta uppercase tracking-wider bg-[#191817] text-[#FAF8F5]">
              {project.status}
            </span>
            <span className="text-xs font-mono-meta text-[#847E76] ml-2">
              Published {new Date(project.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#191817] leading-tight">
            {project.title}
          </h1>

          <p className="text-base sm:text-xl text-[#57524C] leading-relaxed max-w-3xl">
            {project.shortSummary}
          </p>

          {/* Author Byline */}
          <div className="flex items-center justify-between pt-4 border-t border-[#ECE7DE]">
            <div
              onClick={() => navigate(`/u/${project.ownerUsername || project.ownerId}`)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src={project.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={project.ownerName}
                className="w-10 h-10 rounded-full object-cover border border-[#D8D2C5]"
              />
              <div>
                <div className="text-sm font-semibold text-[#191817] group-hover:text-[#C85A32] transition-colors">
                  {project.ownerName}
                </div>
                <div className="text-xs font-mono-meta text-[#847E76]">
                  @{project.ownerUsername || 'creator'}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#C85A32] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Preview
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#57524C] hover:text-[#191817]"
                >
                  <Github className="w-3.5 h-3.5" />
                  Repository
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {project.coverImage && (
          <div className="mb-12 border border-[#E5DFD4] bg-[#F4EFE6] overflow-hidden">
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Narrative Flow Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Long-form Story Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* OVERVIEW */}
            {project.overview && (
              <section>
                <h2 className="text-xs font-mono-meta tracking-wider text-[#C85A32] uppercase mb-2">
                  01 / OVERVIEW
                </h2>
                <div className="text-base text-[#191817] leading-relaxed whitespace-pre-line font-normal">
                  {project.overview}
                </div>
              </section>
            )}

            {/* THE PROBLEM */}
            {project.problem && (
              <section className="p-6 bg-[#F4EFE6] border-l-2 border-[#C85A32]">
                <h2 className="text-xs font-mono-meta tracking-wider text-[#C85A32] uppercase mb-2">
                  02 / THE PROBLEM CONFRONTED
                </h2>
                <div className="text-sm sm:text-base text-[#191817] leading-relaxed whitespace-pre-line">
                  {project.problem}
                </div>
              </section>
            )}

            {/* APPROACH */}
            {project.approach && (
              <section>
                <h2 className="text-xs font-mono-meta tracking-wider text-[#56725F] uppercase mb-2">
                  03 / ARCHITECTURAL APPROACH
                </h2>
                <div className="text-base text-[#191817] leading-relaxed whitespace-pre-line">
                  {project.approach}
                </div>
              </section>
            )}

            {/* PROCESS */}
            {project.process && (
              <section>
                <h2 className="text-xs font-mono-meta tracking-wider text-[#C85A32] uppercase mb-2">
                  04 / PROCESS & ITERATIONS
                </h2>
                <div className="text-base text-[#191817] leading-relaxed whitespace-pre-line">
                  {project.process}
                </div>
              </section>
            )}

            {/* PROJECT JOURNEY / MILESTONES */}
            <section className="pt-6 border-t border-[#E5DFD4] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-mono-meta tracking-wider text-[#C85A32] uppercase mb-1">
                    PROJECT JOURNEY
                  </h2>
                  <h3 className="font-serif-display text-xl font-bold text-[#191817]">
                    Evolution & Milestones
                  </h3>
                </div>
                {isOwner && (
                  <button
                    onClick={() => openCreateModal('milestone')}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#FAF8F5] border border-[#191817] text-[#191817] hover:bg-[#191817] hover:text-[#FAF8F5] transition-colors"
                  >
                    + Add Milestone
                  </button>
                )}
              </div>

              {/* D3 Visual Progress Timeline */}
              <ProjectProgressTimelineD3
                milestones={milestones}
                projectStatus={project.status}
              />

              {milestones.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-[#D8D2C5] text-xs text-[#847E76]">
                  No milestones logged yet. {isOwner ? 'Add your journey checkpoints above.' : ''}
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#E5DFD4]">
                  {milestones.map((m) => (
                    <div key={m.id} className="relative pl-8">
                      <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#FAF8F5] border-2 border-[#C85A32] -translate-x-1/2" />
                      <div className="p-4 bg-[#FAF8F5] border border-[#E5DFD4]">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono-meta px-2 py-0.5 bg-[#F4EFE6] text-[#C85A32] font-semibold">
                            {m.stage}
                          </span>
                          <span className="text-[11px] font-mono-meta text-[#847E76]">
                            {m.date}
                          </span>
                        </div>
                        <h4 className="font-serif-display font-bold text-base text-[#191817] mb-1">
                          {m.title}
                        </h4>
                        <p className="text-xs text-[#57524C] leading-relaxed mb-2">
                          {m.description}
                        </p>
                        {m.learnings && (
                          <div className="p-2.5 bg-[#F4EFE6] text-xs text-[#191817] border-l-2 border-[#56725F]">
                            <span className="font-semibold text-[#56725F] block text-[10px] uppercase font-mono-meta mb-0.5">
                              Learning:
                            </span>
                            {m.learnings}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* OUTCOME */}
            {project.outcome && (
              <section className="pt-6 border-t border-[#E5DFD4]">
                <h2 className="text-xs font-mono-meta tracking-wider text-[#C85A32] uppercase mb-2">
                  05 / OUTCOME & FINAL RESULT
                </h2>
                <div className="text-base text-[#191817] leading-relaxed whitespace-pre-line">
                  {project.outcome}
                </div>
              </section>
            )}

            {/* LESSONS LEARNED */}
            {project.lessonsLearned && project.lessonsLearned.length > 0 && (
              <section className="pt-6 border-t border-[#E5DFD4]">
                <h2 className="text-xs font-mono-meta tracking-wider text-[#56725F] uppercase mb-2">
                  06 / KEY LESSONS LEARNED
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {project.lessonsLearned.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#FAF8F5] border border-[#E5DFD4] flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#EFF4F0] border border-[#56725F] text-[#56725F] text-xs font-mono-meta flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-[#191817] leading-relaxed">
                        {lesson}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* DISCUSSION SECTION */}
            <section className="pt-10 border-t border-[#E5DFD4]" id="discussion">
              <div className="mb-6">
                <h2 className="text-xs font-mono-meta tracking-wider text-[#C85A32] uppercase mb-1">
                  DISCUSSION ({comments.length})
                </h2>
                <h3 className="font-serif-display text-xl font-bold text-[#191817]">
                  Community Feedback & Questions
                </h3>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="mb-8 p-4 bg-[#F4EFE6] border border-[#E5DFD4] space-y-3">
                <textarea
                  rows={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={
                    user
                      ? 'Share constructive thoughts, question a decision, or offer an idea...'
                      : 'Sign in to join the discussion...'
                  }
                  className="w-full p-3 text-xs bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#847E76]">
                    Constructive technical and design inquiries are appreciated.
                  </span>
                  <button
                    type="submit"
                    disabled={submittingComment || !commentInput.trim()}
                    className="px-4 py-1.5 text-xs font-semibold bg-[#191817] text-[#FAF8F5] hover:bg-[#C85A32] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>

              {/* Comment Thread */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-xs text-[#847E76] text-center py-6">
                    No comments yet. Be the first to start a conversation around this story.
                  </p>
                ) : (
                  comments.map((c) => {
                    const isAuthor = user?.uid === c.authorId;
                    return (
                      <div key={c.id} className="p-4 bg-[#FAF8F5] border border-[#E5DFD4] text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                              alt={c.authorName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-semibold text-[#191817]">{c.authorName}</span>
                            <span className="font-mono-meta text-[10px] text-[#847E76]">
                              @{c.authorUsername}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-meta text-[10px] text-[#847E76]">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                            {isAuthor && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-[#847E76] hover:text-[#93301B]"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[#57524C] leading-relaxed whitespace-pre-line pl-8">
                          {c.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar: Tools, Collaboration, Collaborators */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Open For Collaboration Callout */}
            {project.lookingForCollaborators && (
              <div className="p-5 bg-[#F4EFE6] border border-[#C85A32] space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono-meta font-bold text-[#C85A32]">
                  <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-ping" />
                  OPEN FOR COLLABORATION
                </div>
                <div>
                  <span className="text-[10px] font-mono-meta text-[#847E76] block">
                    SEEKING ROLE:
                  </span>
                  <div className="font-serif-display font-bold text-base text-[#191817]">
                    {project.collaborationRole || 'Contributor'}
                  </div>
                </div>
                {project.collaborationDuration && (
                  <div className="text-xs text-[#57524C]">
                    Duration: <span className="font-medium text-[#191817]">{project.collaborationDuration}</span>
                  </div>
                )}
                {project.collaborationSkills && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {project.collaborationSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 text-[10px] font-mono-meta bg-[#FAF8F5] border border-[#D8D2C5] text-[#57524C]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
                {!isOwner && (
                  <button
                    onClick={() => setCollabModalOpen(true)}
                    className="w-full mt-2 py-2 text-xs font-semibold bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Request to Collaborate
                  </button>
                )}
              </div>
            )}

            {/* Tools & Stack */}
            {project.tools && project.tools.length > 0 && (
              <div className="p-5 bg-[#FAF8F5] border border-[#E5DFD4]">
                <h3 className="text-xs font-mono-meta tracking-wider text-[#57524C] uppercase mb-3 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#C85A32]" />
                  TECHNOLOGIES & TOOLS
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      onClick={() => navigate(`/explore?q=${encodeURIComponent(tool)}`)}
                      className="px-2.5 py-1 text-xs font-mono-meta bg-[#F4EFE6] border border-[#E5DFD4] text-[#191817] hover:border-[#C85A32] cursor-pointer transition-colors"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborators Roster */}
            <div className="p-5 bg-[#FAF8F5] border border-[#E5DFD4]">
              <h3 className="text-xs font-mono-meta tracking-wider text-[#57524C] uppercase mb-3">
                PROJECT CREATORS & TEAM
              </h3>
              <div className="space-y-3">
                {/* Project Owner */}
                <div
                  onClick={() => navigate(`/u/${project.ownerUsername || project.ownerId}`)}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <img
                    src={project.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={project.ownerName}
                    className="w-8 h-8 rounded-full object-cover border border-[#D8D2C5]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#191817] group-hover:text-[#C85A32] transition-colors">
                      {project.ownerName}
                    </div>
                    <div className="text-[10px] font-mono-meta text-[#C85A32]">
                      Project Lead
                    </div>
                  </div>
                </div>

                {/* Additional Collaborators */}
                {project.collaborators?.map((collab) => (
                  <div
                    key={collab.userId}
                    onClick={() => navigate(`/u/${collab.userId}`)}
                    className="flex items-center gap-2.5 cursor-pointer group pt-2 border-t border-[#ECE7DE]"
                  >
                    <img
                      src={collab.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                      alt={collab.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#D8D2C5]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#191817] group-hover:text-[#C85A32] transition-colors">
                        {collab.name}
                      </div>
                      <div className="text-[10px] font-mono-meta text-[#57524C]">
                        {collab.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jump to Discussion */}
            <div className="p-4 bg-[#F4EFE6] border border-[#E5DFD4] text-center">
              <a
                href="#discussion"
                className="text-xs font-semibold text-[#191817] hover:text-[#C85A32] flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Join the {comments.length} Discussion Comments
              </a>
            </div>
          </aside>
        </div>
      </article>

      {/* Collaboration Proposal Modal */}
      <CollaborateModal
        project={project}
        isOpen={collabModalOpen}
        onClose={() => setCollabModalOpen(false)}
        onSuccess={() => {
          showToast('Collaboration request sent!', 'success');
        }}
      />
    </div>
  );
};
