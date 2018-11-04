INSERT INTO
  tastespuds.place (
    name,
    types,
    location,
    street,
    city,
    country,
    postal_code,
    address_id
  )
VALUES (
  $1::text,
  $2::text[],
  $3::float[],
  $4::text,
  $5::text,
  $6::text,
  $7::text,
  $8::text
)
ON CONFLICT (address_id)
  DO UPDATE SET
    name          = EXCLUDED.name,
    types         = EXCLUDED.types,
    location      = EXCLUDED.location,
    street        = EXCLUDED.street,
    city          = EXCLUDED.city,
    country       = EXCLUDED.country,
    postal_code   = EXCLUDED.postal_code
RETURNING *
