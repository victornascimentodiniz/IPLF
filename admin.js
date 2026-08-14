let acampamentos = [];

let acampamentoAtual = null;


// =====================================================
// INÍCIO
// =====================================================

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


        configurarEventos();


        await carregarListaAcampamentos();

    }
);


// =====================================================
// EVENTOS
// =====================================================

function configurarEventos() {


    document
    .getElementById(
        "novo-acampamento"
    )
    .addEventListener(
        "click",
        prepararNovoAcampamento
    );


    document
    .getElementById(
        "form-acampamento"
    )
    .addEventListener(
        "submit",
        salvarAcampamento
    );


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


    document
    .getElementById(
        "excluir-acampamento"
    )
    .addEventListener(
        "click",
        excluirAcampamento
    );


    document
    .getElementById(
        "lista-acampamentos-admin"
    )
    .addEventListener(
        "click",
        function(event) {


            const botao =
                event.target.closest(
                    "[data-acampamento-id]"
                );


            if (!botao) {
                return;
            }


            selecionarAcampamento(
                botao.dataset.acampamentoId
            );

        }
    );


    document
    .getElementById(
        "admin-lista-dias"
    )
    .addEventListener(
        "click",
        function(event) {


            const botao =
                event.target.closest(
                    "[data-excluir-dia]"
                );


            if (!botao) {
                return;
            }


            excluirDia(
                botao.dataset.excluirDia,
                botao.dataset.nome
            );

        }
    );


    document
    .getElementById(
        "admin-lista-itens"
    )
    .addEventListener(
        "click",
        function(event) {


            const botao =
                event.target.closest(
                    "[data-excluir-item]"
                );


            if (!botao) {
                return;
            }


            excluirItem(
                botao.dataset.excluirItem,
                botao.dataset.nome
            );

        }
    );


    document
    .getElementById(
        "acampamento-foto"
    )
    .addEventListener(
        "change",
        visualizarFotoEscolhida
    );

}


// =====================================================
// LOGIN
// =====================================================

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


// =====================================================
// LISTAR ACAMPAMENTOS
// =====================================================

async function carregarListaAcampamentos(
    selecionarId = null
) {

    try {

        const resposta =
            await fetch(
                "/api/admin/acampamentos",
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

            throw new Error(
                dados.erro ||
                "Erro ao carregar acampamentos."
            );

        }


        acampamentos =
            dados.acampamentos || [];


        renderizarListaAcampamentos();


        if (selecionarId) {

            await selecionarAcampamento(
                selecionarId
            );

            return;

        }


        if (
            acampamentoAtual &&
            acampamentos.some(
                item =>
                    item.id ===
                    acampamentoAtual.id
            )
        ) {

            await selecionarAcampamento(
                acampamentoAtual.id
            );

            return;

        }


        if (acampamentos.length > 0) {

            await selecionarAcampamento(
                acampamentos[0].id
            );

        } else {

            prepararNovoAcampamento();

        }


    } catch (erro) {

        alert(
            erro.message
        );

    }

}


// =====================================================
// RENDER LISTA
// =====================================================

function renderizarListaAcampamentos() {

    const lista =
        document.getElementById(
            "lista-acampamentos-admin"
        );


    document
    .getElementById(
        "quantidade-acampamentos"
    )
    .textContent =
        acampamentos.length;


    if (!acampamentos.length) {

        lista.innerHTML = `

            <div class="texto-vazio">

                Nenhum acampamento cadastrado.

            </div>

        `;

        return;

    }


    lista.innerHTML =
        acampamentos.map(

            acampamento => {


                let statusTexto =
                    "Rascunho";


                if (
                    acampamento.status ===
                    "aberto"
                ) {

                    statusTexto =
                        "Inscrições abertas";

                }


                if (
                    acampamento.status ===
                    "encerrado"
                ) {

                    statusTexto =
                        "Encerrado";

                }


                const ativo =
                    acampamentoAtual &&
                    acampamentoAtual.id ===
                    acampamento.id;


                return `

                    <button
                        type="button"

                        class="
                            item-acampamento-admin
                            ${ativo
                                ? "ativo"
                                : ""
                            }
                        "

                        data-acampamento-id="
                            ${acampamento.id}
                        ">


                        <strong>

                            ${escaparHtml(
                                acampamento.nome
                            )}

                        </strong>


                        <span>

                            ${formatarData(
                                acampamento.data_inicio
                            )}

                            até

                            ${formatarData(
                                acampamento.data_fim
                            )}

                        </span>


                        <small
                            class="
                                status-admin
                                status-${acampamento.status}
                            ">

                            ${statusTexto}

                        </small>


                    </button>

                `;

            }

        ).join("");

}


