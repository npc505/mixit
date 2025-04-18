REMOVE TABLE IF EXISTS tag;
DEFINE TABLE tag TYPE NORMAL SCHEMAFULL
    PERMISSIONS
        FOR create, select FULL
        FOR update, delete NONE
;

DEFINE FIELD nombre ON TABLE tag TYPE string;

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
