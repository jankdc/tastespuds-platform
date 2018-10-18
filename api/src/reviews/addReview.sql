INSERT INTO
  tastespuds.review (user_id, content, rating, item_id)
VALUES
  ($1, $2, $3, $4)
RETURNING *
