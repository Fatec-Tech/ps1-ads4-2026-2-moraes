# Aula 4 — Express e CRUD Completo (GET, POST, PUT, DELETE)

**Disciplina:** Programação de Scripts I — Backend
**Módulo:** Backend com Node.js → API REST
**Pré-requisitos:** Aula 3 (servidor Node.js com módulo `http`), Aula 2 (Fetch API)

---

## 1. Objetivo

Ao final desta aula, o aluno deve ser capaz de:

- Instalar dependências com `npm install` e entender o que é o `node_modules`;
- Reescrever o servidor da Aula 3 usando **Express**, comparando a diferença de verbosidade;
- Entender o que é **CRUD** e como cada operação se mapeia a um **método HTTP** (POST, GET, PUT, DELETE);
- Criar rotas com **parâmetros** (`/pacientes/:id`) e ler o **corpo (body)** da requisição em JSON;
- Devolver **códigos de status HTTP** adequados (200, 201, 204, 400, 404);
- Evoluir o frontend para cadastrar, listar, editar e excluir pacientes através da API.

Nesta aula os dados **ainda ficam em memória** no servidor. O foco é a **API** (rotas, métodos, status). A persistência em banco vem na Aula 5.

---

## 2. Problema

Na Aula 3 o servidor só sabia responder `GET /pacientes`. Mas um cadastro de verdade precisa **criar, ler, atualizar e excluir** pacientes. Com o módulo `http` puro, cada rota nova viraria mais um `if` dentro de um único bloco gigante, com parsing manual de URL e de corpo da requisição.

O Express resolve exatamente isso: cada rota vira uma linha declarativa, e o `JSON` do corpo é lido automaticamente.

---

## 3. Conceitos

| Conceito | Por que usamos |
|---|---|
| **Express** | Framework minimalista que simplifica rotas, leitura de body e respostas |
| **`npm install` e `node_modules`** | Baixa bibliotecas de terceiros e registra no `package.json` (`dependencies`) |
| **CRUD** | Create, Read, Update, Delete: as quatro operações básicas sobre um recurso |
| **Métodos HTTP** | O "verbo" da requisição indica a intenção: criar (POST), ler (GET), atualizar (PUT), remover (DELETE) |
| **Recurso e endpoint** | `/pacientes` representa a coleção; `/pacientes/5` representa um paciente específico |
| **Parâmetro de rota (`req.params`)** | Valor variável na URL, como o `:id` |
| **Body JSON (`req.body`)** | Dados enviados pelo cliente, lidos graças ao `express.json()` |
| **Middleware** | Função que roda **antes** das rotas (ex.: `cors()` e `express.json()`) |
| **Status HTTP** | Comunica o resultado: `200` OK, `201` criado, `204` sem conteúdo, `400` requisição inválida, `404` não encontrado |

### Mapa do CRUD

| Operação | Método | Endpoint | Sucesso | Erros possíveis |
|---|---|---|---|---|
| **C**reate | `POST` | `/pacientes` | `201` + paciente criado | `400` |
| **R**ead (lista) | `GET` | `/pacientes` | `200` + array | — |
| **R**ead (um) | `GET` | `/pacientes/:id` | `200` + paciente | `404` |
| **U**pdate | `PUT` | `/pacientes/:id` | `200` + paciente atualizado | `400`, `404` |
| **D**elete | `DELETE` | `/pacientes/:id` | `204` sem corpo | `404` |

> **Observação pedagógica:** projete esta tabela no quadro e deixe-a visível durante toda a aula. É o "mapa" que os alunos vão consultar até o fim do curso.

---

## 4. Estrutura do projeto

```
aula-04-cadastro-pacientes/
├── backend/
│   ├── package.json
│   └── server.js
└── frontend/
    ├── index.html
    ├── css/
    │   └── style.css      (igual à Aula 3)
    └── js/
        └── app.js
```

---

## 5. Código

### Instalação (dentro de `backend/`)

```bash
npm install express cors
```

