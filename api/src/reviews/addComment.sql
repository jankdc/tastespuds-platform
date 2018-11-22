WITH new_comment AS (
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
)
SELECT
  c.id,
  c.review_id,
  c.parent_id,
  c.content,
  c.creation_date,
  to_json(u.*) AS user
FROM
  new_comment c
INNER JOIN
  tastespuds.user u ON u.id = c.user_id
