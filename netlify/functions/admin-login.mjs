document.addEventListener(
    "DOMContentLoaded",
    function () {


        // =====================================================
        // ELEMENTOS
        // =====================================================

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


        if (
            !modal ||
            !formulario ||
            !campoSenha
        ) {

            return;

        }


        // =====================================================
        // ABRIR
        // =====================================================

        function abrirModal() {

            modal.classList.add(
                "aberto"
            );


            document.body.style.overflow =
                "hidden";


            setTimeout(
                function () {

                    campoSenha.focus();

                },
                100
            );

        }


        // =====================================================
        // FECHAR
        // =====================================================

        function fecharModal() {

            modal.classList.remove(
                "aberto"
            );


            document.body.style.overflow =
                "";


            const mensagem =
                document.getElementById(
                    "mensagem-login-admin"
                );


            if (mensagem) {

                mensagem.textContent =
                    "";

            }

        }


        // =====================================================
        // TODOS OS BOTÕES ADMIN
        // =====================================================

        botoesAbrir.forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    abrirModal
                );

            }
        );


        // =====================================================
        // BOTÃO X
        // =====================================================

        if (fechar) {

            fechar.addEventListener(
                "click",
                fecharModal
            );

        }


        // =====================================================
        // CLIQUE FORA
        // =====================================================

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    modal
                ) {

                    fecharModal();

                }

            }
        );


        // =====================================================
        // ESC
        // =====================================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                    &&
                    modal.classList
                    .contains(
                        "aberto"
                    )
                ) {

                    fecharModal();

                }

            }
        );


        // =====================================================
        // LOGIN
        // =====================================================

        formulario.addEventListener(
            "submit",
            async function (
                event
            ) {

                event.preventDefault();


                const senha =
                    campoSenha.value;


                const mensagem =
                    document.getElementById(
                        "mensagem-login-admin"
                    );


                const botao =
                    formulario
                    .querySelector(
                        'button[type="submit"]'
                    );


                if (mensagem) {

                    mensagem.textContent =
                        "";

                }


                const textoOriginal =
                    botao.textContent;


                botao.disabled =
                    true;


                botao.textContent =
                    "ENTRANDO...";


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


                    const dados =
                        await resposta.json();


                    if (
                        !resposta.ok
                    ) {

                        throw new Error(

                            dados.erro
                            ||
                            "Não foi possível entrar."

                        );

                    }


                    window.location.href =
                        "admin.html";


                } catch (erro) {

                    if (mensagem) {

                        mensagem.style.color =
                            "#b00020";


                        mensagem.textContent =
                            erro.message;

                    }


                } finally {

                    botao.disabled =
                        false;


                    botao.textContent =
                        textoOriginal;

                }

            }
        );


    }
);