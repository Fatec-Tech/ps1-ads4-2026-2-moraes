# Aula 2B — Atividade Prática: Consumindo a API JSONPlaceholder

**Disciplina:** Programação de Scripts I — Backend
**Módulo:** Fundamentos (Vanilla JavaScript) → Comunicação HTTP
**Tipo:** Aula prática / laboratório (complementar à Aula 2)
**Pré-requisitos:** Aula 2 (Fetch API, `async`/`await`, JSON)

---

## 1. Objetivo

Ao final desta aula, o aluno deve ser capaz de:

- Consumir uma **API REST pública real** (não mais um arquivo `.json` local);
- Fazer múltiplas requisições **encadeadas** (buscar um usuário e, a partir dele, buscar seus posts);
- Entender que o padrão de código do `fetch` **não muda** entre um arquivo local e uma API remota — só a URL;
- Praticar renderização dinâmica de listas e navegação simples entre "telas" (lista → detalhe) usando apenas Vanilla JavaScript.

Este é um exercício **isolado do projeto de cadastro de pacientes** — não vamos alterar aquele projeto aqui. A ideia é dar repertório aos alunos praticando os mesmos conceitos da Aula 2 contra uma API de verdade, publicada na internet, antes de partirmos para construir nosso próprio servidor com Node.js na Aula 3.

---

## 2. Problema

Até agora, só buscamos dados de um arquivo `pacientes.json` que estava dentro do próprio projeto. Mas como isso funciona quando o servidor está em **outro lugar da internet**, mantido por outra pessoa, com muito mais dados e vários endpoints diferentes?

