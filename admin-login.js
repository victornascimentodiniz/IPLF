document.addEventListener(
    "DOMContentLoaded",
    function () {

        const botaoAbrir =
            document.getElementById(
                "abrir-login-admin"
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


        if (
            !botaoAbrir ||
            !modal ||
            !formulario
        ) {
            return;
        }


        botaoAbrir.addEventListener(
            "click",
            function () {

                modal.classList.add(
                    "aberto"
                );


                document
                .getElementById(
                    "senha-admin"
                )
                .focus();

            }
        );


        if (fechar) {

            fechar.addEventListener(
                "click",
                function () {

                    modal.classList.remove(
                        "aberto"
                    );

                }
            );

        }


        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {

                    modal.classList.remove(
                        "aberto"
                    );

                }

            }
        );


        formulario.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const senha =
                    document
                    .getElementById(
                        "senha-admin"
                    )
                    .value;


                const mensagem =
                    document.getElementById(
                        "mensagem-login-admin"
                    );


                const botao =
                    formulario.querySelector(
                        'button[type="submit"]'
                    );


                mensagem.textContent = "";

                botao.disabled = true;

                botao.textContent =
                    "ENTRANDO...";


                try {

                    const resposta =
                        await fetch(
                            "/api/admin/login",
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
                                        senha
                                    })

                            }
                        );


                    const dados =
                        await resposta.json();


                    if (!resposta.ok) {

                        throw new Error(
                            dados.erro ||
                            "Não foi possível entrar."
                        );

                    }


                    window.location.href =
                        "admin.html";


                } catch (erro) {

                    mensagem.style.color =
                        "#b00020";

                    mensagem.textContent =
                        erro.message;


                } finally {

                    botao.disabled = false;

                    botao.textContent =
                        "ENTRAR";

                }

            }
        );

    }
);