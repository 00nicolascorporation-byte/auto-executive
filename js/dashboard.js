// ============================================================
// AUTO EXECUTIVE
// DASHBOARD
// ============================================================

const dashboardUserName =
    document.getElementById("dashboardUserName");

const dashboardUserRole =
    document.getElementById("dashboardUserRole");

const logoutButton =
    document.getElementById("logoutButton");


// ============================================================
// PROTEGER O DASHBOARD
// ============================================================

async function protegerDashboard() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    if (error) {

        console.error(error);

        window.location.href =
            "./index.html";

        return;

    }


    if (!data.session) {

        window.location.href =
            "./index.html";

        return;

    }


    // ========================================================
    // BUSCAR PERFIL
    // ========================================================

    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, matricula, nome, perfil, ativo"
            )
            .eq(
                "id",
                data.session.user.id
            )
            .single();


    if (profileError) {

        console.error(profileError);

        await supabaseClient.auth.signOut();

        window.location.href =
            "./index.html";

        return;

    }


    if (!profile.ativo) {

        await supabaseClient.auth.signOut();

        window.location.href =
            "./index.html";

        return;

    }


    // ========================================================
    // MOSTRAR DADOS DO USUÁRIO
    // ========================================================

    if (dashboardUserName) {

        dashboardUserName.textContent =
            profile.nome || "Usuário";

    }


    if (dashboardUserRole) {

        dashboardUserRole.textContent =
            profile.perfil || "Usuário";

    }

}


// ============================================================
// LOGOUT
// ============================================================

async function sairDoSistema() {

    if (logoutButton) {

        logoutButton.disabled = true;

        logoutButton.textContent =
            "Saindo...";

    }


    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(error);

        if (logoutButton) {

            logoutButton.disabled = false;

            logoutButton.textContent =
                "Sair";

        }

        return;

    }


    window.location.href =
        "./index.html";

}


// ============================================================
// EVENTO DO BOTÃO SAIR
// ============================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        sairDoSistema
    );

}


// ============================================================
// INICIAR DASHBOARD
// ============================================================

protegerDashboard();