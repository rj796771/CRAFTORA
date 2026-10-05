import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  ProjectStory,
  ProjectMilestone,
  JournalEntry,
  Comment,
  Appreciation,
  SaveItem,
  Follow,
  CollaborationRequest,
  NotificationItem,
  UserProfile,
} from '../types';
import {
  SEED_PROFILES,
  SEED_PROJECTS,
  SEED_MILESTONES,
  SEED_JOURNALS,
} from '../data/seedData';

// Memory caches combined with real Firestore persistence
let cachedProjects: ProjectStory[] = [...SEED_PROJECTS];
let cachedJournals: JournalEntry[] = [...SEED_JOURNALS];
let cachedMilestones: ProjectMilestone[] = [...SEED_MILESTONES];
let cachedProfiles: UserProfile[] = [...SEED_PROFILES];

// Initialization: sync initial public seed records to Firestore or read from it
export async function initializeCRAFTORAData(): Promise<void> {
  try {
    const storiesRef = collection(db, 'project_stories');
    const snap = await getDocs(query(storiesRef, limit(5)));
    
    if (snap.empty) {
      // Seed Firestore with initial foundational stories so they persist
      console.log('Seeding initial CRAFTORA stories into Firestore...');
      for (const p of SEED_PROJECTS) {
        await setDoc(doc(db, 'project_stories', p.id), p);
      }
      for (const j of SEED_JOURNALS) {
        await setDoc(doc(db, 'journal_entries', j.id), j);
      }
      for (const m of SEED_MILESTONES) {
        await setDoc(doc(db, 'project_milestones', m.id), m);
      }
      for (const pr of SEED_PROFILES) {
        await setDoc(doc(db, 'profiles', pr.userId), pr);
      }
    } else {
      // Read live projects
      const allStoriesSnap = await getDocs(collection(db, 'project_stories'));
      const liveStories: ProjectStory[] = [];
      allStoriesSnap.forEach((d) => liveStories.push(d.data() as ProjectStory));
      if (liveStories.length > 0) {
        cachedProjects = liveStories;
      }

      const allJournalsSnap = await getDocs(collection(db, 'journal_entries'));
      const liveJournals: JournalEntry[] = [];
      allJournalsSnap.forEach((d) => liveJournals.push(d.data() as JournalEntry));
      if (liveJournals.length > 0) {
        cachedJournals = liveJournals;
      }
    }
  } catch (err) {
    console.warn('Firestore initialization notice (using memory fallback if offline):', err);
  }
}

// ==========================================
// PROJECT STORIES
// ==========================================

export async function fetchProjectStories(category?: string, status?: string): Promise<ProjectStory[]> {
  try {
    const colRef = collection(db, 'project_stories');
    const snap = await getDocs(colRef);
    const results: ProjectStory[] = [];
    snap.forEach((d) => results.push(d.data() as ProjectStory));
    
    // Merge or fallback to cached
    const all = results.length > 0 ? results : cachedProjects;
    return all.filter((p) => {
      if (category && category !== 'All' && p.category !== category) return false;
      if (status && status !== 'All' && p.status !== status) return false;
      return p.visibility === 'PUBLIC';
    });
  } catch {
    return cachedProjects.filter((p) => {
      if (category && category !== 'All' && p.category !== category) return false;
      if (status && status !== 'All' && p.status !== status) return false;
      return p.visibility === 'PUBLIC';
    });
  }
}

export async function fetchProjectBySlug(slug: string): Promise<ProjectStory | null> {
  try {
    const colRef = collection(db, 'project_stories');
    const q = query(colRef, where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as ProjectStory;
    }
    // Check by ID as well
    const docSnap = await getDoc(doc(db, 'project_stories', slug));
    if (docSnap.exists()) {
      return docSnap.data() as ProjectStory;
    }
  } catch (err) {
    console.warn('Error fetching project by slug from Firestore, using cache:', err);
  }

  return (
    cachedProjects.find((p) => p.slug === slug || p.id === slug) || null
  );
}

export async function createProjectStory(data: Omit<ProjectStory, 'id' | 'createdAt' | 'appreciationsCount' | 'savesCount' | 'commentsCount'>): Promise<ProjectStory> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to create a project story');

  const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newStory: ProjectStory = {
    ...data,
    id,
    ownerId: user.uid,
    ownerName: data.ownerName || user.displayName || 'Creator',
    ownerUsername: data.ownerUsername || 'creator',
    appreciationsCount: 0,
    savesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'project_stories', id), newStory);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `project_stories/${id}`);
  }

  cachedProjects.unshift(newStory);
  return newStory;
}

