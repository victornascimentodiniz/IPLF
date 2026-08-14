let acampamentos = [];

let acampamentoAtual = null;


// =====================================================
// INICIAR PAINEL
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


        const painel =
            document.getElementById(
                "painel-admin"
            );


        if (painel) {

            painel.hidden = false;

        }


        configurarEventos();


        await carregarListaAcampamentos();

    }
);


// =====================================================
// CONFIGURAR EVENTOS
// =====================================================

function configurarEventos() {

    // NOVO ACAMPAMENTO

    document
    .getElementById(
        "novo-acampamento"
    )
    ?.addEventListener(
        "click",
        prepararNovoAcampamento
    );


    // SALVAR ACAMPAMENTO

    document
    .getElementById(
        "form-acampamento"
    )
    ?.addEventListener(
        "submit",
        salvarAcampamento
    );


    // SALVAR DIA

    document
    .getElementById(
        "form-admin-dia"
    )
    ?.addEventListener(
        "submit",
        salvarDia
    );


    // SALVAR ITEM

    document
    .getElementById(
        "form-admin-item"
    )
    ?.addEventListener(
        "submit",
        salvarItem
    );


    // SAIR

    document
    .getElementById(
        "botao-sair-admin"
    )
    ?.addEventListener(
        "click",
        sair
    );


    // EXCLUIR ACAMPAMENTO

    document
    .getElementById(
        "excluir-acampamento"
    )
    ?.addEventListener(
        "click",
        excluirAcampamento
    );


    // SELECIONAR ACAMPAMENTO

    document
    .getElementById(
        "lista-acampamentos-admin"
    )
    ?.addEventListener(
        "click",
        function(event) {

            const botao =
                event.target.closest(
                    "[data-acampamento-id]"
                );


            if (!botao) {

                return;

            }


            const id =
                String(
                    botao.dataset
                    .acampamentoId || ""
                ).trim();


            if (!id) {

                alert(
                    "Acampamento inválido."
                );

                return;

            }


            selecionarAcampamento(id);

        }
    );


    // EXCLUIR DIA

    document
    .getElementById(
        "admin-lista-dias"
    )
    ?.addEventListener(
        "click",
        function(event) {

            const botao =
                event.target.closest(
                    "[data-excluir-dia]"
                );


            if (!botao) {

                return;

            }


            const id =
                String(
                    botao.dataset
                    .excluirDia || ""
                ).trim();


            const nome =
                String(
                    botao.dataset
                    .nome || ""
                ).trim();


            excluirDia(
                id,
                nome
            );

        }
    );


    // EXCLUIR ITEM

    document
    .getElementById(
        "admin-lista-itens"
    )
    ?.addEventListener(
        "click",
        function(event) {

            const botao =
                event.target.closest(
                    "[data-excluir-item]"
                );


            if (!botao) {

                return;

            }


            const id =
                String(
                    botao.dataset
                    .excluirItem || ""
                ).trim();


            const nome =
                String(
                    botao.dataset
                    .nome || ""
                ).trim();


            excluirItem(
                id,
                nome
            );

        }
    );


    // PREVIEW DA FOTO

    document
    .getElementById(
        "acampamento-foto"
    )
    ?.addEventListener(
        "change",
        visualizarFotoEscolhida
    );

}


// =====================================================
// VERIFICAR LOGIN
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


        if (!resposta.ok) {

            return false;

        }


        const dados =
            await resposta.json();


        return Boolean(
            dados.autenticado
        );


    } catch (erro) {

        console.error(
            "Erro ao verificar login:",
            erro
        );


        return false;

    }

}


// =====================================================
// CARREGAR LISTA DE ACAMPAMENTOS
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
                "Não foi possível carregar os acampamentos."
            );

        }


        acampamentos =
            Array.isArray(
                dados.acampamentos
            )
            ? dados.acampamentos
            : [];


        renderizarListaAcampamentos();


        // APÓS CRIAR UM NOVO

        if (selecionarId) {

            const idLimpo =
                String(
                    selecionarId
                ).trim();


            await selecionarAcampamento(
                idLimpo
            );


            return;

        }


        // MANTER ACAMPAMENTO ATUAL

        if (
            acampamentoAtual &&
            acampamentos.some(

                item =>
                    String(item.id) ===
                    String(
                        acampamentoAtual.id
                    )

            )
        ) {

            await selecionarAcampamento(
                String(
                    acampamentoAtual.id
                ).trim()
            );


            return;

        }


        // SE EXISTIR ALGUM

        if (acampamentos.length > 0) {

            const primeiroId =
                String(
                    acampamentos[0].id
                ).trim();


            await selecionarAcampamento(
                primeiroId
            );

        } else {

            prepararNovoAcampamento();

        }


    } catch (erro) {

        console.error(
            "Erro lista acampamentos:",
            erro
        );


        alert(
            erro.message ||
            "Erro ao carregar acampamentos."
        );

    }

}


