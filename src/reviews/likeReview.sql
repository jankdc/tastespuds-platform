INSERT INTO
  tastespuds.like_review (user_id, review_id)
VALUES
  ($1, $2::int)
ON CONFLICT ON CONSTRAINT like_review_unique
  DO NOTHING
RETURNING *
