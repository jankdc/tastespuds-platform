INSERT INTO
  tastespuds.review_asset (review_id, asset_id)
VALUES
  ($1, $2)
RETURNING *