// =====================================================
// SELECIONAR ACAMPAMENTO
// =====================================================

async function selecionarAcampamento(id) {

    try {

        const resposta =
            await fetch(
                `/api/admin/dados?id=${encodeURIComponent(id)}`,
                {
                    credentials:
                        "same-origin"
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar acampamento."
            );

        }


        acampamentoAtual =
            dados.acampamento;


        preencherFormulario(
            acampamentoAtual
        );


        renderizarDias(
            dados.dias || []
        );


        renderizarItens(
            dados.itens || []
        );


        renderizarInscritos(
            dados.inscritos || []
        );


        document
        .getElementById(
            "recursos-acampamento"
        )
        .hidden = false;


        document
        .getElementById(
            "excluir-acampamento"
        )
        .hidden = false;


        const campoData =
            document.getElementById(
                "admin-data-dia"
            );


        campoData.min =
            acampamentoAtual.data_inicio;


        campoData.max =
            acampamentoAtual.data_fim;


        renderizarListaAcampamentos();


    } catch (erro) {

        alert(
            erro.message
        );

    }

}


// =====================================================
// NOVO ACAMPAMENTO
// =====================================================

function prepararNovoAcampamento() {

    acampamentoAtual = null;


    const formulario =
        document.getElementById(
            "form-acampamento"
        );


    formulario.reset();


    document
    .getElementById(
        "acampamento-id"
    )
    .value = "";


    document
    .getElementById(
        "acampamento-status"
    )
    .value =
        "rascunho";


    document
    .getElementById(
        "titulo-editor-acampamento"
    )
    .textContent =
        "Novo acampamento";


    document
    .getElementById(
        "salvar-acampamento"
    )
    .textContent =
        "CRIAR ACAMPAMENTO";


    document
    .getElementById(
        "mensagem-acampamento"
    )
    .textContent = "";


    document
    .getElementById(
        "excluir-acampamento"
    )
    .hidden = true;


    document
    .getElementById(
        "recursos-acampamento"
    )
    .hidden = true;


    removerPreviewFoto();


    renderizarListaAcampamentos();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =====================================================
// PREENCHER FORM
// =====================================================

function preencherFormulario(
    acampamento
) {

    document
    .getElementById(
        "acampamento-id"
    )
    .value =
        acampamento.id;


    document
    .getElementById(
        "acampamento-nome"
    )
    .value =
        acampamento.nome || "";


    document
    .getElementById(
        "acampamento-descricao"
    )
    .value =
        acampamento.descricao || "";


    document
    .getElementById(
        "acampamento-local"
    )
    .value =
        acampamento.local || "";


    document
    .getElementById(
        "acampamento-data-inicio"
    )
    .value =
        acampamento.data_inicio || "";


    document
    .getElementById(
        "acampamento-data-fim"
    )
    .value =
        acampamento.data_fim || "";


    document
    .getElementById(
        "valor-completo"
    )
    .value =
        acampamento.valor_completo ??
        "";


    document
    .getElementById(
        "valor-diaria"
    )
    .value =
        acampamento.valor_diaria ??
        "";


    document
    .getElementById(
        "valor-crianca"
    )
    .value =
        acampamento.valor_crianca ??
        "";


    document
    .getElementById(
        "idade-max-crianca"
    )
    .value =
        acampamento.idade_max_crianca ??
        "";


    document
    .getElementById(
        "acampamento-status"
    )
    .value =
        acampamento.status ||
        "rascunho";


    document
    .getElementById(
        "titulo-editor-acampamento"
    )
    .textContent =
        acampamento.nome;


    document
    .getElementById(
        "salvar-acampamento"
    )
    .textContent =
        "SALVAR ALTERAÇÕES";


    document
    .getElementById(
        "mensagem-acampamento"
    )
    .textContent = "";


    document
    .getElementById(
        "acampamento-foto"
    )
    .value = "";


    if (acampamento.foto_key) {

        mostrarFoto(

            `/api/foto-acampamento/${encodeURIComponent(
                acampamento.foto_key
            )}`

        );

    } else {

        removerPreviewFoto();

    }

}


// =====================================================
// SALVAR ACAMPAMENTO
// =====================================================

async function salvarAcampamento(event) {

    event.preventDefault();


    const id =
        document
        .getElementById(
            "acampamento-id"
        )
        .value;


    const mensagem =
        document.getElementById(
            "mensagem-acampamento"
        );


    const botao =
        document.getElementById(
            "salvar-acampamento"
        );


    mensagem.textContent = "";


    const dados = {

        nome:
            document
            .getElementById(
                "acampamento-nome"
            )
            .value
            .trim(),

        descricao:
            document
            .getElementById(
                "acampamento-descricao"
            )
            .value
            .trim(),

        local:
            document
            .getElementById(
                "acampamento-local"
            )
            .value
            .trim(),

        dataInicio:
            document
            .getElementById(
                "acampamento-data-inicio"
            )
            .value,

        dataFim:
            document
            .getElementById(
                "acampamento-data-fim"
            )
            .value,

        valorCompleto:
            valorOuNull(
                document
                .getElementById(
                    "valor-completo"
                )
                .value
            ),

        valorDiaria:
            valorOuNull(
                document
                .getElementById(
                    "valor-diaria"
                )
                .value
            ),

        valorCrianca:
            valorOuNull(
                document
                .getElementById(
                    "valor-crianca"
                )
                .value
            ),

        idadeMaxCrianca:
            valorOuNull(
                document
                .getElementById(
                    "idade-max-crianca"
                )
                .value
            ),

        status:
            document
            .getElementById(
                "acampamento-status"
            )
            .value

    };


    if (id) {

        dados.id = id;

    }


    const textoOriginal =
        botao.textContent;


    botao.disabled = true;

    botao.textContent =
        "SALVANDO...";


    try {

        const resposta =
            await fetch(

                id
                    ? "/api/admin/editar-acampamento"
                    : "/api/admin/acampamentos",

                {

                    method:
                        id
                            ? "PUT"
                            : "POST",

                    credentials:
                        "same-origin",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            dados
                        )

                }

            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                "Erro ao salvar acampamento."
            );

        }


        const acampamentoId =

            id ||

            resultado
            .acampamento
            .id;


        // FOTO

        const arquivoFoto =
            document
            .getElementById(
                "acampamento-foto"
            )
            .files[0];


        if (arquivoFoto) {

            await enviarFoto(
                acampamentoId,
                arquivoFoto
            );

        }


        mensagem.style.color =
            "#087a50";


        mensagem.textContent =
            id
                ? "✓ Acampamento atualizado com sucesso!"
                : "✓ Acampamento criado com sucesso!";


        await carregarListaAcampamentos(
            acampamentoId
        );


    } catch (erro) {

        mensagem.style.color =
            "#b00020";


        mensagem.textContent =
            erro.message;


    } finally {

        botao.disabled = false;

        botao.textContent =
            id
                ? "SALVAR ALTERAÇÕES"
                : textoOriginal;

    }

}


