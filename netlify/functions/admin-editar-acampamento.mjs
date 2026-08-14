import { getDatabase } from "@netlify/database";

import {
    adminAutenticado,
    origemValida
} from "../lib/admin-auth.mjs";


const db = getDatabase();


function numeroOuNull(valor) {

    if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
    ) {
        return null;
    }

    return Number(valor);
}


export default async (req, context) => {

    if (!adminAutenticado(context)) {

        return Response.json(
            { erro: "Não autorizado." },
            { status: 401 }
        );

    }


    if (req.method !== "PUT") {

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


        const id =
            String(dados.id || "");

        const nome =
            String(dados.nome || "").trim();

        const descricao =
            String(dados.descricao || "").trim();

        const local =
            String(dados.local || "").trim();

        const dataInicio =
            String(dados.dataInicio || "");

        const dataFim =
            String(dados.dataFim || "");

        const status =
            String(dados.status || "");


        const valorCompleto =
            numeroOuNull(
                dados.valorCompleto
            );

        const valorDiaria =
            numeroOuNull(
                dados.valorDiaria
            );

        const valorCrianca =
            numeroOuNull(
                dados.valorCrianca
            );

        const idadeMaxCrianca =
            numeroOuNull(
                dados.idadeMaxCrianca
            );


        if (!id || !nome || !local) {

            return Response.json(
                {
                    erro:
                        "Preencha as informações obrigatórias."
                },
                {
                    status: 400
                }
            );

        }


        if (
            ![
                "rascunho",
                "aberto",
                "encerrado"
            ].includes(status)
        ) {

            return Response.json(
                {
                    erro:
                        "Status inválido."
                },
                {
                    status: 400
                }
            );

        }


        if (
            new Date(dataFim) <
            new Date(dataInicio)
        ) {

            return Response.json(
                {
                    erro:
                        "A data final não pode ser anterior à inicial."
                },
                {
                    status: 400
                }
            );

        }


        const resultado =
            await db.sql`

                UPDATE acampamentos

                SET
                    nome =
                        ${nome},

                    descricao =
                        ${descricao || null},

                    local =
                        ${local},

                    data_inicio =
                        ${dataInicio},

                    data_fim =
                        ${dataFim},

                    status =
                        ${status},

                    valor_completo =
                        ${valorCompleto},

                    valor_diaria =
                        ${valorDiaria},

                    valor_crianca =
                        ${valorCrianca},

                    idade_max_crianca =
                        ${idadeMaxCrianca}

                WHERE id =
                    ${id}

                RETURNING id

            `;


        if (resultado.length === 0) {

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


        return Response.json({

            sucesso: true,

            mensagem:
                "Acampamento atualizado com sucesso."

        });


    } catch (erro) {

        console.error(
            "Erro ao editar acampamento:",
            erro
        );


        return Response.json(
            {
                erro:
                    "Não foi possível atualizar o acampamento."
            },
            {
                status: 500
            }
        );

    }

};


export const config = {
    path: "/api/admin/editar-acampamento"
};