export async function updateProjectStory(id: string, updates: Partial<ProjectStory>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to edit project');

  const path = `project_stories/${id}`;
  try {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'project_stories', id), payload);
    cachedProjects = cachedProjects.map((p) => (p.id === id ? { ...p, ...payload } : p));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProjectStory(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to delete project');

  const path = `project_stories/${id}`;
  try {
    await deleteDoc(doc(db, 'project_stories', id));
    cachedProjects = cachedProjects.filter((p) => p.id !== id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// MILESTONES
// ==========================================

export async function fetchMilestones(projectId: string): Promise<ProjectMilestone[]> {
  try {
    const q = query(
      collection(db, 'project_milestones'),
      where('projectId', '==', projectId)
    );
    const snap = await getDocs(q);
    const items: ProjectMilestone[] = [];
    snap.forEach((d) => items.push(d.data() as ProjectMilestone));
    if (items.length > 0) {
      return items.sort((a, b) => a.order - b.order);
    }
  } catch (err) {
    console.warn('Error fetching milestones from Firestore:', err);
  }

  return cachedMilestones
    .filter((m) => m.projectId === projectId)
    .sort((a, b) => a.order - b.order);
}

export async function addProjectMilestone(data: Omit<ProjectMilestone, 'id' | 'createdAt'>): Promise<ProjectMilestone> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to add a milestone');

  const id = `mile_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newMilestone: ProjectMilestone = {
    ...data,
    id,
    ownerId: user.uid,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'project_milestones', id), newMilestone);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `project_milestones/${id}`);
  }

  cachedMilestones.push(newMilestone);
  return newMilestone;
}

// ==========================================
// JOURNAL ENTRIES
// ==========================================

export async function fetchJournalEntries(type?: string): Promise<JournalEntry[]> {
  try {
    const colRef = collection(db, 'journal_entries');
    const snap = await getDocs(colRef);
    const items: JournalEntry[] = [];
    snap.forEach((d) => items.push(d.data() as JournalEntry));
    const all = items.length > 0 ? items : cachedJournals;
    const sorted = [...all].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (type && type !== 'All') {
      return sorted.filter((j) => j.type === type);
    }
    return sorted;
  } catch {
    const sorted = [...cachedJournals].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (type && type !== 'All') {
      return sorted.filter((j) => j.type === type);
    }
    return sorted;
  }
}

export async function createJournalEntry(data: Omit<JournalEntry, 'id' | 'createdAt' | 'appreciationsCount' | 'commentsCount' | 'savesCount'>): Promise<JournalEntry> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to write a journal entry');

  const id = `journ_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newEntry: JournalEntry = {
    ...data,
    id,
    ownerId: user.uid,
    ownerName: data.ownerName || user.displayName || 'Creator',
    ownerUsername: data.ownerUsername || 'creator',
    appreciationsCount: 0,
    commentsCount: 0,
    savesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'journal_entries', id), newEntry);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `journal_entries/${id}`);
  }

  cachedJournals.unshift(newEntry);
  return newEntry;
}

// ==========================================
// COMMENTS & DISCUSSION
// ==========================================

export async function fetchComments(targetId: string): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, 'comments'),
      where('targetId', '==', targetId)
    );
    const snap = await getDocs(q);
    const items: Comment[] = [];
    snap.forEach((d) => items.push(d.data() as Comment));
    return items.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch (err) {
    console.warn('Error fetching comments:', err);
    return [];
  }
}

