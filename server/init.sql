CREATE TABLE checkins (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  meditation VARCHAR(255) NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL
);