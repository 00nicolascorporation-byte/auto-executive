// ============================================================
// AUTO EXECUTIVE
// AUTENTICAÇÃO POR MATRÍCULA
// ============================================================


const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");


// ============================================================
// MENSAGEM
// ============================================================

function mostrarMensagem(mensagem) {

    loginMessage.textContent = mensagem;

}


// ============================================================
// VERIFICAR SESSÃO EXISTENTE
// ============================================================

async function verificarSessaoExistente() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();


    if (error) {

        console.error(error);

        return;

    }


    if (data.session) {

        window.location.href =
            "./dashboard.html";

    }

}


// ============================================================
// REALIZAR LOGIN
// ============================================================

async function realizarLogin(event) {

    event.preventDefault();

    mostrarMensagem("");


    const matricula =
        document
            .getElementById("matricula")
            .value
            .trim();


    const senha =
        document
            .getElementById("senha")
            .value;


    if (!matricula) {

        mostrarMensagem(
            "Digite sua matrícula."
        );

        return;

    }


    if (!senha) {

        mostrarMensagem(
            "Digite sua senha."
        );

        return;

    }


    loginButton.disabled = true;

    loginButton.textContent =
        "Entrando...";


    try {

        // ====================================================
        // BUSCAR E-MAIL PELA MATRÍCULA
        // ====================================================

        const {
            data: email,
            error: emailError
        } =
            await supabaseClient.rpc(
                "buscar_email_por_matricula",
                {
                    p_matricula: matricula
                }
            );


        if (emailError) {

            console.error(
                "Erro ao buscar matrícula:",
                emailError
            );

            mostrarMensagem(
                "Erro ao consultar a matrícula."
            );

            return;

        }


        if (!email) {

            mostrarMensagem(
                "Matrícula não encontrada."
            );

            return;

        }


        // ====================================================
        // AUTENTICAR COM E-MAIL E SENHA
        // ====================================================

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: email,

                    password: senha

                });


        if (error) {

            console.error(
                "Erro de autenticação:",
                error
            );

            mostrarMensagem(
                "Senha incorreta."
            );

            return;

        }


        if (!data.session) {

            mostrarMensagem(
                "Não foi possível criar a sessão."
            );

            return;

        }


        // ====================================================
        // LOGIN CONCLUÍDO
        // ====================================================

        window.location.href =
            "./dashboard.html";


    } catch (error) {

        console.error(error);

        mostrarMensagem(
            "Ocorreu um erro ao realizar o login."
        );

    } finally {

        loginButton.disabled = false;

        loginButton.textContent =
            "Entrar";

    }

}


// ============================================================
// EVENTO DO FORMULÁRIO
// ============================================================

loginForm.addEventListener(
    "submit",
    realizarLogin
);


// ============================================================
// VERIFICAR SESSÃO
// ============================================================

verificarSessaoExistente();