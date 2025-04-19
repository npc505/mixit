REMOVE TABLE IF EXISTS usuario;
DEFINE TABLE usuario TYPE NORMAL SCHEMAFULL
    PERMISSIONS
        FOR select FULL
        FOR create, update WHERE id = $auth.id
;

-- ------------------------------
-- FIELDS
-- ------------------------------

DEFINE FIELD id ON usuario TYPE record<usuario> READONLY
    PERMISSIONS
        FOR create, update NONE
        FOR select FULL
;

DEFINE FIELD followers ON TABLE usuario VALUE <future> {
    LET $res = (SELECT COUNT(<-follows) FROM ONLY $this).count;

    IF $res == None {
        RETURN 0;
    } ELSE {
        RETURN $res;
    }
};

DEFINE FIELD following ON TABLE usuario VALUE <future> {
    LET $res = (SELECT COUNT(->follows) FROM ONLY $this).count;

    IF $res == None {
        RETURN 0;
    } ELSE {
        RETURN $res;
    }
};


DEFINE FIELD pass ON TABLE usuario TYPE option<string> PERMISSIONS FOR select NONE;
DEFINE FIELD sub ON TABLE usuario TYPE option<string> READONLY PERMISSIONS FOR select NONE;
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


REMOVE INDEX IF EXISTS username_idx ON usuario;
REMOVE INDEX IF EXISTS correo_idx ON usuario;
DEFINE INDEX username_idx ON usuario FIELDS username UNIQUE;
DEFINE INDEX correo_idx ON usuario FIELDS correo UNIQUE;
