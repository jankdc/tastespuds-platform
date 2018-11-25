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
  to_json(u.*) AS user,
  ur.id AS reviewer_id,
  ur.picture AS reviewer_picture
FROM
  new_comment c
INNER JOIN
  tastespuds.user u ON u.id = c.user_id
INNER JOIN
  tastespuds.review r ON r.id = c.review_id
INNER JOIN
  tastespuds.user ur ON ur.id = r.user_id
