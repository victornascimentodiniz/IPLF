console.log("Site IPLF carregado.");

let acampamentoAtualId = null;


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        configurarAbas();

        configurarModal();

        const formInscricao =
            document.getElementById(
                "form-inscricao"
            );


        if (formInscricao) {

            configurarFormularioInscricao();

            configurarFormularioDoacao();

            configurarBotoesDoacao();

            carregarAcampamento();

        }

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

    const conteudos =
        document.querySelectorAll(
            ".conteudo-aba"
        );


    botoes.forEach(botao => {

        botao.addEventListener(
            "click",
            function () {

                const aba =
                    this.dataset.aba;


                botoes.forEach(item => {

                    item.classList.remove(
                        "ativa"
                    );

                });


                conteudos.forEach(item => {

                    item.classList.remove(
                        "ativo"
                    );

                });


                this.classList.add(
                    "ativa"
                );


                const conteudo =
                    document.getElementById(
                        aba
                    );


                if (conteudo) {

                    conteudo.classList.add(
                        "ativo"
                    );

                }

            }
        );

    });

}


// =====================================================
// CARREGAR ACAMPAMENTO DO BANCO
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

        listaItens.innerHTML =
            `
            <div class="sem-itens">
                <p>
                    Carregando itens...
                </p>
            </div>
            `;

    }


    try {

        const resposta =
            await fetch(
                "/api/acampamento"
            );


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
            dados.dias
        );


        renderizarItens(
            dados.itens
        );


    } catch (erro) {

        console.error(erro);


        if (listaDias) {

            listaDias.innerHTML =
                `
                <p style="color:#b00020;">
                    Não foi possível carregar
                    os dias do acampamento.
                </p>
                `;

        }


        if (listaItens) {

            listaItens.innerHTML =
                `
                <div class="sem-itens">

                    <h3>
                        Não foi possível carregar
                        as doações
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

    const data =
        document.getElementById(
            "data-acampamento"
        );

    const local =
        document.getElementById(
            "local-acampamento"
        );


    if (nome) {

        nome.textContent =
            acampamento.nome;

        document.title =
            `${acampamento.nome} | IPLF`;

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


    if (!dias || dias.length === 0) {

        lista.innerHTML =
            "<p>Nenhum dia cadastrado.</p>";

        return;

    }


    lista.innerHTML =
        dias.map(
            (dia, indice) => {

                return `
                    <div class="dia-opcao">

                        <input
                            type="checkbox"
                            id="dia-${indice}"
                            name="dias"
                            value="${dia.id}"
                        >

                        <label
                            for="dia-${indice}"
                        >

                            📅
                            ${escaparHtml(
                                dia.nome_dia
                            )}

                            -
                            ${formatarData(
                                dia.data
                            )}

                        </label>

                    </div>
                `;

            }
        ).join("");

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


    if (!itens || itens.length === 0) {

        lista.innerHTML =
            `
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
        itens.map(item => {


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


                    <div
                        class="quantidades-doacao"
                    >

                        <span>
                            Necessário:
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


                    <div
                        class="quantidades-doacao"
                    >

                        <span>
                            Já doado:
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


                    <div
                        class="barra-doacao"
                    >

                        <div
                            class="progresso-doacao"
                            style="
                                width:
                                ${porcentagem}%
                            "
                        >
                        </div>

                    </div>


                    <p
                        class="falta-doacao"
                    >

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

                        data-item-id="
                            ${item.id}
                        "

                        data-item-nome="
                            ${escaparHtml(
                                item.nome
                            )}
                        "

                        data-unidade="
                            ${escaparHtml(
                                item.unidade
                            )}
                        "

                        ${concluido
                            ? "disabled"
                            : ""
                        }
                    >

                        ${
                            concluido
                                ? "META ATINGIDA"
                                : "VOU DOAR"
                        }

                    </button>


                </div>
            `;

        }).join("");

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


            mensagem.textContent = "";


            if (!acampamentoAtualId) {

                mensagem.textContent =
                    "O acampamento ainda não foi carregado.";

                return;

            }


            const nomeCompleto =
                document.getElementById(
                    "nome"
                ).value.trim();


            const telefone =
                document.getElementById(
                    "telefone"
                ).value.trim();


            const dias =
                Array.from(
                    document.querySelectorAll(
                        'input[name="dias"]:checked'
                    )
                ).map(
                    item => item.value
                );


            if (dias.length === 0) {

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


            botao.disabled = true;

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
                    "#087a50";


                mensagem.textContent =
                    "✓ Inscrição realizada com sucesso!";


                formulario.reset();


            } catch (erro) {

                mensagem.style.color =
                    "#b00020";


                mensagem.textContent =
                    erro.message;

            } finally {

                botao.disabled = false;

                botao.textContent =
                    textoOriginal;

            }

        }
    );

}


// =====================================================
// MODAL
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

            if (event.target === modal) {

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


    if (!modal) {
        return;
    }


    nomeItem.textContent =
        nome;


    itemId.value =
        id;


    quantidade.placeholder =
        `Quantidade em ${unidade}`;


    modal.classList.add(
        "aberto"
    );

}


function fecharModalDoacao() {

    const modal =
        document.getElementById(
            "modal-doacao"
        );


    if (modal) {

        modal.classList.remove(
            "aberto"
        );

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


            mensagem.textContent = "";


            const itemId =
                document.getElementById(
                    "item-doacao-id"
                ).value;


            const nomeDoador =
                document.getElementById(
                    "nome-doador"
                ).value.trim();


            const telefone =
                document.getElementById(
                    "telefone-doador"
                ).value.trim();


            const quantidade =
                Number(
                    document.getElementById(
                        "quantidade-doacao"
                    ).value
                );


            const botao =
                formulario.querySelector(
                    'button[type="submit"]'
                );


            const textoOriginal =
                botao.textContent;


            botao.disabled = true;

            botao.textContent =
                "SALVANDO...";


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
                    "#087a50";


                mensagem.textContent =
                    "✓ Doação registrada com sucesso!";


                formulario.reset();


                setTimeout(
                    async function () {

                        fecharModalDoacao();

                        await carregarAcampamento();

                    },
                    1000
                );


            } catch (erro) {

                mensagem.style.color =
                    "#b00020";


                mensagem.textContent =
                    erro.message;


            } finally {

                botao.disabled = false;

                botao.textContent =
                    textoOriginal;

            }

        }
    );

}


// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function formatarData(data) {

    if (!data) {
        return "";
    }


    const somenteData =
        String(data).substring(
            0,
            10
        );


    const partes =
        somenteData.split("-");


    if (partes.length !== 3) {

        return data;

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

    if (!inicio) {
        return "Data não informada";
    }


    if (!fim || inicio === fim) {

        return formatarData(
            inicio
        );

    }


    return (
        formatarData(inicio) +
        " a " +
        formatarData(fim)
    );

}


function formatarNumero(valor) {

    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                maximumFractionDigits: 2
            }
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