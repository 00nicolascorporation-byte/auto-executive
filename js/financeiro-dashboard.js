/* =========================================================
   AUTO EXECUTIVE
   INTEGRAÇÃO FINANCEIRA DO DASHBOARD
   ========================================================= */

const FINANCE_TABLE = "finance_transactions";


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    carregarResumoFinanceiro
);


async function carregarResumoFinanceiro() {

    try {

        const usuario =
            await obterUsuarioFinanceiro();

        if (!usuario) {

            console.warn(
                "Nenhum usuário autenticado."
            );

            return;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from(FINANCE_TABLE)
                .select(
                    "tipo, valor, data"
                )
                .eq(
                    "user_id",
                    usuario.id
                );


        if (error) {

            console.error(
                "Erro ao consultar dados financeiros:",
                error
            );

            return;

        }


        calcularResumoFinanceiro(
            data || []
        );


    } catch (erro) {

        console.error(
            "Erro no módulo financeiro do dashboard:",
            erro
        );

    }

}


/* =========================================================
   USUÁRIO
========================================================= */

async function obterUsuarioFinanceiro() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "Erro ao obter usuário:",
            error
        );

        return null;

    }


    return data?.user || null;

}


/* =========================================================
   CALCULAR RESUMO
========================================================= */

function calcularResumoFinanceiro(
    lancamentos
) {

    let receitas = 0;

    let despesas = 0;

    let investimentos = 0;


    lancamentos.forEach(
        function (item) {

            const valor =
                Number(
                    item.valor
                ) || 0;


            switch (item.tipo) {

                case "ganho":

                    receitas += valor;

                    break;


                case "gasto":

                    despesas += valor;

                    break;


                case "investimento":

                    investimentos += valor;

                    break;

            }

        }
    );


    const saldo =
        receitas -
        despesas;


    atualizarElemento(
        "receitaBruta",
        formatarMoeda(
            receitas
        )
    );


    atualizarElemento(
        "despesas",
        formatarMoeda(
            despesas
        )
    );


    atualizarElemento(
        "investimentos",
        formatarMoeda(
            investimentos
        )
    );


    const elementoSaldo =
    document.getElementById(
        "summaryBalance"
    );

if (elementoSaldo) {

    elementoSaldo.textContent =
        formatarMoeda(
            saldo
        );

}
   

}


/* =========================================================
   ATUALIZAR ELEMENTO
========================================================= */

function atualizarElemento(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (!elemento) {

        console.warn(
            `Elemento #${id} não encontrado no Dashboard.`
        );

        return;

    }


    elemento.textContent =
        valor;

}


/* =========================================================
   MOEDA
========================================================= */

function formatarMoeda(
    valor
) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}