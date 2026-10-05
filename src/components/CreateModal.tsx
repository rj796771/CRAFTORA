import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles, Layers, FileText, Milestone, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import {
  createProjectStory,
  createJournalEntry,
  addProjectMilestone,
  fetchProjectStories,
} from '../services/dataService';
import { ProjectStory, ProjectStatus, MilestoneStage, JournalType } from '../types';

interface CreateModalProps {
  type: 'project' | 'journal' | 'milestone' | null;
  onClose: () => void;
  onSuccess: (targetRoute?: string) => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({ type, onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [userProjects, setUserProjects] = useState<ProjectStory[]>([]);

  // Project Story Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('Design System');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('IN DEVELOPMENT');
  const [projectSummary, setProjectSummary] = useState('');
  const [projectOverview, setProjectOverview] = useState('');
  const [projectProblem, setProjectProblem] = useState('');
  const [projectApproach, setProjectApproach] = useState('');
  const [projectProcess, setProjectProcess] = useState('');
  const [projectOutcome, setProjectOutcome] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [lessonsList, setLessonsList] = useState<string[]>(['']);
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
  );
  const [liveUrl, setLiveUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [lookingForCollab, setLookingForCollab] = useState(false);
  const [collabRole, setCollabRole] = useState('');
  const [collabDuration, setCollabDuration] = useState('');
  const [collabSkillsInput, setCollabSkillsInput] = useState('');

  // Journal Form State
  const [journalType, setJournalType] = useState<JournalType>('Reflection');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalProjectSlug, setJournalProjectSlug] = useState('');
  const [journalTagsInput, setJournalTagsInput] = useState('');

  // Milestone Form State
  const [milestoneProjectId, setMilestoneProjectId] = useState('');
  const [milestoneStage, setMilestoneStage] = useState<MilestoneStage>('FIRST PROTOTYPE');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('October 2026');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneLearnings, setMilestoneLearnings] = useState('');

  useEffect(() => {
    if (type === 'journal' || type === 'milestone') {
      fetchProjectStories().then((list) => {
        setUserProjects(list);
        if (list.length > 0 && !milestoneProjectId) {
          setMilestoneProjectId(list[0].id);
        }
      });
    }
  }, [type]);

  if (!type) return null;

  const handleAddLessonField = () => {
    setLessonsList([...lessonsList, '']);
  };

  const handleLessonChange = (index: number, val: string) => {
    const updated = [...lessonsList];
    updated[index] = val;
    setLessonsList(updated);
  };

  const handleRemoveLesson = (index: number) => {
    setLessonsList(lessonsList.filter((_, i) => i !== index));
  };

