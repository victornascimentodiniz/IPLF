// =====================================================
// IPLF - HOME MODERNA
// =====================================================


document.addEventListener(
    "DOMContentLoaded",
    function () {

        configurarTopbar();

        configurarMenuMobile();

        configurarAnimacoes();

        configurarLinksInternos();

        carregarAcampamentosHome();

    }
);


// =====================================================
// TOPBAR AO ROLAR A TELA
// =====================================================

function configurarTopbar() {

    const topbar =
        document.getElementById(
            "home-topbar"
        );


    if (!topbar) {
        return;
    }


    function atualizar() {

        if (
            window.scrollY > 30
        ) {

            topbar.classList.add(
                "is-scrolled"
            );

        } else {

            topbar.classList.remove(
                "is-scrolled"
            );

        }

    }


    atualizar();


    window.addEventListener(
        "scroll",
        atualizar,
        {
            passive: true
        }
    );

}


// =====================================================
// MENU CELULAR
// =====================================================

function configurarMenuMobile() {

    const botao =
        document.getElementById(
            "home-menu-toggle"
        );


    const menu =
        document.getElementById(
            "home-mobile-menu"
        );


    if (
        !botao ||
        !menu
    ) {
        return;
    }


    function fecharMenu() {

        menu.classList.remove(
            "is-open"
        );


        botao.classList.remove(
            "is-open"
        );


        botao.setAttribute(
            "aria-expanded",
            "false"
        );


        botao.setAttribute(
            "aria-label",
            "Abrir menu"
        );

    }


    botao.addEventListener(
        "click",
        function () {

            const aberto =
                menu.classList
                .contains(
                    "is-open"
                );


            if (aberto) {

                fecharMenu();

            } else {

                menu.classList.add(
                    "is-open"
                );


                botao.classList.add(
                    "is-open"
                );


                botao.setAttribute(
                    "aria-expanded",
                    "true"
                );


                botao.setAttribute(
                    "aria-label",
                    "Fechar menu"
                );

            }

        }
    );


    menu
        .querySelectorAll(
            "a"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    fecharMenu
                );

            }
        );


    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth >
                1050
            ) {

                fecharMenu();

            }

        }
    );

}


// =====================================================
// SCROLL SUAVE NOS LINKS INTERNOS
// =====================================================

function configurarLinksInternos() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(
            link => {

                const destino =
                    link.getAttribute(
                        "href"
                    );


                if (
                    !destino ||
                    destino === "#"
                ) {
                    return;
                }


                link.addEventListener(
                    "click",
                    function (event) {

                        const elemento =
                            document
                                .querySelector(
                                    destino
                                );


                        if (!elemento) {
                            return;
                        }


                        event.preventDefault();


                        const topbar =
                            document
                                .getElementById(
                                    "home-topbar"
                                );


                        const altura =
                            topbar
                                ?.offsetHeight ||
                            0;


                        const posicao =
                            elemento
                                .getBoundingClientRect()
                                .top
                            +
                            window.scrollY
                            -
                            altura;


                        window.scrollTo({

                            top:
                                posicao,

                            behavior:
                                "smooth"

                        });

                    }
                );

            }
        );

}


// =====================================================
// ANIMAÇÕES AO ENTRAR NA TELA
// =====================================================

function configurarAnimacoes() {

    const elementos =
        document.querySelectorAll(
            "[data-reveal]"
        );


    if (!elementos.length) {
        return;
    }


    const reduzirMovimento =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (reduzirMovimento) {

        elementos.forEach(
            elemento => {

                elemento.classList.add(
                    "is-visible"
                );

            }
        );


        return;

    }


    // =================================================
    // COMPATIBILIDADE COM NAVEGADORES MAIS ANTIGOS
    // =================================================

    if (
        !("IntersectionObserver" in window)
    ) {

        elementos.forEach(
            elemento => {

                elemento.classList.add(
                    "is-visible"
                );

            }
        );


        return;

    }


    const observador =
        new IntersectionObserver(

            entradas => {

                entradas.forEach(
                    entrada => {

                        if (
                            entrada.isIntersecting
                        ) {

                            entrada
                                .target
                                .classList
                                .add(
                                    "is-visible"
                                );


                            observador
                                .unobserve(
                                    entrada.target
                                );

                        }

                    }
                );

            },

            {

                threshold:
                    0.08,

                rootMargin:
                    "0px 0px -30px 0px"

            }

        );


    elementos.forEach(
        elemento => {

            observador.observe(
                elemento
            );

        }
    );


    // =================================================
    // GARANTIR QUE O TEXTO DA FOTO PRINCIPAL APAREÇA
    // =================================================

    const hero =
        document.querySelector(
            ".home-hero-content[data-reveal]"
        );


    if (hero) {

        requestAnimationFrame(
            function () {

                hero.classList.add(
                    "is-visible"
                );

            }
        );

    }

}


