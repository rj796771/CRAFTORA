import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  FolderGit2,
  BookOpen,
  Users2,
  Plus,
  Bookmark,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/dataService';
import { NotificationItem } from '../types';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openCreateModal: (type: 'project' | 'journal' | 'milestone') => void;
  openSearchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  navigate,
  openCreateModal,
  openSearchModal,
}) => {
  const { user, profile, signInWithGoogle, signOutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const createRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const unsubscribe = subscribeNotifications((notifs) => {
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [user]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setCreateDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { label: 'HOME', route: '/' },
    { label: 'EXPLORE', route: '/explore' },
    { label: 'PROJECTS', route: '/projects' },
    { label: 'JOURNAL', route: '/journal' },
    { label: 'COLLABORATE', route: '/collaborate' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E5DFD4] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group text-left focus:outline-none"
              aria-label="CRAFTORA Home"
            >
              <span className="font-serif-display text-2xl font-bold tracking-tight text-[#191817] group-hover:text-[#C85A32] transition-colors">
                CRAFTORA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] mb-1" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive =
                  link.route === '/'
                    ? currentRoute === '/'
                    : currentRoute.startsWith(link.route);
                return (
                  <button
                    key={link.label}
                    onClick={() => navigate(link.route)}
                    className={`px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors ${
                      isActive
                        ? 'text-[#C85A32] border-b-2 border-[#C85A32]'
                        : 'text-[#57524C] hover:text-[#191817]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Action Center */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Button */}
            <button
              onClick={openSearchModal}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#57524C] bg-[#F4EFE6] hover:bg-[#EFE9DD] border border-[#E5DFD4] transition-colors rounded-none"
              title="Search CRAFTORA (Press ⌘K or /)"
              aria-label="Search projects, creators, tools"
            >
              <Search className="w-3.5 h-3.5 text-[#847E76]" />
              <span className="hidden sm:inline">Search projects & craft...</span>
              <kbd className="hidden lg:inline text-[10px] font-mono-meta bg-[#FAF8F5] px-1.5 py-0.5 border border-[#D8D2C5] text-[#847E76]">
                /
              </kbd>
            </button>

            {/* Saved Work Link */}
            {user && (
              <button
                onClick={() => navigate('/saved')}
                className={`p-2 text-[#57524C] hover:text-[#191817] hover:bg-[#F4EFE6] transition-colors ${
                  currentRoute === '/saved' ? 'text-[#C85A32]' : ''
                }`}
                title="Saved Work"
                aria-label="View saved items"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            )}

            {/* Notifications Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 text-[#57524C] hover:text-[#191817] hover:bg-[#F4EFE6] transition-colors relative"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C85A32]" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FAF8F5] border border-[#E5DFD4] shadow-lg z-50 p-0 text-left">
                    <div className="p-3 border-b border-[#E5DFD4] flex items-center justify-between bg-[#F4EFE6]">
                      <span className="text-xs font-semibold tracking-wider text-[#191817]">
                        NOTIFICATIONS {unreadCount > 0 && `(${unreadCount})`}
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            markAllNotificationsAsRead(notifications.map((n) => n.id));
                          }}
                          className="text-[11px] text-[#C85A32] hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#ECE7DE]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#847E76]">
                          No notifications yet. When someone appreciates, comments, or requests to collaborate on your work, you will see it here.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.targetUrl) navigate(notif.targetUrl);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3 text-xs hover:bg-[#F4EFE6] cursor-pointer transition-colors ${
                              !notif.read ? 'bg-[#F9F4EC]' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-[#191817]">
                                {notif.title}
                              </span>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[#57524C] mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] font-mono-meta text-[#847E76] mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create Dropdown */}
            {user ? (
              <div className="relative" ref={createRef}>
                <button
                  onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#C85A32] hover:bg-[#AE4B26] text-[#FAF8F5] transition-colors"
                  aria-label="Create something new"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">CREATE</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>

                {createDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#FAF8F5] border border-[#E5DFD4] shadow-lg z-50 divide-y divide-[#ECE7DE]">
                    <button
                      onClick={() => {
                        setCreateDropdownOpen(false);
                        openCreateModal('project');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#191817] hover:bg-[#F4EFE6] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-[#191817]">Project Story</div>
                        <div className="text-[11px] text-[#847E76]">Document what you created & solved</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setCreateDropdownOpen(false);
                        openCreateModal('journal');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#191817] hover:bg-[#F4EFE6] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-[#191817]">Journal Entry</div>
                        <div className="text-[11px] text-[#847E76]">Share a reflection, lesson or question</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setCreateDropdownOpen(false);
                        openCreateModal('milestone');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#191817] hover:bg-[#F4EFE6] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-[#191817]">Add Milestone</div>
                        <div className="text-[11px] text-[#847E76]">Log progress on an existing story</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Auth Button or User Menu */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-label="User Profile"
                >
                  <img
                    src={
                      profile?.avatarUrl ||
                      user.photoURL ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                    }
                    alt={profile?.displayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-[#D8D2C5]"
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#FAF8F5] border border-[#E5DFD4] shadow-lg z-50 divide-y divide-[#ECE7DE]">
                    <div className="p-3 bg-[#F4EFE6]">
                      <div className="font-semibold text-xs text-[#191817] truncate">
                        {profile?.displayName || user.displayName}
                      </div>
                      <div className="text-[11px] text-[#847E76] font-mono-meta truncate">
                        @{profile?.username || 'creator'}
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate(`/u/${profile?.username || user.uid}`);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#191817] hover:bg-[#F4EFE6] flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#57524C]" />
                        My Creator Profile
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/saved');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#191817] hover:bg-[#F4EFE6] flex items-center gap-2"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#57524C]" />
                        Saved Work
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          await signOutUser();
                          navigate('/');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#C85A32] hover:bg-[#F4EFE6] flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-3.5 py-1.5 text-xs font-semibold tracking-wide border border-[#191817] text-[#191817] hover:bg-[#191817] hover:text-[#FAF8F5] transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#57524C] hover:text-[#191817]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5DFD4] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  navigate(link.route);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 px-2 text-sm font-semibold tracking-wider ${
                  currentRoute === link.route ? 'text-[#C85A32]' : 'text-[#57524C]'
                }`}
              >
                {link.label}
              </button>
            ))}
            {user && (
              <button
                onClick={() => {
                  navigate(`/u/${profile?.username || user.uid}`);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-2 text-sm font-semibold tracking-wider text-[#57524C]"
              >
                MY PROFILE
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
};
