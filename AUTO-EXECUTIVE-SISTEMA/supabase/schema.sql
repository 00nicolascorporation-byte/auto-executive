-- ============================================================
-- AUTO EXECUTIVE
-- BANCO DE DADOS PRINCIPAL
-- SUPABASE / POSTGRESQL
-- ============================================================


-- ============================================================
-- EXTENSÕES
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- PERFIS / USUÁRIOS
-- ============================================================

create table if not exists public.profiles (

    id uuid primary key
        references auth.users(id)
        on delete cascade,

    matricula text not null unique,

    nome text not null,

    perfil text not null default 'funcionario',

    ativo boolean not null default true,

    telefone text,

    cargo text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint profiles_perfil_check
        check (
            perfil in (
                'admin',
                'gerente',
                'funcionario'
            )
        )

);


-- ============================================================
-- FUNCIONÁRIOS
-- ============================================================

create table if not exists public.funcionarios (

    id uuid primary key default gen_random_uuid(),

    nome text not null,

    matricula text unique,

    cargo text,

    telefone text,

    salario numeric(14,2) default 0,

    ativo boolean not null default true,

    data_admissao date,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);


-- ============================================================
-- VEÍCULOS
-- ============================================================

create table if not exists public.veiculos (

    id uuid primary key default gen_random_uuid(),

    placa text,

    modelo text not null,

    marca text,

    ano integer,

    cor text,

    tipo text,

    cliente_nome text,

    cliente_telefone text,

    status text not null default 'aguardando',

    observacoes text,

    entrada_at timestamptz default now(),

    saida_at timestamptz,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint veiculos_status_check
        check (
            status in (
                'aguardando',
                'em_servico',
                'finalizado',
                'entregue',
                'cancelado'
            )
        )

);


-- ============================================================
-- PRODUTOS / ESTOQUE
-- ============================================================

create table if not exists public.produtos (

    id uuid primary key default gen_random_uuid(),

    nome text not null,

    categoria text,

    unidade text default 'un',

    quantidade numeric(14,3) not null default 0,

    estoque_minimo numeric(14,3) not null default 0,

    custo_unitario numeric(14,2) not null default 0,

    fornecedor text,

    ativo boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);


-- ============================================================
-- MOVIMENTAÇÃO DE ESTOQUE
-- ============================================================

create table if not exists public.movimentacoes_estoque (

    id uuid primary key default gen_random_uuid(),

    produto_id uuid not null
        references public.produtos(id)
        on delete cascade,

    tipo text not null,

    quantidade numeric(14,3) not null,

    custo_unitario numeric(14,2) default 0,

    motivo text,

    funcionario_id uuid
        references public.funcionarios(id)
        on delete set null,

    created_at timestamptz not null default now(),

    constraint movimentacoes_tipo_check
        check (
            tipo in (
                'entrada',
                'saida',
                'ajuste'
            )
        ),

    constraint movimentacoes_quantidade_check
        check (
            quantidade > 0
        )

);


-- ============================================================
-- GANHOS / RECEITAS
-- ============================================================

create table if not exists public.ganhos (

    id uuid primary key default gen_random_uuid(),

    data date not null default current_date,

    descricao text not null,

    categoria text,

    valor numeric(14,2) not null,

    forma_pagamento text,

    veiculo_id uuid
        references public.veiculos(id)
        on delete set null,

    funcionario_id uuid
        references public.funcionarios(id)
        on delete set null,

    observacoes text,

    created_at timestamptz not null default now(),

    constraint ganhos_valor_check
        check (
            valor >= 0
        )

);


-- ============================================================
-- GASTOS
-- ============================================================

create table if not exists public.gastos (

    id uuid primary key default gen_random_uuid(),

    data date not null default current_date,

    descricao text not null,

    categoria text not null,

    valor numeric(14,2) not null,

    forma_pagamento text,

    fornecedor text,

    recorrente boolean not null default false,

    observacoes text,

    created_at timestamptz not null default now(),

    constraint gastos_valor_check
        check (
            valor >= 0
        )

);


-- ============================================================
-- INVESTIMENTOS
-- ============================================================

create table if not exists public.investimentos (

    id uuid primary key default gen_random_uuid(),

    data date not null default current_date,

    descricao text not null,

    categoria text,

    valor numeric(14,2) not null,

    fornecedor text,

    observacoes text,

    created_at timestamptz not null default now(),

    constraint investimentos_valor_check
        check (
            valor >= 0
        )

);


