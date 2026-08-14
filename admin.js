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


        configurarEventos();


        await carregarPainel();

    }
);



function configurarEventos() {


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

}



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

    try {

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

            throw new Error(
                dados.erro ||
                "Erro ao carregar painel."
            );

        }


        if (dados.semAcampamento) {

            adminAcampamento = null;


            document
            .getElementById(
                "admin-nome-acampamento"
            )
            .textContent =
                "Nenhum acampamento ativo";


            document
            .getElementById(
                "admin-periodo-acampamento"
            )
            .textContent =
                "Cadastre um novo acampamento posteriormente.";


            document
            .getElementById(
                "excluir-acampamento"
            )
            .disabled = true;


            renderizarDias([]);

            renderizarItens([]);

            renderizarInscritos([]);


            return;

        }


        adminAcampamento =
            dados.acampamento;


        document
        .getElementById(
            "excluir-acampamento"
        )
        .disabled = false;


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
            dados.dias || []
        );


        renderizarItens(
            dados.itens || []
        );


        renderizarInscritos(
            dados.inscritos || []
        );


    } catch (erro) {

        alert(
            erro.message ||
            "Erro ao carregar painel."
        );

    }

}



async function salvarDia(event) {

    event.preventDefault();


    if (!adminAcampamento) {

        alert(
            "Nenhum acampamento ativo."
        );

        return;

    }


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
            "✓ Dia cadastrado!";


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


    if (!adminAcampamento) {

        alert(
            "Nenhum acampamento ativo."
        );

        return;

    }


    const mensagem =
        document.getElementById(
            "mensagem-admin-item"
        );


    const nome =
        document.getElementById(
            "admin-item-nome"
        ).value.trim();


    const quantidade =
        Number(
            document.getElementById(
                "admin-item-quantidade"
            ).value
        );


    const unidade =
        document.getElementById(
            "admin-item-unidade"
        ).value.trim();


    const observacao =
        document.getElementById(
            "admin-item-observacao"
        ).value.trim();


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
            "✓ Item cadastrado!";


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

                        data-excluir-dia="${dia.id}"

                        data-nome="${escaparHtml(
                            dia.nome_dia
                        )}">

                        EXCLUIR

                    </button>

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

                    <div>

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


                    <button
                        type="button"

                        class="botao-excluir-pequeno"

                        data-excluir-item="${item.id}"

                        data-nome="${escaparHtml(
                            item.nome
                        )}">

                        EXCLUIR

                    </button>

                </div>

            `

        ).join("");

}



function renderizarInscritos(inscritos) {

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

                <p>
                    Nenhuma pessoa inscrita ainda.
                </p>

            </div>

        `;

        return;

    }


    lista.innerHTML =
        inscritos.map(

            pessoa => {


                const dias =
                    Array.isArray(pessoa.dias)
                        ? pessoa.dias
                        : [];


                const diasHtml =
                    dias.length

                        ? dias.map(
                            dia => `

                                <span class="tag-dia-inscrito">

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
                            <span>
                                Nenhum dia selecionado
                            </span>
                        `;


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



async function excluirDia(
    id,
    nome
) {

    if (!adminAcampamento) {
        return;
    }


    const confirmar =
        window.confirm(
            `Deseja realmente excluir "${nome}"?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                "/api/admin/excluir-dia",
                {

                    method: "DELETE",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            id,

                            acampamentoId:
                                adminAcampamento.id

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


        await carregarPainel();


    } catch (erro) {

        alert(
            erro.message ||
            "Erro ao excluir dia."
        );

    }

}



async function excluirItem(
    id,
    nome
) {

    if (!adminAcampamento) {
        return;
    }


    const confirmar =
        window.confirm(

            `Deseja realmente excluir o item "${nome}"?\n\nAs doações registradas para este item também serão removidas.`

        );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                "/api/admin/excluir-item",
                {

                    method: "DELETE",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            id,

                            acampamentoId:
                                adminAcampamento.id

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


        await carregarPainel();


    } catch (erro) {

        alert(
            erro.message ||
            "Erro ao excluir item."
        );

    }

}



async function excluirAcampamento() {

    if (!adminAcampamento) {
        return;
    }


    const confirmar =
        window.confirm(

            `ATENÇÃO!\n\nDeseja realmente excluir o acampamento "${adminAcampamento.nome}"?\n\nSerão apagados os dias, inscrições, itens e doações ligados a ele.`

        );


    if (!confirmar) {
        return;
    }


    const confirmarNovamente =
        window.confirm(

            "Esta ação não pode ser desfeita.\n\nTem certeza?"

        );


    if (!confirmarNovamente) {
        return;
    }


    try {

        const resposta =
            await fetch(
                "/api/admin/excluir-acampamento",
                {

                    method: "DELETE",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            id:
                                adminAcampamento.id

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


        adminAcampamento = null;


        alert(
            "Acampamento excluído com sucesso."
        );


        await carregarPainel();


    } catch (erro) {

        alert(
            erro.message ||
            "Erro ao excluir acampamento."
        );

    }

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

    return String(valor ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}