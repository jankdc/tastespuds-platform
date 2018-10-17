------------------------------------
-- Tables
------------------------------------

-- user

CREATE TABLE tastespuds.user (
  id TEXT PRIMARY KEY NOT NULL,

  CONSTRAINT no_empty_id
    CHECK (id != '')
);

-- place

CREATE TABLE tastespuds.place (
  id SERIAL PRIMARY KEY NOT NULL,
  gplace_id TEXT NOT NULL UNIQUE,

  CONSTRAINT no_empty_gplace_id
    CHECK (gplace_id != '')
);

-- item

CREATE TABLE tastespuds.item (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  place_id INTEGER NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT no_empty_name
    CHECK (name != ''),

  FOREIGN KEY (place_id)
    REFERENCES tastespuds.place (id)
);

-- asset

CREATE TABLE tastespuds.asset (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  data BYTEA NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT id_must_be_uuidv4
    CHECK (char_length(id) = 36),

  CONSTRAINT no_empty_type
    CHECK (type != '')
);

-- review

CREATE TABLE tastespuds.review (
  id SERIAL PRIMARY KEY NOT NULL,
  rating INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT no_empty_content
    CHECK (content != ''),

  CONSTRAINT rating_must_be_in_range
    CHECK (rating > 0 AND rating <= 5),

  FOREIGN KEY (user_id)
    REFERENCES tastespuds.user (id),

  FOREIGN KEY (item_id)
    REFERENCES tastespuds.item (id)
);

-- review_asset

CREATE TABLE tastespuds.review_asset (
  asset_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  PRIMARY KEY(asset_id, review_id),

  FOREIGN KEY (asset_id)
    REFERENCES tastespuds.asset (id)
    ON DELETE RESTRICT,

  FOREIGN KEY (review_id)
    REFERENCES tastespuds.review (id)
    ON DELETE CASCADE
);

-- comment

CREATE TABLE tastespuds.comment (
  id SERIAL PRIMARY KEY NOT NULL,
  content TEXT NOT NULL,
  user_id TEXT NOT NULL,
  parent_id INTEGER NULL,
  review_id INTEGER NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT no_empty_content
    CHECK (content != ''),

  CONSTRAINT no_circular_comments
    CHECK (id != parent_id),

  FOREIGN KEY (user_id)
    REFERENCES tastespuds.user (id)
    ON DELETE CASCADE,

  FOREIGN KEY (parent_id)
    REFERENCES tastespuds.comment (id)
    ON DELETE CASCADE,

  FOREIGN KEY (review_id)
    REFERENCES tastespuds.review (id)
    ON DELETE CASCADE
);

-- like_review

CREATE TABLE tastespuds.like_review (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  review_id INTEGER NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  FOREIGN KEY (user_id)
    REFERENCES tastespuds.user (id)
    ON DELETE CASCADE,

  FOREIGN KEY (review_id)
    REFERENCES tastespuds.review (id)
    ON DELETE CASCADE
);

-- like_comment

CREATE TABLE tastespuds.like_comment (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  comment_id INTEGER NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  FOREIGN KEY (user_id)
    REFERENCES tastespuds.user (id)
    ON DELETE CASCADE,

  FOREIGN KEY (comment_id)
    REFERENCES tastespuds.comment (id)
    ON DELETE CASCADE
);

INSERT INTO tastespuds.db_version (version) VALUES ('{1,0,0}');
