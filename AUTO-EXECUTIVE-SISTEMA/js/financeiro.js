/* =========================================================
   AUTO EXECUTIVE
   MÓDULO FINANCEIRO
   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const TABLE_NAME = "finance_transactions";


/* =========================================================
   ELEMENTOS
========================================================= */

const transactionModal =
    document.getElementById("transactionModal");

const newTransactionButton =
    document.getElementById("newTransactionButton");

const closeModalButton =
    document.getElementById("closeModalButton");

const cancelModalButton =
    document.getElementById("cancelModalButton");

const transactionForm =
    document.getElementById("transactionForm");

const transactionBody =
    document.getElementById("transactionsBody");

const transactionMessage =
    document.getElementById("transactionMessage");

const transactionCount =
    document.getElementById("transactionCount");

const formError =
    document.getElementById("formError");


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarFinanceiro
);


async function iniciarFinanceiro() {

    configurarDataAtual();

    configurarEventos();

    configurarDataPadrao();

    await carregarLancamentos();

}


/* =========================================================
   DATA ATUAL
========================================================= */

function configurarDataAtual() {

    const elemento =
        document.getElementById("currentDate");

    if (!elemento) {
        return;
    }

    const hoje = new Date();

    elemento.textContent =
        hoje.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

}


/* =========================================================
   DATA PADRÃO DO FORMULÁRIO
========================================================= */

