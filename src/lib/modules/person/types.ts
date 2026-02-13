export interface PersonAdminListItem {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  role: string | null;
  bio: string | null;
  email: string | null;
  avatar: string | null;
  siteOwner: boolean;
  profileData: unknown;
  _count: {
    articles: number;
    projects: number;
  };
}

export interface PersonAdminDetail {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  role: string | null;
  bio: string | null;
  email: string | null;
  avatar: string | null;
  siteOwner: boolean;
  profileData: unknown;
}

export interface PersonAdminPayload {
  firstName?: string | null;
  lastName?: string | null;
  pseudo?: string | null;
  role?: string | null;
  bio?: string | null;
  email?: string | null;
  avatar?: string | null;
  profileData?: unknown;
}
