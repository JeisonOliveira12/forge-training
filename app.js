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
// Renderiza os treinos com lista de exercícios e botões de adicionar/editar/remover
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

// Lista de exercícios com clique no nome para escolher da biblioteca e inputs para reps/séries/peso
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
            <div>
              <button class="btn-outline btn" style="width:auto" onclick="removerExercicioTreino('${letra}', ${i})">🗑</button>
            </div>
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

// Adiciona um exercício novo (começa sem nome, usuário clica para escolher da biblioteca)
function adicionarExercicioTreino(letra) {
  dadosTreinos[letra].push({ nome: "", repeticoes: null, series: null, peso: null });
  salvarTreinos();
  renderizarTreinos();
  if (document.querySelector("#dia.screen.active")) carregarTreinoDia();
}

// Atualiza campos numéricos (reps/séries/peso)
function atualizarCampoExercicio(letra, idx, campo, valor) {
  const v = valor === "" ? null : Number(valor);
  dadosTreinos[letra][idx][campo] = v;
  salvarTreinos();
  if (document.querySelector("#dia.screen.active")) carregarTreinoDia();
}

// Edita o nome do exercício escolhendo da biblioteca
function editarExercicioTreino(letra, idx) {
  // Monta uma lista simples de opções a partir da biblioteca
  const grupos = Object.keys(biblioteca);
  const todas = grupos.flatMap(g => biblioteca[g].map(n => `${g}: ${n}`));
  if (!todas.length) {
    alert("A biblioteca está vazia. Adicione exercícios na aba Biblioteca.");
    return;
  }

  // Prompt com índice para escolher
  const menu = todas.map((item, i) => `${i+1}. ${item}`).join("\n");
  const escolha = prompt(`Escolha o exercício pelo número:\n\n${menu}\n\nDigite o número:`);

  if (!escolha) return;
  const idxEscolha = parseInt(escolha) - 1;
  if (isNaN(idxEscolha) || idxEscolha < 0 || idxEscolha >= todas.length) return;

  // Extrai apenas o nome após "Grupo: Nome"
  const nome = todas[idxEscolha].split(": ").slice(1).join(": ");
  dadosTreinos[letra][idx].nome = nome;
  salvarTreinos();
  renderizarTreinos();
  if (document.querySelector("#dia.screen.active")) carregarTreinoDia();
}

// Remove exercício do treino
function removerExercicioTreino(letra, idx) {
  dadosTreinos[letra].splice(idx, 1);
  salvarTreinos();
  renderizarTreinos();
  if (document.querySelector("#dia.screen.active")) carregarTreinoDia();
}

function salvarTreinos() {
  localStorage.setItem("dadosTreinos", JSON.stringify(dadosTreinos));
}

