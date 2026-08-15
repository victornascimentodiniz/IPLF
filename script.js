console.log("Página do acampamento IPLF carregada.");

let acampamentoAtualId = null;


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        configurarAbas();
        configurarModal();
        configurarFormularioInscricao();
        configurarFormularioDoacao();
        configurarBotoesDoacao();
        abrirAbaDaUrl();
        carregarAcampamento();

    }
);


// =====================================================
// ABAS
// =====================================================

function configurarAbas() {

    const botoes =
        document.querySelectorAll(
            ".aba-acampamento"
        );


    botoes.forEach(
        function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    abrirAba(
                        this.dataset.aba,
                        true
                    );

                }
            );

        }
    );

}


function abrirAba(
    nomeAba,
    atualizarUrl = false
) {

    const botoes =
        document.querySelectorAll(
            ".aba-acampamento"
        );


    const conteudos =
        document.querySelectorAll(
            ".conteudo-aba"
        );


    botoes.forEach(
        function (item) {

            item.classList.remove(
                "ativa"
            );

        }
    );


    conteudos.forEach(
        function (item) {

            item.classList.remove(
                "ativo"
            );

        }
    );


    const botao =
        document.querySelector(
            `.aba-acampamento[data-aba="${nomeAba}"]`
        );


    const conteudo =
        document.getElementById(
            nomeAba
        );


    if (botao) {
        botao.classList.add("ativa");
    }


    if (conteudo) {
        conteudo.classList.add("ativo");
    }


    if (atualizarUrl) {

        const url =
            new URL(
                window.location.href
            );


        url.searchParams.set(
            "aba",
            nomeAba
        );


        window.history.replaceState(
            {},
            "",
            url
        );

    }

}


function abrirAbaDaUrl() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const aba =
        parametros.get("aba");


    if (
        aba === "inscricao" ||
        aba === "doacoes"
    ) {

        abrirAba(
            aba,
            false
        );

    }

}


// =====================================================
// CARREGAR ACAMPAMENTO
// =====================================================

async function carregarAcampamento() {

    const listaDias =
        document.getElementById(
            "lista-dias"
        );


    const listaItens =
        document.getElementById(
            "lista-itens-doacao"
        );


    if (listaDias) {

        listaDias.innerHTML =
            "<p>Carregando dias...</p>";

    }


    if (listaItens) {

        listaItens.innerHTML = `

            <div class="sem-itens">

                <h3>
                    Carregando itens...
                </h3>

                <p>
                    Aguarde um momento.
                </p>

            </div>

        `;

    }


    try {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const id =
            String(
                parametros.get("id") || ""
            ).trim();


        const url =
            id

                ? `/api/acampamento?id=${encodeURIComponent(id)}`

                : "/api/acampamento";


        const resposta =
            await fetch(url);


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar acampamento."
            );

        }


        const acampamento =
            dados.acampamento;


        acampamentoAtualId =
            acampamento.id;


        atualizarCabecalho(
            acampamento
        );


        renderizarDias(
            dados.dias || []
        );


        renderizarItens(
            dados.itens || []
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar acampamento:",
            erro
        );


        if (listaDias) {

            listaDias.innerHTML = `

                <p style="color:#a64039;">
                    Não foi possível carregar
                    os dias do acampamento.
                </p>

            `;

        }


        if (listaItens) {

            listaItens.innerHTML = `

                <div class="sem-itens">

                    <h3>
                        Não foi possível carregar as doações
                    </h3>

                    <p>
                        ${escaparHtml(
                            erro.message
                        )}
                    </p>

                </div>

            `;

        }

    }

}


// =====================================================
// CABEÇALHO
// =====================================================

function atualizarCabecalho(
    acampamento
) {

    const nome =
        document.getElementById(
            "nome-acampamento"
        );


    const descricao =
        document.getElementById(
            "descricao-acampamento"
        );


    const data =
        document.getElementById(
            "data-acampamento"
        );


    const local =
        document.getElementById(
            "local-acampamento"
        );


    const foto =
        document.getElementById(
            "acampamento-foto-hero"
        );


    if (nome) {

        nome.textContent =
            acampamento.nome ||
            "Acampamento IPLF";


        document.title =
            `${acampamento.nome || "Acampamento"} | IPLF`;

    }


    if (descricao) {

        descricao.textContent =
            acampamento.descricao ||
            "Um tempo especial de comunhão, crescimento e presença de Deus.";

    }


    if (data) {

        data.textContent =
            formatarPeriodo(
                acampamento.data_inicio,
                acampamento.data_fim
            );

    }


    if (local) {

        local.textContent =
            acampamento.local ||
            "Local não informado";

    }


    if (
        foto &&
        acampamento.foto_key
    ) {

        foto.style.backgroundImage =
            `url("/api/foto-acampamento/${encodeURIComponent(
                acampamento.foto_key
            )}")`;

    }


    atualizarValores(
        acampamento
    );

}


