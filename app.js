const letras = ["A","B","C","D","E"];
let qtdTreinos = parseInt(localStorage.getItem("qtdTreinos")) || 5;

let dadosTreinos = JSON.parse(localStorage.getItem("dadosTreinos")) || {
  A: [], B: [], C: [], D: [], E: []
};

let biblioteca = JSON.parse(localStorage.getItem("biblioteca")) || {
  Geral: ["Flexão", "Prancha"]
};

let historico = JSON.parse(localStorage.getItem("historico")) || {};
let mesVisualizacao = new Date();

/* ---------- NAVEGAÇÃO ---------- */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));

  const tela = document.getElementById(id);
  if (tela) tela.classList.add("active");

  const mapa = { dia: 0, treinos: 1, biblioteca: 2, calendario: 3, config: 4 };
  if (mapa[id] !== undefined) {
    document.querySelectorAll("nav button")[mapa[id]].classList.add("active");
  }

  if (id === "dia") carregarTreinoDia();
  if (id === "biblioteca") renderizarBiblioteca();
  if (id === "calendario") montarCalendario();
}

/* ---------- CONFIGURAÇÃO DE QUANTIDADE DE TREINOS ---------- */
function definirQtdTreinos(qtd) {
  qtdTreinos = parseInt(qtd);
  localStorage.setItem("qtdTreinos", qtdTreinos);
  renderizarTreinos();
}

/* ---------- TREINOS ---------- */
function renderizarTreinos() {
  const container = document.getElementById("lista-treinos");
  container.innerHTML = "";

  for (let i = 0; i < qtdTreinos; i++) {
    const letra = letras[i];
    container.innerHTML += `
      <div class="card">
        <h3>Treino ${letra}</h3>
        <p>Adicione exercícios para o treino ${letra}</p>
      </div>
    `;
  }
}

/* ---------- TREINO DO DIA ---------- */
function carregarTreinoDia() {
  const idx = parseInt(localStorage.getItem("idx_treino") || 0);
  const letra = letras[idx];

  document.getElementById("treino-atual-letra").innerText = letra;
  const lista = document.getElementById("lista-dia");
  lista.innerHTML = "";

  const treinos = dadosTreinos[letra].filter(e => e.nome);

  if (treinos.length === 0) {
    lista.innerHTML = `<p style="text-align:center;opacity:.5">
      Nenhum exercício no treino ${letra}
    </p>`;
    atualizarProgresso();
    return;
  }

  treinos.forEach(ex => {
    lista.innerHTML += `
      <div class="lista-item">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${
