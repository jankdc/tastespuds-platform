------------------------------------
-- Tables
------------------------------------

-- user

CREATE TABLE tastespuds.user (
  id TEXT PRIMARY KEY NOT NULL,

  CONSTRAINT no_empty_id
    CHECK (id != '')
);

INSERT INTO tastespuds.db_version (version) VALUES ('{1,0,0}');
