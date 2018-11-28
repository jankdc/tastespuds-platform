DELETE FROM
  tastespuds.like_review
WHERE
  id = $1::int
RETURNING *
