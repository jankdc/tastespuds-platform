INSERT INTO
  tastespuds.user (id)
VALUES
  ($1)
ON CONFLICT (id)
  DO UPDATE SET id = EXCLUDED.id
RETURNING *