/* ---------- TREINO DO DIA ---------- */
function carregarTreinoDia() {
  const idx = parseInt(localStorage.getItem("idx_treino") || 0);
  const idxSeguro = Math.min(Math.max(idx, 0), qtdTreinos - 1);
  localStorage.setItem("idx_treino", idxSeguro);

  const letra = letras[idxSeguro];
  document.getElementById("treino-atual-letra").innerText = letra;
  const lista = document.getElementById("lista-dia");
  lista.innerHTML = "";

  const treinos = (dadosTreinos[letra] || []).filter(e => e && e.nome);

  if (treinos.length === 0) {
    lista.innerHTML = `<p style="text-align:center;opacity:.5">
      Nenhum exercício no treino ${letra}
    </p>`;
    atualizarProgresso();
    return;
  }

  treinos.forEach(ex => {
    lista.innerHTML += `
      <div class="card-exercicio">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${ex.nome}</strong>
          <input type="checkbox" onchange="atualizarProgresso()">
        </div>
        <small>
          ${ex.repeticoes ? `${ex.repeticoes} rep` : ""} 
          ${ex.series ? `• ${ex.series} séries` : ""} 
          ${ex.peso ? `• ${ex.peso} kg` : ""}
        </small>
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
  const letra = letras[Math.min(idx, qtdTreinos - 1)];

  historico[hoje] = letra;
  localStorage.setItem("historico", JSON.stringify(historico));
  localStorage.setItem("idx_treino", (idx + 1) % qtdTreinos);

  carregarTreinoDia();
}
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
  biblioteca[grupo].push(nome.trim());
  salvarBib();
  renderizarBiblioteca();
}

// Remover exercício da biblioteca
function removerExercicioGrupo(grupo, idx) {
  biblioteca[grupo].splice(idx, 1);
  salvarBib();
  renderizarBiblioteca();
}

function renderizarBiblioteca() {
  const container = document.getElementById("lista-grupos");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(biblioteca).forEach(grupo => {
    container.innerHTML += `
      <div class="grupo">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${grupo}</strong>
          <button class="btn-outline btn" style="width:auto"
            onclick="adicionarExercicioGrupo('${grupo}')">+</button>
        </div>
        ${biblioteca[grupo]
          .map((e, i) => `
            <div style="margin-top:6px;font-size:13px;opacity:.85;display:flex;justify-content:space-between;align-items:center">
              <span>${e}</span>
              <button class="btn-outline btn" style="width:auto" onclick="removerExercicioGrupo('${grupo}', ${i})">🗑</button>
            </div>
          `)
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
  if (!grade || !mesTxt) return;
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

    const diaSemana = new Date(ano, mes, d).getDay(); // 0 dom, 6 sáb
    const corSemTreino = (diaSemana === 0 || diaSemana === 6) ? "#555" : "#333";
    const cor = treino ? `var(--color-${treino})` : corSemTreino;

    grade.innerHTML += `
      <div class="calendar-day ${treino ? "has-treino" : ""}"
           style="border-color:${cor};color:${cor}"
           onclick="marcarManual('${dataStr}')">
        ${d}
        ${treino ? `<small style="position:absolute;bottom:4px;font-size:8px">${treino}</small>` : ""}
      </div>
    `;
  }

  montarResumoTreinos();
}

// Resumo: total e por letra
function montarResumoTreinos() {
  const resumoBox = document.getElementById("resumo-treinos");
  if (!resumoBox) return;

  const contagens = { A:0, B:0, C:0, D:0, E:0 };
  Object.values(historico).forEach(letra => {
    if (contagens[letra] !== undefined) contagens[letra]++;
  });

  const total = Object.keys(historico).length;

  resumoBox.innerHTML = `
    <h3>Resumo dos Treinos</h3>
    <p>Total: <strong>${total}</strong></p>
    <ul style="list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(2,1fr);gap:6px">
      ${Object.keys(contagens)
        .slice(0, qtdTreinos)
        .map(l => `<li>Treino ${l}: <strong>${contagens[l]}</strong></li>`)
        .join("")}
    </ul>
  `;
}

function marcarManual(data) {
  const letra = prompt(`Marcar qual treino? (A–${letras[qtdTreinos-1]})`);
  if (!letra) return;
  const up = letra.toUpperCase();
  if (!letras.slice(0, qtdTreinos).includes(up)) return;

  historico[data] = up;
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

/* 👉 Nova função para cor da fonte */
function mudarCorFonte(cor) {
  document.documentElement.style.setProperty("--font-color", cor);
  localStorage.setItem("cfg_font_color", cor);
}

/* ---------- INIT ---------- */
window.onload = () => {
  // Fonte
  const f = localStorage.getItem("cfg_fonte");
  if (f) mudarFonte(f);

  // Tema
  const bg = localStorage.getItem("cfg_bg");
  const ac = localStorage.getItem("cfg_ac");
  if (bg && ac) {
    document.getElementById("cor-fundo").value = bg;
    document.getElementById("cor-destaque").value = ac;
    aplicarTemaManual();
  }

  // 👉 Cor da fonte
  const corFonte = localStorage.getItem("cfg_font_color");
  if (corFonte) {
    document.documentElement.style.setProperty("--font-color", corFonte);
  }

  // Cores dos treinos
  const cores = JSON.parse(localStorage.getItem("cfg_cores")) || {};
  Object.keys(cores).forEach(l => atualizarCorTreino(l, cores[l]));

  // Seletor de quantidade
  const seletor = document.getElementById("qtd-treinos");
  if (seletor) seletor.value = qtdTreinos;

  // Inicializar mês de visualização
  mesVisualizacao = new Date();

  // Render inicial
  renderizarTreinos();
  carregarTreinoDia();
  montarCalendario();
  showScreen("dia");
};


