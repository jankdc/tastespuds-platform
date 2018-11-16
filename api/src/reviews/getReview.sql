SELECT
  r.id,
  r.user_id,
  r.rating,
  r.content,
  r.highlight,
  r.suggestion,
  r.creation_date,

  array_agg(ra.asset_id) AS assets,
  json_agg(i.*)->0 AS item,
  json_agg(p.*)->0 AS place,

  COUNT(l.*) AS num_of_likes
FROM
  tastespuds.review r
INNER JOIN
  tastespuds.review_asset ra ON r.id = ra.review_id
INNER JOIN
  tastespuds.item i ON r.item_id = i.id
INNER JOIN
  tastespuds.place p ON i.place_id = p.id
LEFT JOIN
  tastespuds.like_review l ON r.id = l.review_id
WHERE
  r.id = $1::int
GROUP BY
  r.id
LIMIT 1
