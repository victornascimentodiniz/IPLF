import {
    getDatabase
} from "@netlify/database";


const db = getDatabase();


export default async () => {

    try {

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

                WHERE status = 'aberto'

                ORDER BY
                    data_inicio ASC

            `;


        return Response.json({

            sucesso: true,

            acampamentos

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar acampamentos públicos:",
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


export const config = {

    path:
        "/api/acampamentos-publicos"

};