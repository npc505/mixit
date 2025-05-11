REMOVE TABLE IF EXISTS wishes;
DEFINE TABLE wishes TYPE RELATION IN usuario OUT prenda|mixit ENFORCED SCHEMAFULL
    PERMISSIONS
        FOR select WHERE in.wishlist_public = true OR in.id = $auth.id
        FOR delete, create WHERE in.id = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD date ON wishes TYPE datetime READONLY
    PERMISSIONS
        FOR select WHERE in.wishlist_public = true OR in.id = $auth.id
        FOR create WHERE in.id = $auth.id
;

REMOVE INDEX IF EXISTS unique_wishes ON wishes;
DEFINE INDEX unique_wishes
    ON TABLE wishes
    COLUMNS in, out UNIQUE;
