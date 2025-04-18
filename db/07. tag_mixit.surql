REMOVE TABLE IF EXISTS tag_mixit;
DEFINE TABLE tag_mixit TYPE RELATION IN mixit OUT tag ENFORCED SCHEMAFULL
    PERMISSIONS
        FOR select WHERE in.public = true OR in.owner = $auth.id
        FOR delete, update, create WHERE in.owner = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD date ON tag_mixit TYPE datetime READONLY
    PERMISSIONS
        FOR select WHERE in.owner = $auth.id OR in.public = true
        FOR create, delete, update WHERE in.owner = $auth.id
;

REMOVE INDEX IF EXISTS unique_tag_mixit ON tag_mixit;
DEFINE INDEX unique_tag_mixit
    ON TABLE tag_mixit
    COLUMNS in, out UNIQUE;