> O `cors` substitui o `res.setHeader('Access-Control-Allow-Origin', '*')` que escrevíamos à mão na Aula 3.

### `backend/package.json`

```json
{
  "name": "aula-04-servidor-pacientes",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.0.0"
  }
}
```

> `npm run dev` reinicia o servidor automaticamente a cada alteração (recurso nativo do Node, sem precisar do nodemon). Em produção (Render) usa-se `npm start`.

### `backend/server.js`

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares: rodam antes de todas as rotas
app.use(cors());          // libera o acesso do frontend (outra origem)
app.use(express.json());  // converte o body JSON em objeto, disponível em req.body

// "Banco de dados" em memória (será substituído na Aula 5)
const pacientes = [
  { id: 1, nome: 'Maria Silva', email: 'maria.silva@email.com', nascimento: '1990-04-12' },
  { id: 2, nome: 'João Pereira', email: 'joao.pereira@email.com', nascimento: '1985-11-30' },
  { id: 3, nome: 'Ana Costa', email: 'ana.costa@email.com', nascimento: '2001-07-08' },
];
let proximoId = 4;

// READ (lista) — GET /pacientes
app.get('/pacientes', (req, res) => {
  res.json(pacientes);
});

// READ (um) — GET /pacientes/:id
app.get('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find((p) => p.id === id);

  if (!paciente) {
    return res.status(404).json({ erro: 'Paciente não encontrado' });
  }

  res.json(paciente);
});

// CREATE — POST /pacientes
app.post('/pacientes', (req, res) => {
  const { nome, email, nascimento } = req.body ?? {};

  if (!nome || !email || !nascimento) {
    return res.status(400).json({ erro: 'Nome, e-mail e nascimento são obrigatórios' });
  }

  const novoPaciente = { id: proximoId++, nome, email, nascimento };
  pacientes.push(novoPaciente);

  res.status(201).json(novoPaciente);
});

// UPDATE — PUT /pacientes/:id
app.put('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find((p) => p.id === id);

  if (!paciente) {
    return res.status(404).json({ erro: 'Paciente não encontrado' });
  }

  const { nome, email, nascimento } = req.body ?? {};

  if (!nome || !email || !nascimento) {
    return res.status(400).json({ erro: 'Nome, e-mail e nascimento são obrigatórios' });
  }

  paciente.nome = nome;
  paciente.email = email;
  paciente.nascimento = nascimento;

  res.json(paciente);
});

// DELETE — DELETE /pacientes/:id
app.delete('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = pacientes.findIndex((p) => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Paciente não encontrado' });
  }

  pacientes.splice(indice, 1);

  res.status(204).send(); // 204 = deu certo, e não há corpo na resposta
});

// Em produção (Render) a porta vem da variável de ambiente PORT
const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
```

### `frontend/index.html`

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro de Pacientes</title>

  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
  >
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <div class="container py-5">
    <h1 class="mb-4">Cadastro de Pacientes</h1>

    <!-- Área para mensagens de sucesso/erro -->
    <div id="mensagem"></div>

    <form id="form-paciente" class="row g-3 mb-5">
      <!-- Campo oculto: se tiver valor, estamos EDITANDO (PUT); se vazio, CRIANDO (POST) -->
      <input type="hidden" id="id">

      <div class="col-md-4">
        <label for="nome" class="form-label">Nome</label>
        <input type="text" class="form-control" id="nome" required>
      </div>

      <div class="col-md-4">
        <label for="email" class="form-label">E-mail</label>
        <input type="email" class="form-control" id="email" required>
      </div>

      <div class="col-md-2">
        <label for="nascimento" class="form-label">Nascimento</label>
        <input type="date" class="form-control" id="nascimento" required>
      </div>

      <div class="col-md-2 d-flex align-items-end gap-2">
        <button type="submit" id="btn-salvar" class="btn btn-primary">Salvar</button>
        <button type="button" id="btn-cancelar" class="btn btn-outline-secondary d-none">Cancelar</button>
      </div>
    </form>

    <h2 class="h4 mb-3">Pacientes cadastrados</h2>
    <p id="carregando" class="text-muted">
      Carregando pacientes... (a primeira requisição pode levar cerca de 1 minuto no servidor gratuito)
    </p>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Nascimento</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="tabela-pacientes"></tbody>
    </table>
  </div>

  <script src="js/app.js"></script>
</body>
</html>
```