  // Submit Project Story
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !projectSummary.trim()) {
      showToast('Please provide a title and short summary.', 'error');
      return;
    }

    setLoading(true);
    try {
      const slug = projectTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const tools = toolsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const collabSkills = collabSkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const cleanedLessons = lessonsList.map((l) => l.trim()).filter(Boolean);

      const newStory = await createProjectStory({
        slug: `${slug}-${Math.random().toString(36).substr(2, 4)}`,
        ownerId: user?.uid || 'user',
        ownerName: profile?.displayName || user?.displayName || 'Creator',
        ownerUsername: profile?.username || 'creator',
        ownerAvatar: profile?.avatarUrl || user?.photoURL || undefined,
        title: projectTitle.trim(),
        shortSummary: projectSummary.trim(),
        category: projectCategory,
        status: projectStatus,
        coverImage: coverImageUrl,
        overview: projectOverview.trim(),
        problem: projectProblem.trim(),
        approach: projectApproach.trim(),
        process: projectProcess.trim(),
        outcome: projectOutcome.trim(),
        lessonsLearned: cleanedLessons,
        tools: tools.length > 0 ? tools : ['Design', 'Engineering'],
        liveUrl: liveUrl.trim(),
        repoUrl: repoUrl.trim(),
        docsUrl: docsUrl.trim(),
        lookingForCollaborators: lookingForCollab,
        collaborationRole: collabRole.trim(),
        collaborationDuration: collabDuration.trim(),
        collaborationSkills: collabSkills,
        visibility: 'PUBLIC',
      });

      showToast('Project Story published to CRAFTORA!', 'success');
      onSuccess(`/projects/${newStory.slug}`);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to create story: ' + (err.message || 'Error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Journal Entry
  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) {
      showToast('Please provide a title and your reflection content.', 'error');
      return;
    }

    setLoading(true);
    try {
      const selectedProj = userProjects.find((p) => p.slug === journalProjectSlug || p.id === journalProjectSlug);

      const tags = journalTagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await createJournalEntry({
        ownerId: user?.uid || 'user',
        ownerName: profile?.displayName || user?.displayName || 'Creator',
        ownerUsername: profile?.username || 'creator',
        ownerAvatar: profile?.avatarUrl || user?.photoURL || undefined,
        projectId: selectedProj?.id,
        projectTitle: selectedProj?.title,
        projectSlug: selectedProj?.slug,
        type: journalType,
        title: journalTitle.trim(),
        content: journalContent.trim(),
        tags: tags.length > 0 ? tags : [journalType],
      });

      showToast('Journal reflection published!', 'success');
      onSuccess('/journal');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to publish reflection: ' + (err.message || 'Error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Milestone
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !milestoneProjectId) {
      showToast('Please select a project and provide a milestone title.', 'error');
      return;
    }

    setLoading(true);
    try {
      await addProjectMilestone({
        projectId: milestoneProjectId,
        ownerId: user?.uid || 'user',
        stage: milestoneStage,
        title: milestoneTitle.trim(),
        date: milestoneDate.trim(),
        description: milestoneDesc.trim(),
        learnings: milestoneLearnings.trim(),
        order: Date.now(),
      });

      const selected = userProjects.find((p) => p.id === milestoneProjectId);
      showToast('Project milestone logged!', 'success');
      onSuccess(selected ? `/projects/${selected.slug}` : '/projects');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to add milestone: ' + (err.message || 'Error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#191817]/60 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] border border-[#E5DFD4] shadow-2xl my-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DFD4] bg-[#F4EFE6] shrink-0">
          <div className="flex items-center gap-2">
            {type === 'project' && <Layers className="w-4 h-4 text-[#C85A32]" />}
            {type === 'journal' && <FileText className="w-4 h-4 text-[#C85A32]" />}
            {type === 'milestone' && <Milestone className="w-4 h-4 text-[#C85A32]" />}
            <h2 className="font-serif-display text-lg font-bold text-[#191817]">
              {type === 'project' && 'Create Project Story'}
              {type === 'journal' && 'Write Journal Entry'}
              {type === 'milestone' && 'Log Project Milestone'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#847E76] hover:text-[#191817] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="overflow-y-auto p-6 flex-1 text-[#191817]">
          {/* ======================================= */}
          {/* PROJECT STORY FORM */}
          {/* ======================================= */}
          {type === 'project' && (
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <p className="text-xs text-[#57524C] mb-4">
                  CRAFTORA is about showing the process, iterations, and decisions—not just a polished final render.
                </p>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    PROJECT TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. MOTIONKIT or HyperGraph Engine"
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    CATEGORY *
                  </label>
                  <select
                    value={projectCategory}
                    onChange={(e) => setProjectCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  >
                    {[
                      'Design System',
                      'Web Architecture',
                      'Mobile App',
                      'AI & ML',
                      'Hardware & IoT',
                      'Open Source',
                      'Research',
                      'Creative Tool',
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Short Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    CURRENT STATUS
                  </label>
                  <select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  >
                    {[
                      'CONCEPT',
                      'EXPLORING',
                      'IN DEVELOPMENT',
                      'TESTING',
                      'RELEASED',
                      'PAUSED',
                      'ARCHIVED',
                    ].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    SHORT SUMMARY (1-2 sentences) *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectSummary}
                    onChange={(e) => setProjectSummary(e.target.value)}
                    placeholder="What did you build and why does it matter?"
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Image Preset */}
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                  COVER IMAGE URL
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none font-mono-meta"
                />
              </div>

              {/* The Narrative Sections */}
              <div className="space-y-4 pt-2 border-t border-[#ECE7DE]">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    PROJECT OVERVIEW (Background narrative)
                  </label>
                  <textarea
                    rows={3}
                    value={projectOverview}
                    onChange={(e) => setProjectOverview(e.target.value)}
                    placeholder="Describe what inspired this work, the context, and what you set out to explore."
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                      THE PROBLEM
                    </label>
                    <textarea
                      rows={3}
                      value={projectProblem}
                      onChange={(e) => setProjectProblem(e.target.value)}
                      placeholder="What friction, bug, or limitation were you trying to solve?"
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                      APPROACH & METHODOLOGY
                    </label>
                    <textarea
                      rows={3}
                      value={projectApproach}
                      onChange={(e) => setProjectApproach(e.target.value)}
                      placeholder="How did you break down the solution and choose your stack?"
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    PROCESS & DEVELOPMENT
                  </label>
                  <textarea
                    rows={4}
                    value={projectProcess}
                    onChange={(e) => setProjectProcess(e.target.value)}
                    placeholder="Describe the phases, the challenges encountered, and what changed during development."
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    OUTCOME & RESULT
                  </label>
                  <textarea
                    rows={2}
                    value={projectOutcome}
                    onChange={(e) => setProjectOutcome(e.target.value)}
                    placeholder="What was the result? Team adoption, performance metric, feedback, or release."
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tools & Technologies */}
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                  TOOLS & TECHNOLOGIES (Comma-separated)
                </label>
                <input
                  type="text"
                  value={toolsInput}
                  onChange={(e) => setToolsInput(e.target.value)}
                  placeholder="e.g. TypeScript, Figma, WebAudio API, Rust"
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              {/* Lessons Learned */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C]">
                    LESSONS LEARNED (Key takeaways)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLessonField}
                    className="text-xs text-[#C85A32] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3 h-3" /> Add Lesson
                  </button>
                </div>
                <div className="space-y-2">
                  {lessonsList.map((lesson, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={lesson}
                        onChange={(e) => handleLessonChange(idx, e.target.value)}
                        placeholder={`Lesson ${idx + 1}...`}
                        className="w-full px-3 py-1.5 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                      />
                      {lessonsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLesson(idx)}
                          className="p-1.5 text-[#847E76] hover:text-[#93301B]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* External Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#ECE7DE]">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    LIVE DEMO URL
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD4] font-mono-meta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    REPOSITORY URL
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD4] font-mono-meta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    DOCS URL
                  </label>
                  <input
                    type="url"
                    value={docsUrl}
                    onChange={(e) => setDocsUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD4] font-mono-meta"
                  />
                </div>
              </div>

              {/* Collaboration Toggle */}
              <div className="p-4 bg-[#F4EFE6] border border-[#E5DFD4] space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lookingForCollab}
                    onChange={(e) => setLookingForCollab(e.target.checked)}
                    className="w-4 h-4 accent-[#C85A32]"
                  />
                  <span className="text-xs font-bold tracking-wider text-[#191817]">
                    OPEN THIS STORY FOR COLLABORATION
                  </span>
                </label>
                {lookingForCollab && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#57524C] mb-1">
                        ROLE WANTED
                      </label>
                      <input
                        type="text"
                        value={collabRole}
                        onChange={(e) => setCollabRole(e.target.value)}
                        placeholder="e.g. Frontend Engineer, Sound Designer"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D8D2C5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#57524C] mb-1">
                        ESTIMATED DURATION
                      </label>
                      <input
                        type="text"
                        value={collabDuration}
                        onChange={(e) => setCollabDuration(e.target.value)}
                        placeholder="e.g. 4-6 weeks"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D8D2C5]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#57524C] mb-1">
                        SKILLS DESIRED (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={collabSkillsInput}
                        onChange={(e) => setCollabSkillsInput(e.target.value)}
                        placeholder="e.g. WebRTC, Figma, Rust"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D8D2C5]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD4]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#57524C] hover:text-[#191817]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Publishing Story...' : 'Publish Project Story'}
                </button>
              </div>
            </form>
          )}

          {/* ======================================= */}
          {/* JOURNAL ENTRY FORM */}
          {/* ======================================= */}
          {type === 'journal' && (
            <form onSubmit={handleCreateJournal} className="space-y-5">
              <p className="text-xs text-[#57524C]">
                Share a reflection, a debugging takeaway, an experiment result, or an architectural question with the creative community.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    ENTRY TYPE *
                  </label>
                  <select
                    value={journalType}
                    onChange={(e) => setJournalType(e.target.value as JournalType)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  >
                    {[
                      'Reflection',
                      'Lesson',
                      'Case Study',
                      'Question',
                      'Experiment',
                      'Announcement',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    ATTACH TO A PROJECT STORY (Optional)
                  </label>
                  <select
                    value={journalProjectSlug}
                    onChange={(e) => setJournalProjectSlug(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  >
                    <option value="">-- None (Standalone Journal Entry) --</option>
                    {userProjects.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                  TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="e.g. Three things I learned while redesigning our team motion curves"
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none font-serif-display font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                  CONTENT *
                </label>
                <textarea
                  rows={8}
                  required
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Write your reflection in detail. Be frank about what failed, what worked, and what other creators can learn..."
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                  TAGS (Comma-separated)
                </label>
                <input
                  type="text"
                  value={journalTagsInput}
                  onChange={(e) => setJournalTagsInput(e.target.value)}
                  placeholder="e.g. Architecture, Design Systems, Performance"
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD4]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#57524C] hover:text-[#191817]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish Journal Entry'}
                </button>
              </div>
            </form>
          )}

          {/* ======================================= */}
          {/* MILESTONE FORM */}
          {/* ======================================= */}
          {type === 'milestone' && (
            <form onSubmit={handleCreateMilestone} className="space-y-5">
              <p className="text-xs text-[#57524C]">
                Record a critical milestone along your project journey: from early concept and prototypes to production releases.
              </p>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                  SELECT PROJECT *
                </label>
                <select
                  required
                  value={milestoneProjectId}
                  onChange={(e) => setMilestoneProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                >
                  {userProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    JOURNEY STAGE *
                  </label>
                  <select
                    value={milestoneStage}
                    onChange={(e) => setMilestoneStage(e.target.value as MilestoneStage)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  >
                    {[
                      'IDEA',
                      'RESEARCH',
                      'FIRST PROTOTYPE',
                      'ITERATION',
                      'TESTING',
                      'RELEASE',
                    ].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                    DATE OR TIMEFRAME
                  </label>
                  <input
                    type="text"
                    value={milestoneDate}
                    onChange={(e) => setMilestoneDate(e.target.value)}
                    placeholder="e.g. October 2026 or Sprint 4"
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                  MILESTONE TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="e.g. First End-to-End Hardware Telemetry Run"
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                  DESCRIPTION (What happened?)
                </label>
                <textarea
                  rows={3}
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Describe the milestone test or event in detail..."
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                  KEY LEARNING (Short insight)
                </label>
                <input
                  type="text"
                  value={milestoneLearnings}
                  onChange={(e) => setMilestoneLearnings(e.target.value)}
                  placeholder="What did this milestone teach you?"
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD4]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#57524C] hover:text-[#191817]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Log Milestone'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
