REMOVE TABLE IF EXISTS prenda;
DEFINE TABLE prenda TYPE NORMAL SCHEMAFULL
    PERMISSIONS
        FOR select WHERE public = true OR owner = $auth.id
        FOR create, update, delete WHERE owner = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD owner ON prenda TYPE record<usuario> READONLY
    PERMISSIONS
        FOR select NONE,
        FOR create, update, delete WHERE owner = $auth.id
;

DEFINE FIELD tags ON prenda TYPE set<record<tag>> DEFAULT ALWAYS <set>[]
    PERMISSIONS
        FOR select WHERE public = true OR owner = $auth.id
        FOR create, delete, update WHERE public = true OR owner = $auth.id
;

DEFINE FIELD image_url ON prenda TYPE string
    PERMISSIONS
        FOR select WHERE public = true OR owner = $auth.id
        FOR create, update, delete WHERE owner = $auth.id
;

DEFINE FIELD tipo ON prenda TYPE "top" | "bot" | "full" | "foot" | "bag" | "accessory"
    PERMISSIONS
        FOR select WHERE public = true OR owner = $auth.id
        FOR create, update, delete WHERE owner = $auth.id
;

DEFINE FIELD public ON prenda TYPE bool DEFAULT false
    PERMISSIONS
        FOR select WHERE public = true OR owner = $auth.id
        FOR create, update, delete WHERE owner = $auth.id
;
