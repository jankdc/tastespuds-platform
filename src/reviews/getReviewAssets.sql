SELECT
  a.id,
  a.type,
  a.options
FROM
  tastespuds.review_asset ra
INNER JOIN
  tastespuds.asset a ON ra.asset_id = a.id
WHERE
  ra.review_id = $1
