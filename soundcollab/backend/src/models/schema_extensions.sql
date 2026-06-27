-- Incremental schema extensions for SoundCollab platform features.
-- Safe to run multiple times (IF NOT EXISTS / idempotent alters where supported).

-- Premium / profile enhancements
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_image VARCHAR(500) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Extended post metadata (upload studio + marketplace)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS bpm INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mood VARCHAR(50);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS open_verse BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS collab_open BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS marketplace_category VARCHAR(30);

-- Widen post type column for new content types
ALTER TABLE posts ALTER COLUMN type TYPE VARCHAR(30);

-- Message attachments (audio/file sharing in DMs)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(500);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(20);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);

CREATE TABLE IF NOT EXISTS tips (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount REAL NOT NULL CHECK (amount > 0),
  message TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tips_receiver ON tips(receiver_id, created_at DESC);

-- Opportunities hub — dedicated posts for creator needs
CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  genre_tags TEXT[] DEFAULT '{}',
  mood VARCHAR(50),
  is_paid BOOLEAN DEFAULT false,
  budget REAL,
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_user ON opportunities(user_id);

-- Playlists
CREATE TABLE IF NOT EXISTS playlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playlist_items (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(playlist_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);

-- Play history (server-side recently played)
CREATE TABLE IF NOT EXISTS play_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  played_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_play_history_user ON play_history(user_id, played_at DESC);

-- Group chat preparation (multi-member conversation rooms)
CREATE TABLE IF NOT EXISTS group_conversations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_conversation_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES group_conversations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Creator analytics prep (premium feature structure)
CREATE TABLE IF NOT EXISTS creator_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_analytics_user ON creator_analytics(user_id, created_at DESC);