// =====================================================
// CARREGAR ACAMPAMENTOS
// =====================================================

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
                "Não foi possível carregar os acampamentos."
            );

        }


        const acampamentos =
            Array.isArray(
                dados.acampamentos
            )
                ? dados.acampamentos
                : [];


        // =================================================
        // NENHUM ACAMPAMENTO
        // =================================================

        if (
            acampamentos.length === 0
        ) {

            area.innerHTML = `

                <div class="modern-empty">

                    <span
                        style="
                            font-family: Fraunces, serif;
                            font-size: 55px;
                            color: #d4b56c;
                        "
                    >
                        ✦
                    </span>

                    <strong
                        style="
                            color:#06231c;
                            font-size:18px;
                        "
                    >
                        Nenhum acampamento disponível
                    </strong>

                    <span>
                        No momento não existem
                        inscrições abertas.
                    </span>

                </div>

            `;


            return;

        }


        // =================================================
        // MOSTRAR ACAMPAMENTOS
        // =================================================

        area.innerHTML =
            acampamentos
                .map(
                    criarCardAcampamento
                )
                .join("");


        // =================================================
        // ANIMAÇÃO DOS CARDS
        // =================================================

        area
            .querySelectorAll(
                ".modern-camp-card"
            )
            .forEach(
                (card, indice) => {

                    card.style.opacity =
                        "0";


                    card.style.transform =
                        "translateY(25px)";


                    setTimeout(
                        function () {

                            card.style.transition =
                                "opacity .6s ease, transform .6s ease, box-shadow .3s ease";


                            card.style.opacity =
                                "1";


                            card.style.transform =
                                "translateY(0)";

                        },

                        100 +
                        indice * 120

                    );

                }
            );


    } catch (erro) {

        console.error(
            "Erro Home:",
            erro
        );


        area.innerHTML = `

            <div class="modern-empty">

                <strong
                    style="
                        color:#06231c;
                        font-size:18px;
                    "
                >
                    Não foi possível carregar
                    os acampamentos
                </strong>

                <span>
                    Tente novamente em alguns instantes.
                </span>

            </div>

        `;

    }

}


// =====================================================
// CRIAR CARD DO ACAMPAMENTO
// =====================================================

function criarCardAcampamento(
    acampamento
) {

    const id =
        String(
            acampamento.id ||
            ""
        ).trim();


    const nome =
        escaparHtml(
            acampamento.nome ||
            "Acampamento"
        );


    const descricao =
        escaparHtml(
            acampamento.descricao ||
            ""
        );


    const local =
        escaparHtml(
            acampamento.local ||
            "Local a definir"
        );


    // =================================================
    // FOTO
    // =================================================

    let fotoHtml;


    if (
        acampamento.foto_key
    ) {

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


    // =================================================
    // VALORES
    // =================================================

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
            acampamento
                .idade_max_crianca !==
            null
            &&
            acampamento
                .idade_max_crianca !==
            undefined
        ) {

            tituloCrianca =

                `Criança até ${
                    Number(
                        acampamento
                            .idade_max_crianca
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


    // =================================================
    // CARD
    // =================================================

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
                        class="modern-camp-register"
                    >

                        INSCREVA-SE

                    </a>


                    <a
                        href="acampamento.html?id=${encodeURIComponent(id)}&aba=doacoes"
                        class="modern-camp-donate"
                    >

                        FAÇA UMA DOAÇÃO

                    </a>


                </div>


            </div>


        </article>

    `;

}


// =====================================================
// VERIFICAR VALOR
// =====================================================

function temValor(
    valor
) {

    return (

        valor !== null
        &&
        valor !== undefined
        &&
        valor !== ""
        &&
        Number.isFinite(
            Number(valor)
        )

    );

}


// =====================================================
// FORMATAR DINHEIRO
// =====================================================

function formatarDinheiro(
    valor
) {

    return Number(
        valor
    )
        .toLocaleString(
            "pt-BR",
            {

                style:
                    "currency",

                currency:
                    "BRL"

            }
        );

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(
    data
) {

    if (!data) {
        return "";
    }


    const texto =
        String(data)
            .substring(
                0,
                10
            );


    const partes =
        texto.split("-");


    if (
        partes.length !== 3
    ) {

        return texto;

    }


    return (

        partes[2]
        +
        "/"
        +
        partes[1]
        +
        "/"
        +
        partes[0]

    );

}


// =====================================================
// FORMATAR PERÍODO
// =====================================================

function formatarPeriodo(
    inicio,
    fim
) {

    if (
        !inicio &&
        !fim
    ) {

        return "Data a definir";

    }


    if (
        inicio &&
        fim
    ) {

        return (

            formatarData(
                inicio
            )
            +
            " — "
            +
            formatarData(
                fim
            )

        );

    }


    return formatarData(
        inicio ||
        fim
    );

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHtml(
    valor
) {

    return String(
        valor ??
        ""
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