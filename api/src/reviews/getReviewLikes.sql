SELECT
  *
FROM
  tastespuds.like_review l
WHERE
  l.review_id = $1::int AND l.user_id = $2::text
