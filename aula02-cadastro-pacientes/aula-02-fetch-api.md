# Aula 2 — Consumindo Dados com Fetch API

**Disciplina:** Programação de Scripts I — Backend
**Módulo:** Fundamentos (Vanilla JavaScript) → Comunicação HTTP
**Pré-requisitos:** Aula 1 (Cadastro de pacientes no navegador)

---

## 1. Objetivo

Ao final desta aula, o aluno deve ser capaz de:

- Entender o conceito de **cliente e servidor** e o ciclo de requisição/resposta HTTP;
- Compreender o formato **JSON** como linguagem de troca de dados;
- Utilizar a **Fetch API** para buscar dados de forma assíncrona;
- Utilizar **`async`/`await`** e **`try`/`catch`** para lidar com código assíncrono e tratar erros;
- Entender por que, a partir de agora, o projeto precisa ser executado através de um **servidor local** (ex: Live Server), e não mais aberto diretamente como arquivo (`file://`).

Vamos retomar o projeto da Aula 1 e evoluí-lo: em vez de a tabela começar vazia, ela vai **carregar pacientes de um arquivo `pacientes.json`**, simulando o que futuramente será uma resposta vinda de uma API REST real (Aula com Node.js/Express).

---

## 2. Problema

Na Aula 1, todo cadastro começava do zero — a tabela sempre nascia vazia. Na vida real, quando abrimos um sistema, ele já vem com dados existentes: pacientes que já foram cadastrados anteriormente, vindos de "algum lugar".

Hoje esse "algum lugar" ainda não é um banco de dados nem uma API de verdade — é um arquivo `pacientes.json`. Mas a **forma de buscar esses dados** (`fetch`, requisição, resposta, JSON) é exatamente a mesma que será usada mais adiante para conversar com um servidor Node.js/Express de verdade. Estamos aprendendo o "verbo" antes de trocar o "substantivo".

---

## 3. Conceitos

| Conceito                               | Por que usamos                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Cliente e servidor**                 | Todo `fetch` representa uma conversa: o navegador (cliente) pede algo, e alguém (servidor, ou aqui, um arquivo) responde |
| **JSON (JavaScript Object Notation)**  | Formato universal de troca de dados entre sistemas — é basicamente a "língua" que cliente e servidor falam em comum      |
| **Requisição HTTP (request/response)** | Toda comunicação via `fetch` segue esse padrão: uma requisição é enviada, uma resposta é recebida                        |
| **Fetch API**                          | API nativa do navegador para fazer requisições HTTP sem precisar de bibliotecas externas                                 |
| **Promises**                           | O `fetch` não retorna o dado na hora — ele retorna uma **promessa** de que o dado vai chegar                             |
| **`async`/`await`**                    | Sintaxe moderna (ES6+) que torna código assíncrono mais legível, parecendo código síncrono                               |
| **`try`/`catch`**                      | Forma de tratar erros que podem acontecer durante a requisição (ex: arquivo não encontrado, sem internet)                |
| **`response.ok` / status HTTP**        | Nem toda resposta é bem-sucedida — é preciso verificar isso antes de usar os dados                                       |

> **Observação pedagógica:** vale um momento à parte, sem código, só de conversa, para desenhar no quadro o ciclo cliente → requisição → servidor → resposta → cliente. Isso vai se repetir em praticamente todas as aulas daqui pra frente, então é o momento de fixar bem essa mental model.

---

## 4. Estrutura do projeto

```
aula-02-cadastro-pacientes/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── data/
    └── pacientes.json
```

> Note que o projeto é o **mesmo** da Aula 1, apenas com a adição da pasta `data/`. Não estamos recomeçando do zero, estamos evoluindo.

---

## 5. Código

### `data/pacientes.json`

```json
[
	{
		"nome": "Maria Silva",
		"email": "maria.silva@email.com",
		"nascimento": "1990-04-12"
	},
	{
		"nome": "João Pereira",
		"email": "joao.pereira@email.com",
		"nascimento": "1985-11-30"
	},
	{
		"nome": "Ana Costa",
		"email": "ana.costa@email.com",
		"nascimento": "2001-07-08"
	}
]
```

### `index.html`

