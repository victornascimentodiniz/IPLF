-- =====================================================
-- ACAMPAMENTO TEMPORÁRIO PARA TESTE
-- =====================================================

INSERT INTO acampamentos (
    id,
    nome,
    descricao,
    local,
    data_inicio,
    data_fim,
    status
)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'Acampamento de Teste',
    'Acampamento temporário para testar inscrições e doações.',
    'Local de teste',
    CURRENT_DATE + 30,
    CURRENT_DATE + 33,
    'aberto'
)
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- DIAS DO ACAMPAMENTO
-- =====================================================

INSERT INTO dias_acampamento (
    id,
    acampamento_id,
    data,
    nome_dia
)
SELECT
    '21111111-1111-4111-8111-111111111111',
    id,
    data_inicio,
    '1º dia'
FROM acampamentos
WHERE id = '11111111-1111-4111-8111-111111111111'
ON CONFLICT DO NOTHING;


INSERT INTO dias_acampamento (
    id,
    acampamento_id,
    data,
    nome_dia
)
SELECT
    '21111111-1111-4111-8111-111111111112',
    id,
    data_inicio + 1,
    '2º dia'
FROM acampamentos
WHERE id = '11111111-1111-4111-8111-111111111111'
ON CONFLICT DO NOTHING;


INSERT INTO dias_acampamento (
    id,
    acampamento_id,
    data,
    nome_dia
)
SELECT
    '21111111-1111-4111-8111-111111111113',
    id,
    data_inicio + 2,
    '3º dia'
FROM acampamentos
WHERE id = '11111111-1111-4111-8111-111111111111'
ON CONFLICT DO NOTHING;


INSERT INTO dias_acampamento (
    id,
    acampamento_id,
    data,
    nome_dia
)
SELECT
    '21111111-1111-4111-8111-111111111114',
    id,
    data_inicio + 3,
    '4º dia'
FROM acampamentos
WHERE id = '11111111-1111-4111-8111-111111111111'
ON CONFLICT DO NOTHING;


-- =====================================================
-- ITENS TEMPORÁRIOS PARA DOAÇÃO
-- =====================================================

INSERT INTO itens_doacao (
    id,
    acampamento_id,
    nome,
    quantidade_necessaria,
    unidade,
    observacao
)
VALUES (
    '31111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Arroz',
    20,
    'kg',
    'Item de teste'
)
ON CONFLICT (id) DO NOTHING;


INSERT INTO itens_doacao (
    id,
    acampamento_id,
    nome,
    quantidade_necessaria,
    unidade,
    observacao
)
VALUES (
    '31111111-1111-4111-8111-111111111112',
    '11111111-1111-4111-8111-111111111111',
    'Refrigerante',
    30,
    'unidades',
    'Item de teste'
)
ON CONFLICT (id) DO NOTHING;