# Aula 1 — Cadastro de Pacientes no Navegador

**Disciplina:** Programação de Scripts I — Backend
**Módulo:** Fundamentos (Vanilla JavaScript)
**Pré-requisitos dos alunos:** HTML, CSS e JavaScript básico

---

## 1. Objetivo

Ao final desta aula, o aluno deve ser capaz de:

- Capturar dados de um formulário HTML usando JavaScript;
- Armazenar esses dados em um **array de objetos** em memória;
- Renderizar dinamicamente esses dados em uma tabela HTML;
- Compreender a separação de responsabilidades entre HTML (estrutura), CSS (apresentação) e JavaScript (comportamento e lógica).

Esta aula é o **ponto de partida** de um projeto que vai evoluir ao longo do curso: um sistema de cadastro de pacientes que, futuramente, se comunicará com uma API REST em Node.js/Express e persistirá dados em PostgreSQL. Hoje, tudo roda **100% no navegador**, sem servidor e sem persistência real (os dados somem ao atualizar a página).

---

## 2. Problema

Uma clínica precisa de uma forma simples de **cadastrar pacientes** — nome, e-mail e data de nascimento — e visualizar a lista de todos os pacientes cadastrados, sem precisar de um sistema complexo.

Vamos resolver isso hoje da forma mais simples possível: um formulário HTML, um array em JavaScript para guardar os dados, e uma tabela para exibi-los. Essa simplicidade é proposital — nas próximas aulas, vamos ver as limitações dessa abordagem (os dados não persistem, não podem ser compartilhados entre usuários) e isso vai justificar naturalmente a necessidade de um backend.

---

## 3. Conceitos

| Conceito | Por que usamos |
|---|---|
| **Formulário HTML (`<form>`)** | Estrutura padrão para capturar dados do usuário |
| **Evento `submit`** | Permite executar código JavaScript quando o formulário é enviado |
| **`event.preventDefault()`** | Evita que a página recarregue ao enviar o formulário (comportamento padrão do navegador) |
| **Array de objetos** | Forma natural de representar uma lista de "coisas" (pacientes), onde cada paciente tem várias propriedades |
| **Métodos de array (`push`)** | Adiciona um novo paciente à lista |
| **Manipulação do DOM** | Criar e inserir elementos HTML dinamicamente via JavaScript |
| **Template strings (`` ` ` ``)** | Facilita montar HTML dinâmico interpolando variáveis |
| **Funções** | Organizar o código em blocos reutilizáveis e com responsabilidade única |

> **Observação pedagógica:** como a turma já conhece o básico de JS, o foco aqui não é ensinar sintaxe do zero, e sim mostrar **como esses conceitos se combinam** para resolver um problema real. Vale reforçar bem o `preventDefault()`, pois é um erro comum de esquecimento mesmo entre quem já sabe a sintaxe.

---

## 4. Estrutura do projeto

```
aula-01-cadastro-pacientes/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

---

## 5. Código

### `index.html`

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro de Pacientes</title>

  <!-- Bootstrap via CDN, apenas para estilização básica -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
  >
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <div class="container py-5">
    <h1 class="mb-4">Cadastro de Pacientes</h1>

    <!-- Formulário de cadastro -->
    <form id="form-paciente" class="row g-3 mb-5">
      <div class="col-md-4">
        <label for="nome" class="form-label">Nome</label>
        <input type="text" class="form-control" id="nome" required>
      </div>

      <div class="col-md-4">
        <label for="email" class="form-label">E-mail</label>
        <input type="email" class="form-control" id="email" required>
      </div>

      <div class="col-md-3">
        <label for="nascimento" class="form-label">Data de nascimento</label>
        <input type="date" class="form-control" id="nascimento" required>
      </div>

      <div class="col-md-1 d-flex align-items-end">
        <button type="submit" class="btn btn-primary w-100">+</button>
      </div>
    </form>

    <!-- Tabela de pacientes -->
    <h2 class="h4 mb-3">Pacientes cadastrados</h2>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Data de nascimento</th>
        </tr>
      </thead>
      <tbody id="tabela-pacientes">
        <!-- Linhas geradas dinamicamente via JavaScript -->
      </tbody>
    </table>
  </div>

  <script src="js/app.js"></script>
</body>
</html>
```

### `css/style.css`

```css
/* Estilos específicos da aplicação — o Bootstrap cuida do resto */

body {
  background-color: #f8f9fa;
}

h1 {
  color: #212529;
}

#tabela-pacientes tr {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### `js/app.js`

```javascript
// Array que guarda os pacientes cadastrados (em memória, só nesta sessão)
const pacientes = [];

// Referências aos elementos do DOM que vamos usar várias vezes
const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');

// Função responsável por adicionar um paciente ao array
function adicionarPaciente(nome, email, nascimento) {
  const novoPaciente = { nome, email, nascimento };
  pacientes.push(novoPaciente);
}

// Função responsável por desenhar a tabela inteira a partir do array
function renderizarTabela() {
  tabela.innerHTML = ''; // limpa a tabela antes de redesenhar

  pacientes.forEach((paciente) => {
    const linha = document.createElement('tr');

    linha.innerHTML = `
      <td>${paciente.nome}</td>
      <td>${paciente.email}</td>
      <td>${formatarData(paciente.nascimento)}</td>
    `;

    tabela.appendChild(linha);
  });
}

