REMOVE FUNCTION IF EXISTS fn::create_prenda;
DEFINE FUNCTION fn::create_prenda($image_url: string, $tipo: "top" | "bot" | "full" | "foot" | "bag" | "accessory", $public: option<bool>) {
    LET $new_prenda = CREATE prenda CONTENT {
        image_url: $image_url,
        public: IF $public == None { false } ELSE { $public },
        owner: $auth.id,
        tipo: $tipo,
    };

    RELATE ($auth.id)->sube->($new_prenda.id) CONTENT {
        date: time::now()
    };

    RETURN $new_prenda;
};

REMOVE FUNCTION IF EXISTS fn::tag_prenda;
DEFINE FUNCTION fn::tag_prenda($prenda: record<prenda>, $tag_str: string) {
    LET $tag = SELECT *, search::score(1) AS score FROM ONLY tag WHERE nombre @1@ $tag_str ORDER BY score DESC LIMIT 1;

    LET $ftag = IF $tag == none {
        LET $new_tag = CREATE tag CONTENT { nombre: $tag_str };
        $new_tag
    } ELSE {
        $tag
    };

    RETURN RELATE $prenda->tag_prenda->($ftag.id) CONTENT {
        date: time::now(),
    };
};
