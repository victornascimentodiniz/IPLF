-- ============================================
-- 1. ACAMPAMENTOS
-- ============================================

CREATE TABLE acampamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    local VARCHAR(200),

    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'aberto',

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_datas_acampamento
        CHECK (data_fim >= data_inicio),

    CONSTRAINT chk_status_acampamento
        CHECK (status IN ('rascunho', 'aberto', 'encerrado'))
);


-- ============================================
-- 2. DIAS DO ACAMPAMENTO
-- ============================================

CREATE TABLE dias_acampamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    acampamento_id UUID NOT NULL,

    data DATE NOT NULL,
    nome_dia VARCHAR(50) NOT NULL,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_dia_acampamento
        FOREIGN KEY (acampamento_id)
        REFERENCES acampamentos(id)
        ON DELETE CASCADE,

    CONSTRAINT dia_unico_acampamento
        UNIQUE (acampamento_id, data)
);


-- ============================================
-- 3. INSCRIÇÕES
-- ============================================

CREATE TABLE inscricoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    acampamento_id UUID NOT NULL,

    nome_completo VARCHAR(150) NOT NULL,
    telefone VARCHAR(30) NOT NULL,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inscricao_acampamento
        FOREIGN KEY (acampamento_id)
        REFERENCES acampamentos(id)
        ON DELETE CASCADE
);


-- ============================================
-- 4. DIAS ESCOLHIDOS NA INSCRIÇÃO
-- ============================================

CREATE TABLE inscricao_dias (
    inscricao_id UUID NOT NULL,
    dia_acampamento_id UUID NOT NULL,

    PRIMARY KEY (
        inscricao_id,
        dia_acampamento_id
    ),

    CONSTRAINT fk_inscricao_dias_inscricao
        FOREIGN KEY (inscricao_id)
        REFERENCES inscricoes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inscricao_dias_dia
        FOREIGN KEY (dia_acampamento_id)
        REFERENCES dias_acampamento(id)
        ON DELETE CASCADE
);


-- ============================================
-- 5. ITENS PARA DOAÇÃO
-- ============================================

CREATE TABLE itens_doacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    acampamento_id UUID NOT NULL,

    nome VARCHAR(150) NOT NULL,

    quantidade_necessaria NUMERIC(10,2) NOT NULL,

    unidade VARCHAR(30) NOT NULL,

    observacao TEXT,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_item_acampamento
        FOREIGN KEY (acampamento_id)
        REFERENCES acampamentos(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_quantidade_necessaria
        CHECK (quantidade_necessaria > 0)
);


-- ============================================
-- 6. DOAÇÕES
-- ============================================

CREATE TABLE doacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    item_id UUID NOT NULL,

    nome_doador VARCHAR(150) NOT NULL,

    telefone VARCHAR(30),

    quantidade NUMERIC(10,2) NOT NULL,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_doacao_item
        FOREIGN KEY (item_id)
        REFERENCES itens_doacao(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_quantidade_doacao
        CHECK (quantidade > 0)
);