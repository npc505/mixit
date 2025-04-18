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