-- ============================================================
-- HORAS DOS FUNCIONÁRIOS
-- ============================================================

create table if not exists public.horas_funcionarios (

    id uuid primary key default gen_random_uuid(),

    funcionario_id uuid not null
        references public.funcionarios(id)
        on delete cascade,

    data date not null default current_date,

    hora_entrada time,

    hora_saida time,

    intervalo_minutos integer not null default 0,

    horas_trabalhadas numeric(8,2) not null default 0,

    observacoes text,

    created_at timestamptz not null default now(),

    constraint horas_intervalo_check
        check (
            intervalo_minutos >= 0
        ),

    constraint horas_trabalhadas_check
        check (
            horas_trabalhadas >= 0
        )

);


-- ============================================================
-- MÁQUINAS
-- ============================================================

create table if not exists public.maquinas (

    id uuid primary key default gen_random_uuid(),

    nome text not null,

    modelo text,

    numero_serie text,

    categoria text,

    status text not null default 'operando',

    data_aquisicao date,

    valor_aquisicao numeric(14,2) default 0,

    horas_uso_total numeric(14,2) not null default 0,

    ultima_manutencao date,

    proxima_manutencao date,

    observacoes text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint maquinas_status_check
        check (
            status in (
                'operando',
                'parada',
                'manutencao',
                'inativa'
            )
        )

);


-- ============================================================
-- UTILIZAÇÃO DAS MÁQUINAS
-- ============================================================

create table if not exists public.uso_maquinas (

    id uuid primary key default gen_random_uuid(),

    maquina_id uuid not null
        references public.maquinas(id)
        on delete cascade,

    funcionario_id uuid
        references public.funcionarios(id)
        on delete set null,

    data date not null default current_date,

    hora_inicio time,

    hora_fim time,

    horas numeric(8,2) not null default 0,

    descricao text,

    created_at timestamptz not null default now(),

    constraint uso_maquinas_horas_check
        check (
            horas >= 0
        )

);


-- ============================================================
-- SERVIÇOS
-- ============================================================

create table if not exists public.servicos (

    id uuid primary key default gen_random_uuid(),

    nome text not null,

    categoria text,

    descricao text,

    preco numeric(14,2) not null default 0,

    duracao_minutos integer not null default 0,

    ativo boolean not null default true,

    created_at timestamptz not null default now(),

    constraint servicos_preco_check
        check (
            preco >= 0
        ),

    constraint servicos_duracao_check
        check (
            duracao_minutos >= 0
        )

);


-- ============================================================
-- SERVIÇOS REALIZADOS
-- ============================================================

create table if not exists public.servicos_realizados (

    id uuid primary key default gen_random_uuid(),

    servico_id uuid not null
        references public.servicos(id)
        on delete restrict,

    veiculo_id uuid
        references public.veiculos(id)
        on delete set null,

    funcionario_id uuid
        references public.funcionarios(id)
        on delete set null,

    data date not null default current_date,

    quantidade integer not null default 1,

    valor_unitario numeric(14,2) not null default 0,

    desconto numeric(14,2) not null default 0,

    valor_total numeric(14,2) not null default 0,

    observacoes text,

    created_at timestamptz not null default now(),

    constraint servicos_realizados_quantidade_check
        check (
            quantidade > 0
        )

);


-- ============================================================
-- ÍNDICES
-- ============================================================

create index if not exists idx_ganhos_data
    on public.ganhos(data);

create index if not exists idx_gastos_data
    on public.gastos(data);

create index if not exists idx_investimentos_data
    on public.investimentos(data);

create index if not exists idx_horas_funcionario_data
    on public.horas_funcionarios(funcionario_id, data);

create index if not exists idx_movimentacoes_produto
    on public.movimentacoes_estoque(produto_id);

create index if not exists idx_veiculos_status
    on public.veiculos(status);

create index if not exists idx_servicos_realizados_data
    on public.servicos_realizados(data);


-- ============================================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================================

create or replace function public.atualizar_updated_at()
returns trigger
language plpgsql
as $$
begin

    new.updated_at = now();

    return new;

end;
$$;


-- ============================================================
-- TRIGGERS updated_at
-- ============================================================

drop trigger if exists trg_profiles_updated_at
on public.profiles;

create trigger trg_profiles_updated_at

before update
on public.profiles

for each row
execute function public.atualizar_updated_at();


drop trigger if exists trg_funcionarios_updated_at
on public.funcionarios;

