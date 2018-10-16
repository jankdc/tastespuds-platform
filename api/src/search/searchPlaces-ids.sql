SELECT
  *
FROM
  tastespuds.place
WHERE
  gplace_id = ANY($1::text[])
