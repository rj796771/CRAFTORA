import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { CreateModal } from './components/CreateModal';

import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectStoryPage } from './pages/ProjectStoryPage';
import { JournalPage } from './pages/JournalPage';
import { CollaboratePage } from './pages/CollaboratePage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import { SavedPage } from './pages/SavedPage';
import { NotFoundPage } from './pages/NotFoundPage';

import {
  initializeCRAFTORAData,
  fetchProjectStories,
  fetchJournalEntries,
  fetchFeaturedCreators,
} from './services/dataService';
import { ProjectStory, JournalEntry, UserProfile } from './types';

function MainApp() {
  const { user, profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [projects, setProjects] = useState<ProjectStory[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [creators, setCreators] = useState<UserProfile[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Global modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<'project' | 'journal' | 'milestone' | null>(null);

  // Load all initial public collections and sync seed data if initial
  const refreshData = useCallback(async () => {
    try {
      await initializeCRAFTORAData();
      const [allProjects, allJournals, allCreators] = await Promise.all([
        fetchProjectStories(),
        fetchJournalEntries(),
        fetchFeaturedCreators(),
      ]);
      setProjects(allProjects);
      setJournals(allJournals);
      setCreators(allCreators);
    } catch (err) {
      console.warn('Data sync notice:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut for search: `/` or `⌘K`
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !searchModalOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setSearchModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen]);

  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const renderCurrentView = () => {
    const path = currentRoute.split('?')[0];

    // Project Details: /projects/:slug
    if (path.startsWith('/projects/') && path.length > '/projects/'.length) {
      const slug = path.replace('/projects/', '');
      return (
        <ProjectStoryPage
          slug={slug}
          navigate={navigate}
          openCreateModal={(type) => setCreateModalType(type)}
        />
      );
    }

    // Creator Profile: /u/:username
    if (path.startsWith('/u/') && path.length > '/u/'.length) {
      const username = path.replace('/u/', '');
      return (
        <CreatorProfilePage
          identifier={username}
          navigate={navigate}
          openCreateModal={(type) => setCreateModalType(type)}
        />
      );
    }

    // Projects index: /projects
    if (path === '/projects') {
      return (
        <ProjectsPage
          projects={projects}
          navigate={navigate}
          openCreateModal={(type) => setCreateModalType(type)}
        />
      );
    }

    // Explore: /explore
    if (path === '/explore') {
      return (
        <ExplorePage
          projects={projects}
          creators={creators}
          journals={journals}
          navigate={navigate}
        />
      );
    }

    // Journal: /journal
    if (path === '/journal') {
      const urlParams = new URLSearchParams(window.location.search);
      const selectedId = urlParams.get('id');
      return (
        <JournalPage
          initialSelectedId={selectedId}
          navigate={navigate}
          openCreateModal={(type) => setCreateModalType(type)}
        />
      );
    }

    // Collaborate: /collaborate
    if (path === '/collaborate') {
      return (
        <CollaboratePage
          navigate={navigate}
          openCreateModal={(type) => setCreateModalType(type)}
        />
      );
    }

    // Saved items: /saved
    if (path === '/saved') {
      return <SavedPage navigate={navigate} />;
    }

    // Home: /
    if (path === '/' || path === '') {
      return (
        <HomePage
          projects={projects}
          journals={journals}
          creators={creators}
          navigate={navigate}
          openCreateModal={(type) => setCreateModalType(type)}
        />
      );
    }

    // Fallback 404
    return <NotFoundPage navigate={navigate} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-[#191817]">
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        openCreateModal={(type) => setCreateModalType(type)}
        openSearchModal={() => setSearchModalOpen(true)}
      />

      <main className="flex-1">{renderCurrentView()}</main>

      <Footer navigate={navigate} />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        navigate={navigate}
      />

      {/* Global Creation Modal */}
      <CreateModal
        type={createModalType}
        onClose={() => setCreateModalType(null)}
        onSuccess={(targetRoute) => {
          setCreateModalType(null);
          refreshData();
          if (targetRoute) navigate(targetRoute);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
