document.addEventListener(
    "DOMContentLoaded",
    carregarAcampamentosPublicos
);


async function carregarAcampamentosPublicos() {

    const area =
        document.getElementById(
            "lista-acampamentos-publicos"
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
                "Não foi possível carregar os acampamentos."
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

                <div class="modern-empty">

                    <span style="
                        font-family: Fraunces, serif;
                        color:#d4b56c;
                        font-size:55px;
                    ">
                        ✦
                    </span>

                    <strong style="
                        color:#06231c;
                        font-size:18px;
                    ">
                        Nenhum acampamento disponível
                    </strong>

                    <span>
                        No momento não existem inscrições abertas.
                    </span>

                </div>

            `;

            return;
        }


        area.innerHTML =
            acampamentos
            .map(
                criarCardAcampamentoPublico
            )
            .join("");


    } catch (erro) {

        console.error(
            "Erro ao carregar acampamentos:",
            erro
        );


        area.innerHTML = `

            <div class="modern-empty">

                <strong style="
                    color:#06231c;
                    font-size:18px;
                ">
                    Não foi possível carregar os acampamentos
                </strong>

                <span>
                    Tente novamente em alguns instantes.
                </span>

            </div>

        `;

    }

}


function criarCardAcampamentoPublico(
    acampamento
) {

    const id =
        String(
            acampamento.id || ""
        ).trim();


    const nome =
        escaparHtml(
            acampamento.nome ||
            "Acampamento"
        );


    const descricao =
        escaparHtml(
            acampamento.descricao || ""
        );


    const local =
        escaparHtml(
            acampamento.local ||
            "Local a definir"
        );


    let fotoHtml;


    if (acampamento.foto_key) {

        const fotoUrl =

            `/api/foto-acampamento/${encodeURIComponent(
                acampamento.foto_key
            )}`;


        fotoHtml = `

            <img
                src="${fotoUrl}"
                alt="Foto do ${nome}"
                loading="lazy"
            >

        `;

    } else {

        fotoHtml = `

            <div class="modern-camp-no-photo">
                ✦
            </div>

        `;

    }


    const valores = [];


    if (
        temValor(
            acampamento.valor_completo
        )
    ) {

        valores.push(`

            <div class="modern-price">

                <span>
                    Pacote completo
                </span>

                <strong>
                    ${formatarDinheiro(
                        acampamento.valor_completo
                    )}
                </strong>

            </div>

        `);

    }


    if (
        temValor(
            acampamento.valor_diaria
        )
    ) {

        valores.push(`

            <div class="modern-price">

                <span>
                    Diária
                </span>

                <strong>
                    ${formatarDinheiro(
                        acampamento.valor_diaria
                    )}
                </strong>

            </div>

        `);

    }


    if (
        temValor(
            acampamento.valor_crianca
        )
    ) {

        let tituloCrianca =
            "Criança";


        if (
            acampamento.idade_max_crianca !== null &&
            acampamento.idade_max_crianca !== undefined
        ) {

            tituloCrianca =
                `Criança até ${
                    Number(
                        acampamento.idade_max_crianca
                    )
                } anos`;

        }


        valores.push(`

            <div class="modern-price">

                <span>
                    ${tituloCrianca}
                </span>

                <strong>
                    ${formatarDinheiro(
                        acampamento.valor_crianca
                    )}
                </strong>

            </div>

        `);

    }


    return `

        <article class="modern-camp-card">

            <div class="modern-camp-photo">

                ${fotoHtml}

                <div class="modern-camp-status">
                    INSCRIÇÕES ABERTAS
                </div>

            </div>


            <div class="modern-camp-content">

                <span class="modern-camp-label">
                    ACAMPAMENTO IPLF
                </span>

                <h3>
                    ${nome}
                </h3>


                ${
                    descricao

                    ? `
                        <p class="modern-camp-description">
                            ${descricao}
                        </p>
                    `

                    : ""
                }


                <div class="modern-camp-meta">

                    <div>
                        <span class="modern-camp-meta-icon">
                            ◷
                        </span>

                        <span>
                            ${formatarPeriodo(
                                acampamento.data_inicio,
                                acampamento.data_fim
                            )}
                        </span>
                    </div>


                    <div>
                        <span class="modern-camp-meta-icon">
                            ◆
                        </span>

                        <span>
                            ${local}
                        </span>
                    </div>

                </div>


                ${
                    valores.length

                    ? `
                        <div class="modern-camp-values">
                            ${valores.join("")}
                        </div>
                    `

                    : ""
                }


                <div class="modern-camp-actions">

                    <a
                        href="acampamento.html?id=${encodeURIComponent(id)}&aba=inscricao"
                        class="modern-camp-register">
                        INSCREVA-SE
                    </a>

                    <a
                        href="acampamento.html?id=${encodeURIComponent(id)}&aba=doacoes"
                        class="modern-camp-donate">
                        FAÇA UMA DOAÇÃO
                    </a>

                </div>

            </div>
        </article>

    `;

}


function temValor(valor) {

    return (
        valor !== null &&
        valor !== undefined &&
        valor !== "" &&
        Number.isFinite(
            Number(valor)
        )
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


function formatarData(data) {

    if (!data) {
        return "";
    }


    const partes =
        String(data)
        .substring(0, 10)
        .split("-");


    if (partes.length !== 3) {
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


function formatarPeriodo(inicio, fim) {

    if (inicio && fim) {

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


function escaparHtml(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
