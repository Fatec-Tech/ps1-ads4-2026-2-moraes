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

	mensagemCarregando.textContent =
		'Dados carregados com sucesso.';
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
