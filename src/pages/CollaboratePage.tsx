import React, { useState, useEffect } from 'react';
import {
  Handshake,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  fetchProjectStories,
  fetchCollaborationRequestsForOwner,
  updateCollaborationStatus,
} from '../services/dataService';
import { ProjectStory, CollaborationRequest } from '../types';
import { CollaborateModal } from '../components/CollaborateModal';

interface CollaboratePageProps {
  navigate: (route: string) => void;
  openCreateModal: (type: 'project') => void;
}

export const CollaboratePage: React.FC<CollaboratePageProps> = ({
  navigate,
  openCreateModal,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'opportunities' | 'requests'>('opportunities');
  const [projects, setProjects] = useState<ProjectStory[]>([]);
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Proposal modal
  const [selectedProject, setSelectedProject] = useState<ProjectStory | null>(null);
  const [collabModalOpen, setCollabModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const all = await fetchProjectStories();
    setProjects(all.filter((p) => p.lookingForCollaborators));

    if (user) {
      const incoming = await fetchCollaborationRequestsForOwner();
      setRequests(incoming);
    } else {
      setRequests([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateStatus = async (
    requestId: string,
    newStatus: 'ACCEPTED' | 'REJECTED',
    req: CollaborationRequest
  ) => {
    try {
      await updateCollaborationStatus(requestId, newStatus, req);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
      showToast(
        newStatus === 'ACCEPTED'
          ? 'Collaboration proposal accepted! Member added to project.'
          : 'Proposal declined.',
        'info'
      );
    } catch (err: any) {
      showToast('Failed to update status: ' + (err.message || 'Error'), 'error');
    }
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen pb-24 bg-[#FAF8F5]">
      {/* Header Banner */}
      <section className="py-12 border-b border-[#E5DFD4] bg-[#F4EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono-meta tracking-wider text-[#C85A32] block mb-1">
              OPEN CREATIVE ROLES
            </span>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#191817]">
              Collaborate
            </h1>
            <p className="text-xs sm:text-sm text-[#57524C] mt-1 leading-relaxed">
              Find serious partners to help build and refine projects, or review applications from creators who want to join your team.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-[#E5DFD4] bg-[#FAF8F5] sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-3.5 text-xs font-semibold tracking-wider border-b-2 transition-colors ${
              activeTab === 'opportunities'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#57524C] hover:text-[#191817]'
            }`}
          >
            OPEN OPPORTUNITIES ({projects.length})
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-3.5 text-xs font-semibold tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'border-[#C85A32] text-[#C85A32]'
                  : 'border-transparent text-[#57524C] hover:text-[#191817]'
              }`}
            >
              <span>APPLICATIONS TO MY PROJECTS</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono-meta bg-[#C85A32] text-[#FAF8F5]">
                  {pendingRequestsCount} PENDING
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="py-16 text-center text-xs font-mono-meta text-[#847E76] animate-pulse">
            Loading collaboration workspace...
          </div>
        ) : activeTab === 'opportunities' ? (
          <div>
            {projects.length === 0 ? (
              <div className="p-16 border border-dashed border-[#D8D2C5] text-center my-8">
                <Handshake className="w-8 h-8 text-[#847E76] mx-auto mb-2" />
                <p className="font-serif-display text-base font-bold text-[#191817]">
                  No active collaboration calls open right now
                </p>
                <p className="text-xs text-[#847E76] mt-1 mb-4">
                  Have a project story that needs a contributor? Enable &quot;Open for Collaboration&quot; in your project story.
                </p>
                <button
                  onClick={() => openCreateModal('project')}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#191817] text-[#FAF8F5]"
                >
                  Create a Project Story
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="border border-[#E5DFD4] bg-[#FAF8F5] p-6 flex flex-col justify-between hover:border-[#191817] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono-meta px-2 py-0.5 bg-[#F4EFE6] border border-[#D8D2C5] text-[#57524C]">
                          {proj.category}
                        </span>
                        <span className="text-[11px] font-mono-meta text-[#56725F] font-semibold">
                          {proj.collaborationDuration || 'Flexible timeframe'}
                        </span>
                      </div>

                      <h3 className="font-serif-display text-xl font-bold text-[#191817] mb-1">
                        {proj.title}
                      </h3>

                      <div className="text-xs text-[#847E76] mb-3">
                        Created by {proj.ownerName}
                      </div>

                      <p className="text-xs text-[#57524C] line-clamp-3 mb-4 leading-relaxed">
                        {proj.shortSummary}
                      </p>

                      <div className="p-3.5 bg-[#F4EFE6] border border-[#E5DFD4] space-y-2 mb-4">
                        <div>
                          <span className="text-[10px] font-mono-meta text-[#847E76] uppercase tracking-wider block">
                            ROLE SOUGHT:
                          </span>
                          <span className="text-xs font-bold text-[#191817]">
                            {proj.collaborationRole || 'Contributor'}
                          </span>
                        </div>

                        {proj.collaborationSkills && (
                          <div>
                            <span className="text-[10px] font-mono-meta text-[#847E76] block mb-1">
                              DESIRED SKILLS:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {proj.collaborationSkills.map((sk) => (
                                <span
                                  key={sk}
                                  className="text-[10px] px-1.5 py-0.2 bg-[#FAF8F5] border border-[#D8D2C5] text-[#57524C]"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedProject(proj);
                          setCollabModalOpen(true);
                        }}
                        className="w-full py-2 text-xs font-semibold bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Apply to Collaborate
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${proj.slug}`)}
                        className="w-full py-1.5 text-xs text-[#57524C] hover:text-[#191817] flex items-center justify-center gap-1"
                      >
                        Read Full Story <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: INCOMING REQUESTS */
          <div className="max-w-4xl space-y-4">
            {requests.length === 0 ? (
              <div className="p-16 border border-dashed border-[#D8D2C5] text-center my-8">
                <p className="font-serif-display text-base font-bold text-[#191817]">
                  No incoming collaboration proposals
                </p>
                <p className="text-xs text-[#847E76] mt-1">
                  When other creators apply to help on your open project stories, their proposals and pitches will show up here.
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="p-6 bg-[#FAF8F5] border border-[#E5DFD4] space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#ECE7DE]">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.applicantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={req.applicantName}
                        className="w-8 h-8 rounded-full object-cover border border-[#D8D2C5]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#191817]">
                          {req.applicantName}{' '}
                          <span className="text-[#847E76] font-mono-meta font-normal">
                            @{req.applicantUsername}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#57524C]">
                          Applied for: <span className="font-semibold text-[#191817]">{req.roleWanted}</span> on{' '}
                          <span className="font-semibold text-[#C85A32]">{req.projectTitle}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono-meta uppercase tracking-wider font-semibold ${
                          req.status === 'ACCEPTED'
                            ? 'bg-[#EFF4F0] text-[#56725F]'
                            : req.status === 'REJECTED'
                            ? 'bg-[#FDF4F2] text-[#93301B]'
                            : 'bg-[#F4EFE6] text-[#C85A32]'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-[11px] font-mono-meta text-[#847E76]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F4EFE6] border border-[#E5DFD4] text-xs space-y-2">
                    <span className="text-[10px] font-mono-meta text-[#847E76] uppercase tracking-wider block">
                      APPLICANT&apos;S PITCH & EXPERIENCE:
                    </span>
                    <p className="text-[#191817] leading-relaxed whitespace-pre-line">
                      {req.pitch}
                    </p>
                    {req.portfolioLinks && (
                      <div className="pt-2 text-[11px] font-mono-meta">
                        <span className="text-[#847E76]">Links: </span>
                        <a
                          href={req.portfolioLinks}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C85A32] hover:underline"
                        >
                          {req.portfolioLinks}
                        </a>
                      </div>
                    )}
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'REJECTED', req)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-[#847E76] hover:text-[#93301B] border border-[#D8D2C5]"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'ACCEPTED', req)}
                        className="px-4 py-1.5 text-xs font-semibold bg-[#56725F] hover:bg-[#3F5747] text-[#FAF8F5] transition-colors"
                      >
                        Accept Collaborator
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Collaboration Modal */}
      <CollaborateModal
        project={selectedProject}
        isOpen={collabModalOpen}
        onClose={() => setCollabModalOpen(false)}
        onSuccess={() => {
          showToast('Collaboration request submitted!', 'success');
        }}
      />
    </div>
  );
};
