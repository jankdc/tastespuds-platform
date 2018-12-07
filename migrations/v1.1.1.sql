-- Fix spelling
-- Fix array indexing

DROP FUNCTION IF EXISTS dist_diff_on_km;

CREATE OR REPLACE FUNCTION dist_diff_in_km(point1 float[], point2 float[])
RETURNS float AS $$
DECLARE
  r float;
  a float;
  c float;
  dLat float;
  dLng float;
BEGIN
  r := 6371; -- radius of the earth in km

  dLat := radians(point2[1] - point1[1]);
  dLng := radians(point2[2] - point1[2]);

  a :=
    sin(dLat / 2) * sin(dLat / 2) +
    cos(radians(point1[1])) * cos(radians(point2[1])) *
    sin(dLng / 2) * sin(dLng / 2);

  c := 2 * atan2(sqrt(a), sqrt(1 - a));

  return r * c; -- distance in km
END;
$$ LANGUAGE plpgsql;

INSERT INTO tastespuds.db_version (version) VALUES ('{1,1,1}');
