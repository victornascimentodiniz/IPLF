import { getDatabase } from "@netlify/database";

import {
    adminAutenticado,
    origemValida
} from "../lib/admin-auth.mjs";


const db = getDatabase();


export default async (req, context) => {

    if (!adminAutenticado(context)) {
        return Response.json(
            { erro: "Não autorizado." },
            { status: 401 }
        );
    }


    if (req.method !== "DELETE") {
        return Response.json(
            { erro: "Método não permitido." },
            { status: 405 }
        );
    }


    if (!origemValida(req)) {
        return Response.json(
            { erro: "Origem não autorizada." },
            { status: 403 }
        );
    }


    try {

        const dados = await req.json();

        const id =
            String(dados.id || "");

        const acampamentoId =
            String(dados.acampamentoId || "");


        if (!id || !acampamentoId) {
            return Response.json(
                { erro: "Item inválido." },
                { status: 400 }
            );
        }


        const resultado = await db.sql`

            DELETE FROM itens_doacao

            WHERE id = ${id}
            AND acampamento_id = ${acampamentoId}

            RETURNING id

        `;


        if (resultado.length === 0) {
            return Response.json(
                {
                    erro:
                        "Item não encontrado."
                },
                {
                    status: 404
                }
            );
        }


        return Response.json({
            sucesso: true
        });


    } catch (erro) {

        console.error(
            "Erro ao excluir item:",
            erro
        );


        return Response.json(
            {
                erro:
                    "Não foi possível excluir o item."
            },
            {
                status: 500
            }
        );

    }

};


export const config = {
    path: "/api/admin/excluir-item"
};