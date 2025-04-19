REMOVE TABLE IF EXISTS tag_prenda;
DEFINE TABLE tag_prenda TYPE RELATION IN prenda OUT tag ENFORCED SCHEMAFULL
    PERMISSIONS
        FOR select WHERE in.public = true OR in.owner = $auth.id
        FOR delete, update, create WHERE in.owner = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD date ON tag_prenda TYPE datetime READONLY
    PERMISSIONS
        FOR select WHERE in.owner = $auth.id OR in.public = true
        FOR create, delete, update WHERE in.owner = $auth.id
;

REMOVE INDEX IF EXISTS unique_tag_prenda ON tag_prenda;
DEFINE INDEX unique_tag_prenda
    ON TABLE tag_prenda
    COLUMNS in, out UNIQUE;
