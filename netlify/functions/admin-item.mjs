import {
    getDatabase
} from "@netlify/database";

import {
    adminAutenticado,
    origemValida
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


    if (req.method !== "POST") {

        return Response.json(
            {
                erro:
                    "Método não permitido."
            },
            {
                status: 405
            }
        );
    }


    if (!origemValida(req)) {

        return Response.json(
            {
                erro:
                    "Origem não autorizada."
            },
            {
                status: 403
            }
        );
    }


    try {

        const dados =
            await req.json();


        const acampamentoId =
            String(
                dados.acampamentoId || ""
            );


        const nome =
            String(
                dados.nome || ""
            ).trim();


        const quantidade =
            Number(
                dados.quantidade
            );


        const unidade =
            String(
                dados.unidade || ""
            ).trim();


        const observacao =
            String(
                dados.observacao || ""
            ).trim();


        if (!acampamentoId) {

            return Response.json(
                {
                    erro:
                        "Acampamento inválido."
                },
                {
                    status: 400
                }
            );
        }


        if (
            !nome ||
            nome.length > 150
        ) {

            return Response.json(
                {
                    erro:
                        "Informe o nome do item."
                },
                {
                    status: 400
                }
            );
        }


        if (
            !Number.isFinite(quantidade) ||
            quantidade <= 0
        ) {

            return Response.json(
                {
                    erro:
                        "Informe uma quantidade válida."
                },
                {
                    status: 400
                }
            );
        }


        if (
            !unidade ||
            unidade.length > 30
        ) {

            return Response.json(
                {
                    erro:
                        "Informe a unidade."
                },
                {
                    status: 400
                }
            );
        }


        const resultado =
            await db.sql`

                INSERT INTO itens_doacao
                (
                    acampamento_id,
                    nome,
                    quantidade_necessaria,
                    unidade,
                    observacao
                )

                VALUES
                (
                    ${acampamentoId},
                    ${nome},
                    ${quantidade},
                    ${unidade},
                    ${observacao || null}
                )

                RETURNING
                    id,
                    nome,
                    quantidade_necessaria
                    ::double precision
                    AS quantidade_necessaria,
                    unidade,
                    observacao

            `;


        return Response.json(
            {
                sucesso: true,
                item: resultado[0]
            },
            {
                status: 201
            }
        );


    } catch (erro) {

        console.error(erro);


        return Response.json(
            {
                erro:
                    "Não foi possível cadastrar o item."
            },
            {
                status: 500
            }
        );
    }

};


export const config = {

    path: "/api/admin/itens"

};