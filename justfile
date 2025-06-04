copy-db:
    echo -e "BEGIN;\nDEFINE NAMESPACE OVERWRITE mixit;\nUSE NS mixit;\nDEFINE DATABASE OVERWRITE mixit;\nUSE DB mixit;\n\n$(cat db/migrations/*)\n\nCOMMIT;" | wl-copy

start-imgdb:
    mkdir --parents /tmp/db
    cd imgdb && cargo run --release

start-surreal db_path='':
    surreal start {{ if db_path != '' { 'file:' + db_path } else { '' } }} --strict --deny-guests --no-identification-headers -b '[::]:9999' -A -u root -p root --log info --no-banner --query-timeout 10s

run:
    zellij --layout .zellij/services.kdl
