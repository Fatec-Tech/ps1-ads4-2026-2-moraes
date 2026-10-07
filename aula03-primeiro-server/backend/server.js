const http = require('http');
const servidor = http.createServer((req, res) => {
  res.end('Servidor Node.js funcionando!');
});

const PORTA = 3000;
servidor.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
