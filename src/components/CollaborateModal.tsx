import React, { useState } from 'react';
import { X, Handshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { submitCollaborationRequest } from '../services/dataService';
import { ProjectStory } from '../types';

interface CollaborateModalProps {
  project: ProjectStory | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CollaborateModal: React.FC<CollaborateModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, profile, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [roleWanted, setRoleWanted] = useState(project?.collaborationRole || 'Contributor');
  const [pitch, setPitch] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in first to submit a collaboration request.', 'info');
      await signInWithGoogle();
      return;
    }

    if (!roleWanted.trim() || !pitch.trim()) {
      showToast('Please specify the role and a brief pitch of what you bring.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitCollaborationRequest({
        projectId: project.id,
        projectTitle: project.title,
        projectSlug: project.slug,
        projectOwnerId: project.ownerId,
        roleWanted: roleWanted.trim(),
        pitch: pitch.trim(),
        portfolioLinks: portfolioLinks.trim(),
      });

      showToast('Collaboration proposal sent to ' + project.ownerName + '!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('Failed to submit proposal: ' + (err.message || 'Error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#191817]/60 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E5DFD4] shadow-2xl my-8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DFD4] bg-[#F4EFE6]">
          <div className="flex items-center gap-2">
            <Handshake className="w-4 h-4 text-[#C85A32]" />
            <h2 className="font-serif-display text-lg font-bold text-[#191817]">
              Request to Collaborate
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#847E76] hover:text-[#191817]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[#191817]">
          <div>
            <span className="text-[11px] font-mono-meta text-[#847E76] block mb-1">
              PROJECT STORY
            </span>
            <div className="text-sm font-serif-display font-semibold text-[#191817]">
              {project.title}
            </div>
            <div className="text-xs text-[#57524C]">
              Created by {project.ownerName} &middot; {project.category}
            </div>
          </div>

          {project.collaborationSkills && project.collaborationSkills.length > 0 && (
            <div className="p-3 bg-[#F4EFE6] border border-[#E5DFD4]">
              <span className="text-[10px] font-mono-meta text-[#847E76] uppercase tracking-wider block mb-1.5">
                Skills Sought by Creator:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.collaborationSkills.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2 py-0.5 bg-[#FAF8F5] border border-[#D8D2C5] text-[#57524C]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
              ROLE YOU WOULD LIKE TO FULFILL *
            </label>
            <input
              type="text"
              required
              value={roleWanted}
              onChange={(e) => setRoleWanted(e.target.value)}
              placeholder="e.g. Frontend Engineer, UX Researcher, Sound Designer"
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
              YOUR PITCH & MOTIVATION *
            </label>
            <textarea
              rows={4}
              required
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Why does this project interest you? What relevant experience or perspective would you bring to the team?"
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
              RELEVANT WORK / REPOSITORY LINKS
            </label>
            <input
              type="text"
              value={portfolioLinks}
              onChange={(e) => setPortfolioLinks(e.target.value)}
              placeholder="https://github.com/... or https://yourwork.dev"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none font-mono-meta"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#57524C] hover:text-[#191817]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Sending Request...' : 'Send Collaboration Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
