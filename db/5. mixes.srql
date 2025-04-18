REMOVE TABLE IF EXISTS mixes;
DEFINE TABLE mixes TYPE RELATION IN prenda OUT mixit ENFORCED SCHEMAFULL
    PERMISSIONS
        FOR create, delete, update WHERE out.owner = $auth.id
        FOR select WHERE out.public = true OR out.owner = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD date ON mixes TYPE datetime READONLY
    PERMISSIONS
        FOR select WHERE out.owner = $auth.id OR out.public = true
        FOR create, delete, update WHERE out.owner = $auth.id
;