// =====================================================
// VALORES
// =====================================================

function atualizarValores(
    acampamento
) {

    const area =
        document.getElementById(
            "acampamento-valores"
        );


    const configuracoes = [

        {
            valor:
                acampamento.valor_completo,

            bloco:
                "bloco-valor-completo",

            destino:
                "valor-completo-publico"
        },

        {
            valor:
                acampamento.valor_diaria,

            bloco:
                "bloco-valor-diaria",

            destino:
                "valor-diaria-publico"
        },

        {
            valor:
                acampamento.valor_crianca,

            bloco:
                "bloco-valor-crianca",

            destino:
                "valor-crianca-publico"
        }

    ];


    let algumValor =
        false;


    configuracoes.forEach(
        function (configuracao) {

            const bloco =
                document.getElementById(
                    configuracao.bloco
                );


            const destino =
                document.getElementById(
                    configuracao.destino
                );


            const existe =
                configuracao.valor !== null &&
                configuracao.valor !== undefined &&
                configuracao.valor !== "" &&
                Number.isFinite(
                    Number(
                        configuracao.valor
                    )
                );


            if (
                bloco &&
                destino
            ) {

                bloco.hidden =
                    !existe;


                if (existe) {

                    destino.textContent =
                        formatarDinheiro(
                            configuracao.valor
                        );


                    algumValor =
                        true;

                }

            }

        }
    );


    const labelCrianca =
        document.getElementById(
            "label-valor-crianca"
        );


    if (
        labelCrianca &&
        acampamento.idade_max_crianca !== null &&
        acampamento.idade_max_crianca !== undefined
    ) {

        labelCrianca.textContent =
            `CRIANÇA ATÉ ${Number(
                acampamento.idade_max_crianca
            )} ANOS`;

    }


    if (area) {

        area.hidden =
            !algumValor;

    }

}


// =====================================================
// DIAS
// =====================================================

function renderizarDias(
    dias
) {

    const lista =
        document.getElementById(
            "lista-dias"
        );


    if (!lista) {
        return;
    }


    if (
        !dias ||
        dias.length === 0
    ) {

        lista.innerHTML =
            "<p>Nenhum dia cadastrado.</p>";

        return;
    }


    lista.innerHTML =
        dias.map(
            function (dia, indice) {

                return `

                    <div class="dia-opcao">

                        <input
                            type="checkbox"
                            id="dia-${indice}"
                            name="dias"
                            value="${dia.id}"
                        >

                        <label for="dia-${indice}">

                            ${escaparHtml(
                                dia.nome_dia
                            )}

                            •
                            ${formatarData(
                                dia.data
                            )}

                        </label>

                    </div>

                `;

            }
        )
        .join("");

}


// =====================================================
// ITENS DE DOAÇÃO
// =====================================================

