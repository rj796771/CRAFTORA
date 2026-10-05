import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { CreatorType } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [identityStatement, setIdentityStatement] = useState(profile?.identityStatement || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile?.websiteUrl || '');
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolioUrl || '');
  const [creatorType, setCreatorType] = useState<CreatorType>(profile?.creatorType || 'Developer');

  // Currently
  const [exploring, setExploring] = useState(profile?.currently?.exploring || '');
  const [workingOn, setWorkingOn] = useState(profile?.currently?.workingOn || '');
  const [learning, setLearning] = useState(profile?.currently?.learning || '');
  const [openTo, setOpenTo] = useState(profile?.currently?.openTo || '');

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) {
      showToast('Display Name and Username are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        identityStatement: identityStatement.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        location: location.trim(),
        websiteUrl: websiteUrl.trim(),
        githubUrl: githubUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        creatorType,
        currently: {
          exploring: exploring.trim(),
          workingOn: workingOn.trim(),
          learning: learning.trim(),
          openTo: openTo.trim(),
        },
      });

      showToast('Profile updated successfully!', 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('Failed to update profile: ' + (err.message || 'Error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#191817]/60 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E5DFD4] shadow-2xl my-8 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DFD4] bg-[#F4EFE6] shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#C85A32]" />
            <h2 className="font-serif-display text-lg font-bold text-[#191817]">
              Edit Creator Profile
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#847E76] hover:text-[#191817]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-[#191817] flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                DISPLAY NAME *
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                USERNAME (HANDLE) *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none font-mono-meta text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                CREATOR TYPE
              </label>
              <select
                value={creatorType}
                onChange={(e) => setCreatorType(e.target.value as CreatorType)}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
              >
                {[
                  'Developer',
                  'Designer',
                  'Researcher',
                  'Founder',
                  'Engineer',
                  'Creator',
                  'Student',
                ].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                LOCATION
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
              IDENTITY STATEMENT (One-line core essence)
            </label>
            <input
              type="text"
              value={identityStatement}
              onChange={(e) => setIdentityStatement(e.target.value)}
              placeholder="e.g. Design systems lead & component architect"
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
              BIO & BACKGROUND
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share what drives you, your craft philosophy, and your creative domain."
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E5DFD4] focus:border-[#C85A32] focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
              AVATAR IMAGE URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD4] font-mono-meta"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#ECE7DE]">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                WEBSITE URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD4] font-mono-meta"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                GITHUB URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD4] font-mono-meta"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#57524C] mb-1">
                PORTFOLIO URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD4] font-mono-meta"
              />
            </div>
          </div>

          {/* Currently Panel */}
          <div className="p-4 bg-[#F4EFE6] border border-[#E5DFD4] space-y-3">
            <span className="text-xs font-bold tracking-wider text-[#191817] block">
              CURRENTLY (What are you up to right now?)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#57524C] mb-1">
                  EXPLORING
                </label>
                <input
                  type="text"
                  value={exploring}
                  onChange={(e) => setExploring(e.target.value)}
                  placeholder="e.g. Human-centered AI interfaces"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D8D2C5]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#57524C] mb-1">
                  WORKING ON
                </label>
                <input
                  type="text"
                  value={workingOn}
                  onChange={(e) => setWorkingOn(e.target.value)}
                  placeholder="e.g. MotionKit v2 spring physics"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D8D2C5]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#57524C] mb-1">
                  LEARNING
                </label>
                <input
                  type="text"
                  value={learning}
                  onChange={(e) => setLearning(e.target.value)}
                  placeholder="e.g. Rust for WebAssembly canvas layout"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D8D2C5]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#57524C] mb-1">
                  OPEN TO
                </label>
                <input
                  type="text"
                  value={openTo}
                  onChange={(e) => setOpenTo(e.target.value)}
                  placeholder="e.g. Design + engineering collaborations"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D8D2C5]"
                />
              </div>
            </div>
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
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
