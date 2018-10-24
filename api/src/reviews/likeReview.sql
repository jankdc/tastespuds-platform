INSERT INTO
  tastespuds.like_review (user_id, review_id)
VALUES
  ($1, $2::int)
RETURNING *