```html
<!DOCTYPE html>
<html lang="pt-br">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Cadastro de Pacientes</title>

		<link
			href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
			rel="stylesheet"
		/>
		<link rel="stylesheet" href="css/style.css" />
	</head>
	<body>
		<div class="container py-5">
			<h1 class="mb-4">Cadastro de Pacientes</h1>

			<form id="form-paciente" class="row g-3 mb-5">
				<div class="col-md-4">
					<label for="nome" class="form-label">Nome</label>
					<input type="text" class="form-control" id="nome" required />
				</div>

				<div class="col-md-4">
					<label for="email" class="form-label">E-mail</label>
					<input type="email" class="form-control" id="email" required />
				</div>

				<div class="col-md-3">
					<label for="nascimento" class="form-label">Data de nascimento</label>
					<input type="date" class="form-control" id="nascimento" required />
				</div>

				<div class="col-md-1 d-flex align-items-end">
					<button type="submit" class="btn btn-primary w-100">+</button>
				</div>
			</form>

			<h2 class="h4 mb-3">Pacientes cadastrados</h2>

			<!-- Mensagem de carregamento, visível enquanto os dados não chegam -->
			<p id="carregando" class="text-muted">Carregando pacientes...</p>

			<table class="table table-striped">
				<thead>
					<tr>
						<th>Nome</th>
						<th>E-mail</th>
						<th>Data de nascimento</th>
					</tr>
				</thead>
				<tbody id="tabela-pacientes"></tbody>
			</table>
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

h1 {
	color: #212529;
}

#tabela-pacientes tr {
	animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
```

### `js/app.js`

```javascript
const pacientes = [];

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagemCarregando = document.getElementById('carregando');

function adicionarPaciente(nome, email, nascimento) {
	pacientes.push({ nome, email, nascimento });
}

function renderizarTabela() {
	tabela.innerHTML = '';

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

function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');
	return `${dia}/${mes}/${ano}`;
}

// Nova função: busca os pacientes iniciais a partir do arquivo JSON
async function carregarPacientesIniciais() {
	try {
		const resposta = await fetch('data/pacientes.json');
		console.log(resposta);

		// Nem toda resposta é sucesso — precisamos checar antes de usar
		if (!resposta.ok) {
			throw new Error(`Erro HTTP: ${resposta.status}`);
		}

		const dados = await resposta.json(); // converte a resposta em objeto JS

		// Adiciona cada paciente vindo do arquivo ao nosso array local
		dados.forEach((paciente) => {
			adicionarPaciente(paciente.nome, paciente.email, paciente.nascimento);
		});

		renderizarTabela();
	} catch (erro) {
		console.error('Não foi possível carregar os pacientes:', erro);
		mensagemCarregando.textContent =
			'Erro ao carregar pacientes. Veja o console para mais detalhes.';
		return; // sai da função sem esconder a mensagem de erro
	}

	mensagemCarregando.textContent = 'Dados carregados com sucesso.';
	// mensagemCarregando.style.display = 'none'; // esconde "Carregando..." em caso de sucesso
}

formulario.addEventListener('submit', (event) => {
	event.preventDefault();

	const nome = document.getElementById('nome').value;
	const email = document.getElementById('email').value;
	const nascimento = document.getElementById('nascimento').value;

	adicionarPaciente(nome, email, nascimento);
	renderizarTabela();

	formulario.reset();
});

// Assim que o script carrega, já dispara a busca dos dados iniciais
carregarPacientesIniciais();
```

---

## 6. Explicação

- **`async function carregarPacientesIniciais()`** — o `async` na frente da função permite usar `await` dentro dela. Vale explicar que, sem `async`/`await`, o mesmo código exigiria encadear `.then()` várias vezes, o que fica bem menos legível.

- **`await fetch('data/pacientes.json')`** — o `fetch` dispara a requisição e retorna uma _Promise_. O `await` "pausa" a execução da função até essa promise ser resolvida, sem travar o navegador inteiro (isso é importante deixar claro: só aquela função espera, a página continua responsiva).

- **`resposta.ok` e `resposta.status`** — o `fetch` só lança erro em casos raros (ex: sem internet). Se o arquivo não existir (erro 404), o `fetch` ainda considera isso uma "resposta bem-sucedida" do ponto de vista técnico — por isso é preciso checar `resposta.ok` manualmente. Esse é um dos detalhes mais importantes (e mais esquecidos) do Fetch API.

- **`await resposta.json()`** — a resposta chega como um "fluxo de bytes"; esse método converte esse conteúdo em um array/objeto JavaScript de verdade, que já podemos usar normalmente.

- **`try`/`catch`** — qualquer erro dentro do `try` (arquivo não encontrado, JSON mal formatado, etc.) é capturado no `catch`, evitando que o erro "quebre" a aplicação silenciosamente. Sempre damos um feedback visual ao usuário quando algo falha.

- **`carregarPacientesIniciais()` no final do arquivo** — é isso que dispara todo o processo assim que a página carrega o script.

- **Por que precisamos de um servidor local agora?** Navegadores bloqueiam, por segurança, requisições `fetch` feitas a partir de arquivos abertos diretamente (`file://...`). É por isso que, a partir desta aula, o projeto **precisa** ser aberto através de um servidor HTTP local (ex: extensão Live Server do VS Code, ou `npx serve`). Isso antecipa exatamente o papel que o Node.js vai cumprir a partir da próxima aula.

---

## 7. Passo a passo (execução em sala)

