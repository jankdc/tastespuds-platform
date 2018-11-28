SELECT
  r.id,
  count(lr.*) as likes,
  array_agg(ra.asset_id) as assets
FROM
  tastespuds.review r
INNER JOIN
  tastespuds.review_asset ra ON ra.review_id = r.id
LEFT JOIN
  tastespuds.like_review lr ON lr.review_id = r.id
WHERE
  r.user_id = $1
GROUP BY
  r.id
ORDER BY
  r.creation_date DESC
