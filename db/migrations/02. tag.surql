REMOVE TABLE IF EXISTS tag;
DEFINE TABLE tag TYPE NORMAL SCHEMAFULL
    PERMISSIONS
        FOR create, select FULL
        FOR update, delete NONE
;

DEFINE FIELD nombre ON TABLE tag TYPE string;

DEFINE FIELD refs ON TABLE tag VALUE <future> {
    LET $res = (SELECT COUNT(<-tag_prenda) FROM ONLY $this).count;

    IF $res == None {
        RETURN 0;
    } ELSE {
        RETURN $res;
    }
};

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
