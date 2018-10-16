INSERT INTO
  tastespuds.place (gplace_id)
SELECT
  *
FROM
  unnest($1::text[])
ON CONFLICT (gplace_id)
  DO NOTHING
RETURNING *
