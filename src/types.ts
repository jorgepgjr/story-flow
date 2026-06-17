export type ScriptStatus = 'draft' | 'generating' | 'review' | 'approved' | 'audio_generation';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'ti' | 'author' | 'reviewer' | 'producer';
}

export interface Comment {
  id: string;
  scriptId: string;
  userId: string;
  text: string;
  createdAt: string;
  resolved: boolean;
}

export interface Version {
  id: string;
  scriptId: string;
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