// =====================================================
// RENDERIZAR LISTA DE ACAMPAMENTOS
// =====================================================

function renderizarListaAcampamentos() {

    const lista =
        document.getElementById(
            "lista-acampamentos-admin"
        );


    const quantidade =
        document.getElementById(
            "quantidade-acampamentos"
        );


    if (quantidade) {

        quantidade.textContent =
            acampamentos.length;

    }


    if (!lista) {

        return;

    }


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
                    String(
                        acampamentoAtual.id
                    ) ===
                    String(
                        acampamento.id
                    );


                const id =
                    String(
                        acampamento.id || ""
                    ).trim();


                return `

                    <button
                        type="button"
                        class="item-acampamento-admin ${ativo ? "ativo" : ""}"
                        data-acampamento-id="${id}">

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
                            class="status-admin status-${escaparHtml(
                                acampamento.status
                            )}">

                            ${statusTexto}

                        </small>

                    </button>

                `;

            }
        )
        .join("");

}


// =====================================================
// SELECIONAR ACAMPAMENTO
// =====================================================

async function selecionarAcampamento(id) {

    try {

        const idLimpo =
            String(id || "")
            .trim();


        if (!idLimpo) {

            throw new Error(
                "ID do acampamento inválido."
            );

        }


        const resposta =
            await fetch(

                `/api/admin/dados?id=${encodeURIComponent(
                    idLimpo
                )}`,

                {
                    credentials:
                        "same-origin"
                }

            );


        let dados;


        try {

            dados =
                await resposta.json();

        } catch {

            throw new Error(
                "O servidor retornou uma resposta inválida."
            );

        }


        if (resposta.status === 401) {

            window.location.href =
                "index.html";

            return;

        }


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Não foi possível carregar o acampamento."
            );

        }


        if (!dados.acampamento) {

            throw new Error(
                "Dados do acampamento não encontrados."
            );

        }


        acampamentoAtual =
            dados.acampamento;


        // FORMULÁRIO

        preencherFormulario(
            acampamentoAtual
        );


        // DIAS

        renderizarDias(
            Array.isArray(dados.dias)
                ? dados.dias
                : []
        );


        // ITENS

        renderizarItens(
            Array.isArray(dados.itens)
                ? dados.itens
                : []
        );


        // INSCRITOS

        renderizarInscritos(
            Array.isArray(
                dados.inscritos
            )
                ? dados.inscritos
                : []
        );


        // MOSTRAR RECURSOS

        const recursos =
            document.getElementById(
                "recursos-acampamento"
            );


        if (recursos) {

            recursos.hidden = false;

        }


        // MOSTRAR EXCLUIR

        const botaoExcluir =
            document.getElementById(
                "excluir-acampamento"
            );


        if (botaoExcluir) {

            botaoExcluir.hidden = false;

        }


        // LIMITAR DATA DOS DIAS

        const campoData =
            document.getElementById(
                "admin-data-dia"
            );


        if (campoData) {

            campoData.min =
                acampamentoAtual
                .data_inicio || "";


            campoData.max =
                acampamentoAtual
                .data_fim || "";

        }


        // ATUALIZAR DESTAQUE DA LISTA

        renderizarListaAcampamentos();


    } catch (erro) {

        console.error(
            "Erro selecionar acampamento:",
            erro
        );


        alert(
            erro.message ||
            "Não foi possível carregar o acampamento."
        );

    }

}


// =====================================================
// PREPARAR NOVO ACAMPAMENTO
// =====================================================