Vamos usar a [JSONPlaceholder](https://jsonplaceholder.typicode.com/), uma API pública gratuita e sem necessidade de autenticação, feita justamente para prática e testes. Ela simula um sistema de usuários e posts (como um blog), com endpoints como:

- `https://jsonplaceholder.typicode.com/users` → lista de usuários
- `https://jsonplaceholder.typicode.com/posts?userId=1` → posts de um usuário específico

Vamos construir uma pequena aplicação que lista os usuários e, ao clicar em um deles, busca e exibe os posts daquele usuário — exigindo uma **segunda requisição**, disparada a partir do resultado da primeira.

---

## 3. Conceitos

| Conceito | Por que usamos |
|---|---|
| **API pública / API de terceiros** | Mostrar que o mesmo `fetch` que usamos localmente funciona contra qualquer servidor HTTP do mundo |
| **Endpoint** | Cada "caminho" da API representa um recurso diferente (`/users`, `/posts`) |
| **Query string (`?userId=1`)** | Forma de filtrar/parametrizar uma requisição GET |
| **Requisições encadeadas** | Uma requisição pode depender do resultado de outra (buscar posts *depois* de saber o ID do usuário) |
| **Renderização condicional** | Alternar entre "tela de lista" e "tela de detalhe" trocando o conteúdo de um mesmo elemento |
| **Delegação de eventos (`addEventListener` em elementos criados dinamicamente)** | Como reagir a cliques em elementos que não existiam quando a página carregou |

> **Observação pedagógica:** essa é uma ótima aula para reforçar, na prática, que "Fetch API não sabe nem se importa" se está falando com um arquivo local, uma API pública ou, no futuro, o próprio servidor Node.js da turma. O padrão de código é sempre o mesmo — isso é uma das ideias mais importantes do curso inteiro.

---

## 4. Estrutura do projeto

```
aula-02a-jsonplaceholder/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

> Projeto novo e independente — não é uma evolução do cadastro de pacientes. Deixe isso bem claro para a turma, para não gerar confusão sobre "qual projeto é qual".

---

## 5. Código

### `index.html`

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usuários e Posts — JSONPlaceholder</title>

  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
  >
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <div class="container py-5">
    <h1 class="mb-4">Usuários (JSONPlaceholder)</h1>

    <p id="carregando" class="text-muted">Carregando usuários...</p>

    <!-- Tela 1: lista de usuários -->
    <div id="tela-lista" class="row g-3"></div>

    <!-- Tela 2: detalhe de um usuário (começa escondida) -->
    <div id="tela-detalhe" class="d-none">
      <button id="btn-voltar" class="btn btn-outline-secondary mb-3">← Voltar</button>
      <h2 id="detalhe-nome" class="h4 mb-3"></h2>
      <ul id="lista-posts" class="list-group"></ul>
    </div>
  </div>

  <script src="js/app.js"></script>
</body>
</html>
```

### `css/style.css`

```css
body {
  background-color: #f8f9fa;
}

.card-usuario {
  cursor: pointer;
  transition: transform 0.15s ease-in-out;
}

.card-usuario:hover {
  transform: translateY(-3px);
}
```

### `js/app.js`

```javascript
const URL_BASE = 'https://jsonplaceholder.typicode.com';

// Referências aos elementos do DOM
const telaLista = document.getElementById('tela-lista');
const telaDetalhe = document.getElementById('tela-detalhe');
const mensagemCarregando = document.getElementById('carregando');
const detalheNome = document.getElementById('detalhe-nome');
const listaPosts = document.getElementById('lista-posts');
const botaoVoltar = document.getElementById('btn-voltar');

// Busca a lista de usuários na API
async function carregarUsuarios() {
  try {
    const resposta = await fetch(`${URL_BASE}/users`);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const usuarios = await resposta.json();
    renderizarListaUsuarios(usuarios);
  } catch (erro) {
    console.error('Erro ao carregar usuários:', erro);
    mensagemCarregando.textContent = 'Não foi possível carregar os usuários.';
    return;
  }

  mensagemCarregando.style.display = 'none';
}

// Desenha um "card" para cada usuário na tela de lista
function renderizarListaUsuarios(usuarios) {
  telaLista.innerHTML = '';

  usuarios.forEach((usuario) => {
    const coluna = document.createElement('div');
    coluna.className = 'col-md-4';

    coluna.innerHTML = `
      <div class="card card-usuario h-100" data-id="${usuario.id}">
        <div class="card-body">
          <h5 class="card-title">${usuario.name}</h5>
          <p class="card-text text-muted">${usuario.email}</p>
          <p class="card-text"><small>${usuario.company.name}</small></p>
        </div>
      </div>
    `;

    // Cada card criado dinamicamente recebe seu próprio listener de clique
    coluna.querySelector('.card-usuario').addEventListener('click', () => {
      abrirDetalheUsuario(usuario);
    });

    telaLista.appendChild(coluna);
  });
}

// Busca os posts de um usuário específico e mostra a tela de detalhe
async function abrirDetalheUsuario(usuario) {
  detalheNome.textContent = `Posts de ${usuario.name}`;
  listaPosts.innerHTML = '<li class="list-group-item">Carregando posts...</li>';

  telaLista.classList.add('d-none');
  telaDetalhe.classList.remove('d-none');

  try {
    // Segunda requisição, feita a partir do ID do usuário selecionado
    const resposta = await fetch(`${URL_BASE}/posts?userId=${usuario.id}`);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const posts = await resposta.json();
    renderizarPosts(posts);
  } catch (erro) {
    console.error('Erro ao carregar posts:', erro);
    listaPosts.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar posts.</li>';
  }
}

function renderizarPosts(posts) {
  listaPosts.innerHTML = '';

  posts.forEach((post) => {
    const item = document.createElement('li');
    item.className = 'list-group-item';
    item.innerHTML = `<strong>${post.title}</strong><p class="mb-0">${post.body}</p>`;
    listaPosts.appendChild(item);
  });
}

// Botão para voltar da tela de detalhe para a tela de lista
botaoVoltar.addEventListener('click', () => {
  telaDetalhe.classList.add('d-none');
  telaLista.classList.remove('d-none');
});

carregarUsuarios();
```

---

## 6. Explicação

- **`URL_BASE`** — guardamos a URL base em uma constante para não repetir a URL inteira em todo lugar. Isso também deixa explícito, visualmente, que estamos falando com um servidor **externo** — diferente do `fetch('data/pacientes.json')` da aula anterior.

- **`carregarUsuarios()`** — segue exatamente o mesmo padrão `try/await/resposta.ok/resposta.json()` da Aula 2. Vale parar aqui e perguntar à turma: "o que mudou em relação à aula passada?" A resposta esperada é: só a URL.

- **`renderizarListaUsuarios()` + `addEventListener` dentro do `forEach`** — como os cards são criados dinamicamente, não existiam no HTML original, então não podemos simplesmente colocar um `onclick` no HTML. Precisamos adicionar o listener **depois** de criar cada elemento.

- **`abrirDetalheUsuario()`** — este é o ponto mais importante da aula: uma função `async` que dispara uma **segunda** requisição, usando um dado (`usuario.id`) que só temos porque a primeira requisição já tinha terminado. Isso ilustra bem por que `async`/`await` é tão mais legível que encadear vários `.then()`.

- **Alternância de telas com `classList.add('d-none')` / `remove('d-none')`** — uma forma simples (sem framework, sem rotas) de simular "navegação" entre duas telas dentro da mesma página. Vale comentar que ferramentas como React resolvem isso de forma mais sofisticada, mas o princípio (esconder/mostrar conforme o estado) é o mesmo.

---

## 7. Passo a passo (execução em sala)

1. Criar a pasta `aula-02a-jsonplaceholder` com a estrutura de arquivos.
2. Antes de programar, explorar a API **no próprio navegador**: acessar `https://jsonplaceholder.typicode.com/users` diretamente na barra de endereços e mostrar o JSON puro. Repetir para `/posts?userId=1`.
3. Montar o HTML com as duas "telas" (lista e detalhe), explicando por que a tela de detalhe começa com `d-none`.
4. Escrever `carregarUsuarios()` e `renderizarListaUsuarios()`, testando só a listagem antes de avançar.
5. Escrever `abrirDetalheUsuario()` e `renderizarPosts()`, testando o clique em um card.
6. Implementar o botão "Voltar" por último.
7. Abrir o DevTools → aba **Network** e mostrar visualmente as requisições saindo para `jsonplaceholder.typicode.com` — isso ajuda muito a tornar o conceito de "requisição HTTP" concreto.

---

## 8. Exercícios

1. Exiba também o **telefone** e o **website** de cada usuário no card.
2. Na tela de detalhe, exiba quantos posts aquele usuário tem, com um texto como "3 posts encontrados".
3. Adicione um campo de busca que filtra os cards de usuário por nome, sem precisar de nova requisição (filtrando o array que já foi carregado).
4. Trate o caso de um usuário sem nenhum post (mostre uma mensagem amigável ao invés de uma lista vazia).

---

## 9. Extensões

- Ao clicar em um post específico, buscar e exibir também os **comentários** daquele post (`/comments?postId=X`) — uma terceira camada de requisição encadeada.
- Adicionar um campo de loading (*spinner*) mais elaborado durante a troca de tela.
- Comparar, em voz alta com a turma, o tempo de resposta da JSONPlaceholder com o tempo de resposta do `pacientes.json` local da Aula 2 (usando a aba Network) — ótima forma de discutir latência de rede.

---

## 10. Erros comuns

| Erro | Causa provável |
|---|---|
| Clique no card não faz nada | O `addEventListener` foi colocado no HTML estático, não dentro do `forEach` que cria os cards dinamicamente |
| Posts do usuário errado aparecem | Uso de uma variável compartilhada incorretamente, ou esquecimento de passar `usuario.id` correto na query string |
| Tela de detalhe não aparece | Confusão entre `classList.add` e `classList.remove` (adicionar `d-none` esconde, remover mostra) |
| Erro de CORS | Muito raro com a JSONPlaceholder (ela permite CORS por padrão), mas se acontecer com outra API no futuro, é sinal de que o servidor não autoriza requisições vindas do navegador do aluno |
| `usuarios.forEach is not a function` | A API retornou um erro (ex: objeto de erro) em vez de um array — reforça a importância de checar `resposta.ok` |

---

## 11. Perguntas para discussão em sala

1. O que mudou no código do `fetch` em relação à Aula 2, agora que estamos falando com uma API remota, e não mais com um arquivo local?
2. Por que precisamos esperar a primeira requisição (`/users`) terminar antes de poder fazer a segunda (`/posts?userId=...`)?
3. O que aconteceria se tentássemos buscar os posts **antes** de sabermos o ID do usuário?
4. Que tipo de sistema real vocês imaginam que poderia ser construído usando esse padrão de "lista → detalhe com nova requisição"? (ex: e-commerce, rede social, prontuário médico)
5. Esse mesmo padrão de código vai servir, com pouquíssimas mudanças, para quando nosso próprio servidor Node.js estiver pronto — o que vocês acham que vai precisar mudar, e o que vai continuar igual?

---

## Observações para o professor

- Esta aula é **opcional/complementar** dentro da sequência, mas altamente recomendada: ela consolida o padrão de `fetch` aprendido na Aula 2 contra uma API de verdade, com múltiplos endpoints e relacionamento entre dados — algo que o `pacientes.json` estático não permite demonstrar sozinho.
- Sugestão de duração: ~15min de exploração da API direto no navegador, ~45min de código guiado, ~30min de exercícios.
- Não é necessário devolver para o projeto de cadastro de pacientes nesta aula — a Aula 3 retoma normalmente a partir da Aula 2, introduzindo o Node.js.
- Se a turma tiver pouco tempo disponível no cronograma, esta aula pode ser marcada como **atividade extraclasse** ou **desafio opcional**, sem prejuízo para a sequência principal do curso.