import { Script, Comment, Version, User, ScriptStatus } from '../types';

// Map database row to Script object (Now happens from the JSON response directly)
function mapScript(row: any): Script {
  return {
    id: row.id || row.id,
    title: row.title || row.title,
    synopsis: row.synopsis || row.synopsis,
    status: (row.status || row.status) as ScriptStatus,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    authorId: row.author_id || row.authorId,
    versions: row.versions ? row.versions.map((v: any) => ({
      id: v.id,
      scriptId: v.script_id || v.scriptId,
      versionNumber: v.version_number || v.versionNumber,
      content: v.content,
      createdAt: v.created_at || v.createdAt,
      authorId: v.author_id || v.authorId,
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [],
    comments: row.comments ? row.comments.map((c: any) => ({
      id: c.id,
      scriptId: c.script_id || c.scriptId,
      userId: c.user_id || c.userId,
      text: c.text,
      createdAt: c.created_at || c.createdAt,
      resolved: c.resolved,
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [],
  };
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getScripts(): Promise<Script[]> {
  const res = await fetch('/api/scripts');
  if (!res.ok) throw new Error('Failed to fetch scripts');
  const data = await res.json();
  return data.map(mapScript);
}

export async function createScript(script: Script): Promise<void> {
  const res = await fetch('/api/scripts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script }),
  });
  if (!res.ok) throw new Error('Failed to create script');
}

export async function updateScriptStatus(id: string, status: ScriptStatus): Promise<void> {
  const res = await fetch('/api/status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
}

export async function updateScriptTitle(id: string, title: string): Promise<void> {
  const res = await fetch('/api/title', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title }),
  });
  if (!res.ok) throw new Error('Failed to update title');
}

export async function deleteScript(id: string): Promise<void> {
  const res = await fetch(`/api/scripts?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete script');
}

export async function addComment(comment: Comment): Promise<void> {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
}

export async function addVersion(scriptId: string, version: Version): Promise<void> {
  const res = await fetch('/api/versions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scriptId, version }),
  });
  if (!res.ok) throw new Error('Failed to add version');
}

export async function queueBatchStories(prompt: string, count: number, authorId: string): Promise<void> {
  const res = await fetch('/api/queue-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, count, authorId }),
  });
  if (!res.ok) throw new Error('Failed to queue batch');
}

export async function getQueueStatus(): Promise<number> {
  const res = await fetch('/api/queue-status');
  if (!res.ok) throw new Error('Failed to fetch queue status');
  const data = await res.json();
  return data.pendingCount;
}