function prepararNovoAcampamento() {

    acampamentoAtual = null;


    const formulario =
        document.getElementById(
            "form-acampamento"
        );


    if (formulario) {

        formulario.reset();

    }


    const id =
        document.getElementById(
            "acampamento-id"
        );


    if (id) {

        id.value = "";

    }


    const status =
        document.getElementById(
            "acampamento-status"
        );


    if (status) {

        status.value =
            "rascunho";

    }


    const titulo =
        document.getElementById(
            "titulo-editor-acampamento"
        );


    if (titulo) {

        titulo.textContent =
            "Novo acampamento";

    }


    const salvar =
        document.getElementById(
            "salvar-acampamento"
        );


    if (salvar) {

        salvar.textContent =
            "CRIAR ACAMPAMENTO";

    }


    const mensagem =
        document.getElementById(
            "mensagem-acampamento"
        );


    if (mensagem) {

        mensagem.textContent = "";

    }


    const excluir =
        document.getElementById(
            "excluir-acampamento"
        );


    if (excluir) {

        excluir.hidden = true;

    }


    const recursos =
        document.getElementById(
            "recursos-acampamento"
        );


    if (recursos) {

        recursos.hidden = true;

    }


    removerPreviewFoto();


    renderizarListaAcampamentos();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =====================================================
// PREENCHER FORMULÁRIO
// =====================================================

function preencherFormulario(
    acampamento
) {

    definirValor(
        "acampamento-id",
        acampamento.id
    );


    definirValor(
        "acampamento-nome",
        acampamento.nome
    );


    definirValor(
        "acampamento-descricao",
        acampamento.descricao
    );


    definirValor(
        "acampamento-local",
        acampamento.local
    );


    definirValor(
        "acampamento-data-inicio",
        acampamento.data_inicio
    );


    definirValor(
        "acampamento-data-fim",
        acampamento.data_fim
    );


    definirValor(
        "valor-completo",
        acampamento.valor_completo
    );


    definirValor(
        "valor-diaria",
        acampamento.valor_diaria
    );


    definirValor(
        "valor-crianca",
        acampamento.valor_crianca
    );


    definirValor(
        "idade-max-crianca",
        acampamento.idade_max_crianca
    );


    definirValor(
        "acampamento-status",
        acampamento.status ||
        "rascunho"
    );


    const titulo =
        document.getElementById(
            "titulo-editor-acampamento"
        );


    if (titulo) {

        titulo.textContent =
            acampamento.nome;

    }


    const botao =
        document.getElementById(
            "salvar-acampamento"
        );


    if (botao) {

        botao.textContent =
            "SALVAR ALTERAÇÕES";

    }


    const mensagem =
        document.getElementById(
            "mensagem-acampamento"
        );


    if (mensagem) {

        mensagem.textContent = "";

    }


    const fotoInput =
        document.getElementById(
            "acampamento-foto"
        );


    if (fotoInput) {

        fotoInput.value = "";

    }


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

async function salvarAcampamento(
    event
) {

    event.preventDefault();


    const id =
        String(
            document
            .getElementById(
                "acampamento-id"
            )
            ?.value || ""
        ).trim();


    const mensagem =
        document.getElementById(
            "mensagem-acampamento"
        );


    const botao =
        document.getElementById(
            "salvar-acampamento"
        );


    if (mensagem) {

        mensagem.textContent = "";

    }


    const dados = {

        nome:
            obterValor(
                "acampamento-nome"
            ).trim(),

        descricao:
            obterValor(
                "acampamento-descricao"
            ).trim(),

        local:
            obterValor(
                "acampamento-local"
            ).trim(),

        dataInicio:
            obterValor(
                "acampamento-data-inicio"
            ),

        dataFim:
            obterValor(
                "acampamento-data-fim"
            ),

        valorCompleto:
            valorOuNull(
                obterValor(
                    "valor-completo"
                )
            ),

        valorDiaria:
            valorOuNull(
                obterValor(
                    "valor-diaria"
                )
            ),

        valorCrianca:
            valorOuNull(
                obterValor(
                    "valor-crianca"
                )
            ),

        idadeMaxCrianca:
            valorOuNull(
                obterValor(
                    "idade-max-crianca"
                )
            ),

        status:
            obterValor(
                "acampamento-status"
            )

    };


    if (id) {

        dados.id = id;

    }


    if (botao) {

        botao.disabled = true;

        botao.textContent =
            "SALVANDO...";

    }


    try {

        const url =
            id
                ? "/api/admin/editar-acampamento"
                : "/api/admin/acampamentos";


        const metodo =
            id
                ? "PUT"
                : "POST";


        const resposta =
            await fetch(
                url,
                {

                    method:
                        metodo,

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
                "Erro ao salvar o acampamento."
            );

        }


        const acampamentoId =
            String(

                id ||

                resultado
                ?.acampamento
                ?.id ||

                ""

            ).trim();


        if (!acampamentoId) {

            throw new Error(
                "O acampamento foi salvo, mas o ID não foi retornado."
            );

        }


        // =============================================
        // FOTO
        // =============================================

        const arquivoFoto =
            document
            .getElementById(
                "acampamento-foto"
            )
            ?.files?.[0];


        if (arquivoFoto) {

            await enviarFoto(
                acampamentoId,
                arquivoFoto
            );

        }


        if (mensagem) {

            mensagem.style.color =
                "#087a50";


            mensagem.textContent =
                id
                    ? "✓ Acampamento atualizado com sucesso!"
                    : "✓ Acampamento criado com sucesso!";

        }


        await carregarListaAcampamentos(
            acampamentoId
        );


    } catch (erro) {

        console.error(
            "Erro ao salvar:",
            erro
        );


        if (mensagem) {

            mensagem.style.color =
                "#b00020";


            mensagem.textContent =
                erro.message;

        }


    } finally {

        if (botao) {

            botao.disabled = false;


            botao.textContent =
                id
                    ? "SALVAR ALTERAÇÕES"
                    : "CRIAR ACAMPAMENTO";

        }

    }

}


// =====================================================
// ENVIAR FOTO
// =====================================================

async function enviarFoto(
    acampamentoId,
    arquivo
) {

    const formData =
        new FormData();


    formData.append(
        "acampamentoId",
        String(
            acampamentoId
        ).trim()
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
            "O acampamento foi salvo, mas não foi possível enviar a foto."
        );

    }

}


// =====================================================
// PREVIEW FOTO ESCOLHIDA
// =====================================================

function visualizarFotoEscolhida(
    event
) {

    const arquivo =
        event.target
        ?.files?.[0];


    if (!arquivo) {

        return;

    }


    if (
        arquivo.size >
        3 * 1024 * 1024
    ) {

        alert(
            "A foto deve ter no máximo 3 MB."
        );


        event.target.value = "";

        return;

    }


    const tiposPermitidos = [

        "image/jpeg",
        "image/png",
        "image/webp"

    ];


    if (
        !tiposPermitidos.includes(
            arquivo.type
        )
    ) {

        alert(
            "Escolha uma imagem JPG, PNG ou WEBP."
        );


        event.target.value = "";

        return;

    }


    const url =
        URL.createObjectURL(
            arquivo
        );


    mostrarFoto(url);

}


// =====================================================
// MOSTRAR FOTO
// =====================================================

function mostrarFoto(url) {

    const imagem =
        document.getElementById(
            "foto-admin-imagem"
        );


    const vazio =
        document.getElementById(
            "foto-admin-sem-imagem"
        );


    if (imagem) {

        imagem.src = url;

        imagem.hidden = false;

    }


    if (vazio) {

        vazio.hidden = true;

    }

}


// =====================================================
// REMOVER PREVIEW FOTO
// =====================================================

function removerPreviewFoto() {

    const imagem =
        document.getElementById(
            "foto-admin-imagem"
        );


    const vazio =
        document.getElementById(
            "foto-admin-sem-imagem"
        );


    if (imagem) {

        imagem.removeAttribute(
            "src"
        );

        imagem.hidden = true;

    }


    if (vazio) {

        vazio.hidden = false;

    }

}


// =====================================================
// SALVAR DIA
// =====================================================

async function salvarDia(event) {

    event.preventDefault();


    if (!acampamentoAtual) {

        alert(
            "Selecione um acampamento."
        );

        return;

    }


    const mensagem =
        document.getElementById(
            "mensagem-admin-dia"
        );


    if (mensagem) {

        mensagem.textContent = "";

    }


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
                                String(
                                    acampamentoAtual.id
                                ).trim(),

                            data:
                                obterValor(
                                    "admin-data-dia"
                                )

                        })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Não foi possível cadastrar o dia."
            );

        }


        if (mensagem) {

            mensagem.style.color =
                "#087a50";

            mensagem.textContent =
                "✓ Dia cadastrado!";

        }


        event.target.reset();


        await selecionarAcampamento(
            String(
                acampamentoAtual.id
            ).trim()
        );


    } catch (erro) {

        if (mensagem) {

            mensagem.style.color =
                "#b00020";

            mensagem.textContent =
                erro.message;

        }

    }

}


