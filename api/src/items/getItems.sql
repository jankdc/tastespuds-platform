SELECT
  *
FROM
  tastespuds.item i
INNER JOIN
  tastespuds.place p ON i.place_id = p.id
WHERE
  p.gplace_id = $1
