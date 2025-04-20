copy-db:
    echo -e "BEGIN;\nUSE NS mixit DB mixit;\n\n$(cat db/migrations/*)\n\nCOMMIT;" | wl-copy

start-imgdb:
    mkdir --parents /tmp/db
    cd imgdb && env DB_DIR="/tmp/db/" RUST_LOG="info" cargo run --release

start-surreal:
    surreal start --strict --deny-scripting --deny-guests --no-identification-headers -b '[::]:9999' -A -u root -p root --log debug --no-banner --query-timeout 10s

run:
    zellij --layout .zellij/services.kdl
