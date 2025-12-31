/**
 * Types for the friends system
 */

export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface FriendRequest {
  id: string;
  user: {
    id: string;
    displayName: string | null;
  };
  status: FriendshipStatus;
  createdAt: string;
  direction: 'incoming' | 'outgoing';
}

export interface Friend {
  id: string;
  displayName: string | null;
  friendshipId: string;
}

export interface UserSearchResult {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  friendshipStatus: 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted';
}
