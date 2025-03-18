DEFINE ACCESS account ON DATABASE TYPE RECORD
    SIGNUP (
        CREATE usuario
        SET
            correo = $username,
            pass = crypto::argon2::generate($password)
    )
    SIGNIN (
        SELECT * 
        FROM usuario
        WHERE (username = $username OR correo = $username) AND crypto::argon2::compare(pass, $password)
    )
;
