INSERT INTO
  tastespuds.review (user_id, content, rating, item_id, highlight, suggestion, price)
VALUES
  ($1, $2, $3, $4, $5, $6, $7)
RETURNING *
