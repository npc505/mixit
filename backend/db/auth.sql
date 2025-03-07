DEFINE ACCESS account ON DATABASE TYPE RECORD
    TYPE JWT ALGORITHM HS256
    KEY 'melteamo' WITH ISSUER KEY 'melteamo'
    SIGNUP (
        CREATE usuario
        SET
            correo = $correo,
            pass = crypto::argon2::generate($pass),
    )
    SIGNIN (
        SELECT * FROM usuario WHERE correo = $correo
    )
	DURATION FOR TOKEN 1h
;



CREATE usuario SET 
    nombres = "Mel",
    username = "meluhermosa",
    apellidos = "Bonita",
    correo = "mel.bonita@gmail.com",
    pass = crypto::argon2::generate("1234")
;
