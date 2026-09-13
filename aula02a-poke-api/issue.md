# Criar uma issue:

## Título: [aula02a] Desafio: Implementar Modal de Detalhes Completo da Pokédex

### 🎯 Objetivo

Estender a aplicação base da Pokédex implementando um **Modal de Detalhes Completo** do Bootstrap. Ao clicar na carta de qualquer Pokémon na tela, o usuário deve visualizar informações aprofundadas sobre o Pokémon selecionado diretamente de uma caixa de diálogo responsiva.

---

### 📋 Requisitos da Tarefa

1. **Interatividade nos Cards**:
   - Tornar os cards da lista clicáveis (`cursor: pointer`).
   - Ao clicar no card, disparar a abertura do modal sem recarregar a página.

2. **Estrutura e Dados no Modal**:
   O modal deve carregar dinamicamente as seguintes informações consumidas da PokéAPI:
   - **Status Base (`stats`)**: Exibir os valores de *HP*, *Ataque*, *Defesa* e *Velocidade* utilizando o componente **Progress Bar** do Bootstrap.
   - **Habilidades (`abilities`)**: Listar as habilidades do Pokémon formatadas em badges ou lista visual.
   - **Áudio do Pokémon (`cries`)**: Incluir um player de áudio HTML5 (`<audio>`) ou botão de reprodução para o som oficial do Pokémon (`cries.latest`).
   - **Galeria de Sprites (`sprites`)**: Exibir as versões *Normal* e *Shiny* (frente e costas) usando `sprites.front_default`, `sprites.back_default`, `sprites.front_shiny` e `sprites.back_shiny`.

3. **Feedback Visual e UX**:
   - Exibir um indicador de carregamento (spinner) dentro do modal enquanto os dados estão sendo recuperados.
   - Tratar possíveis erros de requisição de forma amigável.

---

### 💡 Dicas de Implementação

- **Estrutura HTML do Modal**: Adicione a estrutura base do Modal do Bootstrap 5 no final da tag `<body>` do seu `index.html`.
- **API JS do Bootstrap**: Você pode controlar a exibição do modal programaticamente usando:
  ```javascript
  const modalElement = document.getElementById('pokemonModal');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
Barras de Progresso: Utilize a classe .progress-bar do Bootstrap para renderizar a porcentagem/valor dos status base.

🏆 Critérios de Aceite
[ ] A aplicação abre o modal ao clicar em qualquer card da lista.

[ ] O modal exibe os status base (HP, Ataque, Defesa, Velocidade) em barras de progresso.

[ ] As habilidades estão visíveis e formatadas corretamente.

[ ] O som do Pokémon pode ser ouvido interativamente.

[ ] As visões de sprites (Normal/Shiny) são exibidas.

[ ] Não há erros no console ao abrir ou fechar o modal

---