CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  matric_no     VARCHAR(20)  UNIQUE,             -- NULL for admin
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  password_hash TEXT         NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'student'
                CHECK (role IN ('student','admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE items (
  id            SERIAL PRIMARY KEY,
  type          VARCHAR(5)   NOT NULL CHECK (type IN ('LOST','FOUND')),
  title         VARCHAR(120) NOT NULL,
  description   TEXT         NOT NULL,
  category_id   INT NOT NULL REFERENCES categories(id),
  location      VARCHAR(150) NOT NULL,
  date_occurred DATE         NOT NULL,
  photo_path    TEXT,
  status        VARCHAR(15)  NOT NULL DEFAULT 'OPEN'
                CHECK (status IN ('OPEN','CLAIM_PENDING','RETURNED','ARCHIVED')),
  reported_by   INT NOT NULL REFERENCES users(id),
  held_by       INT REFERENCES users(id),        -- D7: = reported_by for FOUND
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (type = 'FOUND' OR held_by IS NULL)
);
CREATE INDEX idx_items_type_status ON items(type, status);
CREATE INDEX idx_items_category    ON items(category_id);

CREATE TABLE claims (
  id               SERIAL PRIMARY KEY,
  item_id          INT NOT NULL REFERENCES items(id),
  claimant_id      INT NOT NULL REFERENCES users(id),
  proof_text       TEXT NOT NULL CHECK (char_length(proof_text) >= 30),  -- D12
  serial_number    VARCHAR(80),
  status           VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  rejection_reason TEXT,
  reviewed_by      INT REFERENCES users(id),
  reviewed_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, claimant_id),                                         -- D18
  CHECK (status <> 'REJECTED' OR rejection_reason IS NOT NULL)           -- mandatory reason
);
-- D11: only one pending claim per item
CREATE UNIQUE INDEX one_pending_claim_per_item
  ON claims(item_id) WHERE status = 'PENDING';