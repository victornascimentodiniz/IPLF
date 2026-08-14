ALTER TABLE acampamentos
ADD COLUMN IF NOT EXISTS valor_completo NUMERIC(10,2),

ADD COLUMN IF NOT EXISTS valor_diaria NUMERIC(10,2),

ADD COLUMN IF NOT EXISTS valor_crianca NUMERIC(10,2),

ADD COLUMN IF NOT EXISTS idade_max_crianca INTEGER,

ADD COLUMN IF NOT EXISTS foto_key TEXT;


ALTER TABLE acampamentos
ADD CONSTRAINT chk_valor_completo
CHECK (
    valor_completo IS NULL
    OR valor_completo >= 0
);


ALTER TABLE acampamentos
ADD CONSTRAINT chk_valor_diaria
CHECK (
    valor_diaria IS NULL
    OR valor_diaria >= 0
);


ALTER TABLE acampamentos
ADD CONSTRAINT chk_valor_crianca
CHECK (
    valor_crianca IS NULL
    OR valor_crianca >= 0
);


ALTER TABLE acampamentos
ADD CONSTRAINT chk_idade_max_crianca
CHECK (
    idade_max_crianca IS NULL
    OR idade_max_crianca BETWEEN 0 AND 17
);