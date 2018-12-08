-- Adds price column

ALTER TABLE tastespuds.review ADD price FLOAT NOT NULL DEFAULT 0;

INSERT INTO tastespuds.db_version (version) VALUES ('{1,2,0}');
