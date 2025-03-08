DEFINE ACCESS account ON DATABASE TYPE RECORD
    SIGNUP (
        CREATE usuario
        SET
            correo = $login_method,
            pass = crypto::argon2::generate($pass)
    )
    SIGNIN (
        SELECT * FROM usuario WHERE correo = $login_method OR username = $login_method
    )
;

CREATE usuario SET 
    nombres = "Mel",
    username = "meluhermosa",
    apellidos = "Bonita",
    correo = "mel.bonita@gmail.com",
    pass = crypto::argon2::generate("1234")
;
