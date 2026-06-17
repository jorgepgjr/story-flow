export type ScriptStatus = 'draft' | 'review' | 'approved' | 'audio_generation';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'author' | 'reviewer' | 'producer';
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  resolved: boolean;
}

export interface Version {
  id: string;
  versionNumber: string;
  content: string;
  createdAt: string;
  authorId: string;
}

export interface Script {
  id: string;
  title: string;
  synopsis: string;
  status: ScriptStatus;
  versions: Version[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
}
