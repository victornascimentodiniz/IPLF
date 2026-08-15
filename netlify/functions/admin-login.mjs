import {
    senhaCorreta,
    criarSessao,
    origemValida
} from "../lib/admin-auth.mjs";


// =====================================================
// LOGIN ADMINISTRATIVO
// =====================================================

export default async (req, context) => {

    // =================================================
    // ACEITAR SOMENTE POST
    // =================================================

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


    // =================================================
    // VERIFICAR ORIGEM
    // =================================================

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

        // =================================================
        // LER DADOS RECEBIDOS
        // =================================================

        const dados =
            await req.json();


        const senha =
            String(
                dados?.senha || ""
            );


        // =================================================
        // SENHA VAZIA
        // =================================================

        if (!senha) {

            return Response.json(
                {
                    erro:
                        "Digite a senha."
                },
                {
                    status: 400
                }
            );

        }


        // =================================================
        // VERIFICAR SENHA
        // =================================================

        if (!senhaCorreta(senha)) {

            /*
                Pequeno atraso para dificultar
                várias tentativas muito rápidas.
            */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );


            return Response.json(
                {
                    erro:
                        "Senha incorreta."
                },
                {
                    status: 401
                }
            );

        }


        // =================================================
        // CRIAR SESSÃO
        // =================================================

        criarSessao(context);


        // =================================================
        // LOGIN CORRETO
        // =================================================

        return Response.json(
            {
                sucesso: true,

                mensagem:
                    "Login realizado com sucesso."
            },
            {
                status: 200
            }
        );


    } catch (erro) {

        console.error(
            "ERRO ADMIN LOGIN:",
            erro
        );


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


// =====================================================
// ROTA DA FUNCTION
// =====================================================

export const config = {

    path:
        "/api/admin/login"

};