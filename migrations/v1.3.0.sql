-- # Adding a better way to search for a place

-- For mispelt but nearly complete searches
CREATE INDEX
  place_name_idx
ON
  tastespuds.place
USING
  gist(name gist_trgm_ops);

-- For searches that contain some of the words
ALTER TABLE
  tastespuds.place
ADD
  search_tsv tsvector;

CREATE INDEX
  place_search_idx
ON
  tastespuds.place
USING
  gist(search_tsv);

UPDATE
  tastespuds.place
SET
  search_tsv = to_tsvector(name);

CREATE OR REPLACE FUNCTION
  fill_place_search_tsv_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_tsv := to_tsvector(COALESCE(NEW.name, ''));
  return NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER
  on_new_place_search_tsv
BEFORE INSERT OR UPDATE ON
  tastespuds.place
FOR EACH ROW EXECUTE PROCEDURE
  fill_place_search_tsv_trigger();

INSERT INTO tastespuds.db_version (version) VALUES ('{1,3,0}');