function configurarDataPadrao() {

    const campo =
        document.getElementById("transactionDate");

    if (!campo) {
        return;
    }

    const hoje =
        new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");

    campo.value =
        `${ano}-${mes}-${dia}`;

}


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {


    /* NOVO LANÇAMENTO */

    if (newTransactionButton) {

        newTransactionButton.addEventListener(
            "click",
            abrirModal
        );

    }


    /* FECHAR MODAL */

    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            fecharModal
        );

    }


    if (cancelModalButton) {

        cancelModalButton.addEventListener(
            "click",
            fecharModal
        );

    }


    /* FORMULÁRIO */

    if (transactionForm) {

        transactionForm.addEventListener(
            "submit",
            salvarLancamento
        );

    }


    /* FILTRO */

    const filterButton =
        document.getElementById(
            "filterButton"
        );

    if (filterButton) {

        filterButton.addEventListener(
            "click",
            carregarLancamentos
        );

    }


    /* LIMPAR FILTRO */

    const clearFilterButton =
        document.getElementById(
            "clearFilterButton"
        );

    if (clearFilterButton) {

        clearFilterButton.addEventListener(
            "click",
            limparFiltros
        );

    }


    /* CLICAR FORA DO MODAL */

    if (transactionModal) {

        transactionModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    transactionModal
                ) {

                    fecharModal();

                }

            }
        );

    }


    /* LOGOUT */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            realizarLogout
        );

    }

}


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal() {

    limparErroFormulario();

    transactionModal.classList.remove(
        "hidden"
    );

    configurarDataPadrao();

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal() {

    transactionModal.classList.add(
        "hidden"
    );

    limparErroFormulario();

}


/* =========================================================
   ERRO DO FORMULÁRIO
========================================================= */

function mostrarErroFormulario(
    mensagem
) {

    if (!formError) {
        return;
    }

    formError.textContent =
        mensagem;

    formError.classList.add(
        "visible"
    );

}


function limparErroFormulario() {

    if (!formError) {
        return;
    }

    formError.textContent = "";

    formError.classList.remove(
        "visible"
    );

}


/* =========================================================
   USUÁRIO LOGADO
========================================================= */

async function obterUsuarioAtual() {

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
   SALVAR LANÇAMENTO
========================================================= */

async function salvarLancamento(
    event
) {

    event.preventDefault();

    limparErroFormulario();


    const tipo =
        document.getElementById(
            "transactionType"
        ).value;


    const data =
        document.getElementById(
            "transactionDate"
        ).value;


    const descricao =
        document.getElementById(
            "transactionDescription"
        ).value.trim();


    const categoria =
        document.getElementById(
            "transactionCategory"
        ).value;


    const valor =
        Number(
            document.getElementById(
                "transactionValue"
            ).value
        );


    const observacao =
        document.getElementById(
            "transactionNote"
        ).value.trim();


    /* VALIDAÇÕES */

    if (!tipo) {

        mostrarErroFormulario(
            "Selecione o tipo do lançamento."
        );

        return;

    }


    if (!data) {

        mostrarErroFormulario(
            "Informe a data."
        );

        return;

    }


    if (!descricao) {

        mostrarErroFormulario(
            "Informe uma descrição."
        );

        return;

    }


    if (!categoria) {

        mostrarErroFormulario(
            "Selecione uma categoria."
        );

        return;

    }


    if (
        !Number.isFinite(valor) ||
        valor <= 0
    ) {

        mostrarErroFormulario(
            "Informe um valor válido maior que zero."
        );

        return;

    }


    /* USUÁRIO */

    const usuario =
        await obterUsuarioAtual();


    if (!usuario) {

        mostrarErroFormulario(
            "Sua sessão expirou. Faça login novamente."
        );

        return;

    }


    /* DADOS */

    const registro = {

        user_id:
            usuario.id,

        tipo:
            tipo,

        descricao:
            descricao,

        categoria:
            categoria,

        valor:
            valor,

        data:
            data,

        observacao:
            observacao || null

    };


    /* BOTÃO */

    const submitButton =
        transactionForm.querySelector(
            'button[type="submit"]'
        );


    const textoOriginal =
        submitButton.textContent;


    submitButton.disabled =
        true;

    submitButton.textContent =
        "Salvando...";


    /* INSERT */

    const {
        error
    } =
        await supabaseClient
            .from(TABLE_NAME)
            .insert(registro);


    submitButton.disabled =
        false;

    submitButton.textContent =
        textoOriginal;


    if (error) {

        console.error(
            "Erro ao salvar lançamento:",
            error
        );


        mostrarErroFormulario(
            "Não foi possível salvar o lançamento."
        );

        return;

    }


    /* SUCESSO */

    transactionForm.reset();

    configurarDataPadrao();

    fecharModal();


    await carregarLancamentos();

}


/* =========================================================
   BUSCAR LANÇAMENTOS
========================================================= */

async function carregarLancamentos() {

    mostrarMensagem(
        "Carregando lançamentos..."
    );


    let query =
        supabaseClient
            .from(TABLE_NAME)
            .select("*")
            .order(
                "data",
                {
                    ascending: false
                }
            );


    /* DATA INICIAL */

    const startDate =
        document.getElementById(
            "startDate"
        )?.value;


    if (startDate) {

        query =
            query.gte(
                "data",
                startDate
            );

    }


    /* DATA FINAL */

    const endDate =
        document.getElementById(
            "endDate"
        )?.value;


    if (endDate) {

        query =
            query.lte(
                "data",
                endDate
            );

    }


    /* TIPO */

    const typeFilter =
        document.getElementById(
            "typeFilter"
        )?.value;


    if (
        typeFilter &&
        typeFilter !== "todos"
    ) {

        query =
            query.eq(
                "tipo",
                typeFilter
            );

    }


    const {
        data,
        error
    } =
        await query;


    if (error) {

        console.error(
            "Erro ao carregar lançamentos:",
            error
        );


        mostrarMensagem(
            "Erro ao consultar os lançamentos."
        );

        return;

    }


    const lancamentos =
        data || [];


    renderizarLancamentos(
        lancamentos
    );


    atualizarResumo(
        lancamentos
    );

}


/* =========================================================
   RENDERIZAR TABELA
========================================================= */

function renderizarLancamentos(
    lancamentos
) {

    transactionBody.innerHTML =
        "";


    if (
        lancamentos.length === 0
    ) {

        mostrarMensagem(
            "Nenhum lançamento encontrado."
        );

        atualizarContador(0);

        return;

    }


    esconderMensagem();


    lancamentos.forEach(
        function (item) {

            const row =
                document.createElement(
                    "tr"
                );


            const dataFormatada =
                formatarData(
                    item.data
                );


            const tipoLabel =
                obterTipoLabel(
                    item.tipo
                );


            const valorFormatado =
                formatarMoeda(
                    item.valor
                );


            row.innerHTML = `

                <td>
                    ${dataFormatada}
                </td>

                <td>

                    <div class="transaction-description">

                        <strong>
                            ${escaparHTML(
                                item.descricao
                            )}
                        </strong>

                        ${
                            item.observacao
                                ? `
                                    <span>
                                        ${escaparHTML(
                                            item.observacao
                                        )}
                                    </span>
                                  `
                                : ""
                        }

                    </div>

                </td>

                <td>

                    <span class="category-badge">

                        ${escaparHTML(
                            formatarCategoria(
                                item.categoria
                            )
                        )}

                    </span>

                </td>

                <td>

                    <span
                        class="type-badge ${item.tipo}"
                    >

                        ${tipoLabel}

                    </span>

                </td>

                <td>

                    <strong
                        class="
                            transaction-value
                            ${item.tipo}
                        "
                    >

                        ${valorFormatado}

                    </strong>

                </td>

                <td>

                    <button
                        type="button"
                        class="delete-button"
                        data-id="${item.id}"
                    >
                        Excluir
                    </button>

                </td>

            `;


            transactionBody.appendChild(
                row
            );


            const deleteButton =
                row.querySelector(
                    ".delete-button"
                );


            deleteButton.addEventListener(
                "click",
                function () {

                    excluirLancamento(
                        item.id
                    );

                }
            );

        }
    );


    atualizarContador(
        lancamentos.length
    );

}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo(
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


            if (
                item.tipo ===
                "ganho"
            ) {

                receitas += valor;

            }


            if (
                item.tipo ===
                "gasto"
            ) {

                despesas += valor;

            }


            if (
                item.tipo ===
                "investimento"
            ) {

                investimentos += valor;

            }

        }
    );


    const saldo =
        receitas -
        despesas;


    definirTexto(
        "totalIncome",
        formatarMoeda(
            receitas
        )
    );


    definirTexto(
        "totalExpense",
        formatarMoeda(
            despesas
        )
    );


    definirTexto(
        "totalInvestment",
        formatarMoeda(
            investimentos
        )
    );


    definirTexto(
        "totalBalance",
        formatarMoeda(
            saldo
        )
    );

}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirLancamento(
    id
) {

    const confirmar =
        window.confirm(
            "Deseja realmente excluir este lançamento?"
        );


    if (!confirmar) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from(TABLE_NAME)
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Erro ao excluir:",
            error
        );


        alert(
            "Não foi possível excluir o lançamento."
        );

        return;

    }


    await carregarLancamentos();

}