// Função utilitária só para formatar a data no padrão dd/mm/aaaa
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Evento disparado quando o formulário é enviado
formulario.addEventListener('submit', (event) => {
  event.preventDefault(); // evita o recarregamento da página

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const nascimento = document.getElementById('nascimento').value;

  adicionarPaciente(nome, email, nascimento);
  renderizarTabela();

  formulario.reset(); // limpa os campos do formulário
});
```

---

## 6. Explicação

- **`const pacientes = []`** — este é o "banco de dados" da nossa aplicação por enquanto. É importante deixar claro que esse array vive só na memória do navegador: se a página for recarregada, tudo se perde. Esse é exatamente o problema que vamos resolver mais adiante com backend + banco de dados.

- **`document.getElementById(...)`** — forma clássica de pegar referências a elementos do DOM. Guardamos `formulario` e `tabela` em variáveis no topo do arquivo porque vamos usá-los várias vezes; isso evita repetir a busca no DOM toda hora (bom hábito de performance e legibilidade).

- **`adicionarPaciente()`** — função pequena, com uma única responsabilidade: criar um objeto paciente e colocá-lo no array. Separar essa lógica em uma função facilita reaproveitamento e leitura do código.

- **`renderizarTabela()`** — sempre que os dados mudam, chamamos essa função para redesenhar a tabela do zero. É uma versão simplificada (e não otimizada) do que frameworks como React fazem por trás dos panos — vale comentar isso brevemente, sem entrar em detalhes, só para plantar a semente.

- **Template strings com `${}`** — muito mais legível do que concatenar strings com `+`. Vale reforçar que isso é ES6+.

- **`event.preventDefault()`** — sem essa linha, o navegador tentaria enviar o formulário para o servidor (que ainda não existe) e recarregaria a página, perdendo tudo.

- **`formulario.reset()`** — limpa os campos automaticamente após o cadastro, melhorando a experiência do usuário.

---

## 7. Passo a passo (execução em sala)

1. Criar a pasta `aula-01-cadastro-pacientes` com a estrutura de arquivos indicada.
2. Criar o `index.html` e explicar a estrutura do formulário e da tabela **antes** de adicionar o CSS/Bootstrap.
3. Adicionar o link do Bootstrap via CDN e mostrar a diferença visual (antes/depois).
4. Criar o `css/style.css` e mostrar que ele só adiciona detalhes que o Bootstrap não cobre.
5. Criar o `js/app.js` **incrementalmente**:
   a. Primeiro, só capturar o evento de `submit` e dar um `console.log()` dos valores — mostrar no DevTools.
   b. Depois, adicionar o `preventDefault()` e mostrar a diferença de comportamento.
   c. Em seguida, criar o array `pacientes` e a função `adicionarPaciente`.
   d. Por fim, criar `renderizarTabela()` e conectar tudo.
6. Abrir o `index.html` diretamente no navegador (duplo clique ou "Open with Live Server") e testar cadastrando 2–3 pacientes.
7. Recarregar a página propositalmente para os alunos verem os dados sumirem — gancho para a próxima aula.

---

## 8. Exercícios

1. Adicione um campo **telefone** ao formulário e faça-o aparecer na tabela.
2. Adicione uma coluna **"Idade"** na tabela, calculada automaticamente a partir da data de nascimento (dica: use `Date` e subtraia os anos).
3. Adicione um contador acima da tabela mostrando **"Total de pacientes: X"**, atualizado automaticamente.
4. Impeça o cadastro de e-mails duplicados, exibindo um `alert()` se o e-mail já existir no array.

---

## 9. Extensões (para alunos mais avançados ou tarefa extra)

- Adicionar um botão **"Remover"** em cada linha da tabela, usando o índice do array.
- Adicionar um campo de **busca** que filtra a tabela por nome em tempo real (evento `input`).
- Ordenar a tabela por nome ao clicar no cabeçalho da coluna.
- Salvar os dados no `localStorage` do navegador, para que sobrevivam a um recarregamento de página (isso antecipa, de forma simples, o conceito de persistência — sem ainda envolver backend).

---

## 10. Erros comuns

| Erro | Causa provável |
|---|---|
| Página recarrega ao clicar em "+" | Esqueceu do `event.preventDefault()` |
| Tabela não atualiza | Esqueceu de chamar `renderizarTabela()` após adicionar o paciente |
| `Cannot read properties of null` | `document.getElementById()` retornou `null` porque o `<script>` foi carregado antes do HTML existir (lembrar de colocar `<script>` no final do `<body>`, como no exemplo) |
| Data aparece formatada errada | Confundir a ordem `dia/mes/ano` vs. o formato `aaaa-mm-dd` que o `<input type="date">` retorna |
| Bootstrap não aparece | Esqueceu de incluir o link do CDN, ou a ordem dos `<link>` está errada (o `style.css` deve vir **depois** do Bootstrap, para poder sobrescrever) |

---

## 11. Perguntas para discussão em sala

1. O que aconteceria se recarregássemos a página agora? Por quê isso acontece?
2. Por que separamos o JavaScript em um arquivo `.js` ao invés de colocá-lo direto no HTML?
3. Qual a diferença entre os dados ficarem "na memória do navegador" e ficarem "em um banco de dados"?
4. Se dois computadores diferentes abrirem essa mesma página, eles vão compartilhar a mesma lista de pacientes? Por quê?
5. O que precisaríamos mudar nesse código se quiséssemos que os dados fossem compartilhados entre vários usuários ao mesmo tempo? (gancho para introduzir a ideia de servidor/backend na próxima aula)

---
