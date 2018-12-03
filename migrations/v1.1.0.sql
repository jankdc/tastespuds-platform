-- v1.1.0
-- Changes:
-- # Adding a better way to search for an item

ALTER TABLE
  tastespuds.item
ADD
  search_tsv tsvector;

CREATE INDEX
  search_idx
ON
  tastespuds.item
USING
  gist(search_tsv);

UPDATE
  tastespuds.item
SET
  search_tsv = to_tsvector(name);

CREATE OR REPLACE FUNCTION
  fill_search_tsv_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_tsv := to_tsvector(COALESCE(NEW.name, ''));
  return NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER
  on_new_item_search_tsv
BEFORE INSERT OR UPDATE ON
  tastespuds.item
FOR EACH ROW EXECUTE PROCEDURE
  fill_search_tsv_trigger();

INSERT INTO tastespuds.db_version (version) VALUES ('{1,1,0}');
