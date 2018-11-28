INSERT INTO
  tastespuds.item (name, place_id)
VALUES
  ($1, $2)
RETURNING *
