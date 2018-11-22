WITH caller_comment AS (
  SELECT
    *
  FROM
    tastespuds.like_comment
  WHERE
    user_id = $2
)
SELECT
  c.*,
  COUNT(lc.*) AS num_of_likes,
  json_agg(u.*)->0 AS user,
  json_agg(cc.*)->0->'id' AS caller_like_id
FROM
  tastespuds.comment c
INNER JOIN
  tastespuds.user u ON u.id = c.user_id
LEFT JOIN
  caller_comment cc ON cc.comment_id = c.id
LEFT JOIN
  tastespuds.like_comment lc ON lc.comment_id = c.id
WHERE
  c.review_id = $1
AND
  c.creation_date < $3::timestamptz
GROUP BY
  c.id
ORDER BY
  c.creation_date DESC
LIMIT
  20
