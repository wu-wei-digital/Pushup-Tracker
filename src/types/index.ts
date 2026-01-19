// User types
export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  yearlyGoal: number;
  timezone: string;
  points: number;
  level: number;
  currentTitle: string | null;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: number;
  username: string;
  displayName: string | null;
  bio: string | null;
  points: number;
  level: number;
  currentTitle: string | null;
}

// Entry types
export interface PushupEntry {
  id: number;
  userId: number;
  amount: number;
  note: string | null;
  createdAt: string;
  user?: PublicUser;
  reactions?: Reaction[];
  comments?: Comment[];
  _count?: {
    reactions: number;
    comments: number;
  };
}

// Stats types
export interface UserStats {
  totalPushups: number;
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  yearTotal: number;
  currentStreak: number;
  longestStreak: number;
  dailyTarget: number;
  yearProgress: number;
  totalEntries: number;
  averagePerDay: number;
  singleEntryMax: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  user: PublicUser;
  total: number;
  percentComplete: number;
}

// Achievement types
export interface Achievement {
  id: number;
  badgeType: string;
  badgeName: string;
  badgeDesc: string | null;
  badgeRarity: string;
  unlockedAt: string;
  isShowcased: boolean;
}

// Social types
export interface Poke {
  id: number;
  pokerId: number;
  pokedId: number;
  message: string | null;
  createdAt: string;
  isRead: boolean;
  poker?: PublicUser;
  poked?: PublicUser;
}

export interface Reaction {
  id: number;
  userId: number;
  entryId: number;
  reactionType: ReactionType;
  createdAt: string;
  user?: PublicUser;
}

export type ReactionType = "strong" | "fire" | "applause" | "party" | "wow";

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  strong: "💪",
  fire: "🔥",
  applause: "👏",
  party: "🎉",
  wow: "😮",
};

export interface Comment {
  id: number;
  userId: number;
  entryId: number;
  content: string;
  createdAt: string;
  user?: PublicUser;
}

// Friend types
export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: "pending" | "accepted" | "blocked";
  createdAt: string;
  acceptedAt: string | null;
  user?: PublicUser;
  friend?: PublicUser;
}

// Notification types
export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

// Challenge types
export interface Challenge {
  id: number;
  creatorId: number;
  name: string;
  description: string | null;
  challengeType: "time_based" | "race" | "target" | "team";
  startDate: string;
  endDate: string;
  targetAmount: number | null;
  isPublic: boolean;
  createdAt: string;
  creator?: PublicUser;
  participants?: ChallengeParticipant[];
  _count?: {
    participants: number;
  };
}

export interface ChallengeParticipant {
  id: number;
  challengeId: number;
  userId: number;
  teamName: string | null;
  joinedAt: string;
  user?: PublicUser;
  totalPushups?: number;
}

// Team types
export interface Team {
  id: number;
  name: string;
  description: string | null;
  creatorId: number;
  teamGoal: number;
  isPublic: boolean;
  createdAt: string;
  creator?: PublicUser;
  members?: TeamMember[];
  _count?: {
    members: number;
  };
  totalPushups?: number;
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  role: "admin" | "member";
  joinedAt: string;
  user?: PublicUser;
  totalPushups?: number;
}

// Activity feed types
export interface FeedItem {
  id: string;
  type: "entry" | "achievement" | "challenge_join" | "team_join" | "friend";
  user: PublicUser;
  data: Record<string, unknown>;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
