REMOVE TABLE IF EXISTS follows;
DEFINE TABLE follows TYPE RELATION IN usuario OUT usuario ENFORCED SCHEMAFULL
    PERMISSIONS
        -- TODO: Define follow privacy
        FOR create, update, delete, select WHERE in = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD date ON follows TYPE datetime READONLY
    PERMISSIONS
        FOR create, delete, update, select WHERE in = $auth.id
;

REMOVE INDEX IF EXISTS unique_follows ON follows;
DEFINE INDEX unique_follows
    ON TABLE follows
    COLUMNS in, out UNIQUE;
