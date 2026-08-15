import {
    getDatabase
} from "@netlify/database";


const db =
    getDatabase();


// =====================================================
// LISTAR ACAMPAMENTOS PÚBLICOS
// =====================================================

export default async (req) => {

    // =================================================
    // ACEITAR SOMENTE GET
    // =================================================

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

        // =================================================
        // BUSCAR ACAMPAMENTOS ABERTOS
        // =================================================

        const acampamentos =
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


                    status


                FROM acampamentos


                WHERE status =
                    'aberto'


                ORDER BY

                    data_inicio ASC,

                    criado_em DESC

            `;


        // =================================================
        // RETORNAR RESULTADO
        // =================================================

        return Response.json(
            {

                sucesso:
                    true,

                acampamentos

            },
            {
                status: 200
            }
        );


    } catch (erro) {

        console.error(
            "ERRO ACAMPAMENTOS PÚBLICOS:",
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

};


// =====================================================
// ROTA
// =====================================================

export const config = {

    path:
        "/api/acampamentos-publicos"

};