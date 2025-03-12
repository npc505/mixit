DEFINE TABLE usuario TYPE NORMAL SCHEMAFULL 
    PERMISSIONS
        FOR select FULL
        FOR create, update WHERE id = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------ 

DEFINE FIELD id ON usuario TYPE record<usuario>
    PERMISSIONS 
        FOR create, update NONE
        FOR select FULL
;

DEFINE FIELD pass ON TABLE usuario PERMISSIONS FOR select NONE;
DEFINE FIELD username ON TABLE usuario TYPE string
    ASSERT
        $value != None AND string::len($value) > 5
;

DEFINE FIELD nombres ON usuario TYPE option<string>;
DEFINE FIELD apellidos ON usuario TYPE option<string>;
DEFINE FIELD correo ON usuario TYPE string
    PERMISSIONS 
        FOR select WHERE id = $auth.id
    ASSERT 
        $value != None AND string::is::email($value)
;

DEFINE FIELD profile_picture ON usuario TYPE option<string> PERMISSIONS FULL;

-- ------------------------------
-- INDEXES
-- ------------------------------ 

DEFINE INDEX username_idx ON usuario FIELDS username UNIQUE;
DEFINE INDEX correo_idx ON usuario FIELDS correo UNIQUE;