// =====================================================
// RENDERIZAR DIAS
// =====================================================

function renderizarDias(dias) {

    const lista =
        document.getElementById(
            "admin-lista-dias"
        );


    if (!lista) {

        return;

    }


    if (!dias.length) {

        lista.innerHTML =
            "<p>Nenhum dia cadastrado.</p>";

        return;

    }


    lista.innerHTML =
        dias.map(
            dia => {

                const id =
                    String(
                        dia.id || ""
                    ).trim();


                return `

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
                            class="botao-excluir-pequeno"
                            data-excluir-dia="${id}"
                            data-nome="${escaparHtml(
                                dia.nome_dia
                            )}">

                            EXCLUIR

                        </button>

                    </div>

                `;

            }
        )
        .join("");

}


// =====================================================
// SALVAR ITEM
// =====================================================

async function salvarItem(event) {

    event.preventDefault();


    if (!acampamentoAtual) {

        alert(
            "Selecione um acampamento."
        );

        return;

    }


    const mensagem =
        document.getElementById(
            "mensagem-admin-item"
        );


    if (mensagem) {

        mensagem.textContent = "";

    }


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
                                String(
                                    acampamentoAtual.id
                                ).trim(),

                            nome:
                                obterValor(
                                    "admin-item-nome"
                                ).trim(),

                            quantidade:
                                Number(
                                    obterValor(
                                        "admin-item-quantidade"
                                    )
                                ),

                            unidade:
                                obterValor(
                                    "admin-item-unidade"
                                ).trim(),

                            observacao:
                                obterValor(
                                    "admin-item-observacao"
                                ).trim()

                        })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Não foi possível cadastrar o item."
            );

        }


        if (mensagem) {

            mensagem.style.color =
                "#087a50";

            mensagem.textContent =
                "✓ Item cadastrado!";

        }


        event.target.reset();


        await selecionarAcampamento(
            String(
                acampamentoAtual.id
            ).trim()
        );


    } catch (erro) {

        if (mensagem) {

            mensagem.style.color =
                "#b00020";

            mensagem.textContent =
                erro.message;

        }

    }

}