// =====================================================
// FOTO
// =====================================================

async function enviarFoto(
    acampamentoId,
    arquivo
) {

    const formData =
        new FormData();


    formData.append(
        "acampamentoId",
        acampamentoId
    );


    formData.append(
        "foto",
        arquivo
    );


    const resposta =
        await fetch(
            "/api/admin/foto-acampamento",
            {

                method: "POST",

                credentials:
                    "same-origin",

                body:
                    formData

            }
        );


    const dados =
        await resposta.json();


    if (!resposta.ok) {

        throw new Error(
            dados.erro ||
            "O acampamento foi salvo, mas ocorreu um erro ao enviar a foto."
        );

    }

}


function visualizarFotoEscolhida(
    event
) {

    const arquivo =
        event.target.files[0];


    if (!arquivo) {
        return;
    }


    const url =
        URL.createObjectURL(
            arquivo
        );


    mostrarFoto(url);

}


function mostrarFoto(url) {

    const imagem =
        document.getElementById(
            "foto-admin-imagem"
        );


    const vazio =
        document.getElementById(
            "foto-admin-sem-imagem"
        );


    imagem.src = url;

    imagem.hidden = false;

    vazio.hidden = true;

}


function removerPreviewFoto() {

    const imagem =
        document.getElementById(
            "foto-admin-imagem"
        );


    const vazio =
        document.getElementById(
            "foto-admin-sem-imagem"
        );


    imagem.removeAttribute(
        "src"
    );


    imagem.hidden = true;

    vazio.hidden = false;

}


