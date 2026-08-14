import {
    getDatabase
} from "@netlify/database";

import {
    adminAutenticado
} from "../lib/admin-auth.mjs";


const db =
    getDatabase();


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
                    erro:
                        "Nenhum acampamento aberto."
                },
                {
                    status: 404
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


        return Response.json({

            acampamento,
            dias,
            itens

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