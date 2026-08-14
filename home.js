document.addEventListener(
    "DOMContentLoaded",
    carregarAcampamentosHome
);


async function carregarAcampamentosHome() {

    const area =
        document.getElementById(
            "home-lista-acampamentos"
        );


    if (!area) {
        return;
    }


    try {

        const resposta =
            await fetch(
                "/api/acampamentos-publicos"
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar acampamentos."
            );

        }


        const acampamentos =
            Array.isArray(
                dados.acampamentos
            )
            ? dados.acampamentos
            : [];


        if (!acampamentos.length) {

            area.innerHTML = `

                <div class="home-sem-acampamento">

                    <div class="home-sem-acampamento-icone">
                        ⛺
                    </div>

                    <h3>
                        Nenhum acampamento disponível
                    </h3>

                    <p>
                        No momento não temos
                        inscrições abertas.
                    </p>

                </div>

            `;


            return;

        }


        area.innerHTML =
            acampamentos
            .map(
                criarCardAcampamento
            )
            .join("");


    } catch (erro) {

        console.error(
            erro
        );


        area.innerHTML = `

            <div class="home-sem-acampamento">

                <p>
                    Não foi possível carregar
                    os acampamentos no momento.
                </p>

            </div>

        `;

    }

}



function criarCardAcampamento(
    acampamento
) {

    const id =
        String(
            acampamento.id || ""
        ).trim();


    const nome =
        escaparHtml(
            acampamento.nome
        );


    const descricao =
        escaparHtml(
            acampamento.descricao || ""
        );


    const local =
        escaparHtml(
            acampamento.local || ""
        );


    let imagemHtml;


    if (acampamento.foto_key) {

        const fotoUrl =

            `/api/foto-acampamento/${encodeURIComponent(
                acampamento.foto_key
            )}`;


        imagemHtml = `

            <img
                src="${fotoUrl}"
                alt="Foto de ${nome}"
                loading="lazy">

        `;

    } else {

        imagemHtml = `

            <div class="home-acampamento-sem-foto">
                ⛺
            </div>

        `;

    }


    let valoresHtml = "";


    if (
        acampamento.valor_completo !== null
    ) {

        valoresHtml += `

            <div class="home-valor-item">

                <span>
                    Valor completo
                </span>

                <strong>

                    ${formatarDinheiro(
                        acampamento.valor_completo
                    )}

                </strong>

            </div>

        `;

    }


    if (
        acampamento.valor_diaria !== null
    ) {

        valoresHtml += `

            <div class="home-valor-item">

                <span>
                    Diária
                </span>

                <strong>

                    ${formatarDinheiro(
                        acampamento.valor_diaria
                    )}

                </strong>

            </div>

        `;

    }


    if (
        acampamento.valor_crianca !== null
    ) {

        let textoCrianca =
            "Criança";


        if (
            acampamento.idade_max_crianca !==
            null
        ) {

            textoCrianca =

                `Crianças até ${
                    acampamento
                    .idade_max_crianca
                } anos`;

        }


        valoresHtml += `

            <div class="home-valor-item">

                <span>
                    ${textoCrianca}
                </span>

                <strong>

                    ${formatarDinheiro(
                        acampamento.valor_crianca
                    )}

                </strong>

            </div>

        `;

    }


    return `

        <article
            class="home-card-acampamento">


            <div class="home-foto-acampamento">

                ${imagemHtml}


                <span class="home-status-acampamento">

                    INSCRIÇÕES ABERTAS

                </span>

            </div>


            <div class="home-conteudo-acampamento">


                <span class="titulo-pequeno">

                    ACAMPAMENTO

                </span>


                <h3>

                    ${nome}

                </h3>


                ${
                    descricao
                        ? `
                            <p class="home-descricao-acampamento">
                                ${descricao}
                            </p>
                        `
                        : ""
                }


                <div class="home-informacoes-acampamento">


                    <div>

                        <span>
                            📅
                        </span>

                        <p>

                            ${formatarData(
                                acampamento.data_inicio
                            )}

                            até

                            ${formatarData(
                                acampamento.data_fim
                            )}

                        </p>

                    </div>


                    <div>

                        <span>
                            📍
                        </span>

                        <p>
                            ${local}
                        </p>

                    </div>


                </div>


                ${
                    valoresHtml

                    ? `

                        <div class="home-valores-acampamento">

                            ${valoresHtml}

                        </div>

                    `

                    : ""
                }


                <div class="home-botoes-acampamento">


                    <a
                        href="acampamento.html?id=${encodeURIComponent(id)}&aba=inscricao"
                        class="home-botao-inscricao">

                        INSCREVA-SE

                    </a>


                    <a
                        href="acampamento.html?id=${encodeURIComponent(id)}&aba=doacoes"
                        class="home-botao-doacao">

                        FAÇA UMA DOAÇÃO

                    </a>


                </div>


            </div>


        </article>

    `;

}



function formatarDinheiro(
    valor
) {

    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}



function formatarData(
    data
) {

    if (!data) {
        return "";
    }


    const partes =
        String(data)
        .substring(0, 10)
        .split("-");


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



function escaparHtml(
    valor
) {

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