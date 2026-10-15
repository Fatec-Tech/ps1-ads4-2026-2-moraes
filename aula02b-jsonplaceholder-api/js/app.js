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
		listaPosts.innerHTML =
			'<li class="list-group-item text-danger">Erro ao carregar posts.</li>';
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
