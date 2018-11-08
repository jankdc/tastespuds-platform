------------------------------------
-- Extensions
------------------------------------

CREATE EXTENSION pg_trgm;

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
  name TEXT NOT NULL,
  types TEXT[] NOT NULL,
  location FLOAT[] NOT NULL,

  street TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  address_id TEXT NOT NULL UNIQUE,

  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT no_empty_name
    CHECK (name != ''),

  CONSTRAINT location_format
    CHECK (array_length(location, 1) = 2),

  CONSTRAINT no_empty_types
    CHECK (array_length(types, 1) != 0),

  CONSTRAINT no_empty_city
    CHECK (city != ''),

  CONSTRAINT no_empty_country
    CHECK (country != ''),

  CONSTRAINT no_empty_postal_code
    CHECK (postal_code != ''),

  CONSTRAINT no_empty_address_id
    CHECK (address_id != '')
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

CREATE INDEX
  name_idx
ON
  tastespuds.item
USING GIST (name gist_trgm_ops);

-- asset

CREATE TABLE tastespuds.asset (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  data BYTEA NOT NULL,
  options JSONB NOT NULL,
  original_name TEXT NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT id_must_be_uuidv4
    CHECK (char_length(id) = 36),

  CONSTRAINT no_empty_type
    CHECK (type != ''),

  CONSTRAINT no_empty_original_name
    CHECK (original_name != '')
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
  review_id INTEGER NOT NULL,
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

  CONSTRAINT like_review_unique
    UNIQUE(user_id, review_id),

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

  CONSTRAINT like_comment_unique
    UNIQUE(user_id, comment_id),

  FOREIGN KEY (user_id)
    REFERENCES tastespuds.user (id)
    ON DELETE CASCADE,

  FOREIGN KEY (comment_id)
    REFERENCES tastespuds.comment (id)
    ON DELETE CASCADE
);

------------------------------------
-- Functions
------------------------------------

CREATE OR REPLACE FUNCTION dist_diff_on_km(point1 float[], point2 float[])
RETURNS float AS $$
DECLARE
  r float;
  a float;
  c float;
  dLat float;
  dLng float;
BEGIN
  r := 6371; -- radius of the earth in km

  dLat := radians(point2[0] - point1[0]);
  dLng := radians(point2[1] - point1[1]);

  a :=
    sin(dLat / 2) * sin(dLat / 2) +
    cos(radians(point1[0])) * cos(radians(point2[0])) *
    sin(dLon / 2) * sin(dLon / 2);

  c := 2 * atan2(sqrt(a), sqrt(1 - a));

  return r * c; -- distance in km
END;
$$ LANGUAGE plpgsql;

INSERT INTO tastespuds.db_version (version) VALUES ('{1,0,0}');
