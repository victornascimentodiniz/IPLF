import {
    getStore
} from "@netlify/blobs";

import {
    getDatabase
} from "@netlify/database";

import {
    adminAutenticado,
    origemValida
} from "../lib/admin-auth.mjs";


const db = getDatabase();


const TAMANHO_MAXIMO =
    3 * 1024 * 1024;


const TIPOS_PERMITIDOS = [

    "image/jpeg",
    "image/png",
    "image/webp"

];


export default async (req, context) => {

    if (!adminAutenticado(context)) {

        return Response.json(
            {
                erro:
                    "Não autorizado."
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

        const formData =
            await req.formData();


        const acampamentoId =
            String(
                formData.get(
                    "acampamentoId"
                ) || ""
            );


        const foto =
            formData.get(
                "foto"
            );


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
            !foto ||
            typeof foto.arrayBuffer !==
                "function"
        ) {

            return Response.json(
                {
                    erro:
                        "Escolha uma foto."
                },
                {
                    status: 400
                }
            );

        }


        if (
            !TIPOS_PERMITIDOS.includes(
                foto.type
            )
        ) {

            return Response.json(
                {
                    erro:
                        "Use uma imagem JPG, PNG ou WEBP."
                },
                {
                    status: 400
                }
            );

        }


        if (
            foto.size >
            TAMANHO_MAXIMO
        ) {

            return Response.json(
                {
                    erro:
                        "A foto deve ter no máximo 3 MB."
                },
                {
                    status: 400
                }
            );

        }


        const acampamentos =
            await db.sql`

                SELECT
                    id,
                    foto_key

                FROM acampamentos

                WHERE id =
                    ${acampamentoId}

                LIMIT 1

            `;


        if (
            acampamentos.length === 0
        ) {

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


        const fotoAntiga =
            acampamentos[0].foto_key;


        const chave =
            `foto-${acampamentoId}-${crypto.randomUUID()}`;


        const fotos =
            getStore(
                "fotos-acampamentos"
            );


        await fotos.set(
            chave,
            foto,
            {
                metadata: {

                    contentType:
                        foto.type,

                    nomeOriginal:
                        foto.name

                }
            }
        );


        await db.sql`

            UPDATE acampamentos

            SET foto_key =
                ${chave}

            WHERE id =
                ${acampamentoId}

        `;


        if (
            fotoAntiga &&
            fotoAntiga !== chave
        ) {

            try {

                await fotos.delete(
                    fotoAntiga
                );

            } catch (erro) {

                console.error(
                    "Não foi possível apagar a foto antiga:",
                    erro
                );

            }

        }


        return Response.json({

            sucesso: true,

            fotoKey:
                chave,

            fotoUrl:
                `/api/foto-acampamento/${chave}`

        });


    } catch (erro) {

        console.error(
            "Erro no upload da foto:",
            erro
        );


        return Response.json(
            {
                erro:
                    "Não foi possível enviar a foto."
            },
            {
                status: 500
            }
        );

    }

};


export const config = {
    path: "/api/admin/foto-acampamento"
};