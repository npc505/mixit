REMOVE TABLE IF EXISTS mixit;
DEFINE TABLE mixit TYPE NORMAL SCHEMAFULL
    PERMISSIONS
        FOR select WHERE public = true OR owner.id = $auth.id
        FOR create, update, delete WHERE owner.id = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD owner ON mixit TYPE record<usuario> READONLY
    PERMISSIONS
        FOR select NONE,
        FOR create, update WHERE owner = $auth.id
;

DEFINE FIELD public ON mixit TYPE bool DEFAULT false
    PERMISSIONS
        FOR select WHERE public = true OR owner = $auth.id
        FOR create, update WHERE owner = $auth.id
;

DEFINE FIELD description ON mixit TYPE string
    PERMISSIONS
        FOR select WHERE public = true OR owner = $auth.id
        FOR create, update WHERE owner = $auth.id
;

DEFINE FIELD hooks ON mixit TYPE number READONLY
    PERMISSIONS
        FOR select WHERE public = true OR owner = $auth.id
        FOR create, update NONE
;

DEFINE FIELD tags ON mixit TYPE set<record<tag>> DEFAULT ALWAYS <set>[]
    PERMISSIONS
        FOR select WHERE public = true OR owner = $auth.id
        FOR create, update WHERE public = true OR owner = $auth.id
;