create trigger trg_funcionarios_updated_at

before update
on public.funcionarios

for each row
execute function public.atualizar_updated_at();


drop trigger if exists trg_veiculos_updated_at
on public.veiculos;

create trigger trg_veiculos_updated_at

before update
on public.veiculos

for each row
execute function public.atualizar_updated_at();


drop trigger if exists trg_produtos_updated_at
on public.produtos;

create trigger trg_produtos_updated_at

before update
on public.produtos

for each row
execute function public.atualizar_updated_at();


drop trigger if exists trg_maquinas_updated_at
on public.maquinas;

create trigger trg_maquinas_updated_at

before update
on public.maquinas

for each row
execute function public.atualizar_updated_at();


-- ============================================================
-- RLS
-- ============================================================

alter table public.profiles
enable row level security;

alter table public.funcionarios
enable row level security;

alter table public.veiculos
enable row level security;

alter table public.produtos
enable row level security;

alter table public.movimentacoes_estoque
enable row level security;

alter table public.ganhos
enable row level security;

alter table public.gastos
enable row level security;

alter table public.investimentos
enable row level security;

alter table public.horas_funcionarios
enable row level security;

alter table public.maquinas
enable row level security;

alter table public.uso_maquinas
enable row level security;

alter table public.servicos
enable row level security;

alter table public.servicos_realizados
enable row level security;


-- ============================================================
-- POLÍTICAS INICIAIS
-- ============================================================
--
-- Nesta primeira versão, usuários autenticados podem acessar
-- os dados do sistema.
--
-- Depois vamos separar as permissões entre:
-- ADMIN
-- GERENTE
-- FUNCIONÁRIO
--
-- ============================================================


drop policy if exists "authenticated_profiles"
on public.profiles;

create policy "authenticated_profiles"

on public.profiles

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_funcionarios"
on public.funcionarios;

create policy "authenticated_funcionarios"

on public.funcionarios

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_veiculos"
on public.veiculos;

create policy "authenticated_veiculos"

on public.veiculos

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_produtos"
on public.produtos;

create policy "authenticated_produtos"

on public.produtos

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_movimentacoes"
on public.movimentacoes_estoque;

create policy "authenticated_movimentacoes"

on public.movimentacoes_estoque

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_ganhos"
on public.ganhos;

create policy "authenticated_ganhos"

on public.ganhos

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_gastos"
on public.gastos;

create policy "authenticated_gastos"

on public.gastos

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_investimentos"
on public.investimentos;

create policy "authenticated_investimentos"

on public.investimentos

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_horas"
on public.horas_funcionarios;

create policy "authenticated_horas"

on public.horas_funcionarios

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_maquinas"
on public.maquinas;

create policy "authenticated_maquinas"

on public.maquinas

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_uso_maquinas"
on public.uso_maquinas;

create policy "authenticated_uso_maquinas"

on public.uso_maquinas

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_servicos"
on public.servicos;

create policy "authenticated_servicos"

on public.servicos

for all

to authenticated

using (true)

with check (true);


drop policy if exists "authenticated_servicos_realizados"
on public.servicos_realizados;

create policy "authenticated_servicos_realizados"

on public.servicos_realizados

for all

to authenticated

using (true)

with check (true);


-- ============================================================
-- VIEWS FINANCEIRAS
-- ============================================================

create or replace view public.resumo_financeiro_diario
with (security_invoker = true)
as

select

    d.data,

    coalesce(g.receita, 0) as receita_bruta,

    coalesce(x.despesas, 0) as despesas,

    coalesce(i.investimentos, 0) as investimentos,

    (
        coalesce(g.receita, 0)
        -
        coalesce(x.despesas, 0)
    ) as resultado_liquido_operacional,

    (
        coalesce(g.receita, 0)
        -
        coalesce(x.despesas, 0)
        -
        coalesce(i.investimentos, 0)
    ) as saldo_apos_investimentos

from (

    select data
    from public.ganhos

    union

    select data
    from public.gastos

    union

    select data
    from public.investimentos

) d

left join (

    select
        data,
        sum(valor) as receita

    from public.ganhos

    group by data

) g

on g.data = d.data

left join (

    select
        data,
        sum(valor) as despesas

    from public.gastos

    group by data

) x

on x.data = d.data

left join (

    select
        data,
        sum(valor) as investimentos

    from public.investimentos

    group by data

) i

on i.data = d.data;


-- ============================================================
-- FIM
-- ============================================================