// =====================================================
// RENDERIZAR ITENS
// =====================================================

function renderizarItens(itens) {

    const lista =
        document.getElementById(
            "admin-lista-itens"
        );


    if (!lista) {

        return;

    }


    if (!itens.length) {

        lista.innerHTML =
            "<p>Nenhum item cadastrado.</p>";

        return;

    }


    lista.innerHTML =
        itens.map(
            item => {

                const id =
                    String(
                        item.id || ""
                    ).trim();


                return `

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
                            class="botao-excluir-pequeno"
                            data-excluir-item="${id}"
                            data-nome="${escaparHtml(
                                item.nome
                            )}">

                            EXCLUIR

                        </button>

                    </div>

                `;

            }
        )
        .join("");

}


// =====================================================
// RENDERIZAR INSCRITOS
// =====================================================

function renderizarInscritos(
    inscritos
) {

    const lista =
        document.getElementById(
            "admin-lista-inscritos"
        );


    const total =
        document.getElementById(
            "total-inscritos"
        );


    if (total) {

        total.textContent =
            inscritos.length;

    }


    if (!lista) {

        return;

    }


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

                let dias =
                    pessoa.dias;


                // CASO O BANCO RETORNE JSON COMO TEXTO

                if (
                    typeof dias ===
                    "string"
                ) {

                    try {

                        dias =
                            JSON.parse(dias);

                    } catch {

                        dias = [];

                    }

                }


                if (!Array.isArray(dias)) {

                    dias = [];

                }


                const diasHtml =
                    dias.length

                    ? dias.map(
                        dia => `

                            <span
                                class="tag-dia-inscrito">

                                ${escaparHtml(
                                    dia.nome_dia
                                )}

                                -

                                ${formatarData(
                                    dia.data
                                )}

                            </span>

                        `
                    ).join("")

                    : `

                        <span class="tag-dia-inscrito">

                            Nenhum dia selecionado

                        </span>

                    `;


                const nome =
                    String(
                        pessoa.nome_completo ||
                        ""
                    );


                const inicial =
                    nome
                    .charAt(0)
                    .toUpperCase();


                return `

                    <div class="pessoa-inscrita">

                        <div class="pessoa-inicial">

                            ${escaparHtml(
                                inicial
                            )}

                        </div>


                        <div class="pessoa-dados">

                            <h3>

                                ${escaparHtml(
                                    nome
                                )}

                            </h3>


                            <p>

                                📱

                                ${escaparHtml(
                                    pessoa.telefone ||
                                    "Não informado"
                                )}

                            </p>


                            <div class="dias-pessoa">

                                ${diasHtml}

                            </div>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

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


    const idLimpo =
        String(id || "")
        .trim();


    if (!idLimpo) {

        return;

    }


    const confirmou =
        confirm(
            `Deseja excluir "${nome}"?`
        );


    if (!confirmou) {

        return;

    }


    try {

        await executarExclusao(
            "/api/admin/excluir-dia",
            {

                id:
                    idLimpo,

                acampamentoId:
                    String(
                        acampamentoAtual.id
                    ).trim()

            }
        );


        await selecionarAcampamento(
            String(
                acampamentoAtual.id
            ).trim()
        );


    } catch (erro) {

        console.error(
            erro
        );

    }

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


    const idLimpo =
        String(id || "")
        .trim();


    if (!idLimpo) {

        return;

    }


    const confirmou =
        confirm(

            `Deseja excluir o item "${nome}"?\n\nAs doações ligadas a ele também serão apagadas.`

        );


    if (!confirmou) {

        return;

    }


    try {

        await executarExclusao(
            "/api/admin/excluir-item",
            {

                id:
                    idLimpo,

                acampamentoId:
                    String(
                        acampamentoAtual.id
                    ).trim()

            }
        );


        await selecionarAcampamento(
            String(
                acampamentoAtual.id
            ).trim()
        );


    } catch (erro) {

        console.error(
            erro
        );

    }

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


    const primeiraConfirmacao =
        confirm(

            `Deseja realmente excluir "${nome}"?\n\nTodos os dias, inscrições, itens e doações deste acampamento serão apagados.`

        );


    if (!primeiraConfirmacao) {

        return;

    }


    const segundaConfirmacao =
        confirm(

            "Esta ação não pode ser desfeita.\n\nTem certeza que deseja continuar?"

        );


    if (!segundaConfirmacao) {

        return;

    }


    try {

        await executarExclusao(
            "/api/admin/excluir-acampamento",
            {

                id:
                    String(
                        acampamentoAtual.id
                    ).trim()

            }
        );


        acampamentoAtual = null;


        alert(
            "Acampamento excluído com sucesso."
        );


        await carregarListaAcampamentos();


    } catch (erro) {

        console.error(
            erro
        );

    }

}


// =====================================================
// EXECUTAR EXCLUSÃO
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
            resultado.erro ||
            "Erro ao excluir."
        );

    }


    return resultado;

}


// =====================================================
// SAIR
// =====================================================

async function sair() {

    try {

        await fetch(
            "/api/admin/logout",
            {

                method: "POST",

                credentials:
                    "same-origin"

            }
        );

    } catch (erro) {

        console.error(
            erro
        );

    }


    window.location.href =
        "index.html";

}


// =====================================================
// PEGAR VALOR DE CAMPO
// =====================================================

function obterValor(id) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {

        return "";

    }


    return elemento.value ?? "";

}


// =====================================================
// DEFINIR VALOR
// =====================================================

function definirValor(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {

        return;

    }


    elemento.value =
        valor ??
        "";

}


// =====================================================
// VALOR OU NULL
// =====================================================

function valorOuNull(valor) {

    if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
    ) {

        return null;

    }


    const numero =
        Number(valor);


    if (!Number.isFinite(numero)) {

        return null;

    }


    return numero;

}


// =====================================================
// FORMATAR NÚMERO
// =====================================================

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


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data) {

    if (!data) {

        return "";

    }


    const texto =
        String(data)
        .substring(0, 10);


    const partes =
        texto.split("-");


    if (partes.length !== 3) {

        return texto;

    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


// =====================================================
// ESCAPAR HTML
// =====================================================

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