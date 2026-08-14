import {
    createHmac,
    timingSafeEqual
} from "node:crypto";


const COOKIE_NAME = "iplf_admin";


function compararSeguro(valor1, valor2) {

    const a = Buffer.from(String(valor1 || ""));
    const b = Buffer.from(String(valor2 || ""));

    if (a.length !== b.length) {
        return false;
    }

    return timingSafeEqual(a, b);
}


function assinar(valor) {

    const segredo = process.env.ADMIN_SESSION_SECRET;

    if (!segredo) {
        throw new Error(
            "ADMIN_SESSION_SECRET não configurado."
        );
    }

    return createHmac(
        "sha256",
        segredo
    )
    .update(valor)
    .digest("hex");
}


export function senhaCorreta(senha) {

    const senhaAdmin =
        process.env.ADMIN_PASSWORD;

    if (!senhaAdmin) {
        return false;
    }

    return compararSeguro(
        senha,
        senhaAdmin
    );
}


export function criarSessao(context) {

    const expiracao =
        Date.now() + (12 * 60 * 60 * 1000);

    const valor =
        String(expiracao);

    const assinatura =
        assinar(valor);

    const token =
        `${valor}.${assinatura}`;


    context.cookies.set({

        name: COOKIE_NAME,

        value: token,

        path: "/",

        httpOnly: true,

        secure: true,

        sameSite: "strict",

        maxAge: 12 * 60 * 60

    });
}


export function adminAutenticado(context) {

    const token =
        context.cookies.get(
            COOKIE_NAME
        );

    if (!token) {
        return false;
    }


    const partes =
        token.split(".");


    if (partes.length !== 2) {
        return false;
    }


    const [
        expiracao,
        assinaturaRecebida
    ] = partes;


    if (
        !expiracao ||
        Number(expiracao) < Date.now()
    ) {
        return false;
    }


    const assinaturaCorreta =
        assinar(expiracao);


    return compararSeguro(
        assinaturaRecebida,
        assinaturaCorreta
    );
}


export function encerrarSessao(context) {

    context.cookies.delete({

        name: COOKIE_NAME,
        path: "/"

    });
}


export function origemValida(req) {

    const origem =
        req.headers.get("origin");

    if (!origem) {
        return true;
    }

    return origem ===
        new URL(req.url).origin;
}