// =====================================================
// DIAS
// =====================================================

async function salvarDia(event) {

    event.preventDefault();


    if (!acampamentoAtual) {
        return;
    }


    const mensagem =
        document.getElementById(
            "mensagem-admin-dia"
        );


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
                                acampamentoAtual.id,

                            data:
                                document
                                .getElementById(
                                    "admin-data-dia"
                                )
                                .value

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
            "✓ Dia cadastrado!";


        event.target.reset();


        await selecionarAcampamento(
            acampamentoAtual.id
        );


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

                    <div>

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


                    <button
                        type="button"

                        class="
                            botao-excluir-pequeno
                        "

                        data-excluir-dia="
                            ${dia.id}
                        "

                        data-nome="
                            ${escaparHtml(
                                dia.nome_dia
                            )}
                        ">

                        EXCLUIR

                    </button>

                </div>

            `

        ).join("");

}


// =====================================================
// ITENS
// =====================================================

async function salvarItem(event) {

    event.preventDefault();


    if (!acampamentoAtual) {
        return;
    }


    const mensagem =
        document.getElementById(
            "mensagem-admin-item"
        );


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
                                acampamentoAtual.id,

                            nome:
                                document
                                .getElementById(
                                    "admin-item-nome"
                                )
                                .value
                                .trim(),

                            quantidade:
                                Number(
                                    document
                                    .getElementById(
                                        "admin-item-quantidade"
                                    )
                                    .value
                                ),

                            unidade:
                                document
                                .getElementById(
                                    "admin-item-unidade"
                                )
                                .value
                                .trim(),

                            observacao:
                                document
                                .getElementById(
                                    "admin-item-observacao"
                                )
                                .value
                                .trim()

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
            "✓ Item cadastrado!";


        event.target.reset();


        await selecionarAcampamento(
            acampamentoAtual.id
        );


    } catch (erro) {

        mensagem.style.color =
            "#b00020";


        mensagem.textContent =
            erro.message;

    }

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


                    <div>

                        <strong>

                            ${escaparHtml(
                                item.nome
                            )}

                        </strong>


                        <span>

                            ${formatarNumero(
                                item.quantidade_doada
                            )}

                            /

                            ${formatarNumero(
                                item.quantidade_necessaria
                            )}

                            ${escaparHtml(
                                item.unidade
                            )}

                        </span>

                    </div>


                    <button
                        type="button"

                        class="
                            botao-excluir-pequeno
                        "

                        data-excluir-item="
                            ${item.id}
                        "

                        data-nome="
                            ${escaparHtml(
                                item.nome
                            )}
                        ">

                        EXCLUIR

                    </button>


                </div>

            `

        ).join("");

}


// =====================================================
// INSCRITOS
// =====================================================

