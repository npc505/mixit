REMOVE FUNCTION IF EXISTS fn::search_by_username;
DEFINE FUNCTION fn::search_by_username($username: string) {
    RETURN SELECT VALUE id FROM ONLY usuario WHERE username == $username LIMIT 1;
};

REMOVE FUNCTION IF EXISTS fn::follow;
DEFINE FUNCTION fn::follow($user: record<usuario>) {
    IF $auth.id == $user {
        RETURN NONE;
    } ELSE {
        RETURN RELATE ($auth.id)->follows->$user CONTENT {
            date: time::now()
        };
    };
};

REMOVE FUNCTION IF EXISTS fn::unfollow;
DEFINE FUNCTION fn::unfollow($user: record<usuario>) {
    RETURN DELETE ($auth.id)->follows WHERE out=$user RETURN BEFORE;
};

REMOVE FUNCTION IF EXISTS fn::create_prenda;
DEFINE FUNCTION fn::create_prenda($image_url: string, $tipo: "top" | "bot" | "full" | "foot" | "bag" | "accessory", $public: option<bool>) {
    LET $new_prenda = CREATE prenda CONTENT {
        image_url: $image_url,
        public: IF $public == None { false } ELSE { $public },
        owner: $auth.id,
        tipo: $tipo,
        tags: [],
    };

    RELATE ($auth.id)->sube->($new_prenda.id) CONTENT {
        date: time::now()
    };

    RETURN $new_prenda;
};

REMOVE FUNCTION IF EXISTS fn::untag_prenda;
DEFINE FUNCTION fn::untag_prenda($prenda: record<prenda>, $tag: record<tag>) {
    LET $relation = DELETE $prenda->tag_prenda WHERE out=$tag RETURN BEFORE;

    UPDATE $prenda.id SET
        tags -= $tag.id;

    RETURN $relation;
};

REMOVE FUNCTION IF EXISTS fn::tag_prenda;
DEFINE FUNCTION fn::tag_prenda($prenda: record<prenda>, $tag: record<tag>) {
    LET $relation = RELATE $prenda->tag_prenda->$tag CONTENT {
        date: time::now(),
    };

    UPDATE $prenda.id SET
        tags += $tag.id;

    RETURN $relation;
};

REMOVE FUNCTION IF EXISTS fn::tag_prenda_with_str;
DEFINE FUNCTION fn::tag_prenda_with_str($prenda: record<prenda>, $tag_str: string) {
    LET $tag = SELECT *, search::score(1) AS score FROM ONLY tag WHERE nombre @1@ $tag_str ORDER BY score DESC LIMIT 1;

    LET $ftag = IF $tag == none {
        LET $new_tag = CREATE tag CONTENT { nombre: $tag_str };
        $new_tag
    } ELSE {
        $tag
    };

    RETURN fn::tag_prenda($prenda, $ftag);
};
