copy-db:
    echo -e "BEGIN;\nDEFINE NAMESPACE OVERWRITE mixit;\nUSE NS mixit;\nDEFINE DATABASE OVERWRITE mixit;\nUSE DB mixit;\n\n$(cat db/migrations/*)\n\nCOMMIT;" | wl-copy

start-imgdb:
    mkdir --parents /tmp/db
    cd imgdb && env DB_DIR="/home/ae/db/" RUST_LOG="debug" cargo run --release

start-surreal:
    surreal start --strict --deny-scripting --deny-guests --no-identification-headers -b '[::]:9999' -A -u root -p root --log debug --no-banner --query-timeout 10s

run:
    zellij --layout .zellij/services.kdl
