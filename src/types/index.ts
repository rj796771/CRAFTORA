export type CreatorType =
  | 'Developer'
  | 'Designer'
  | 'Researcher'
  | 'Founder'
  | 'Engineer'
  | 'Creator'
  | 'Student';

export type ProjectStatus =
  | 'CONCEPT'
  | 'EXPLORING'
  | 'IN DEVELOPMENT'
  | 'TESTING'
  | 'RELEASED'
  | 'PAUSED'
  | 'ARCHIVED';

export type MilestoneStage =
  | 'IDEA'
  | 'RESEARCH'
  | 'FIRST PROTOTYPE'
  | 'ITERATION'
  | 'TESTING'
  | 'RELEASE';

export type JournalType =
  | 'Reflection'
  | 'Lesson'
  | 'Case Study'
  | 'Question'
  | 'Experiment'
  | 'Announcement';

export type ProjectVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

export type CollaborationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface CreatorFocus {
  exploring?: string;
  workingOn?: string;
  learning?: string;
  openTo?: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  username: string;
  identityStatement?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  websiteUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  creatorType?: CreatorType;
  currently?: CreatorFocus;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectCollaborator {
  userId: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface ProjectStory {
  id: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  ownerUsername: string;
  ownerAvatar?: string;
  title: string;
  shortSummary: string;
  category: string;
  status: ProjectStatus;
  coverImage?: string;
  overview?: string;
  problem?: string;
  approach?: string;
  process?: string;
  outcome?: string;
  lessonsLearned?: string[];
  futureImprovements?: string;
  tools?: string[];
  liveUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  collaboratorIds?: string[];
  collaborators?: ProjectCollaborator[];
  lookingForCollaborators?: boolean;
  collaborationRole?: string;
  collaborationDuration?: string;
  collaborationSkills?: string[];
  appreciationsCount: number;
  savesCount: number;
  commentsCount: number;
  visibility: ProjectVisibility;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  ownerId: string;
  stage: MilestoneStage;
  title: string;
  date: string;
  description: string;
  learnings?: string;
  imageUrl?: string;
  externalUrl?: string;
  order: number;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerUsername: string;
  ownerAvatar?: string;
  projectId?: string;
  projectTitle?: string;
  projectSlug?: string;
  type: JournalType;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  appreciationsCount: number;
  commentsCount: number;
  savesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  targetType: 'project' | 'journal';
  targetId: string;
  targetTitle: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Appreciation {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'project' | 'journal';
  createdAt: string;
}

export interface SaveItem {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'project' | 'journal' | 'creator';
  itemData: {
    title: string;
    subtitle?: string;
    authorName?: string;
    categoryOrType?: string;
    slugOrUsername?: string;
    imageUrl?: string;
  };
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followedId: string;
  followerName: string;
  followerUsername: string;
  createdAt: string;
}

export interface CollaborationRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  projectSlug: string;
  projectOwnerId: string;
  applicantId: string;
  applicantName: string;
  applicantUsername: string;
  applicantAvatar?: string;
  roleWanted: string;
  pitch: string;
  portfolioLinks?: string;
  status: CollaborationStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  type:
    | 'appreciation'
    | 'comment'
    | 'follow'
    | 'collaboration_request'
    | 'collaboration_accepted'
    | 'milestone_added';
  title: string;
  message: string;
  targetUrl: string;
  read: boolean;
  createdAt: string;
}
