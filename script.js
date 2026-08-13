document.addEventListener("DOMContentLoaded", function () {

    // ============================
    // ABAS
    // ============================

    const botoesAbas =
        document.querySelectorAll(".aba-acampamento");

    const conteudosAbas =
        document.querySelectorAll(".conteudo-aba");


    botoesAbas.forEach(botao => {

        botao.addEventListener("click", function () {

            const aba =
                this.getAttribute("data-aba");


            botoesAbas.forEach(b => {
                b.classList.remove("ativa");
            });


            conteudosAbas.forEach(c => {
                c.classList.remove("ativo");
            });


            this.classList.add("ativa");


            const conteudo =
                document.getElementById(aba);

            if (conteudo) {
                conteudo.classList.add("ativo");
            }

        });

    });



    // ============================
    // MODAL DE DOAÇÃO
    // ============================

    const modal =
        document.getElementById("modal-doacao");

    const fecharModal =
        document.getElementById("fechar-modal");


    if (fecharModal && modal) {

        fecharModal.addEventListener("click", function () {

            modal.classList.remove("aberto");

        });


        modal.addEventListener("click", function (event) {

            if (event.target === modal) {

                modal.classList.remove("aberto");

            }

        });

    }

});