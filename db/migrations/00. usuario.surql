REMOVE TABLE IF EXISTS usuario;
DEFINE TABLE usuario TYPE NORMAL SCHEMAFULL
    PERMISSIONS
        FOR create, update WHERE id = $auth.id
        FOR select FULL
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD id ON usuario TYPE record<usuario> READONLY
    PERMISSIONS
        FOR select FULL
;

DEFINE FIELD followers ON TABLE usuario VALUE <future> {
    LET $res = (SELECT COUNT(<-follows) FROM ONLY $this).count;

    IF $res == None {
        RETURN 0;
    } ELSE {
        RETURN $res;
    }
} PERMISSIONS
    FOR select FULL
;

DEFINE FIELD following ON TABLE usuario VALUE <future> {
    LET $res = (SELECT COUNT(->follows) FROM ONLY $this).count;

    IF $res == None {
        RETURN 0;
    } ELSE {
        RETURN $res;
    }
} PERMISSIONS
    FOR select FULL
;


DEFINE FIELD pass ON TABLE usuario TYPE option<string> PERMISSIONS FOR select NONE;
DEFINE FIELD sub ON TABLE usuario TYPE option<string> READONLY PERMISSIONS FOR select NONE;
DEFINE FIELD username ON TABLE usuario TYPE string
    ASSERT
        $value != None AND string::len($value) >= 3
    PERMISSIONS
        FOR select FULL;
;

DEFINE FIELD nombres ON usuario TYPE option<string>
    PERMISSIONS
        FOR select WHERE id = $auth.id
;
DEFINE FIELD apellidos ON usuario TYPE option<string>
    PERMISSIONS
        FOR select WHERE id = $auth.id
;
DEFINE FIELD correo ON usuario TYPE string
    PERMISSIONS
        FOR select WHERE id = $auth.id
    ASSERT
        $value != None AND string::is::email($value)
;
DEFINE FIELD using_today ON usuario TYPE option<record<mixit>>
    ASSERT
        $value != None AND $value.public == true
;

DEFINE FIELD profile_picture ON usuario TYPE option<string>;
DEFINE FIELD back_picture ON usuario TYPE option<string>;


-- ------------------------------
-- INDEXES
-- ------------------------------


REMOVE INDEX IF EXISTS username_idx ON usuario;
REMOVE INDEX IF EXISTS correo_idx ON usuario;
DEFINE INDEX username_idx ON usuario FIELDS username UNIQUE;
DEFINE INDEX correo_idx ON usuario FIELDS correo UNIQUE;
