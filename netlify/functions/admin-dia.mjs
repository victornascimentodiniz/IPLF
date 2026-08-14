import {
    getDatabase
} from "@netlify/database";

import {
    adminAutenticado,
    origemValida
} from "../lib/admin-auth.mjs";


const db =
    getDatabase();


function nomeDoDia(data) {

    const resultado =
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                weekday: "long",
                timeZone: "UTC"
            }
        )
        .format(
            new Date(
                `${data}T12:00:00Z`
            )
        );


    return (
        resultado
        .charAt(0)
        .toUpperCase()
        +
        resultado.slice(1)
    );
}


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


        const data =
            String(
                dados.data || ""
            );


        if (
            !acampamentoId ||
            !/^\d{4}-\d{2}-\d{2}$/
            .test(data)
        ) {

            return Response.json(
                {
                    erro:
                        "Informe uma data válida."
                },
                {
                    status: 400
                }
            );
        }


        const acampamento =
            await db.sql`

                SELECT id

                FROM acampamentos

                WHERE id =
                    ${acampamentoId}

                AND status = 'aberto'

                AND ${data}::date
                    BETWEEN data_inicio
                    AND data_fim

                LIMIT 1

            `;


        if (acampamento.length === 0) {

            return Response.json(
                {
                    erro:
                        "A data precisa estar dentro do período do acampamento."
                },
                {
                    status: 400
                }
            );
        }


        const resultado =
            await db.sql`

                INSERT INTO dias_acampamento
                (
                    acampamento_id,
                    data,
                    nome_dia
                )

                VALUES
                (
                    ${acampamentoId},
                    ${data},
                    ${nomeDoDia(data)}
                )

                RETURNING
                    id,
                    data::text AS data,
                    nome_dia

            `;


        return Response.json(
            {
                sucesso: true,
                dia: resultado[0]
            },
            {
                status: 201
            }
        );


    } catch (erro) {

        console.error(erro);


        if (erro.code === "23505") {

            return Response.json(
                {
                    erro:
                        "Este dia já está cadastrado."
                },
                {
                    status: 409
                }
            );
        }


        return Response.json(
            {
                erro:
                    "Não foi possível cadastrar o dia."
            },
            {
                status: 500
            }
        );
    }

};


export const config = {

    path: "/api/admin/dias"

};