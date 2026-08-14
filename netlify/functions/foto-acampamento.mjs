import {
    getStore
} from "@netlify/blobs";


export default async (req, context) => {

    try {

        const chave =
            context.params.key;


        if (!chave) {

            return new Response(
                "Imagem inválida.",
                {
                    status: 400
                }
            );

        }


        const fotos =
            getStore(
                "fotos-acampamentos"
            );


        const resultado =
            await fotos.getWithMetadata(
                chave,
                {
                    type: "blob"
                }
            );


        if (!resultado) {

            return new Response(
                "Imagem não encontrada.",
                {
                    status: 404
                }
            );

        }


        return new Response(
            resultado.data,
            {
                headers: {

                    "Content-Type":
                        resultado.metadata
                            ?.contentType ||
                        resultado.data
                            ?.type ||
                        "application/octet-stream",

                    "Cache-Control":
                        "public, max-age=3600"

                }
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar foto:",
            erro
        );


        return new Response(
            "Erro ao carregar imagem.",
            {
                status: 500
            }
        );

    }

};


export const config = {

    path:
        "/api/foto-acampamento/:key"

};