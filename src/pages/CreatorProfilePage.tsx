import React, { useState, useEffect } from 'react';
import {
  Globe,
  Github,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  BookOpen,
  Handshake,
  UserCheck,
  UserPlus,
  Edit3,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  fetchProfileByUsernameOrId,
  fetchProjectStories,
  fetchJournalEntries,
  checkFollowing,
  toggleFollow,
} from '../services/dataService';
import { UserProfile, ProjectStory, JournalEntry } from '../types';
import { EditProfileModal } from '../components/EditProfileModal';

interface CreatorProfilePageProps {
  identifier: string; // username or userId
  navigate: (route: string) => void;
  openCreateModal: (type: 'project' | 'journal') => void;
}

export const CreatorProfilePage: React.FC<CreatorProfilePageProps> = ({
  identifier,
  navigate,
  openCreateModal,
}) => {
  const { user, profile: myProfile, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null);
  const [creatorProjects, setCreatorProjects] = useState<ProjectStory[]>([]);
  const [creatorJournals, setCreatorJournals] = useState<JournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'stories' | 'journal' | 'collaborations'>('stories');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchProfileByUsernameOrId(identifier).then(async (found) => {
      if (!isMounted) return;
      if (found) {
        setCreatorProfile(found);

        const [allStories, allJournals, followState] = await Promise.all([
          fetchProjectStories(),
          fetchJournalEntries(),
          checkFollowing(found.userId),
        ]);

        if (isMounted) {
          const userStories = allStories.filter((s) => s.ownerId === found.userId);
          const userJournals = allJournals.filter((j) => j.ownerId === found.userId);
          setCreatorProjects(userStories);
          setCreatorJournals(userJournals);
          setIsFollowing(followState);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [identifier, user]);

  const handleFollowToggle = async () => {
    if (!user) {
      showToast('Please sign in to follow creators.', 'info');
      await signInWithGoogle();
      return;
    }
    if (!creatorProfile) return;

    try {
      const nextFollow = await toggleFollow(creatorProfile.userId, creatorProfile.displayName);
      setIsFollowing(nextFollow);
      showToast(
        nextFollow
          ? `Now following ${creatorProfile.displayName}`
          : `Unfollowed ${creatorProfile.displayName}`,
        'info'
      );
    } catch {
      showToast('Failed to update follow state.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-mono-meta text-xs text-[#847E76] animate-pulse">
        Loading creator profile & work...
      </div>
    );
  }

  if (!creatorProfile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif-display text-2xl font-bold text-[#191817] mb-2">
          Creator Not Found
        </h2>
        <p className="text-xs text-[#57524C] mb-6">
          We couldn&apos;t find a creator profile for &quot;{identifier}&quot;.
        </p>
        <button
          onClick={() => navigate('/explore')}
          className="px-4 py-2 text-xs font-semibold bg-[#191817] text-[#FAF8F5]"
        >
          Explore Creators
        </button>
      </div>
    );
  }

  const isOwnProfile = user?.uid === creatorProfile.userId;

  return (
    <div className="min-h-screen pb-24 bg-[#FAF8F5]">
      {/* Profile Header Canvas */}
      <section className="border-b border-[#E5DFD4] bg-[#F4EFE6] pt-12 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            {/* Creator Overview */}
            <div className="flex items-start gap-5">
              <img
                src={
                  creatorProfile.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={creatorProfile.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#FAF8F5] shadow-sm"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#191817]">
                    {creatorProfile.displayName}
                  </h1>
                  {creatorProfile.creatorType && (
                    <span className="px-2 py-0.5 text-[10px] font-mono-meta uppercase bg-[#FAF8F5] border border-[#D8D2C5] text-[#57524C]">
                      {creatorProfile.creatorType}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono-meta text-[#847E76]">
                  @{creatorProfile.username}
                </div>

                {creatorProfile.identityStatement && (
                  <p className="text-sm font-medium text-[#191817] pt-1 max-w-xl">
                    {creatorProfile.identityStatement}
                  </p>
                )}

                {creatorProfile.location && (
                  <div className="flex items-center gap-1 text-xs text-[#57524C] pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#847E76]" />
                    <span>{creatorProfile.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              {isOwnProfile ? (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold bg-[#FAF8F5] border border-[#191817] text-[#191817] hover:bg-[#191817] hover:text-[#FAF8F5] transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`px-5 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isFollowing
                      ? 'bg-[#FAF8F5] border border-[#D8D2C5] text-[#57524C] hover:border-[#93301B] hover:text-[#93301B]'
                      : 'bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5]'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-[#56725F]" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow Creator
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bio Narrative */}
          {creatorProfile.bio && (
            <div className="mt-6 pt-6 border-t border-[#E5DFD4] text-xs sm:text-sm text-[#57524C] leading-relaxed max-w-3xl">
              {creatorProfile.bio}
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-[#ECE7DE] text-xs">
            {creatorProfile.websiteUrl && (
              <a
                href={creatorProfile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#57524C] hover:text-[#C85A32]"
              >
                <Globe className="w-3.5 h-3.5" />
                Website
              </a>
            )}
            {creatorProfile.githubUrl && (
              <a
                href={creatorProfile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#57524C] hover:text-[#C85A32]"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
            )}
            {creatorProfile.portfolioUrl && (
              <a
                href={creatorProfile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#57524C] hover:text-[#C85A32]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Portfolio
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* CURRENTLY PANEL */}
        {creatorProfile.currently && (
          <section className="p-6 bg-[#FAF8F5] border border-[#E5DFD4] space-y-4">
            <span className="text-xs font-mono-meta tracking-wider text-[#C85A32] uppercase block">
              CURRENT FOCUS & DIRECTION
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-[#F4EFE6] border border-[#E5DFD4]">
                <span className="text-[10px] font-mono-meta text-[#847E76] block mb-1">
                  EXPLORING
                </span>
                <p className="text-xs font-medium text-[#191817]">
                  {creatorProfile.currently.exploring || 'New creative possibilities'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F4EFE6] border border-[#E5DFD4]">
                <span className="text-[10px] font-mono-meta text-[#847E76] block mb-1">
                  WORKING ON
                </span>
                <p className="text-xs font-medium text-[#191817]">
                  {creatorProfile.currently.workingOn || 'Active projects'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F4EFE6] border border-[#E5DFD4]">
                <span className="text-[10px] font-mono-meta text-[#847E76] block mb-1">
                  LEARNING
                </span>
                <p className="text-xs font-medium text-[#191817]">
                  {creatorProfile.currently.learning || 'Deepening craft skills'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F4EFE6] border border-[#E5DFD4]">
                <span className="text-[10px] font-mono-meta text-[#847E76] block mb-1">
                  OPEN TO
                </span>
                <p className="text-xs font-medium text-[#191817]">
                  {creatorProfile.currently.openTo || 'Design & code conversations'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Content Tabs */}
        <div>
          <div className="flex items-center gap-6 border-b border-[#E5DFD4] mb-6">
            <button
              onClick={() => setActiveTab('stories')}
              className={`pb-3 text-xs font-semibold tracking-wider border-b-2 transition-colors ${
                activeTab === 'stories'
                  ? 'border-[#C85A32] text-[#C85A32]'
                  : 'border-transparent text-[#57524C] hover:text-[#191817]'
              }`}
            >
              PROJECT STORIES ({creatorProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`pb-3 text-xs font-semibold tracking-wider border-b-2 transition-colors ${
                activeTab === 'journal'
                  ? 'border-[#C85A32] text-[#C85A32]'
                  : 'border-transparent text-[#57524C] hover:text-[#191817]'
              }`}
            >
              JOURNAL REFLECTIONS ({creatorJournals.length})
            </button>
          </div>

          {/* Stories Tab */}
          {activeTab === 'stories' && (
            <div>
              {creatorProjects.length === 0 ? (
                <div className="p-12 border border-dashed border-[#D8D2C5] text-center">
                  <Layers className="w-8 h-8 text-[#847E76] mx-auto mb-2" />
                  <p className="font-serif-display text-base font-bold text-[#191817]">
                    No Project Stories published yet
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => openCreateModal('project')}
                      className="mt-3 px-4 py-1.5 text-xs font-semibold bg-[#C85A32] text-[#FAF8F5]"
                    >
                      Start Your First Project Story
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {creatorProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.slug}`)}
                      className="border border-[#E5DFD4] bg-[#FAF8F5] hover:border-[#191817] transition-all cursor-pointer p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono-meta px-2 py-0.5 bg-[#F4EFE6] border border-[#D8D2C5] text-[#57524C]">
                            {p.category}
                          </span>
                          <span className="text-[10px] font-mono-meta bg-[#191817] text-[#FAF8F5] px-1.5 py-0.5">
                            {p.status}
                          </span>
                        </div>
                        <h3 className="font-serif-display text-lg font-bold text-[#191817] mb-1 hover:text-[#C85A32] transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-xs text-[#57524C] line-clamp-2 mb-3">
                          {p.shortSummary}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-[#ECE7DE] flex items-center justify-between text-xs text-[#847E76] font-mono-meta">
                        <span>{p.appreciationsCount} appreciations</span>
                        <span className="text-[#C85A32] font-semibold flex items-center gap-1">
                          Read Story <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Journal Tab */}
          {activeTab === 'journal' && (
            <div>
              {creatorJournals.length === 0 ? (
                <div className="p-12 border border-dashed border-[#D8D2C5] text-center">
                  <BookOpen className="w-8 h-8 text-[#847E76] mx-auto mb-2" />
                  <p className="font-serif-display text-base font-bold text-[#191817]">
                    No journal reflections published yet
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => openCreateModal('journal')}
                      className="mt-3 px-4 py-1.5 text-xs font-semibold bg-[#C85A32] text-[#FAF8F5]"
                    >
                      Write First Reflection
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {creatorJournals.map((j) => (
                    <div
                      key={j.id}
                      onClick={() => navigate(`/journal?id=${j.id}`)}
                      className="p-6 bg-[#FAF8F5] border border-[#E5DFD4] hover:border-[#191817] transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono-meta">
                        <span className="text-[#C85A32] font-bold uppercase">{j.type}</span>
                        <span className="text-[#847E76]">
                          {new Date(j.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-serif-display text-lg font-bold text-[#191817]">
                        {j.title}
                      </h3>
                      <p className="text-xs text-[#57524C] line-clamp-2 leading-relaxed">
                        {j.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} />
    </div>
  );
};
