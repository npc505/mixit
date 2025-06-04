REMOVE FUNCTION IF EXISTS fn::log;
DEFINE FUNCTION fn::log($arg1: any, $arg2: any) {
    RETURN function($arg1, $arg2) {
        let args = [...arguments];
        let lastArg = (args.findLastIndex(_ => _ !== undefined) + 1) || 0;

        console.log(args[0], JSON.stringify(args[1]));
        return true;
    }
};

REMOVE FUNCTION IF EXISTS fn::search_by_username;
DEFINE FUNCTION fn::search_by_username($username: string) {
    IF (RETURN type::thing("usuario", $username) FETCH usuario) != NONE {
        RETURN type::thing("usuario", $username);
    } ELSE {
        RETURN SELECT VALUE id FROM ONLY usuario WHERE username == $username LIMIT 1;
    };
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

REMOVE FUNCTION IF EXISTS fn::untag_something;
DEFINE FUNCTION fn::untag_something($something: record<prenda>|record<mixit>, $tag: record<tag>) {
    LET $relation = DELETE $tag->tagged WHERE out=$something RETURN BEFORE;

    UPDATE $something SET
        tags -= $tag;

    RETURN $relation;
};

REMOVE FUNCTION IF EXISTS fn::tag_something;
DEFINE FUNCTION fn::tag_something($something: record<prenda>|record<mixit>, $tag: record<tag>) {
    LET $relation = RELATE $tag->tagged->$something CONTENT {
        date: time::now(),
    };

    UPDATE $something SET
        tags += $tag;

    RETURN $relation;
} PERMISSIONS FULL;

REMOVE FUNCTION IF EXISTS fn::tag_something_with_str;
DEFINE FUNCTION fn::tag_something_with_str($something: record<prenda>|record<mixit>, $tag_str: string) {
    LET $tag = SELECT *, search::score(1) AS score FROM ONLY tag WHERE nombre @1@ $tag_str ORDER BY score DESC LIMIT 1;

    LET $ftag = IF $tag == none {
        LET $new_tag = CREATE tag CONTENT { nombre: $tag_str };
        fn::log("Creating new tag:", $new_tag);
        $new_tag[0]
    } ELSE {
        $tag
    };

    RETURN fn::tag_something($something, $ftag.id);
} PERMISSIONS FULL;

REMOVE FUNCTION IF EXISTS fn::wish;
DEFINE FUNCTION fn::wish($something: record<prenda>|record<mixit>) {
    RETURN RELATE ($auth.id)->wishes->$something CONTENT {
        date: time::now(),
    };
};

REMOVE FUNCTION IF EXISTS fn::unwish;
DEFINE FUNCTION fn::unwish($something: record<prenda>|record<mixit>) {
    RETURN DELETE ($auth.id)->wishes WHERE out = $something RETURN BEFORE;
};
