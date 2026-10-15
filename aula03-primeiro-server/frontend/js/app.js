// Em produção (Render). Para testar localmente, troque por 'http://localhost:3000/pacientes'
const URL_API = 'https://api-clinica-glxw.onrender.com/pacientes';
// const URL_API = 'http://localhost:3000/pacientes';

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
		mostrarMensagem(
			'Não foi possível carregar os pacientes. O servidor está no ar?'
		);
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