### `frontend/js/app.js`

```javascript
// Em produção (Render). Para testar localmente, troque por 'http://localhost:3000/pacientes'
const URL_API = 'https://api-clinica-glxw.onrender.com/pacientes';

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagem = document.getElementById('mensagem');
const mensagemCarregando = document.getElementById('carregando');

const campoId = document.getElementById('id');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoNascimento = document.getElementById('nascimento');
const botaoSalvar = document.getElementById('btn-salvar');
const botaoCancelar = document.getElementById('btn-cancelar');

// ---------- Utilidades de interface ----------

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function mostrarMensagem(texto, tipo = 'danger') {
  mensagem.innerHTML = '';
  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo}`;
  alerta.textContent = texto; // textContent evita injeção de HTML
  mensagem.appendChild(alerta);
}

function criarCelula(texto) {
  const celula = document.createElement('td');
  celula.textContent = texto;
  return celula;
}

function renderizarTabela(pacientes) {
  tabela.innerHTML = '';

  pacientes.forEach((paciente) => {
    const linha = document.createElement('tr');

    linha.appendChild(criarCelula(paciente.nome));
    linha.appendChild(criarCelula(paciente.email));
    linha.appendChild(criarCelula(formatarData(paciente.nascimento)));

    const celulaAcoes = document.createElement('td');

    const botaoEditar = document.createElement('button');
    botaoEditar.textContent = 'Editar';
    botaoEditar.className = 'btn btn-sm btn-outline-primary me-2';
    botaoEditar.addEventListener('click', () => iniciarEdicao(paciente));

    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.className = 'btn btn-sm btn-outline-danger';
    botaoExcluir.addEventListener('click', () => excluirPaciente(paciente.id));

    celulaAcoes.appendChild(botaoEditar);
    celulaAcoes.appendChild(botaoExcluir);
    linha.appendChild(celulaAcoes);

    tabela.appendChild(linha);
  });
}

function iniciarEdicao(paciente) {
  campoId.value = paciente.id;
  campoNome.value = paciente.nome;
  campoEmail.value = paciente.email;
  campoNascimento.value = paciente.nascimento;

  botaoSalvar.textContent = 'Atualizar';
  botaoCancelar.classList.remove('d-none');
  campoNome.focus();
}

function limparFormulario() {
  formulario.reset();
  campoId.value = '';
  botaoSalvar.textContent = 'Salvar';
  botaoCancelar.classList.add('d-none');
}

// ---------- Comunicação com a API (um método HTTP por operação) ----------

// READ — GET /pacientes
async function listarPacientes() {
  try {
    const resposta = await fetch(URL_API);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const pacientes = await resposta.json();
    renderizarTabela(pacientes);
    mensagemCarregando.style.display = 'none';
  } catch (erro) {
    console.error(erro);
    mensagemCarregando.style.display = 'none';
    mostrarMensagem('Não foi possível carregar os pacientes. O servidor está no ar?');
  }
}

// CREATE (POST) ou UPDATE (PUT), conforme exista ou não um id
async function salvarPaciente(dados, id) {
  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `${URL_API}/${id}` : URL_API;

  const resposta = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados), // objeto JS → texto JSON
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.erro || `Erro HTTP: ${resposta.status}`);
  }
}