1. Copiar o projeto da Aula 1 para a pasta `aula-02-cadastro-pacientes`.
2. Criar a pasta `data/` e o arquivo `pacientes.json` com os dados de exemplo.
3. Mostrar, propositalmente, o que acontece ao abrir o `index.html` com duplo clique (erro de CORS/`fetch` no console) — isso é ótimo gancho pedagógico.
4. Instalar/ativar a extensão **Live Server** no VS Code (ou usar `npx serve` no terminal) e abrir o projeto por `http://localhost:...`.
5. Adicionar o elemento `<p id="carregando">` no HTML e explicar sua função.
6. Escrever a função `carregarPacientesIniciais()` **incrementalmente**:
   a. Primeiro só o `fetch` com `console.log(resposta)` — mostrar o objeto `Response` no console.
   b. Depois adicionar `await resposta.json()` e logar o resultado.
   c. Por fim, integrar com `adicionarPaciente` e `renderizarTabela`.
7. Testar removendo/renomeando o arquivo `pacientes.json` propositalmente, para mostrar o `catch` funcionando.
8. Cadastrar um novo paciente pelo formulário e mostrar que ele se soma aos que vieram do JSON.

---

## 8. Exercícios

1. Adicione um pequeno `setTimeout` de 1 segundo antes do `fetch` (dentro da função) só para conseguir _ver_ a mensagem "Carregando pacientes..." antes dos dados aparecerem (isso simula uma conexão mais lenta).
2. Exiba, em algum lugar da página, quantos pacientes vieram do arquivo JSON versus quantos foram cadastrados manualmente na sessão atual.
3. Trate o caso em que o `pacientes.json` existe mas está vazio (`[]`) — exiba uma mensagem "Nenhum paciente cadastrado ainda" no lugar da tabela.
4. Force um erro proposital (ex: mude a URL do fetch para um arquivo que não existe) e capriche na mensagem de erro mostrada ao usuário.

---

## 9. Extensões

- Adicionar um botão "Recarregar pacientes" que chama `carregarPacientesIniciais()` novamente, limpando o array antes.
- Buscar dados de uma API pública real, como a [JSONPlaceholder](https://jsonplaceholder.typicode.com/), só para os alunos verem o mesmo padrão funcionando com um servidor de verdade, fora do próprio projeto.
- Adicionar um `<div>` de _spinner_ do Bootstrap enquanto os dados carregam, ao invés de apenas texto.

---

## 10. Erros comuns

| Erro                                                        | Causa provável                                                                                                   |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Failed to fetch` ou erro de CORS no console                | Projeto aberto via `file://` em vez de um servidor local (`http://`)                                             |
| `Unexpected token < in JSON`                                | O `fetch` está buscando um caminho errado e recebendo uma página HTML de erro 404 no lugar do JSON               |
| Tabela nunca aparece, mensagem "Carregando..." fica travada | Esqueceu do `await`, ou algum erro no `try` está sendo engolido sem exibir feedback                              |
| `resposta.json is not a function`                           | Confundiu `resposta` (objeto `Response`) com os dados já convertidos — sempre precisa do `await resposta.json()` |
| Dados aparecem duplicados                                   | `carregarPacientesIniciais()` está sendo chamada mais de uma vez                                                 |

---

## 11. Perguntas para discussão em sala

1. Por que o `fetch` não retorna os dados na hora, e sim uma "promessa"?
2. O que significa, na prática, dizer que o `fetch` é **assíncrono**? O que aconteceria se ele fosse síncrono?
3. Por que precisamos checar `resposta.ok` mesmo quando o `fetch` não lançou nenhum erro?
4. Hoje buscamos dados de um arquivo `.json` local. O que vai mudar, do ponto de vista do código JavaScript, quando esse arquivo for substituído por uma API real feita em Node.js? (Spoiler para a próxima aula: praticamente nada no `fetch` muda — só a URL.)
5. Por que precisamos de um servidor local (Live Server) agora, se na Aula 1 conseguíamos simplesmente abrir o arquivo no navegador?

---

## Observações para o professor

- Esta aula é a ponte conceitual mais importante do curso: é aqui que "cliente e servidor" deixa de ser abstrato e vira código de verdade.
- Reserve um tempo para o erro de `file://` acontecer **de propósito** — é uma das aulas mais efetivas quando o erro é vivido, não apenas explicado.
- Sugestão de duração: ~40min de conceito + exemplo guiado, ~20min tentando quebrar o app propositalmente (arquivo errado, JSON inválido), ~30min de exercícios.
- Na Aula 3, este arquivo `pacientes.json` "estático" será substituído por um **servidor Node.js real**, servindo os mesmos dados dinamicamente — o código de `fetch` no frontend praticamente não vai mudar, o que reforça bem a separação de responsabilidades entre cliente e servidor.
