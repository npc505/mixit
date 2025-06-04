REMOVE TABLE IF EXISTS hooks;
DEFINE TABLE hooks TYPE RELATION IN usuario OUT mixit ENFORCED SCHEMAFULL
    PERMISSIONS
        FOR create, update WHERE in.id = $auth.id
        -- TODO: How does hooks privacy work?
        FOR select WHERE in.id = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD date ON hooks TYPE datetime READONLY
    PERMISSIONS
        FOR select WHERE in.id = $auth.id
        FOR create WHERE in.id = $auth.id
;
