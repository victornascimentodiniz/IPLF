document.addEventListener("DOMContentLoaded", function () {

    const topbar = document.getElementById("home-topbar");
    const toggle = document.getElementById("internal-menu-toggle");
    const menu = document.getElementById("internal-mobile-menu");

    function atualizarTopbar() {
        if (!topbar) return;

        if (window.scrollY > 24) {
            topbar.classList.add("is-scrolled");
        } else {
            topbar.classList.remove("is-scrolled");
        }
    }

    function fecharMenu() {
        if (!toggle || !menu) return;

        toggle.classList.remove("is-open");
        menu.classList.remove("is-open");

        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menu");
    }

    if (toggle && menu) {

        toggle.addEventListener("click", function () {

            const aberto = menu.classList.contains("is-open");

            if (aberto) {
                fecharMenu();
                return;
            }

            toggle.classList.add("is-open");
            menu.classList.add("is-open");

            toggle.setAttribute("aria-expanded", "true");
            toggle.setAttribute("aria-label", "Fechar menu");
        });

        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", fecharMenu);
        });
    }

    document
        .querySelectorAll("[data-mobile-admin-logout]")
        .forEach(function (botao) {

            botao.addEventListener("click", function () {

                const botaoPrincipal =
                    document.getElementById("botao-sair-admin");

                if (botaoPrincipal) {
                    botaoPrincipal.click();
                }

            });

        });

    atualizarTopbar();

    window.addEventListener("scroll", atualizarTopbar, {
        passive: true
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 1050) {
            fecharMenu();
        }
    });

});
