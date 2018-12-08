SELECT
  r.id,
  r.price,
  r.rating,
  r.content,
  r.highlight,
  r.suggestion,
  r.creation_date,

  json_agg(ra.*) AS assets,
  json_agg(u.*)->0 AS user,
  json_agg(i.*)->0 AS item,
  json_agg(p.*)->0 AS place,

  COUNT(l.*) AS num_of_likes,

  CASE WHEN r.creation_date > now() - INTERVAL '1 days'
    THEN exp(-0.3 * (date_part('hour', now() - r.creation_date) / 24) ^ 2)
    ELSE exp(-0.03 - (date_part('day', now() - r.creation_date) / 7) * 2)
  END
    AS date_weighted_score,

  AVG(
    COALESCE(
      exp(-4 * (date_part('day', now() - l.creation_date) / 7) ^ 2),
      0
    )
  ) AS likes_weighted_score
FROM
  tastespuds.review r
INNER JOIN
  tastespuds.review_asset ra ON r.id = ra.review_id
INNER JOIN
  tastespuds.user u ON u.id = r.user_id
INNER JOIN
  tastespuds.item i ON r.item_id = i.id
INNER JOIN
  tastespuds.place p ON i.place_id = p.id
LEFT JOIN
  tastespuds.like_review l ON r.id = l.review_id
WHERE
  r.creation_date > now() - INTERVAL '7 days'
AND
  dist_diff_in_km(p.location, $1::float[]) < 5
GROUP BY
  r.id
