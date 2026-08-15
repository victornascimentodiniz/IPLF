document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ==========================================
        // BOTÕES ADMIN
        // Funciona no computador e no celular
        // ==========================================

        const botoesAbrir =
            document.querySelectorAll(
                "[data-admin-login]"
            );


        const modal =
            document.getElementById(
                "modal-login-admin"
            );


        const fechar =
            document.getElementById(
                "fechar-login-admin"
            );


        const formulario =
            document.getElementById(
                "form-login-admin"
            );


        const campoSenha =
            document.getElementById(
                "senha-admin"
            );


        const mensagem =
            document.getElementById(
                "mensagem-login-admin"
            );


        // ==========================================
        // VERIFICAR ELEMENTOS
        // ==========================================

        if (
            !modal ||
            !formulario ||
            !campoSenha
        ) {

            console.error(
                "Elementos do login administrativo não encontrados."
            );

            return;

        }


        // ==========================================
        // ABRIR MODAL
        // ==========================================

        function abrirModalAdmin() {

            modal.classList.add(
                "aberto"
            );


            document.body.style.overflow =
                "hidden";


            if (mensagem) {

                mensagem.textContent =
                    "";

            }


            setTimeout(
                function () {

                    campoSenha.focus();

                },
                100
            );

        }


        // ==========================================
        // FECHAR MODAL
        // ==========================================

        function fecharModalAdmin() {

            modal.classList.remove(
                "aberto"
            );


            document.body.style.overflow =
                "";


            campoSenha.value =
                "";


            if (mensagem) {

                mensagem.textContent =
                    "";

            }

        }


        // ==========================================
        // BOTÕES ADMIN
        // ==========================================

        botoesAbrir.forEach(
            function (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        abrirModalAdmin();

                    }
                );

            }
        );


        // ==========================================
        // BOTÃO X
        // ==========================================

        if (fechar) {

            fechar.addEventListener(
                "click",
                function () {

                    fecharModalAdmin();

                }
            );

        }


        // ==========================================
        // CLICAR FORA DA CAIXA
        // ==========================================

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    fecharModalAdmin();

                }

            }
        );


        // ==========================================
        // TECLA ESC
        // ==========================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    modal.classList.contains(
                        "aberto"
                    )
                ) {

                    fecharModalAdmin();

                }

            }
        );


        // ==========================================
        // ENVIAR LOGIN
        // ==========================================

        formulario.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const senha =
                    campoSenha.value.trim();


                const botaoEntrar =
                    formulario.querySelector(
                        'button[type="submit"]'
                    );


                if (!senha) {

                    if (mensagem) {

                        mensagem.style.color =
                            "#b00020";

                        mensagem.textContent =
                            "Digite a senha.";

                    }

                    return;

                }


                const textoOriginal =
                    botaoEntrar.textContent;


                botaoEntrar.disabled =
                    true;


                botaoEntrar.textContent =
                    "ENTRANDO...";


                if (mensagem) {

                    mensagem.textContent =
                        "";

                }


                try {

                    const resposta =
                        await fetch(
                            "/api/admin/login",
                            {

                                method:
                                    "POST",

                                credentials:
                                    "same-origin",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        {
                                            senha
                                        }
                                    )

                            }
                        );


                    let dados;


                    try {

                        dados =
                            await resposta.json();

                    } catch {

                        dados = {};

                    }


                    if (!resposta.ok) {

                        throw new Error(
                            dados.erro ||
                            "Não foi possível entrar."
                        );

                    }


                    // ==================================
                    // LOGIN CORRETO
                    // ==================================

                    window.location.href =
                        "admin.html";


                } catch (erro) {

                    console.error(
                        "Erro no login:",
                        erro
                    );


                    if (mensagem) {

                        mensagem.style.color =
                            "#b00020";


                        mensagem.textContent =
                            erro.message;

                    }


                } finally {

                    botaoEntrar.disabled =
                        false;


                    botaoEntrar.textContent =
                        textoOriginal;

                }

            }
        );

    }
);