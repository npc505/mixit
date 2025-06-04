REMOVE TABLE IF EXISTS tag;
DEFINE TABLE tag TYPE NORMAL SCHEMAFULL
    PERMISSIONS
        FOR create, update, select FULL
        FOR delete NONE
;

DEFINE FIELD nombre ON TABLE tag TYPE string
    PERMISSIONS
        FOR create, select FULL
        FOR update NONE
;

DEFINE FIELD refs ON TABLE tag READONLY VALUE <future> {
    LET $res = COUNT(SELECT id FROM $this->tagged);

    IF $res == None {
        RETURN 0;
    } ELSE {
        RETURN $res;
    }
} PERMISSIONS
    FOR select FULL
    FOR create, update NONE
;

REMOVE ANALYZER IF EXISTS my_analyzer;
DEFINE ANALYZER my_analyzer
  TOKENIZERS class
  FILTERS lowercase, ascii;

REMOVE INDEX IF EXISTS idx_nombre ON tag;
DEFINE INDEX idx_nombre ON tag
    FIELDS nombre
    SEARCH ANALYZER my_analyzer
    HIGHLIGHTS BM25
;
