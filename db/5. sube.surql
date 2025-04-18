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

REMOVE FUNCTION IF EXISTS fn::create_prenda;
DEFINE FUNCTION fn::create_prenda($image_url: string, $public: option<bool>) {
    LET $final_public = if $public == None {
        false
    } else {
        $public
    };

    LET $new_prenda = CREATE prenda CONTENT {
        image_url: $image_url,
        public: $final_public,
        owner: $auth.id
    };

    RELATE ($auth.id)->sube->($new_prenda.id) CONTENT {
        date: time::now()
    };

    RETURN $new_prenda;
};
