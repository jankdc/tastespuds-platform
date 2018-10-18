INSERT INTO
  tastespuds.asset (id, type, data, original_name, options)
VALUES
  ($1::text, $2::text, $3::bytea, $4::text, $5::jsonb)
RETURNING *