function renderizarInscritos(
    inscritos
) {

    const lista =
        document.getElementById(
            "admin-lista-inscritos"
        );


    document
    .getElementById(
        "total-inscritos"
    )
    .textContent =
        inscritos.length;


    if (!inscritos.length) {

        lista.innerHTML = `

            <div class="nenhum-inscrito">

                Nenhuma pessoa inscrita ainda.

            </div>

        `;

        return;

    }


    lista.innerHTML =
        inscritos.map(

            pessoa => {


                const dias =
                    Array.isArray(
                        pessoa.dias
                    )
                    ? pessoa.dias
                    : [];


                const diasHtml =
                    dias.map(

                        dia => `

                            <span
                                class="
                                    tag-dia-inscrito
                                ">

                                ${escaparHtml(
                                    dia.nome_dia
                                )}

                                -

                                ${formatarData(
                                    dia.data
                                )}

                            </span>

                        `

                    ).join("");


                return `

                    <div class="pessoa-inscrita">


                        <div class="pessoa-inicial">

                            ${escaparHtml(
                                pessoa.nome_completo
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>


                        <div class="pessoa-dados">


                            <h3>

                                ${escaparHtml(
                                    pessoa.nome_completo
                                )}

                            </h3>


                            <p>

                                📱

                                ${escaparHtml(
                                    pessoa.telefone
                                )}

                            </p>


                            <div class="dias-pessoa">

                                ${diasHtml}

                            </div>


                        </div>


                    </div>

                `;

            }

        ).join("");

}


// =====================================================
// EXCLUIR DIA
// =====================================================

async function excluirDia(
    id,
    nome
) {

    if (!acampamentoAtual) {
        return;
    }


    if (
        !confirm(
            `Excluir ${nome}?`
        )
    ) {
        return;
    }


    await executarExclusao(
        "/api/admin/excluir-dia",
        {

            id,

            acampamentoId:
                acampamentoAtual.id

        }
    );


    await selecionarAcampamento(
        acampamentoAtual.id
    );

}


// =====================================================
// EXCLUIR ITEM
// =====================================================

async function excluirItem(
    id,
    nome
) {

    if (!acampamentoAtual) {
        return;
    }


    if (
        !confirm(
            `Excluir o item "${nome}"?\n\nAs doações ligadas a ele também serão apagadas.`
        )
    ) {
        return;
    }


    await executarExclusao(
        "/api/admin/excluir-item",
        {

            id,

            acampamentoId:
                acampamentoAtual.id

        }
    );


    await selecionarAcampamento(
        acampamentoAtual.id
    );

}


// =====================================================
// EXCLUIR ACAMPAMENTO
// =====================================================

async function excluirAcampamento() {

    if (!acampamentoAtual) {
        return;
    }


    const nome =
        acampamentoAtual.nome;


    if (
        !confirm(
            `Deseja excluir "${nome}"?\n\nTodos os dias, inscrições, itens e doações deste acampamento também serão apagados.`
        )
    ) {
        return;
    }


    if (
        !confirm(
            "Esta ação não pode ser desfeita. Tem certeza?"
        )
    ) {
        return;
    }


    await executarExclusao(
        "/api/admin/excluir-acampamento",
        {
            id:
                acampamentoAtual.id
        }
    );


    acampamentoAtual = null;


    await carregarListaAcampamentos();

}


// =====================================================
// EXECUTAR DELETE
// =====================================================

async function executarExclusao(
    url,
    dados
) {

    const resposta =
        await fetch(
            url,
            {

                method: "DELETE",

                credentials:
                    "same-origin",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        dados
                    )

            }
        );


    const resultado =
        await resposta.json();


    if (!resposta.ok) {

        alert(
            resultado.erro ||
            "Não foi possível excluir."
        );

        throw new Error(
            resultado.erro
        );

    }

}


// =====================================================
// LOGOUT
// =====================================================

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


// =====================================================
// AUXILIARES
// =====================================================

function valorOuNull(valor) {

    if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
    ) {

        return null;

    }


    return Number(valor);

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


function formatarData(data) {

    if (!data) {
        return "";
    }


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

    return String(
        valor ?? ""
    )

    .replaceAll(
        "&",
        "&amp;"
    )

    .replaceAll(
        "<",
        "&lt;"
    )

    .replaceAll(
        ">",
        "&gt;"
    )

    .replaceAll(
        '"',
        "&quot;"
    )

    .replaceAll(
        "'",
        "&#039;"
    );

}