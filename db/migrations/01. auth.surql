REMOVE ACCESS IF EXISTS account ON DATABASE;
DEFINE ACCESS account ON DATABASE TYPE RECORD
    SIGNUP ({
        LET $final_username: string =
            IF $username == null OR $username == none { rand::string(12) }
            ELSE { $username };

        RETURN IF $sub != none AND $sub != null THEN
            CREATE usuario
            SET
                username = $final_username,
                correo = $email,
                pass = None,
                sub = $sub
        ELSE
            CREATE usuario
            SET
                username = $final_username,
                correo = $email,
                pass = crypto::argon2::generate($password),
                sub = None
        END
    })
    SIGNIN (
        SELECT *
        FROM usuario
        WHERE (
            (username = $username OR correo = $username)
            AND crypto::argon2::compare(pass, $password)
        ) OR sub = $sub
    )
    DURATION
        FOR TOKEN 90d
        FOR SESSION 90d
;
