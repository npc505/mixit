copy-db:
    echo -e "BEGIN;\nUSE NS mixit DB mixit;\n\n$(cat db/migrations/*)\n\nCOMMIT;" | wl-copy
