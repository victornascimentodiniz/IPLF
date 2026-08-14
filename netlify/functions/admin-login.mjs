import {
    senhaCorreta,
    criarSessao,
    origemValida
} from "../lib/admin-auth.mjs";


export default async (req, context) => {

    if (req.method !== "POST") {

        return Response.json(
            {
                erro: "Método não permitido."
            },
            {
                status: 405
            }
        );
    }


    if (!origemValida(req)) {

        return Response.json(
            {
                erro: "Origem não autorizada."
            },
            {
                status: 403
            }
        );
    }


    try {

        const dados =
            await req.json();


        const senha =
            String(
                dados.senha || ""
            );


        if (!senhaCorreta(senha)) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        600
                    )
            );


            return Response.json(
                {
                    erro: "Senha incorreta."
                },
                {
                    status: 401
                }
            );
        }


        criarSessao(context);


        return Response.json({

            sucesso: true

        });


    } catch (erro) {

        console.error(erro);


        return Response.json(
            {
                erro:
                    "Não foi possível realizar o login."
            },
            {
                status: 500
            }
        );
    }

};


export const config = {

    path: "/api/admin/login"

};