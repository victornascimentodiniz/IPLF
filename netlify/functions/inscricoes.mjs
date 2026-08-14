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


    const acampamentoId =
        String(body.acampamentoId || "").trim();

    const nomeCompleto =
        String(body.nomeCompleto || "").trim();

    const telefone =
        String(body.telefone || "").trim();

    const dias =
        Array.isArray(body.dias)
            ? [...new Set(body.dias)]
            : [];


    if (!acampamentoId) {

        return Response.json(
            { erro: "Acampamento inválido." },
            { status: 400 }
        );

    }


    if (!nomeCompleto || nomeCompleto.length > 150) {

        return Response.json(
            { erro: "Informe um nome válido." },
            { status: 400 }
        );

    }


    if (!telefone || telefone.length > 30) {

        return Response.json(
            { erro: "Informe um telefone válido." },
            { status: 400 }
        );

    }


    if (dias.length === 0) {

        return Response.json(
            {
                erro: "Escolha pelo menos um dia do acampamento."
            },
            {
                status: 400
            }
        );

    }


    const client = await db.pool.connect();


    try {

        await client.query("BEGIN");


        const acampamento = await client.query(
            `
            SELECT id
            FROM acampamentos
            WHERE id = $1
              AND status = 'aberto'
            `,
            [acampamentoId]
        );


        if (acampamento.rowCount === 0) {

            await client.query("ROLLBACK");

            return Response.json(
                {
                    erro: "Este acampamento não está disponível para inscrição."
                },
                {
                    status: 400
                }
            );

        }


        const diasValidos = await client.query(
            `
            SELECT id
            FROM dias_acampamento
            WHERE acampamento_id = $1
              AND id = ANY($2::uuid[])
            `,
            [
                acampamentoId,
                dias
            ]
        );


        if (diasValidos.rowCount !== dias.length) {

            await client.query("ROLLBACK");

            return Response.json(
                {
                    erro: "Um ou mais dias escolhidos são inválidos."
                },
                {
                    status: 400
                }
            );

        }


        const resultadoInscricao = await client.query(
            `
            INSERT INTO inscricoes (
                acampamento_id,
                nome_completo,
                telefone
            )
            VALUES ($1, $2, $3)
            RETURNING id
            `,
            [
                acampamentoId,
                nomeCompleto,
                telefone
            ]
        );


        const inscricaoId =
            resultadoInscricao.rows[0].id;


        await client.query(
            `
            INSERT INTO inscricao_dias (
                inscricao_id,
                dia_acampamento_id
            )
            SELECT
                $1,
                unnest($2::uuid[])
            `,
            [
                inscricaoId,
                dias
            ]
        );


        await client.query("COMMIT");


        return Response.json(
            {
                sucesso: true,
                inscricaoId,
                mensagem: "Inscrição realizada com sucesso!"
            },
            {
                status: 201
            }
        );


    } catch (erro) {

        await client.query("ROLLBACK");

        console.error(
            "Erro ao realizar inscrição:",
            erro
        );


        return Response.json(
            {
                erro: "Não foi possível realizar a inscrição."
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
    path: "/api/inscricoes"
};