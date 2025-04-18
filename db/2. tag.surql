REMOVE TABLE IF EXISTS tag;
DEFINE TABLE tag TYPE NORMAL SCHEMAFULL
    PERMISSIONS
        FOR create, select FULL
        FOR update, delete NONE
;

DEFINE FIELD nombre ON TABLE tag TYPE string;
