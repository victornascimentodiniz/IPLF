import { getDatabase } from "@netlify/database";

const db = getDatabase();


export default async (req) => {

    if (req.method !== "POST") {

        return Response.json(
            { erro: "Método não permitido." },
            { status: 405 }
        );

    }


    let body;

    try {

        body = await req.json();

    } catch {

        return Response.json(
            { erro: "Dados inválidos." },
            { status: 400 }
        );

    }


    const itemId =
        String(body.itemId || "").trim();

    const nomeDoador =
        String(body.nomeDoador || "").trim();

    const telefone =
        String(body.telefone || "").trim();

    const quantidade =
        Number(body.quantidade);


    if (!itemId) {

        return Response.json(
            { erro: "Item inválido." },
            { status: 400 }
        );

    }


    if (!nomeDoador || nomeDoador.length > 150) {

        return Response.json(
            { erro: "Informe seu nome." },
            { status: 400 }
        );

    }


    if (
        !Number.isFinite(quantidade) ||
        quantidade <= 0
    ) {

        return Response.json(
            { erro: "Informe uma quantidade válida." },
            { status: 400 }
        );

    }


    const client = await db.pool.connect();


    try {

        await client.query("BEGIN");


        const resultadoItem = await client.query(
            `
            SELECT
                id,
                quantidade_necessaria::double precision
                    AS quantidade_necessaria
            FROM itens_doacao
            WHERE id = $1
            FOR UPDATE
            `,
            [itemId]
        );


        if (resultadoItem.rowCount === 0) {

            await client.query("ROLLBACK");

            return Response.json(
                { erro: "Item não encontrado." },
                { status: 404 }
            );

        }


        const necessario =
            Number(
                resultadoItem.rows[0]
                    .quantidade_necessaria
            );


        const resultadoTotal = await client.query(
            `
            SELECT
                COALESCE(
                    SUM(quantidade),
                    0
                )::double precision AS total
            FROM doacoes
            WHERE item_id = $1
            `,
            [itemId]
        );


        const jaDoado =
            Number(
                resultadoTotal.rows[0].total
            );


        const restante =
            Math.max(
                0,
                necessario - jaDoado
            );


        if (restante <= 0) {

            await client.query("ROLLBACK");

            return Response.json(
                {
                    erro: "A quantidade necessária deste item já foi atingida."
                },
                {
                    status: 400
                }
            );

        }


        if (quantidade > restante) {

            await client.query("ROLLBACK");

            return Response.json(
                {
                    erro:
                        `Faltam apenas ${restante} deste item.`
                },
                {
                    status: 400
                }
            );

        }


        await client.query(
            `
            INSERT INTO doacoes (
                item_id,
                nome_doador,
                telefone,
                quantidade
            )
            VALUES ($1, $2, $3, $4)
            `,
            [
                itemId,
                nomeDoador,
                telefone || null,
                quantidade
            ]
        );


        await client.query("COMMIT");


        const novoTotal =
            jaDoado + quantidade;


        return Response.json(
            {
                sucesso: true,
                quantidadeDoada: novoTotal,
                restante:
                    Math.max(
                        0,
                        necessario - novoTotal
                    ),
                mensagem: "Doação registrada com sucesso!"
            },
            {
                status: 201
            }
        );


    } catch (erro) {

        await client.query("ROLLBACK");


        console.error(
            "Erro ao registrar doação:",
            erro
        );


        return Response.json(
            {
                erro: "Não foi possível registrar a doação."
            },
            {
                status: 500
            }
        );


    } finally {

        client.release();

    }

};


export const config = {
    path: "/api/doacoes"
};