import {
    getDatabase
} from "@netlify/database";


const db =
    getDatabase();


export default async (req) => {

    if (
        req.method !== "GET"
    ) {

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


    try {

        const url =
            new URL(req.url);


        const id =
            String(
                url.searchParams.get("id") || ""
            ).trim();


        let acampamentos;


        if (id) {

            acampamentos =
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

                    WHERE id =
                        ${id}

                    AND status =
                        'aberto'

                    LIMIT 1

                `;

        } else {

            acampamentos =
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

                    WHERE status =
                        'aberto'

                    ORDER BY
                        data_inicio ASC,
                        criado_em DESC

                    LIMIT 1

                `;

        }


        if (
            acampamentos.length === 0
        ) {

            return Response.json(
                {
                    erro:
                        "Nenhum acampamento disponível foi encontrado."
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
                    ON d.item_id =
                        i.id

                WHERE i.acampamento_id =
                    ${acampamento.id}

                GROUP BY
                    i.id,
                    i.nome,
                    i.quantidade_necessaria,
                    i.unidade,
                    i.observacao

                ORDER BY
                    i.nome

            `;


        return Response.json({

            acampamento,
            dias,
            itens

        });


    } catch (erro) {

        console.error(
            "Erro ao buscar acampamento:",
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
        "/api/acampamento"

};
