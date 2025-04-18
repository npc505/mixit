REMOVE TABLE IF EXISTS sube;
DEFINE TABLE sube TYPE RELATION IN usuario OUT prenda ENFORCED SCHEMAFULL
    PERMISSIONS
        FOR select WHERE in = $auth.id OR out.public = true
        FOR create WHERE in = $auth.id AND out.owner = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD date ON sube TYPE datetime READONLY
    PERMISSIONS
        FOR select WHERE in = $auth.id OR out.public = true
        FOR create WHERE in = $auth.id
;

REMOVE INDEX IF EXISTS unique_sube ON sube;
DEFINE INDEX unique_sube
    ON TABLE sube
    COLUMNS in, out UNIQUE;
