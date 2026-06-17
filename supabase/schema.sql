-- Reset
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS versions;
DROP TABLE IF EXISTS scripts;
DROP TABLE IF EXISTS users;

-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  role TEXT NOT NULL
);

-- Scripts
CREATE TABLE scripts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  synopsis TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Versions
CREATE TABLE versions (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Comments
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE
);

-- Insert Mock Users
INSERT INTO users (id, name, avatar, role) VALUES 
('u_ti', 'João (TI)', 'https://ui-avatars.com/api/?name=João+TI&background=0D8ABC&color=fff', 'ti'),
('u_rev', 'Maria (Revisora)', 'https://ui-avatars.com/api/?name=Maria+Rev&background=10B981&color=fff', 'revisor');