export async function addComment(data: {
  targetType: 'project' | 'journal';
  targetId: string;
  targetTitle: string;
  content: string;
}): Promise<Comment> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to comment');

  const id = `comm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newComment: Comment = {
    id,
    targetType: data.targetType,
    targetId: data.targetId,
    targetTitle: data.targetTitle,
    authorId: user.uid,
    authorName: user.displayName || 'Creator',
    authorUsername: user.displayName?.toLowerCase().replace(/\s+/g, '') || 'creator',
    authorAvatar: user.photoURL || undefined,
    content: data.content.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'comments', id), newComment);

    // Increment count on target document
    const targetCollection = data.targetType === 'project' ? 'project_stories' : 'journal_entries';
    try {
      await updateDoc(doc(db, targetCollection, data.targetId), {
        commentsCount: increment(1),
      });
    } catch {
      // non-fatal
    }

    return newComment;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `comments/${id}`);
  }
}

export async function deleteComment(commentId: string, targetType: 'project' | 'journal', targetId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to delete comment');

  try {
    await deleteDoc(doc(db, 'comments', commentId));
    const targetCollection = targetType === 'project' ? 'project_stories' : 'journal_entries';
    try {
      await updateDoc(doc(db, targetCollection, targetId), {
        commentsCount: increment(-1),
      });
    } catch {
      // non-fatal
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
  }
}

// ==========================================
// APPRECIATIONS (Sincere reactions)
// ==========================================

export async function checkAppreciation(targetId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const id = `${user.uid}_${targetId}`;
    const snap = await getDoc(doc(db, 'appreciations', id));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function toggleAppreciation(targetId: string, targetType: 'project' | 'journal'): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to appreciate');

  const id = `${user.uid}_${targetId}`;
  const appRef = doc(db, 'appreciations', id);
  const targetCol = targetType === 'project' ? 'project_stories' : 'journal_entries';
  const targetRef = doc(db, targetCol, targetId);

  try {
    const snap = await getDoc(appRef);
    if (snap.exists()) {
      await deleteDoc(appRef);
      try {
        await updateDoc(targetRef, { appreciationsCount: increment(-1) });
      } catch {}
      return false;
    } else {
      const newApp: Appreciation = {
        id,
        userId: user.uid,
        targetId,
        targetType,
        createdAt: new Date().toISOString(),
      };
      await setDoc(appRef, newApp);
      try {
        await updateDoc(targetRef, { appreciationsCount: increment(1) });
      } catch {}
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `appreciations/${id}`);
  }
}

// ==========================================
// SAVES / BOOKMARKS
// ==========================================

export async function checkSaved(targetId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const id = `${user.uid}_${targetId}`;
    const snap = await getDoc(doc(db, 'saves', id));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function toggleSave(targetId: string, targetType: 'project' | 'journal' | 'creator', itemData: SaveItem['itemData']): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to save');

  const id = `${user.uid}_${targetId}`;
  const saveRef = doc(db, 'saves', id);

  try {
    const snap = await getDoc(saveRef);
    if (snap.exists()) {
      await deleteDoc(saveRef);
      if (targetType === 'project') {
        try {
          await updateDoc(doc(db, 'project_stories', targetId), { savesCount: increment(-1) });
        } catch {}
      }
      return false;
    } else {
      const newSave: SaveItem = {
        id,
        userId: user.uid,
        targetId,
        targetType,
        itemData,
        createdAt: new Date().toISOString(),
      };
      await setDoc(saveRef, newSave);
      if (targetType === 'project') {
        try {
          await updateDoc(doc(db, 'project_stories', targetId), { savesCount: increment(1) });
        } catch {}
      }
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `saves/${id}`);
  }
}

export async function fetchUserSaves(): Promise<SaveItem[]> {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(collection(db, 'saves'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const items: SaveItem[] = [];
    snap.forEach((d) => items.push(d.data() as SaveItem));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Error fetching saves:', err);
    return [];
  }
}

// ==========================================
// FOLLOWS
// ==========================================

export async function checkFollowing(creatorId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const id = `${user.uid}_${creatorId}`;
    const snap = await getDoc(doc(db, 'follows', id));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function toggleFollow(creatorId: string, creatorName: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to follow');

  const id = `${user.uid}_${creatorId}`;
  const followRef = doc(db, 'follows', id);

  try {
    const snap = await getDoc(followRef);
    if (snap.exists()) {
      await deleteDoc(followRef);
      return false;
    } else {
      const newFollow: Follow = {
        id,
        followerId: user.uid,
        followedId: creatorId,
        followerName: user.displayName || 'Creator',
        followerUsername: user.displayName?.toLowerCase().replace(/\s+/g, '') || 'creator',
        createdAt: new Date().toISOString(),
      };
      await setDoc(followRef, newFollow);

      // Create notification for followed creator
      try {
        await createNotification({
          recipientId: creatorId,
          type: 'follow',
          title: 'New Follower',
          message: `${user.displayName || 'Someone'} started following your creative journey.`,
          targetUrl: `/u/${user.uid}`,
        });
      } catch {}

      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `follows/${id}`);
  }
}

// ==========================================
// COLLABORATION WORKFLOW
// ==========================================

export async function submitCollaborationRequest(data: {
  projectId: string;
  projectTitle: string;
  projectSlug: string;
  projectOwnerId: string;
  roleWanted: string;
  pitch: string;
  portfolioLinks?: string;
}): Promise<CollaborationRequest> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to request collaboration');

  const id = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const req: CollaborationRequest = {
    id,
    projectId: data.projectId,
    projectTitle: data.projectTitle,
    projectSlug: data.projectSlug,
    projectOwnerId: data.projectOwnerId,
    applicantId: user.uid,
    applicantName: user.displayName || 'Creator',
    applicantUsername: user.displayName?.toLowerCase().replace(/\s+/g, '') || 'creator',
    applicantAvatar: user.photoURL || undefined,
    roleWanted: data.roleWanted.trim(),
    pitch: data.pitch.trim(),
    portfolioLinks: data.portfolioLinks?.trim(),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'collaboration_requests', id), req);

    // Notify the project owner
    try {
      await createNotification({
        recipientId: data.projectOwnerId,
        type: 'collaboration_request',
        title: 'New Collaboration Request',
        message: `${user.displayName || 'A creator'} applied to collaborate as ${data.roleWanted} on ${data.projectTitle}.`,
        targetUrl: `/projects/${data.projectSlug}`,
      });
    } catch {}

    return req;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `collaboration_requests/${id}`);
  }
}

export async function fetchCollaborationRequestsForOwner(): Promise<CollaborationRequest[]> {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(db, 'collaboration_requests'),
      where('projectOwnerId', '==', user.uid)
    );
    const snap = await getDocs(q);
    const items: CollaborationRequest[] = [];
    snap.forEach((d) => items.push(d.data() as CollaborationRequest));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Error fetching collaboration requests:', err);
    return [];
  }
}

export async function updateCollaborationStatus(
  requestId: string,
  newStatus: 'ACCEPTED' | 'REJECTED',
  req: CollaborationRequest
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authorized');

  const path = `collaboration_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'collaboration_requests', requestId), {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    if (newStatus === 'ACCEPTED') {
      // Add collaborator to project story
      const projRef = doc(db, 'project_stories', req.projectId);
      const projSnap = await getDoc(projRef);
      if (projSnap.exists()) {
        const story = projSnap.data() as ProjectStory;
        const currentIds = story.collaboratorIds || [];
        const currentList = story.collaborators || [];

        if (!currentIds.includes(req.applicantId)) {
          await updateDoc(projRef, {
            collaboratorIds: [...currentIds, req.applicantId],
            collaborators: [
              ...currentList,
              {
                userId: req.applicantId,
                name: req.applicantName,
                role: req.roleWanted,
                avatar: req.applicantAvatar,
              },
            ],
          });
        }
      }

      // Notify the applicant
      try {
        await createNotification({
          recipientId: req.applicantId,
          type: 'collaboration_accepted',
          title: 'Collaboration Proposal Accepted',
          message: `Your request to collaborate on ${req.projectTitle} was accepted! Welcome to the team.`,
          targetUrl: `/projects/${req.projectSlug}`,
        });
      } catch {}
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export async function createNotification(data: {
  recipientId: string;
  type: NotificationItem['type'];
  title: string;
  message: string;
  targetUrl: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  if (data.recipientId === user.uid) return; // Do not notify oneself

  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const notif: NotificationItem = {
    id,
    recipientId: data.recipientId,
    actorId: user.uid,
    actorName: user.displayName || 'A creator',
    actorAvatar: user.photoURL || undefined,
    type: data.type,
    title: data.title,
    message: data.message,
    targetUrl: data.targetUrl,
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'notifications', id), notif);
  } catch (error) {
    console.warn('Notification write notice:', error);
  }
}

export function subscribeNotifications(
  callback: (notifs: NotificationItem[]) => void
): () => void {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'notifications'),
    where('recipientId', '==', user.uid)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items: NotificationItem[] = [];
      snap.forEach((d) => items.push(d.data() as NotificationItem));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'notifications');
    }
  );
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (err) {
    console.warn('Error marking notification read:', err);
  }
}

export async function markAllNotificationsAsRead(notifIds: string[]): Promise<void> {
  for (const id of notifIds) {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch {}
  }
}

// ==========================================
// CREATOR PROFILES
// ==========================================

export async function fetchProfileByUsernameOrId(identifier: string): Promise<UserProfile | null> {
  try {
    // Try by userId
    const docSnap = await getDoc(doc(db, 'profiles', identifier));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }

    // Try by username
    const q = query(collection(db, 'profiles'), where('username', '==', identifier), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error fetching profile from Firestore:', err);
  }

  return (
    cachedProfiles.find(
      (p) => p.userId === identifier || p.username.toLowerCase() === identifier.toLowerCase()
    ) || null
  );
}

export async function fetchFeaturedCreators(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'profiles'));
    const items: UserProfile[] = [];
    snap.forEach((d) => items.push(d.data() as UserProfile));
    return items.length > 0 ? items : cachedProfiles;
  } catch {
    return cachedProfiles;
  }
}
