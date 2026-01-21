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
          <strong>${ex.nome}</strong>
          <input type="checkbox" onchange="atualizarProgresso()">
        </div>
        <small>${ex.peso || 0} kg</small>
      </div>
    `;
  });

  atualizarProgresso();
}

function atualizarProgresso() {
  const checks = document.querySelectorAll("#lista-dia input[type='checkbox']");
  const total = checks.length;
  const feitos = [...checks].filter(c => c.checked).length;
  const perc = total ? Math.round((feitos / total) * 100) : 0;

  document.getElementById("progresso-dia").value = perc;
  document.getElementById("percentual").innerText = perc + "%";

  if (perc === 100 && total > 0) {
    setTimeout(finalizarTreino, 400);
  }
}

function finalizarTreino() {
  if (!confirm("Finalizar treino e salvar histórico?")) return;

  const hoje = new Date().toISOString().split("T")[0];
  const idx = parseInt(localStorage.getItem("idx_treino") || 0);

  historico[hoje] = letras[idx];
  localStorage.setItem("historico", JSON.stringify(historico));
  localStorage.setItem("idx_treino", (idx + 1) % qtdTreinos);

  showScreen("dia");
}

/* ---------- BIBLIOTECA ---------- */
function adicionarGrupo() {
  const input = document.getElementById("novo-grupo-input");
  const nome = input.value.trim();
  if (!nome || biblioteca[nome]) return;

  biblioteca[nome] = [];
  input.value = "";
  salvarBib();
  renderizarBiblioteca();
}

function adicionarExercicioGrupo(grupo) {
  const nome = prompt(`Novo exercício em ${grupo}:`);
  if (!nome) return;

  biblioteca[grupo].push(nome);
  salvarBib();
  renderizarBiblioteca();
}

function renderizarBiblioteca() {
  const container = document.getElementById("lista-grupos");
  container.innerHTML = "";

  Object.keys(biblioteca).forEach(grupo => {
    container.innerHTML += `
      <div class="config-box">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${grupo}</strong>
          <button class="btn-outline btn" style="width:auto"
            onclick="adicionarExercicioGrupo('${grupo}')">+</button>
        </div>
        ${biblioteca[grupo]
          .map(e => `<div style="margin-top:6px;font-size:13px;opacity:.7">${e}</div>`)
          .join("")}
      </div>
    `;
  });
}

function salvarBib() {
  localStorage.setItem("biblioteca", JSON.stringify(biblioteca));
}

/* ---------- CALENDÁRIO ---------- */
function mudarMes(delta) {
  mesVisualizacao.setMonth(mesVisualizacao.getMonth() + delta);
  montarCalendario();
}

function montarCalendario() {
  const grade = document.getElementById("calendario-grade");
  const mesTxt = document.getElementById("mes-atual");
  grade.innerHTML = "";

  const ano = mesVisualizacao.getFullYear();
  const mes = mesVisualizacao.getMonth();

  mesTxt.innerText = new Date(ano, mes)
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  for (let i = 0; i < primeiroDia; i++) grade.innerHTML += "<div></div>";

  for (let d = 1; d <= totalDias; d++) {
    const dataStr = `${ano}-${String(mes + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const treino = historico[dataStr];
    const cor = treino ? `var(--color-${treino})` : "#222";

    grade.innerHTML += `
      <div class="calendar-day ${treino ? "has-treino" : ""}"
           style="border-color:${cor};color:${cor}"
           onclick="marcarManual('${dataStr}')">
        ${d}
        ${treino ? `<small style="position:absolute;bottom:4px;font-size:8px">${treino}</small>` : ""}
      </div>
    `;
  }
}

function marcarManual(data) {
  const letra = prompt("Marcar qual treino? (A–E)");
  if (!letra || !letras.includes(letra.toUpperCase())) return;

  historico[data] = letra.toUpperCase();
  localStorage.setItem("historico", JSON.stringify(historico));
  montarCalendario();
}

/* ---------- VISUAL ---------- */
function mudarFonte(f) {
  document.body.classList.remove("font-modern","font-sport","font-tech");
  document.body.classList.add(f);
  localStorage.setItem("cfg_fonte", f);
}

function aplicarTemaManual() {
  const bg = document.getElementById("cor-fundo").value;
  const ac = document.getElementById("cor-destaque").value;

  document.documentElement.style.setProperty("--bg-color", bg);
  document.documentElement.style.setProperty("--accent-color", ac);

  localStorage.setItem("cfg_bg", bg);
  localStorage.setItem("cfg_ac", ac);
}

function atualizarCorTreino(letra, cor) {
  document.documentElement.style.setProperty(`--color-${letra}`, cor);
  let cores = JSON.parse(localStorage.getItem("cfg_cores")) || {};
  cores[letra] = cor;
  localStorage.setItem("cfg_cores", JSON.stringify(cores));
}

/* ---------- INIT ---------- */
window.onload = () => {
  if (localStorage.getItem("cfg_fonte")) {
    mudarFonte(localStorage.get
