import {
    encerrarSessao,
    origemValida
} from "../lib/admin-auth.mjs";


export default async (req, context) => {

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


    encerrarSessao(context);


    return Response.json({

        sucesso: true

    });

};


export const config = {

    path: "/api/admin/logout"

};