function renderizarItens(
    itens
) {

    const lista =
        document.getElementById(
            "lista-itens-doacao"
        );


    if (!lista) {
        return;
    }


    if (
        !itens ||
        itens.length === 0
    ) {

        lista.innerHTML = `

            <div class="sem-itens">

                <h3>
                    Nenhum item cadastrado
                </h3>

                <p>
                    Ainda não existem itens
                    para doação.
                </p>

            </div>

        `;

        return;
    }


    lista.innerHTML =
        itens.map(
            function (item) {

                const necessario =
                    Number(
                        item.quantidade_necessaria
                    );


                const doado =
                    Number(
                        item.quantidade_doada
                    );


                const faltando =
                    Math.max(
                        0,
                        necessario - doado
                    );


                const porcentagem =
                    necessario > 0

                        ? Math.min(
                            100,
                            (
                                doado /
                                necessario
                            ) * 100
                        )

                        : 0;


                const concluido =
                    faltando <= 0;


                return `

                    <div class="card-doacao">

                        <h3>
                            ${escaparHtml(
                                item.nome
                            )}
                        </h3>


                        <div class="quantidades-doacao">

                            <span>
                                Necessário
                            </span>

                            <strong>

                                ${formatarNumero(
                                    necessario
                                )}

                                ${escaparHtml(
                                    item.unidade
                                )}

                            </strong>

                        </div>


                        <div class="quantidades-doacao">

                            <span>
                                Já doado
                            </span>

                            <strong>

                                ${formatarNumero(
                                    doado
                                )}

                                ${escaparHtml(
                                    item.unidade
                                )}

                            </strong>

                        </div>


                        <div class="barra-doacao">

                            <div
                                class="progresso-doacao"
                                style="width:${porcentagem}%">
                            </div>

                        </div>


                        <p class="falta-doacao">

                            ${
                                concluido

                                    ? "Meta atingida!"

                                    : `
                                        Faltam
                                        <strong>

                                            ${formatarNumero(
                                                faltando
                                            )}

                                            ${escaparHtml(
                                                item.unidade
                                            )}

                                        </strong>
                                    `
                            }

                        </p>


                        <button
                            type="button"
                            class="botao-doar"
                            data-item-id="${item.id}"
                            data-item-nome="${escaparAtributo(
                                item.nome
                            )}"
                            data-unidade="${escaparAtributo(
                                item.unidade
                            )}"
                            ${concluido ? "disabled" : ""}>

                            ${
                                concluido
                                    ? "META ATINGIDA"
                                    : "VOU DOAR"
                            }

                        </button>

                    </div>

                `;

            }
        )
        .join("");

}


// =====================================================
// BOTÕES DE DOAÇÃO
// =====================================================

function configurarBotoesDoacao() {

    const lista =
        document.getElementById(
            "lista-itens-doacao"
        );


    if (!lista) {
        return;
    }


    lista.addEventListener(
        "click",
        function (event) {

            const botao =
                event.target.closest(
                    ".botao-doar"
                );


            if (
                !botao ||
                botao.disabled
            ) {
                return;
            }


            abrirModalDoacao(
                botao.dataset.itemId,
                botao.dataset.itemNome,
                botao.dataset.unidade
            );

        }
    );

}


// =====================================================
// INSCRIÇÃO
// =====================================================

function configurarFormularioInscricao() {

    const formulario =
        document.getElementById(
            "form-inscricao"
        );


    if (!formulario) {
        return;
    }


    formulario.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const mensagem =
                document.getElementById(
                    "mensagem-inscricao"
                );


            mensagem.textContent =
                "";


            if (!acampamentoAtualId) {

                mensagem.style.color =
                    "#a64039";


                mensagem.textContent =
                    "O acampamento ainda não foi carregado.";

                return;
            }


            const nomeCompleto =
                document.getElementById(
                    "nome"
                )
                .value
                .trim();


            const telefone =
                document.getElementById(
                    "telefone"
                )
                .value
                .trim();


            const dias =
                Array.from(
                    document.querySelectorAll(
                        'input[name="dias"]:checked'
                    )
                )
                .map(
                    function (item) {
                        return item.value;
                    }
                );


            if (
                dias.length === 0
            ) {

                mensagem.style.color =
                    "#a64039";


                mensagem.textContent =
                    "Escolha pelo menos um dia.";

                return;
            }


            const botao =
                formulario.querySelector(
                    'button[type="submit"]'
                );


            const textoOriginal =
                botao.textContent;


            botao.disabled =
                true;


            botao.textContent =
                "SALVANDO...";


            try {

                const resposta =
                    await fetch(
                        "/api/inscricoes",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    acampamentoId:
                                        acampamentoAtualId,

                                    nomeCompleto,

                                    telefone,

                                    dias
                                })

                        }
                    );


                const dados =
                    await resposta.json();


                if (!resposta.ok) {

                    throw new Error(
                        dados.erro ||
                        "Erro ao realizar inscrição."
                    );

                }


                mensagem.style.color =
                    "#176646";


                mensagem.textContent =
                    "✓ Inscrição realizada com sucesso!";


                formulario.reset();


            } catch (erro) {

                mensagem.style.color =
                    "#a64039";


                mensagem.textContent =
                    erro.message;


            } finally {

                botao.disabled =
                    false;


                botao.textContent =
                    textoOriginal;

            }

        }
    );

}


// =====================================================
// MODAL DE DOAÇÃO
// =====================================================

