REMOVE TABLE IF EXISTS follows;
DEFINE TABLE follows TYPE RELATION IN usuario OUT usuario ENFORCED SCHEMAFULL
    PERMISSIONS
        -- TODO: Define follow privacy
        -- notes: for anyone to count the followers of any other person the
        -- relation "follows" needs to be public, visible
        FOR select FULL
        FOR create, update WHERE in = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD date ON follows TYPE datetime READONLY
    PERMISSIONS
        FOR create, update, select WHERE in = $auth.id
;

REMOVE INDEX IF EXISTS unique_follows ON follows;
DEFINE INDEX unique_follows
    ON TABLE follows
    COLUMNS in, out UNIQUE;
