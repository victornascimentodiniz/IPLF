let adminAcampamento = null;


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const autenticado =
            await verificarLogin();


        if (!autenticado) {

            window.location.href =
                "index.html";

            return;
        }


        document
        .getElementById(
            "painel-admin"
        )
        .hidden = false;


        document
        .getElementById(
            "form-admin-dia"
        )
        .addEventListener(
            "submit",
            salvarDia
        );


        document
        .getElementById(
            "form-admin-item"
        )
        .addEventListener(
            "submit",
            salvarItem
        );


        document
        .getElementById(
            "botao-sair-admin"
        )
        .addEventListener(
            "click",
            sair
        );


        await carregarPainel();

    }
);


async function verificarLogin() {

    try {

        const resposta =
            await fetch(
                "/api/admin/status",
                {
                    credentials:
                        "same-origin"
                }
            );


        const dados =
            await resposta.json();


        return (
            resposta.ok &&
            dados.autenticado
        );


    } catch {

        return false;

    }

}


async function carregarPainel() {

    const resposta =
        await fetch(
            "/api/admin/dados",
            {
                credentials:
                    "same-origin"
            }
        );


    if (resposta.status === 401) {

        window.location.href =
            "index.html";

        return;
    }


    const dados =
        await resposta.json();


    if (!resposta.ok) {

        alert(
            dados.erro ||
            "Erro ao carregar painel."
        );

        return;
    }


    adminAcampamento =
        dados.acampamento;


    document
    .getElementById(
        "admin-nome-acampamento"
    )
    .textContent =
        adminAcampamento.nome;


    document
    .getElementById(
        "admin-periodo-acampamento"
    )
    .textContent =
        `${formatarData(
            adminAcampamento.data_inicio
        )} até ${formatarData(
            adminAcampamento.data_fim
        )}`;


    const campoData =
        document.getElementById(
            "admin-data-dia"
        );


    campoData.min =
        adminAcampamento.data_inicio;

    campoData.max =
        adminAcampamento.data_fim;


    renderizarDias(
        dados.dias
    );


    renderizarItens(
        dados.itens
    );

}


async function salvarDia(event) {

    event.preventDefault();


    const mensagem =
        document.getElementById(
            "mensagem-admin-dia"
        );


    const data =
        document.getElementById(
            "admin-data-dia"
        ).value;


    mensagem.textContent = "";


    try {

        const resposta =
            await fetch(
                "/api/admin/dias",
                {

                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            acampamentoId:
                                adminAcampamento.id,

                            data

                        })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro
            );

        }


        mensagem.style.color =
            "#087a50";

        mensagem.textContent =
            "✓ Dia cadastrado com sucesso!";


        event.target.reset();


        await carregarPainel();


    } catch (erro) {

        mensagem.style.color =
            "#b00020";

        mensagem.textContent =
            erro.message;

    }

}


async function salvarItem(event) {

    event.preventDefault();


    const mensagem =
        document.getElementById(
            "mensagem-admin-item"
        );


    const nome =
        document
        .getElementById(
            "admin-item-nome"
        )
        .value
        .trim();


    const quantidade =
        Number(
            document
            .getElementById(
                "admin-item-quantidade"
            )
            .value
        );


    const unidade =
        document
        .getElementById(
            "admin-item-unidade"
        )
        .value
        .trim();


    const observacao =
        document
        .getElementById(
            "admin-item-observacao"
        )
        .value
        .trim();


    try {

        const resposta =
            await fetch(
                "/api/admin/itens",
                {

                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            acampamentoId:
                                adminAcampamento.id,

                            nome,

                            quantidade,

                            unidade,

                            observacao

                        })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro
            );

        }


        mensagem.style.color =
            "#087a50";

        mensagem.textContent =
            "✓ Item cadastrado com sucesso!";


        event.target.reset();


        await carregarPainel();


    } catch (erro) {

        mensagem.style.color =
            "#b00020";

        mensagem.textContent =
            erro.message;

    }

}


function renderizarDias(dias) {

    const lista =
        document.getElementById(
            "admin-lista-dias"
        );


    if (!dias.length) {

        lista.innerHTML =
            "<p>Nenhum dia cadastrado.</p>";

        return;
    }


    lista.innerHTML =
        dias.map(
            dia => `

                <div class="admin-item-lista">

                    <strong>
                        ${escaparHtml(
                            dia.nome_dia
                        )}
                    </strong>

                    <span>
                        ${formatarData(
                            dia.data
                        )}
                    </span>

                </div>

            `
        ).join("");

}


function renderizarItens(itens) {

    const lista =
        document.getElementById(
            "admin-lista-itens"
        );


    if (!itens.length) {

        lista.innerHTML =
            "<p>Nenhum item cadastrado.</p>";

        return;
    }


    lista.innerHTML =
        itens.map(
            item => `

                <div class="admin-item-lista">

                    <strong>
                        ${escaparHtml(
                            item.nome
                        )}
                    </strong>

                    <span>

                        ${Number(
                            item.quantidade_necessaria
                        ).toLocaleString(
                            "pt-BR"
                        )}

                        ${escaparHtml(
                            item.unidade
                        )}

                    </span>

                </div>

            `
        ).join("");

}


async function sair() {

    await fetch(
        "/api/admin/logout",
        {

            method: "POST",

            credentials:
                "same-origin"

        }
    );


    window.location.href =
        "index.html";

}


function formatarData(data) {

    const partes =
        String(data)
        .substring(0, 10)
        .split("-");


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


function escaparHtml(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}