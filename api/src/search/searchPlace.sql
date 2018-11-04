SELECT
  *
FROM
  tastespuds.place
WHERE
  address_id = $1::text
