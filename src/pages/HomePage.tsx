import React from 'react';
import {
  ArrowRight,
  Sparkles,
  GitBranch,
  BookOpen,
  Users2,
  Layers,
  Handshake,
  CheckCircle2,
  Terminal,
  Compass,
} from 'lucide-react';
import { ProjectStory, JournalEntry, UserProfile } from '../types';

interface HomePageProps {
  projects: ProjectStory[];
  journals: JournalEntry[];
  creators: UserProfile[];
  navigate: (route: string) => void;
  openCreateModal: (type: 'project' | 'journal') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  projects,
  journals,
  creators,
  navigate,
  openCreateModal,
}) => {
  const featuredProjects = projects.filter((p) => p.isFeatured).slice(0, 4);
  const recentProjects = projects.slice(0, 4);
  const recentJournals = journals.slice(0, 3);
  const collaborationProjects = projects.filter((p) => p.lookingForCollaborators).slice(0, 3);
  const spotlightCreators = creators.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* ======================================================== */}
      {/* HERO SECTION */}
      {/* ======================================================== */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#E5DFD4] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4EFE6] border border-[#E5DFD4] text-xs font-mono-meta tracking-wider text-[#57524C]">
                <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                THE WORK BEHIND WHAT WE MAKE
              </div>

              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#191817] leading-[1.08]">
                MAKE SOMETHING.<br />
                <span className="italic font-normal text-[#C85A32]">TELL THE STORY.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#57524C] max-w-xl leading-relaxed">
                CRAFTORA gives your projects a place to evolve from first idea to finished work. Document the prototypes, the architectural dead-ends, the solutions, and what you learned along the way.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => openCreateModal('project')}
                  className="px-6 py-3 text-xs font-semibold tracking-wider bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-all flex items-center gap-2 shadow-sm"
                >
                  START A PROJECT STORY
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/explore')}
                  className="px-6 py-3 text-xs font-semibold tracking-wider border border-[#191817] text-[#191817] hover:bg-[#F4EFE6] transition-all"
                >
                  EXPLORE PROJECTS
                </button>
              </div>

              {/* Philosophy Micro-Statement */}
              <div className="pt-6 border-t border-[#ECE7DE] grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-mono-meta text-[#847E76] block text-[10px]">PHILOSOPHY</span>
                  <span className="font-medium text-[#191817] mt-0.5 block">Show the process</span>
                </div>
                <div>
                  <span className="font-mono-meta text-[#847E76] block text-[10px]">CONTENT</span>
                  <span className="font-medium text-[#191817] mt-0.5 block">Zero superficial posts</span>
                </div>
                <div>
                  <span className="font-mono-meta text-[#847E76] block text-[10px]">COMMUNITY</span>
                  <span className="font-medium text-[#191817] mt-0.5 block">True collaboration</span>
                </div>
              </div>
            </div>

            {/* Right Editorial Hero Composition */}
            <div className="lg:col-span-5">
              <div className="relative border border-[#E5DFD4] bg-[#F4EFE6] p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4] text-xs font-mono-meta text-[#847E76]">
                  <span>FEATURED CASE ARCHIVE</span>
                  <span className="text-[#C85A32] font-semibold">STAGE: RELEASED</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="text-xl font-serif-display font-bold text-[#191817]">
                    MOTIONKIT Design System
                  </div>
                  <p className="text-xs text-[#57524C] leading-relaxed">
                    &quot;We audited 140+ screens across four student engineering repositories, consolidating 18 arbitrary button states down to 4 foundational primitives with mathematical spring curves.&quot;
                  </p>

                  <div className="p-3 bg-[#FAF8F5] border border-[#ECE7DE] space-y-1.5 font-mono-meta text-[11px] text-[#57524C]">
                    <div className="flex items-center justify-between text-[#847E76]">
                      <span>TOKEN VERIFICATION</span>
                      <span className="text-[#56725F]">PASS (100% PARITY)</span>
                    </div>
                    <div className="text-xs text-[#191817]">
                      --motion-editorial: 280ms cubic-bezier(0.16, 1, 0.3, 1)
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                        alt="Maya Chen"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-[#191817]">Maya Chen</span>
                    </div>
                    <button
                      onClick={() => navigate('/projects/motionkit-design-system')}
                      className="text-xs font-semibold text-[#C85A32] hover:underline flex items-center gap-1"
                    >
                      Read Project Story <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 1: FEATURED PROJECT STORIES */}
      {/* ======================================================== */}
      <section className="py-16 md:py-20 border-b border-[#E5DFD4] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E5DFD4]">
            <div>
              <span className="text-xs font-mono-meta tracking-wider text-[#C85A32] block mb-1">
                CURATED CASE STUDIES
              </span>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#191817]">
                Featured Project Stories
              </h2>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="mt-3 sm:mt-0 text-xs font-semibold tracking-wider text-[#191817] hover:text-[#C85A32] flex items-center gap-1.5"
            >
              VIEW ALL STORIES <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredProjects.map((project, idx) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.slug}`)}
                className="group cursor-pointer border border-[#E5DFD4] bg-[#FAF8F5] hover:border-[#191817] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#F4EFE6] border-b border-[#E5DFD4]">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono-meta uppercase tracking-wider bg-[#FAF8F5]/95 text-[#191817] border border-[#E5DFD4]">
                        {project.category}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono-meta uppercase tracking-wider bg-[#191817]/90 text-[#FAF8F5]">
                        {project.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={project.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={project.ownerName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-[#57524C]">
                        {project.ownerName}
                      </span>
                    </div>

                    <h3 className="font-serif-display text-xl font-bold text-[#191817] group-hover:text-[#C85A32] transition-colors mb-2">
                      {project.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#57524C] leading-relaxed line-clamp-3 mb-4">
                      {project.shortSummary}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {project.tools?.slice(0, 4).map((tool) => (
                        <span
                          key={tool}
                          className="px-2 py-0.5 text-[11px] font-mono-meta bg-[#F4EFE6] border border-[#E5DFD4] text-[#57524C]"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 border-t border-[#ECE7DE] bg-[#F4EFE6]/50 flex items-center justify-between text-xs text-[#847E76] font-mono-meta">
                  <span>{project.appreciationsCount} appreciations</span>
                  <span className="text-[#C85A32] group-hover:underline flex items-center gap-1 font-semibold">
                    Read Story <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: FROM THE JOURNAL */}
      {/* ======================================================== */}
      <section className="py-16 md:py-20 border-b border-[#E5DFD4] bg-[#F4EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E5DFD4]">
            <div>
              <span className="text-xs font-mono-meta tracking-wider text-[#56725F] block mb-1">
                HONEST REFLECTIONS & LESSONS
              </span>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#191817]">
                From the Journal
              </h2>
            </div>
            <button
              onClick={() => navigate('/journal')}
              className="mt-3 sm:mt-0 text-xs font-semibold tracking-wider text-[#191817] hover:text-[#C85A32] flex items-center gap-1.5"
            >
              BROWSE ALL JOURNAL REFLECTIONS <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentJournals.map((entry) => (
              <div
                key={entry.id}
                onClick={() => navigate(`/journal?id=${entry.id}`)}
                className="p-6 bg-[#FAF8F5] border border-[#E5DFD4] hover:border-[#191817] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono-meta uppercase tracking-wider text-[#C85A32] font-semibold">
                      {entry.type}
                    </span>
                    <span className="text-[10px] font-mono-meta text-[#847E76]">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#191817] mb-2 leading-snug hover:text-[#C85A32] transition-colors">
                    {entry.title}
                  </h3>

                  <p className="text-xs text-[#57524C] leading-relaxed line-clamp-4 mb-4">
                    {entry.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#ECE7DE] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={entry.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={entry.ownerName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-[#191817]">
                      {entry.ownerName}
                    </span>
                  </div>
                  {entry.projectTitle && (
                    <span className="text-[11px] text-[#847E76] font-mono-meta truncate max-w-[120px]">
                      ↳ {entry.projectTitle}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: PEOPLE MAKING INTERESTING THINGS */}
      {/* ======================================================== */}
      <section className="py-16 md:py-20 border-b border-[#E5DFD4] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 pb-4 border-b border-[#E5DFD4]">
            <span className="text-xs font-mono-meta tracking-wider text-[#C85A32] block mb-1">
              CREATORS & BUILDERS
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#191817]">
              People Making Interesting Things
            </h2>
            <p className="text-xs sm:text-sm text-[#57524C] mt-1">
              Discovered through their craft, technical explorations, and working open-source journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {spotlightCreators.map((creator) => (
              <div
                key={creator.userId}
                onClick={() => navigate(`/u/${creator.username}`)}
                className="p-5 border border-[#E5DFD4] bg-[#F4EFE6]/40 hover:bg-[#F4EFE6] hover:border-[#191817] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.displayName}
                      className="w-12 h-12 rounded-full object-cover border border-[#D8D2C5]"
                    />
                    <div>
                      <h4 className="font-serif-display font-bold text-sm text-[#191817] hover:text-[#C85A32] transition-colors">
                        {creator.displayName}
                      </h4>
                      <span className="text-[11px] font-mono-meta text-[#847E76]">
                        @{creator.username}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#57524C] leading-relaxed mb-4 line-clamp-2">
                    {creator.identityStatement}
                  </p>

                  {creator.currently?.workingOn && (
                    <div className="p-2.5 bg-[#FAF8F5] border border-[#E5DFD4] text-[11px]">
                      <span className="text-[10px] font-mono-meta text-[#847E76] block">
                        CURRENTLY WORKING ON:
                      </span>
                      <span className="text-[#191817] font-medium block mt-0.5 line-clamp-1">
                        {creator.currently.workingOn}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-4 border-t border-[#ECE7DE] flex items-center justify-between text-xs text-[#C85A32] font-semibold">
                  <span>View Story & Focus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: COLLABORATION OPPORTUNITIES */}
      {/* ======================================================== */}
      <section className="py-16 md:py-20 border-b border-[#E5DFD4] bg-[#F4EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E5DFD4]">
            <div>
              <span className="text-xs font-mono-meta tracking-wider text-[#C85A32] block mb-1">
                SEEKING CONTRIBUTORS
              </span>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#191817]">
                Collaboration Opportunities
              </h2>
            </div>
            <button
              onClick={() => navigate('/collaborate')}
              className="mt-3 sm:mt-0 text-xs font-semibold tracking-wider text-[#191817] hover:text-[#C85A32] flex items-center gap-1.5"
            >
              EXPLORE ALL ROLES <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collaborationProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-6 bg-[#FAF8F5] border border-[#E5DFD4] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono-meta px-2 py-0.5 bg-[#F4EFE6] border border-[#D8D2C5] text-[#57524C]">
                      {proj.category}
                    </span>
                    <span className="text-[11px] font-mono-meta text-[#56725F] font-medium">
                      {proj.collaborationDuration || 'Flexible'}
                    </span>
                  </div>

                  <h3 className="font-serif-display text-lg font-bold text-[#191817] mb-1">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-[#57524C] line-clamp-2 mb-4">
                    {proj.shortSummary}
                  </p>

                  <div className="p-3 bg-[#F4EFE6] border border-[#E5DFD4] space-y-2 mb-4">
                    <div>
                      <span className="text-[10px] font-mono-meta text-[#847E76] block">
                        LOOKING FOR:
                      </span>
                      <span className="text-xs font-bold text-[#191817]">
                        {proj.collaborationRole || 'Contributor'}
                      </span>
                    </div>

                    {proj.collaborationSkills && (
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
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/projects/${proj.slug}`)}
                  className="w-full py-2 text-xs font-semibold bg-[#191817] hover:bg-[#C85A32] text-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  View & Request to Join
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5: HOW CRAFTORA WORKS */}
      {/* ======================================================== */}
      <section className="py-16 md:py-20 border-b border-[#E5DFD4] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono-meta tracking-wider text-[#C85A32] block mb-1">
              THE WORKFLOW
            </span>
            <h2 className="font-serif-display text-3xl font-bold text-[#191817]">
              How CRAFTORA Works
            </h2>
            <p className="text-xs sm:text-sm text-[#57524C] mt-2">
              A place to document work that resists superficial portfolio gloss.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 border border-[#E5DFD4] bg-[#F4EFE6]/50">
              <span className="font-mono-meta text-2xl font-bold text-[#C85A32] block mb-2">01</span>
              <h3 className="font-serif-display text-lg font-bold text-[#191817] mb-1">Start</h3>
              <p className="text-xs text-[#57524C] leading-relaxed">
                Initialize a Project Story as a concept, exploration, or active prototype. No need to wait for a launch.
              </p>
            </div>

            <div className="p-6 border border-[#E5DFD4] bg-[#F4EFE6]/50">
              <span className="font-mono-meta text-2xl font-bold text-[#C85A32] block mb-2">02</span>
              <h3 className="font-serif-display text-lg font-bold text-[#191817] mb-1">Document</h3>
              <p className="text-xs text-[#57524C] leading-relaxed">
                Record the milestones, tests, and constraints. Share the problems you wrestled with and the trade-offs you chose.
              </p>
            </div>

            <div className="p-6 border border-[#E5DFD4] bg-[#F4EFE6]/50">
              <span className="font-mono-meta text-2xl font-bold text-[#C85A32] block mb-2">03</span>
              <h3 className="font-serif-display text-lg font-bold text-[#191817] mb-1">Refine</h3>
              <p className="text-xs text-[#57524C] leading-relaxed">
                Publish reflections in your Journal. Receive feedback and find collaborators who respect your methodology.
              </p>
            </div>

            <div className="p-6 border border-[#E5DFD4] bg-[#F4EFE6]/50">
              <span className="font-mono-meta text-2xl font-bold text-[#C85A32] block mb-2">04</span>
              <h3 className="font-serif-display text-lg font-bold text-[#191817] mb-1">Share</h3>
              <p className="text-xs text-[#57524C] leading-relaxed">
                A permanent, searchable record of your genuine creative and technical capability that speaks for itself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FINAL CALL TO ACTION */}
      {/* ======================================================== */}
      <section className="py-20 bg-[#F4EFE6] text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#191817] mb-4">
            Document something you&apos;re building.
          </h2>
          <p className="text-sm sm:text-base text-[#57524C] mb-8 leading-relaxed">
            Whether it&apos;s a design system, a climate map, an embedded sensor, or an experimental synthesizer, your process has value.
          </p>
          <button
            onClick={() => openCreateModal('project')}
            className="px-8 py-3.5 text-xs font-semibold tracking-wider bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-all shadow-sm"
          >
            START A PROJECT STORY
          </button>
        </div>
      </section>
    </div>
  );
};