function configurarModal() {

    const modal =
        document.getElementById(
            "modal-doacao"
        );


    const fechar =
        document.getElementById(
            "fechar-modal"
        );


    if (!modal) {
        return;
    }


    if (fechar) {

        fechar.addEventListener(
            "click",
            fecharModalDoacao
        );

    }


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                fecharModalDoacao();

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal.classList.contains(
                    "aberto"
                )
            ) {

                fecharModalDoacao();

            }

        }
    );

}


function abrirModalDoacao(
    id,
    nome,
    unidade
) {

    const modal =
        document.getElementById(
            "modal-doacao"
        );


    const nomeItem =
        document.getElementById(
            "nome-item-modal"
        );


    const itemId =
        document.getElementById(
            "item-doacao-id"
        );


    const quantidade =
        document.getElementById(
            "quantidade-doacao"
        );


    if (
        !modal ||
        !nomeItem ||
        !itemId ||
        !quantidade
    ) {
        return;
    }


    nomeItem.textContent =
        nome;


    itemId.value =
        id;


    quantidade.placeholder =
        `Quantidade em ${unidade}`;


    document.body.style.overflow =
        "hidden";


    modal.classList.add(
        "aberto"
    );

}


function fecharModalDoacao() {

    const modal =
        document.getElementById(
            "modal-doacao"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "aberto"
    );


    document.body.style.overflow =
        "";


    const formulario =
        document.getElementById(
            "form-doacao"
        );


    const mensagem =
        document.getElementById(
            "mensagem-doacao"
        );


    if (formulario) {
        formulario.reset();
    }


    if (mensagem) {
        mensagem.textContent = "";
    }

}


// =====================================================
// SALVAR DOAÇÃO
// =====================================================

function configurarFormularioDoacao() {

    const formulario =
        document.getElementById(
            "form-doacao"
        );


    if (!formulario) {
        return;
    }


    formulario.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const mensagem =
                document.getElementById(
                    "mensagem-doacao"
                );


            mensagem.textContent =
                "";


            const itemId =
                document.getElementById(
                    "item-doacao-id"
                )
                .value;


            const nomeDoador =
                document.getElementById(
                    "nome-doador"
                )
                .value
                .trim();


            const telefone =
                document.getElementById(
                    "telefone-doador"
                )
                .value
                .trim();


            const quantidade =
                Number(
                    document.getElementById(
                        "quantidade-doacao"
                    )
                    .value
                );


            const botao =
                formulario.querySelector(
                    'button[type="submit"]'
                );


            const textoOriginal =
                botao.textContent;


            botao.disabled =
                true;


            botao.textContent =
                "REGISTRANDO...";


            try {

                const resposta =
                    await fetch(
                        "/api/doacoes",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    itemId,
                                    nomeDoador,
                                    telefone,
                                    quantidade
                                })

                        }
                    );


                const dados =
                    await resposta.json();


                if (!resposta.ok) {

                    throw new Error(
                        dados.erro ||
                        "Erro ao registrar doação."
                    );

                }


                mensagem.style.color =
                    "#176646";


                mensagem.textContent =
                    "✓ Doação registrada com sucesso!";


                setTimeout(
                    function () {

                        fecharModalDoacao();

                        carregarAcampamento();

                    },
                    900
                );


            } catch (erro) {

                mensagem.style.color =
                    "#a64039";


                mensagem.textContent =
                    erro.message;


            } finally {

                botao.disabled =
                    false;


                botao.textContent =
                    textoOriginal;

            }

        }
    );

}


// =====================================================
// AUXILIARES
// =====================================================

function formatarData(data) {

    if (!data) {
        return "";
    }


    const partes =
        String(data)
        .substring(0, 10)
        .split("-");


    if (
        partes.length !== 3
    ) {
        return String(data);
    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


function formatarPeriodo(
    inicio,
    fim
) {

    if (
        inicio &&
        fim
    ) {

        return (
            formatarData(inicio) +
            " — " +
            formatarData(fim)
        );

    }


    return (
        formatarData(
            inicio || fim
        )
        ||
        "Data a definir"
    );

}


function formatarNumero(valor) {

    return Number(
        valor || 0
    )
    .toLocaleString(
        "pt-BR",
        {
            maximumFractionDigits: 2
        }
    );

}


function formatarDinheiro(valor) {

    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}


function escaparHtml(valor) {

    return String(
        valor ?? ""
    )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escaparAtributo(valor) {

    return escaparHtml(valor)
        .replaceAll("`", "&#096;");

}
