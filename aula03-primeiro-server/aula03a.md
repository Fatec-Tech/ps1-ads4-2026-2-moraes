# Aula 3 — Primeiro Servidor com Node.js

**Módulo:** Backend com Node.js (introdução)
**Pré-requisitos:** Aula 2 (Fetch API, JSON, `async`/`await`)

---

## 1. Objetivo

Ao final desta aula, o aluno deve ser capaz de:

- Entender o que é o **Node.js** e como ele difere do JavaScript executado no navegador;
- Criar um projeto Node.js com `npm init` e entender o papel do `package.json`;
- Criar um **servidor HTTP** usando o módulo nativo `http` do Node.js;
- Responder requisições `GET` com dados em formato **JSON**;
- Conectar o projeto frontend (Aula 2) a esse servidor real, substituindo o `pacientes.json` estático.

Esta é a aula em que o projeto de cadastro de pacientes ganha, pela primeira vez, um **servidor de verdade** por trás dele. O `fetch` do frontend, que até agora buscava um arquivo `.json` local, vai passar a buscar dados de um programa Node.js rodando continuamente na máquina.

---

## 2. Problema

O `pacientes.json` da Aula 2 tem uma limitação importante: é um arquivo **estático**. Ele não pode ser alterado dinamicamente, não pode ser compartilhado entre computadores diferentes na rede, e qualquer pessoa que abrir o projeto vê exatamente os mesmos dados fixos.

Para resolver isso, precisamos de um **programa que fique rodando continuamente**, escutando por requisições e respondendo com dados — isso é, essencialmente, o que chamamos de **servidor**. É exatamente isso que o Node.js nos permite construir, usando a mesma linguagem (JavaScript) que já usamos no frontend.

---

## 3. Conceitos

| Conceito | Por que usamos |
|---|---|
| **Node.js** | Ambiente de execução que roda JavaScript **fora do navegador**, permitindo criar servidores, acessar o sistema de arquivos, etc. |
| **npm (Node Package Manager)** | Ferramenta para gerenciar dependências e metadados do projeto |
| **`package.json`** | Arquivo que descreve o projeto Node.js: nome, versão, dependências, scripts |
| **`require()` (módulos CommonJS)** | Forma padrão do Node.js de importar módulos — diferente do `import` do frontend |
| **Módulo `http`** | Módulo nativo do Node.js para criar servidores HTTP, sem precisar de nenhuma biblioteca externa |
| **`http.createServer()`** | Cria o servidor, recebendo uma função que roda **toda vez** que uma requisição chega |
| **Objetos `req` e `res`** | Representam, respectivamente, a requisição recebida e a resposta que vamos construir e enviar de volta |
| **Porta (`port`) e `localhost`** | O servidor "escuta" em um número de porta específico da máquina; `localhost` significa "esta própria máquina" |
| **CORS (Cross-Origin Resource Sharing)** | Mecanismo de segurança do navegador que precisa ser liberado explicitamente pelo servidor quando frontend e backend rodam em portas/origens diferentes |

> **Observação pedagógica:** esta aula é tecnicamente mais "crua" do que as anteriores — estamos usando o módulo `http` puro, sem nenhum framework. Isso é proposital: a verbosidade e repetição do código vão justificar naturalmente a chegada do **Express** na próxima aula. Vale nomear isso explicitamente com a turma ao final: "percebam como isso ficaria repetitivo com mais rotas — temos uma ferramenta pra resolver isso".

---

## 4. Estrutura do projeto

A partir de agora, o projeto passa a ter duas partes bem distintas: **frontend** e **backend**, cada uma rodando de forma independente.

