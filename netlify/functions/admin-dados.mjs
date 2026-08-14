import {
    getDatabase
} from "@netlify/database";

import {
    adminAutenticado
} from "../lib/admin-auth.mjs";


const db = getDatabase();


export default async (req, context) => {

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

        const url =
            new URL(req.url);

        const id =
            url.searchParams.get("id");


        if (!id) {

            return Response.json(
                {
                    erro:
                        "Informe o acampamento."
                },
                {
                    status: 400
                }
            );

        }


        // ==========================================
        // ACAMPAMENTO
        // ==========================================

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


        // ==========================================
        // DIAS
        // ==========================================

        const dias =
            await db.sql`

                SELECT

                    id,
                    data::text AS data,
                    nome_dia

                FROM dias_acampamento

                WHERE acampamento_id =
                    ${id}

                ORDER BY data

            `;


        // ==========================================
        // ITENS DE DOAÇÃO
        // ==========================================

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
                    )::double precision
                        AS quantidade_doada

                FROM itens_doacao i

                LEFT JOIN doacoes d
                    ON d.item_id = i.id

                WHERE i.acampamento_id =
                    ${id}

                GROUP BY i.id

                ORDER BY i.nome

            `;


        // ==========================================
        // INSCRITOS
        // ==========================================

        const inscritos =
            await db.sql`

                SELECT

                    i.id,

                    i.nome_completo,

                    i.telefone,

                    i.criado_em,

                    COALESCE(

                        json_agg(

                            json_build_object(

                                'id',
                                d.id,

                                'data',
                                d.data::text,

                                'nome_dia',
                                d.nome_dia

                            )

                            ORDER BY d.data

                        )

                        FILTER (
                            WHERE d.id IS NOT NULL
                        ),

                        '[]'::json

                    ) AS dias

                FROM inscricoes i


                LEFT JOIN inscricao_dias idias

                    ON idias.inscricao_id =
                        i.id


                LEFT JOIN dias_acampamento d

                    ON d.id =
                        idias.dia_acampamento_id


                WHERE i.acampamento_id =
                    ${id}


                GROUP BY

                    i.id,
                    i.nome_completo,
                    i.telefone,
                    i.criado_em


                ORDER BY
                    i.criado_em DESC

            `;


        return Response.json({

            acampamento,
            dias,
            itens,
            inscritos

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar acampamento:",
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