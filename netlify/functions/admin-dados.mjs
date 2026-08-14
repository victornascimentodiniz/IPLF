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

        const acampamentos =
            await db.sql`

                SELECT
                    id,
                    nome,
                    local,

                    data_inicio::text
                        AS data_inicio,

                    data_fim::text
                        AS data_fim

                FROM acampamentos

                WHERE status = 'aberto'

                ORDER BY criado_em DESC

                LIMIT 1

            `;


        if (acampamentos.length === 0) {

            return Response.json(
                {
                    semAcampamento: true,
                    dias: [],
                    itens: [],
                    inscritos: []
                }
            );

        }


        const acampamento =
            acampamentos[0];


        const dias =
            await db.sql`

                SELECT
                    id,
                    data::text AS data,
                    nome_dia

                FROM dias_acampamento

                WHERE acampamento_id =
                    ${acampamento.id}

                ORDER BY data

            `;


        const itens =
            await db.sql`

                SELECT
                    id,
                    nome,

                    quantidade_necessaria
                    ::double precision
                    AS quantidade_necessaria,

                    unidade,
                    observacao

                FROM itens_doacao

                WHERE acampamento_id =
                    ${acampamento.id}

                ORDER BY nome

            `;


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
                    ${acampamento.id}


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
            "Erro admin:",
            erro
        );


        return Response.json(
            {
                erro:
                    "Erro ao carregar o painel."
            },
            {
                status: 500
            }
        );

    }

};


export const config = {
    path: "/api/admin/dados"
};