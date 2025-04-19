copy-db:
    echo -e "BEGIN;\nUSE NS mixit DB mixit;\n\n$(cat db/migrations/*)\n\nCOMMIT;" | wl-copy

start-imgdb:
    mkdir --parents /tmp/db
    cd imgdb && env DB_DIR="/tmp/db/" RUST_LOG="info" cargo run --release

start-surreal:
    surreal start -b '[::]:9999' -A -u root -p root --log debug --no-banner