// DELETE — DELETE /pacientes/:id
async function excluirPaciente(id) {
  if (!confirm('Deseja realmente excluir este paciente?')) {
    return;
  }

  try {
    const resposta = await fetch(`${URL_API}/${id}`, { method: 'DELETE' });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    mostrarMensagem('Paciente excluído com sucesso.', 'success');
    await listarPacientes();
  } catch (erro) {
    console.error(erro);
    mostrarMensagem('Não foi possível excluir o paciente.');
  }
}

// ---------- Eventos ----------

formulario.addEventListener('submit', async (event) => {
  event.preventDefault();

  const dados = {
    nome: campoNome.value,
    email: campoEmail.value,
    nascimento: campoNascimento.value,
  };

  try {
    await salvarPaciente(dados, campoId.value);
    mostrarMensagem('Paciente salvo com sucesso.', 'success');
    limparFormulario();
    await listarPacientes(); // sempre relê do servidor: a fonte da verdade é a API
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
});

botaoCancelar.addEventListener('click', limparFormulario);

listarPacientes();
```

---

## 6. Explicação

- **Express vs. módulo `http`:** compare lado a lado com a Aula 3. O que eram vários `if (req.method === ... && req.url === ...)` agora é `app.get('/pacientes', ...)`. Peça aos alunos para contar as linhas de cada versão.

- **`app.use(...)` e middlewares:** funções que o Express executa **antes** de chegar na rota. `cors()` adiciona os cabeçalhos de CORS; `express.json()` lê o corpo da requisição e o coloca em `req.body`. Sem o segundo, `req.body` chega vazio, um erro clássico.

- **`req.params.id` é texto:** por isso a conversão `Number(...)`. Sem ela, `1 === '1'` é `false` e o paciente nunca seria encontrado.

- **`return res.status(404)...`:** o `return` impede que o código continue executando depois de responder. Sem ele, o Express tentaria enviar uma segunda resposta e geraria erro.

- **Por que POST devolve `201` e DELETE devolve `204`?** `201 Created` indica que algo novo foi criado (e devolvemos o recurso com seu `id`); `204 No Content` indica sucesso sem nada para devolver.

- **`POST` vs `PUT`:** POST cria um recurso novo na coleção (`/pacientes`); PUT substitui o recurso identificado na URL (`/pacientes/5`). No frontend, o mesmo formulário decide qual usar olhando se o campo oculto `id` está preenchido.

- **Frontend sempre relê a lista após alterar:** é uma escolha didática. A API é a "fonte da verdade", e a tabela apenas reflete o que ela devolve.

- **`textContent` em vez de `innerHTML`:** como agora qualquer pessoa pode cadastrar texto livre numa API pública, usar `innerHTML` permitiria injetar HTML/JS na tabela de outros usuários (ataque XSS). Vale um momento de conversa sobre isso.

---

## 7. Passo a passo (execução em sala)

1. Copiar o projeto da Aula 3 para `aula-04-cadastro-pacientes`.
2. Em `backend/`, rodar `npm install express cors` e abrir o `package.json` para mostrar as `dependencies`. Mostrar a pasta `node_modules` e explicar por que ela **não** vai para o Git (`.gitignore` com `node_modules/`).
3. Reescrever o `server.js` **incrementalmente**, testando cada rota **antes** de mexer no frontend:
   a. `GET /pacientes` e comparar com a Aula 3.
   b. `GET /pacientes/:id` (testar um id existente e um inexistente).
   c. `POST /pacientes` (apresentar o `express.json()` e o que acontece sem ele).
   d. `PUT /pacientes/:id`.
   e. `DELETE /pacientes/:id`.
4. Testar cada rota sem frontend. Opções: aba **Network** do navegador, extensão Thunder Client/REST Client no VS Code, ou `curl`:

   ```bash
   # CREATE
   curl -X POST http://localhost:3000/pacientes \
     -H "Content-Type: application/json" \
     -d '{"nome":"Carlos Lima","email":"carlos@email.com","nascimento":"1995-02-20"}'

   # READ
   curl http://localhost:3000/pacientes

   # UPDATE
   curl -X PUT http://localhost:3000/pacientes/4 \
     -H "Content-Type: application/json" \
     -d '{"nome":"Carlos Lima Jr.","email":"carlos@email.com","nascimento":"1995-02-20"}'

   # DELETE
   curl -X DELETE http://localhost:3000/pacientes/4
   ```
5. Atualizar o frontend (`index.html` e `app.js`), construindo na ordem: listar → criar → excluir → editar.
6. Publicar: `git push` para o repositório; o Render refaz o deploy do backend e do frontend. Testar com as URLs de produção.
7. **Momento do gancho:** cadastre um paciente na versão em produção, depois reinicie o serviço (ou espere ~15 minutos sem acessar). Os dados voltam ao estado inicial.

---

## 8. Exercícios

1. Adicione `GET /pacientes/total`, retornando `{ "total": N }`. **Dica:** onde essa rota precisa ficar em relação a `/pacientes/:id`? Teste das duas formas e explique o resultado.
2. Impeça o cadastro de dois pacientes com o mesmo e-mail, devolvendo status `409` (Conflict).
3. Suporte filtro por nome na listagem: `GET /pacientes?nome=ana` (use `req.query.nome`).
4. Teste no `curl`/Thunder Client o que acontece em `DELETE /pacientes/999` e `POST /pacientes` com body vazio. Os status estão como esperado?

---

## 9. Extensões

- Validar o formato do e-mail e rejeitar datas de nascimento no futuro (status `400` com mensagem clara).
- Pesquisar a diferença entre `PUT` e `PATCH` e implementar `PATCH /pacientes/:id` para atualização parcial.
- Exibir no frontend a mensagem de erro específica vinda da API (ex.: "e-mail já cadastrado").

---

## 10. Erros comuns

| Erro | Causa provável |
|---|---|
| `req.body` vazio ou `undefined` | Esqueceu `app.use(express.json())`, ou o cliente não enviou `Content-Type: application/json` |
| Paciente "não encontrado" mesmo existindo | Comparou `req.params.id` (texto) com `p.id` (número) sem converter |
| `Cannot set headers after they are sent` | Faltou `return` antes de `res.status(...).json(...)` e o código continuou executando |
| `GET /pacientes/total` cai na rota `/:id` | A rota genérica `/:id` foi declarada **antes** da rota específica |
| Erro de CORS no navegador | Esqueceu `app.use(cors())`, ou usou a URL errada da API |
| Funciona local, falha no Render | Porta fixa no código em vez de `process.env.PORT`; ou frontend ainda apontando para `localhost` |
| Primeira chamada em produção demora muito | Servidor gratuito "dormindo"; é esperado, avise a turma |

---

## 11. Perguntas para discussão em sala

1. Por que usamos métodos HTTP diferentes (GET, POST, PUT, DELETE) se poderíamos usar sempre `POST` para tudo?
2. Qual a diferença entre `/pacientes` e `/pacientes/5`? O que cada URL representa?
3. Por que a API devolve `201` ao criar e `404` ao não encontrar, em vez de sempre `200`?
4. O frontend poderia ser trocado por outro (um app de celular, por exemplo) sem mudar nada no backend? Por quê?
5. Nossos dados voltam ao estado inicial quando o servidor reinicia. Onde deveriam ficar guardados para sobreviver? (gancho para o banco de dados)

---

## Observações para o professor

- É a aula com mais código até agora; se faltar tempo, o `PUT`/edição no frontend pode ser deixado como atividade guiada, mas o **mapa do CRUD** e os testes com `curl`/Thunder Client precisam ser cobertos.
- A demonstração da perda de dados em produção é o ponto alto: o comportamento do serviço gratuito do Render (dormir por inatividade) torna o problema **real**, não teórico.
- Combine com a turma **que não deve cadastrar dados reais**: a API é pública e sem autenticação, e qualquer aluno pode editar ou apagar registros de outros.
- Na Aula 5, o array em memória é substituído por uma tabela `pacientes` no PostgreSQL do Render, com o **frontend praticamente intocado**.