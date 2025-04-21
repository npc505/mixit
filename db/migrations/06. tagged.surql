REMOVE TABLE IF EXISTS tagged;
DEFINE TABLE tagged TYPE RELATION IN tag OUT prenda|mixit ENFORCED SCHEMAFULL
    PERMISSIONS
        FOR select WHERE out.public = true OR out.owner = $auth.id
        FOR delete, update, create WHERE out.owner = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD date ON tagged TYPE datetime READONLY
    PERMISSIONS
        FOR select WHERE out.owner = $auth.id OR out.public = true
        FOR create, delete, update WHERE out.owner = $auth.id
;

REMOVE INDEX IF EXISTS unique_tagged ON tagged;
DEFINE INDEX unique_tagged
    ON TABLE tagged
    COLUMNS in, out UNIQUE;