/* =========================================================
   LIMPAR FILTROS
========================================================= */

function limparFiltros() {

    const startDate =
        document.getElementById(
            "startDate"
        );

    const endDate =
        document.getElementById(
            "endDate"
        );

    const typeFilter =
        document.getElementById(
            "typeFilter"
        );


    if (startDate) {
        startDate.value = "";
    }


    if (endDate) {
        endDate.value = "";
    }


    if (typeFilter) {
        typeFilter.value = "todos";
    }


    carregarLancamentos();

}


/* =========================================================
   CONTADOR
========================================================= */

function atualizarContador(
    quantidade
) {

    if (!transactionCount) {
        return;
    }


    transactionCount.textContent =
        quantidade === 1
            ? "1 lançamento"
            : `${quantidade} lançamentos`;

}


/* =========================================================
   MENSAGENS
========================================================= */

function mostrarMensagem(
    mensagem
) {

    if (!transactionMessage) {
        return;
    }


    transactionMessage.textContent =
        mensagem;


    transactionMessage.style.display =
        "block";

}


function esconderMensagem() {

    if (!transactionMessage) {
        return;
    }


    transactionMessage.style.display =
        "none";

}


/* =========================================================
   LOGOUT
========================================================= */

async function realizarLogout() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Erro ao sair:",
            error
        );

        alert(
            "Não foi possível sair."
        );

        return;

    }


    window.location.href =
        "./index.html";

}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function definirTexto(
    id,
    texto
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            texto;

    }

}


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


function formatarData(
    data
) {

    if (!data) {
        return "--";
    }


    const partes =
        data.split("-");


    if (
        partes.length !== 3
    ) {

        return data;

    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function obterTipoLabel(
    tipo
) {

    const tipos = {

        ganho:
            "Ganho",

        gasto:
            "Gasto",

        investimento:
            "Investimento"

    };


    return tipos[tipo] ||
        tipo;

}


function formatarCategoria(
    categoria
) {

    const categorias = {

        servicos:
            "Serviços",

        produtos:
            "Produtos",

        materiais:
            "Materiais",

        energia:
            "Energia",

        aluguel:
            "Aluguel",

        salarios:
            "Salários",

        equipamentos:
            "Equipamentos",

        marketing:
            "Marketing",

        outros:
            "Outros"

    };


    return categorias[categoria] ||
        categoria;

}


/* =========================================================
   SEGURANÇA — TEXTO HTML
========================================================= */

function escaparHTML(
    texto
) {

    return String(
        texto ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}