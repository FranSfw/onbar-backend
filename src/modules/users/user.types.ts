// src/modules/users/user.types.ts

export interface UserMetrics {
  followersCount: number;
  followingCount: number;
}

export interface CafeDetails {
  carouselImages: string[];
  activeBaristas: string[];
  pendingBaristas: string[];
  location?: {
    address: string;
    city: string;
  };
}

export interface BaristaEmployment {
  currentCafeId?: string;
  isVerifiedByCafe: boolean;
}

export interface UserProfile {
  uid: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  profilePhotoURL?: string;
  coverPhotoURL?: string;
  role: 'barista' | 'manager' | 'admin';
  baristaInfo?: BaristaEmployment;
  cafeInfo?: CafeDetails;
  skills?: string[];
  metrics: UserMetrics;
  joinedAt: string;
}

// 📝 Lo que se usa en el POST inicial (Ya NO tiene skills)
export interface CreateUserInput {
  uid: string;
  username: string;
  name: string;
  email: string;
  role: 'barista' | 'manager';
  bio?: string;
  profilePhotoURL?: string;
  coverPhotoURL?: string;
}

// ✏️ Lo que se usa en el PATCH (Le agregamos firma de índice para Firestore)
export interface UpdateUserInput {
  name?: string;
  bio?: string;
  profilePhotoURL?: string;
  coverPhotoURL?: string;
  skills?: string[];
  [key: string]: any;
}

