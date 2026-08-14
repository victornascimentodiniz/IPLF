import {
    getDatabase
} from "@netlify/database";

import {
    adminAutenticado
} from "../lib/admin-auth.mjs";


const db = getDatabase();


const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;



export default async (req, context) => {

    // =====================================================
    // VERIFICAR LOGIN
    // =====================================================

    if (!adminAutenticado(context)) {

        return Response.json(
            {
                erro: "Não autorizado."
            },
            {
                status: 401
            }
        );

    }


    try {

        // =====================================================
        // PEGAR ID DO ACAMPAMENTO
        // =====================================================

        const url =
            new URL(req.url);


        const id =
            String(
                url.searchParams.get("id") || ""
            ).trim();


        if (!id) {

            return Response.json(
                {
                    erro:
                        "ID do acampamento não informado."
                },
                {
                    status: 400
                }
            );

        }


        if (!UUID_REGEX.test(id)) {

            console.error(
                "UUID inválido recebido:",
                JSON.stringify(id)
            );


            return Response.json(
                {
                    erro:
                        "ID do acampamento inválido."
                },
                {
                    status: 400
                }
            );

        }


        // =====================================================
        // BUSCAR ACAMPAMENTO
        // =====================================================

        const acampamentos =
            await db.sql`

                SELECT

                    id,
                    nome,
                    descricao,
                    local,

                    data_inicio::text
                        AS data_inicio,

                    data_fim::text
                        AS data_fim,

                    status,

                    valor_completo
                        ::double precision
                        AS valor_completo,

                    valor_diaria
                        ::double precision
                        AS valor_diaria,

                    valor_crianca
                        ::double precision
                        AS valor_crianca,

                    idade_max_crianca,

                    foto_key

                FROM acampamentos

                WHERE id = ${id}

                LIMIT 1

            `;


        if (acampamentos.length === 0) {

            return Response.json(
                {
                    erro:
                        "Acampamento não encontrado."
                },
                {
                    status: 404
                }
            );

        }


        const acampamento =
            acampamentos[0];


        // =====================================================
        // BUSCAR DIAS
        // =====================================================

        const dias =
            await db.sql`

                SELECT

                    id,

                    data::text
                        AS data,

                    nome_dia

                FROM dias_acampamento

                WHERE acampamento_id =
                    ${id}

                ORDER BY data ASC

            `;


        // =====================================================
        // BUSCAR ITENS DE DOAÇÃO
        // =====================================================

        const itens =
            await db.sql`

                SELECT

                    i.id,

                    i.nome,

                    i.quantidade_necessaria
                        ::double precision
                        AS quantidade_necessaria,

                    i.unidade,

                    i.observacao,

                    COALESCE(
                        SUM(d.quantidade),
                        0
                    )
                    ::double precision
                        AS quantidade_doada

                FROM itens_doacao i


                LEFT JOIN doacoes d

                    ON d.item_id =
                        i.id


                WHERE i.acampamento_id =
                    ${id}


                GROUP BY

                    i.id,

                    i.nome,

                    i.quantidade_necessaria,

                    i.unidade,

                    i.observacao


                ORDER BY
                    i.nome ASC

            `;


        // =====================================================
        // BUSCAR INSCRITOS
        // =====================================================

        const inscritos =
            await db.sql`

                SELECT

                    ins.id,

                    ins.nome_completo,

                    ins.telefone,

                    ins.criado_em,

                    COALESCE(

                        json_agg(

                            json_build_object(

                                'id',
                                dia.id,

                                'data',
                                dia.data::text,

                                'nome_dia',
                                dia.nome_dia

                            )

                            ORDER BY
                                dia.data ASC

                        )

                        FILTER (
                            WHERE dia.id
                            IS NOT NULL
                        ),

                        '[]'::json

                    ) AS dias


                FROM inscricoes ins


                LEFT JOIN inscricao_dias idias

                    ON idias.inscricao_id =
                        ins.id


                LEFT JOIN dias_acampamento dia

                    ON dia.id =
                        idias.dia_acampamento_id


                WHERE ins.acampamento_id =
                    ${id}


                GROUP BY

                    ins.id,

                    ins.nome_completo,

                    ins.telefone,

                    ins.criado_em


                ORDER BY

                    ins.criado_em DESC

            `;


        // =====================================================
        // RESPOSTA
        // =====================================================

        return Response.json({

            sucesso: true,

            acampamento,

            dias,

            itens,

            inscritos

        });


    } catch (erro) {

        console.error(
            "ERRO ADMIN-DADOS:",
            erro
        );


        return Response.json(
            {
                erro:
                    "Não foi possível carregar o acampamento."
            },
            {
                status: 500
            }
        );

    }

};



export const config = {

    path:
        "/api/admin/dados"

};