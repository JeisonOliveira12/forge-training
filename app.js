alert("O app.js foi carregado!");

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
  if (id === "treinos") renderizarTreinos();
  if (id === "biblioteca") renderizarBiblioteca();
  if (id === "calendario") montarCalendario();
}

/* ---------- CONFIGURAÇÃO DE QUANTIDADE DE TREINOS ---------- */
function definirQtdTreinos(qtd) {
  qtdTreinos = parseInt(qtd);
  localStorage.setItem("qtdTreinos", qtdTreinos);
  renderizarTreinos();
  const idx = parseInt(localStorage.getItem("idx_treino") || 0);
  if (idx >= qtdTreinos) localStorage.setItem("idx_treino", 0);
  carregarTreinoDia();
}

/* ---------- TREINOS (EDIÇÃO COMPLETA) ---------- */
function renderizarTreinos() {
  const container = document.getElementById("lista-treinos");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 0; i < qtdTreinos; i++) {
    const letra = letras[i];
    container.innerHTML += `
      <div class="card">
        <h3>Treino ${letra}</h3>
        <p>Adicione e edite exercícios do treino ${letra}</p>
        <button class="btn" onclick="adicionarExercicioTreino('${letra}')">Adicionar exercício</button>
        ${renderListaExerciciosTreino(letra)}
      </div>
    `;
  }
}

function renderListaExerciciosTreino(letra) {
  const lista = dadosTreinos[letra] || [];
  if (!lista.length) {
    return `<div style="opacity:.6;margin-top:6px">Nenhum exercício</div>`;
  }
  return `
    <div style="margin-top:8px">
      ${lista.map((ex, i) => `
        <div class="lista-item" style="display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <button class="btn-outline btn" style="width:auto" onclick="editarExercicioTreino('${letra}', ${i})">
              ${ex.nome || 'Selecionar exercício'}
            </button>
            <button class="btn-outline btn" style="width:auto" onclick="removerExercicioTreino('${letra}', ${i})">🗑</button>
          </div>
          <div style="display:flex;gap:8px">
            <label style="flex:1">
              <small>Repetições</small>
              <input type="number" min="0" value="${ex.repeticoes ?? ''}" 
                     oninput="atualizarCampoExercicio('${letra}', ${i}, 'repeticoes', this.value)">
            </label>
            <label style="flex:1">
              <small>Séries</small>
              <input type="number" min="0" value="${ex.series ?? ''}" 
                     oninput="atualizarCampoExercicio('${letra}', ${i}, 'series', this.value)">
            </label>
            <label style="flex:1">
              <small>Peso (kg)</small>
              <input type="number" min="0" step="0.5" value="${ex.peso ?? ''}" 
                     oninput="atualizarCampoExercicio('${letra}', ${i}, 'peso', this.value)">
            </label>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function adicionarExercicioTreino(letra) {
  dadosTreinos[letra].push({ nome: "", repeticoes: null, series: null, peso: null });
  salvarTreinos();
  renderizarTreinos();
  if (document.querySelector("#dia.screen.active")) carregarTreinoDia();
}

function atualizarCampoExercicio(letra, idx, campo, valor) {
  const v = valor === "" ? null : Number(valor);
  dadosTreinos[letra][idx][campo] = v;
  salvarTreinos();
  if (document.querySelector("#dia.screen.active")) carregarTreinoDia();
}

function editarExercicioTreino(letra, idx) {
  const grupos = Object.keys(biblioteca);
  const todas = grupos.flatMap(g => biblioteca[g].map(n => `${g}: ${n}`));
  if (!todas.length) {
    alert("A biblioteca está vazia. Adicione exercícios na aba Biblioteca.");
    return;
  }
  const menu = todas.map((item, i) => `${i+1}. ${item}`).join("\n");
  const escolha = prompt(`Escolha o exercício pelo número:\n\n${menu}\n\nDigite o número:`);
  if (!escolha) return;
  const idxEscolha = parseInt(escolha) - 1;
  if (isNaN(idxEscolha) || idxEscolha < 0 || idxEscolha >= todas.length) return;
  const nome = todas[idxEscolha].split(": ").slice(1).join(": ");
  dadosTreinos[letra][idx].nome = nome;
  salvarTreinos();
  renderizarTreinos();
  if (document.querySelector("#dia.screen.active")) carregarTreinoDia();
}

function removerExercicioTreino(letra, idx) {
  dadosTreinos[letra].splice(idx, 1);
  salvarTreinos();
  renderizarTreinos();
  if (document.querySelector("#dia.screen.active")) carregarTreinoDia();
}

function salvarTreinos() {
  localStorage.setItem("dadosTreinos", JSON.stringify(dadosTreinos));
}