```
aula-03-cadastro-pacientes/
├── backend/
│   ├── package.json
│   └── server.js
└── frontend/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

> O `frontend/` é basicamente o mesmo projeto da Aula 2 — só o `app.js` muda, trocando a URL do `fetch`.

---

## 5. Código

### `backend/package.json`

```json
{
  "name": "aula-03-servidor-pacientes",
  "version": "1.0.0",
  "description": "Servidor Node.js do projeto de cadastro de pacientes",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

### `backend/server.js`

```javascript
const http = require('http');

// Por enquanto, os dados ainda vivem em memória, dentro do próprio servidor
const pacientes = [
  { id: 1, nome: 'Maria Silva', email: 'maria.silva@email.com', nascimento: '1990-04-12' },
  { id: 2, nome: 'João Pereira', email: 'joao.pereira@email.com', nascimento: '1985-11-30' },
  { id: 3, nome: 'Ana Costa', email: 'ana.costa@email.com', nascimento: '2001-07-08' },
];

const servidor = http.createServer((req, res) => {
  // Libera o acesso para que o frontend, rodando em outra porta, possa consumir esta API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/pacientes') {
    res.writeHead(200);
    res.end(JSON.stringify(pacientes));
    return;
  }

  // Qualquer outra rota/método não tratado cai aqui
  res.writeHead(404);
  res.end(JSON.stringify({ erro: 'Rota não encontrada' }));
});

const PORTA = 3000;

servidor.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
```

### `frontend/js/app.js` (alterações em relação à Aula 2)

```javascript
const URL_API = 'http://localhost:3000/pacientes';

// ... (adicionarPaciente, renderizarTabela e formatarData continuam iguais à Aula 2)

async function carregarPacientesIniciais() {
  try {
    const resposta = await fetch(URL_API); // única linha que muda de verdade

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const dados = await resposta.json();

    dados.forEach((paciente) => {
      adicionarPaciente(paciente.nome, paciente.email, paciente.nascimento);
    });

    renderizarTabela();
  } catch (erro) {
    console.error('Não foi possível carregar os pacientes:', erro);
    mensagemCarregando.textContent =
      'Erro ao carregar pacientes. O servidor está rodando?';
    return;
  }

  mensagemCarregando.style.display = 'none';
}
```

> **Ponto-chave para destacar em sala:** compare este trecho com o da Aula 2. A única mudança real é a URL — de `'data/pacientes.json'` para `'http://localhost:3000/pacientes'`. Todo o resto do frontend (try/catch, `resposta.ok`, `resposta.json()`) permanece **idêntico**. Essa é a prova prática de que cliente e servidor são desacoplados.

---

## 6. Explicação

- **`require('http')`** — no Node.js, usamos `require()` para importar módulos (diferente do `import` que os alunos podem ter visto em exemplos de frontend com bundlers). O módulo `http` já vem embutido no Node, sem precisar instalar nada.

- **`http.createServer((req, res) => {...})`** — essa função é executada **automaticamente pelo Node** toda vez que uma requisição chega ao servidor. `req` contém informações sobre a requisição (método, URL, etc.); `res` é o objeto que usamos para construir a resposta.

- **`res.setHeader('Access-Control-Allow-Origin', '*')`** — sem essa linha, o navegador bloquearia a resposta por política de CORS, já que o frontend (ex: `localhost:5500`, do Live Server) e o backend (`localhost:3000`) são considerados **origens diferentes**. Vale abrir o DevTools e mostrar o erro de CORS removendo essa linha propositalmente.

- **`req.method` e `req.url`** — como não estamos usando nenhum framework ainda, **nós mesmos** precisamos checar manualmente qual método HTTP foi usado e qual caminho foi acessado. Isso é exatamente o tipo de repetição que frameworks como Express resolvem.

- **`res.writeHead(200)` / `res.writeHead(404)`** — define o **código de status HTTP** da resposta. `200` significa sucesso; `404` significa "não encontrado". Vale uma pausa rápida para mencionar outros códigos comuns (`201`, `400`, `500`) sem entrar em profundidade ainda — isso será retomado na aula de tratamento de erros.

- **`res.end(JSON.stringify(pacientes))`** — como o servidor só pode enviar texto (ou bytes), precisamos **converter** nosso array/objeto JavaScript em uma string JSON antes de enviar. Isso é o inverso do `resposta.json()` que já usamos no frontend.

- **`servidor.listen(PORTA, ...)`** — é essa linha que efetivamente "liga" o servidor, fazendo-o ficar escutando indefinidamente por novas conexões na porta 3000. Vale destacar: diferente de um script comum, esse programa **não termina** sozinho — ele fica rodando até ser interrompido (Ctrl+C no terminal).

---

## 7. Passo a passo (execução em sala)

1. Criar a pasta `backend/` dentro do projeto.
2. No terminal, dentro de `backend/`, rodar `npm init -y` e mostrar o `package.json` gerado.
3. Criar o `server.js` **incrementalmente**:
   a. Primeiro, só `http.createServer` respondendo qualquer requisição com um texto simples (`res.end('Olá mundo')`), sem JSON ainda.
   b. Rodar com `node server.js` e acessar `http://localhost:3000` no navegador para ver funcionando.
   c. Evoluir para checar `req.url === '/pacientes'` e devolver o array de pacientes como JSON.
   d. Adicionar os headers de CORS e `Content-Type`.
4. Mostrar o terminal rodando o servidor (deixar aberto durante toda a aula) — reforçar que, enquanto o terminal estiver rodando, o servidor está "vivo".
5. Retomar o projeto `frontend/` da Aula 2 e trocar a URL do `fetch` em `app.js`.
6. Abrir o frontend via Live Server e mostrar os dados vindo agora do servidor Node.js, não mais do arquivo local.
7. Parar o servidor Node (Ctrl+C no terminal) e recarregar o frontend, mostrando o erro tratado pelo `catch` ("O servidor está rodando?").

---

## 8. Exercícios

1. Adicione uma nova rota `GET /pacientes/total`, que retorna `{ "total": 3 }` (a contagem de pacientes).
2. Adicione um paciente a mais no array `pacientes` do servidor e confirme que ele aparece automaticamente no frontend, sem precisar alterar `app.js`.
3. Altere a mensagem de erro `404` para incluir também qual `req.url` foi solicitado, algo como `{ "erro": "Rota /xyz não encontrada" }`.
4. Descubra (por conta própria ou pesquisando) o que acontece se duas instâncias do servidor tentarem rodar na mesma porta ao mesmo tempo, e qual mensagem de erro aparece.

---

## 9. Extensões

- Instalar e configurar o **nodemon** (`npm install --save-dev nodemon`) para reiniciar o servidor automaticamente a cada alteração no código, evitando a necessidade de parar e rodar `node server.js` manualmente.
- Mover o array `pacientes` para um arquivo separado (`dados.js`), usando `module.exports`, para começar a separar responsabilidades dentro do backend.
- Adicionar uma rota `GET /pacientes/:id` (ainda que "na unha", extraindo o ID de `req.url` manualmente) — bom desafio para perceber como isso fica trabalhoso sem um framework.

---

## 10. Erros comuns

| Erro | Causa provável |
|---|---|
| `Error: listen EADDRINUSE: address already in use :::3000` | Já existe outro processo Node rodando na mesma porta (esqueceram de fechar um servidor anterior) |
| CORS bloqueado no console do navegador | Esqueceram do `res.setHeader('Access-Control-Allow-Origin', '*')` |
| `Failed to fetch` no frontend | O servidor Node não está rodando (terminal fechado ou processo parado) |
| Resposta chega como texto estranho, não como objeto | Esqueceram do `res.setHeader('Content-Type', 'application/json')` |
| Servidor "trava" e não responde a mais nada | Esqueceram do `res.end()` em algum caminho do código — a resposta nunca é finalizada |
| `require is not defined` | Tentaram rodar o `server.js` no navegador em vez de com `node server.js` no terminal — reforçar que este código roda em Node, não no browser |

---

## 11. Perguntas para discussão em sala

1. Qual a diferença entre o JavaScript que escrevemos no `frontend/app.js` e o que escrevemos no `backend/server.js`? Os dois são "a mesma linguagem"?
2. Por que o servidor precisa ficar rodando continuamente no terminal, diferente de um script comum que termina depois de executar?
3. O que é uma porta, e por que dois programas não podem "escutar" na mesma porta ao mesmo tempo?
4. Por que o navegador bloqueia, por padrão, requisições entre origens diferentes (CORS)? Que tipo de problema de segurança isso evita?
5. Vocês notaram como o código do `server.js` cresce rápido conforme adicionamos rotas (`if` atrás de `if`)? Como vocês imaginam que isso poderia ser organizado de forma mais elegante? (gancho direto para o Express na próxima aula)

---

## Observações para o professor

- Esta é a primeira aula em que a turma trabalha com **dois processos rodando ao mesmo tempo** (servidor Node em um terminal, Live Server em outro/no editor) — vale reservar um tempo extra só para garantir que todo mundo consiga rodar os dois lados sem confusão.
- É importante deixar claro que o uso do módulo `http` puro é **didático e temporário**: a partir da próxima aula, o Express vai substituir boa parte desse código repetitivo, mas os conceitos de requisição/resposta, status HTTP e rotas continuam os mesmos.
- Sugestão de duração: ~20min de conceitos (Node.js, npm, `package.json`), ~40min de código guiado do servidor, ~20min conectando com o frontend, ~20min de exercícios.
- Na Aula 4, o mesmo `server.js` será reescrito usando **Express**, e a turma vai poder comparar diretamente a diferença de verbosidade entre as duas abordagens.