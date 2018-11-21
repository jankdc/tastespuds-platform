INSERT INTO
  tastespuds.comment (
    review_id,
    user_id,
    content,
    parent_id
  )
VALUES
  (
    $1,
    $2,
    $3,
    $4
  )
RETURNING *
