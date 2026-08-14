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


    // =========================================
    // LISTAR ACAMPAMENTOS
    // =========================================

    if (req.method === "GET") {

        try {

            const acampamentos = await db.sql`

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

                    foto_key,

                    criado_em

                FROM acampamentos

                ORDER BY
                    data_inicio DESC,
                    criado_em DESC

            `;


            return Response.json({
                acampamentos
            });


        } catch (erro) {

            console.error(
                "Erro ao listar acampamentos:",
                erro
            );


            return Response.json(
                {
                    erro:
                        "Não foi possível carregar os acampamentos."
                },
                {
                    status: 500
                }
            );

        }

    }


    // =========================================
    // CRIAR ACAMPAMENTO
    // =========================================

    if (req.method === "POST") {

        if (!origemValida(req)) {
            return Response.json(
                { erro: "Origem não autorizada." },
                { status: 403 }
            );
        }


        try {

            const dados =
                await req.json();


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
                String(
                    dados.status || "rascunho"
                );


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


            if (!nome) {
                return Response.json(
                    {
                        erro:
                            "Informe o nome do acampamento."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (!local) {
                return Response.json(
                    {
                        erro:
                            "Informe o local do acampamento."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (
                !/^\d{4}-\d{2}-\d{2}$/
                .test(dataInicio) ||

                !/^\d{4}-\d{2}-\d{2}$/
                .test(dataFim)
            ) {

                return Response.json(
                    {
                        erro:
                            "Informe as datas corretamente."
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


            const valores = [
                valorCompleto,
                valorDiaria,
                valorCrianca
            ];


            if (
                valores.some(
                    valor =>
                        valor !== null &&
                        (
                            !Number.isFinite(valor) ||
                            valor < 0
                        )
                )
            ) {

                return Response.json(
                    {
                        erro:
                            "Verifique os valores informados."
                    },
                    {
                        status: 400
                    }
                );

            }


            if (
                idadeMaxCrianca !== null &&
                (
                    !Number.isInteger(
                        idadeMaxCrianca
                    ) ||
                    idadeMaxCrianca < 0 ||
                    idadeMaxCrianca > 17
                )
            ) {

                return Response.json(
                    {
                        erro:
                            "A idade máxima da criança deve estar entre 0 e 17 anos."
                    },
                    {
                        status: 400
                    }
                );

            }


            const resultado =
                await db.sql`

                    INSERT INTO acampamentos
                    (
                        nome,
                        descricao,
                        local,
                        data_inicio,
                        data_fim,
                        status,
                        valor_completo,
                        valor_diaria,
                        valor_crianca,
                        idade_max_crianca
                    )

                    VALUES
                    (
                        ${nome},
                        ${descricao || null},
                        ${local},
                        ${dataInicio},
                        ${dataFim},
                        ${status},
                        ${valorCompleto},
                        ${valorDiaria},
                        ${valorCrianca},
                        ${idadeMaxCrianca}
                    )

                    RETURNING
                        id,
                        nome,
                        status

                `;


            return Response.json(
                {
                    sucesso: true,
                    acampamento:
                        resultado[0]
                },
                {
                    status: 201
                }
            );


        } catch (erro) {

            console.error(
                "Erro ao criar acampamento:",
                erro
            );


            return Response.json(
                {
                    erro:
                        "Não foi possível criar o acampamento."
                },
                {
                    status: 500
                }
            );

        }

    }


    return Response.json(
        {
            erro:
                "Método não permitido."
        },
        {
            status: 405
        }
    );

};


export const config = {
    path: "/api/admin/acampamentos"
};