/* ===============================
   FORGE TRAINING – SCRIPT CORE
   =============================== */

/* ---------- STORAGE ---------- */
let dadosTreinos = JSON.parse(localStorage.getItem('dadosTreinos')) || {
  A: [], B: [], C: [], D: [], E: []
};

let biblioteca = JSON.parse(localStorage.getItem('biblioteca')) || {
  "Geral": ["Flexão", "Prancha"]
};

let historico = JSON.parse(localStorage.getItem('historico')) || {};
let mesVisualizacao = new Date();

/* ---------- NAVEGAÇÃO ---------- */
function showScreen(id) {
  document.querySelectorAll('nav button')
    .forEach(b => b.classList.remove('active'));

  document.querySelectorAll('.screen')
    .forEach(s => s.classList.remove('active'));

  document.getElementById(id).classList.add('active');
  event?.target?.classList.add('active');

  if (id === 'dia') carregarTreinoDia();
  if (id === 'biblioteca') renderizarBiblioteca();
  if (id === 'calendario') montarCalendario();
}

/* ---------- BIBLIOTECA ---------- */
function adicionarGrupo() {
  const input = document.getElementById('novo-grupo-input');
  const nome = input.value.trim();
  if (!nome) return;

  if (!biblioteca[nome]) {
    biblioteca[nome] = [];
    input.value = '';
    salvarBib();
    renderizarBiblioteca();
  } else {
    alert("Grupo já existe");
  }
}

function adicionarExercicioGrupo(grupo) {
  const nome = prompt(`Novo exercício em ${grupo}:`);
  if (!nome) return;

  biblioteca[grupo].push(nome);
  salvarBib();
  renderizarBiblioteca();
}

function renderizarBiblioteca() {
  const container = document.getElementById('lista-grupos');
  container.innerHTML = '';

  Object.keys(biblioteca).forEach(grupo => {
    container.innerHTML += `
      <div class="config-box">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong>${grupo}</strong>
          <button class="btn-outline btn" style="width:auto"
            onclick="adicionarExercicioGrupo('${grupo}')">+</button>
        </div>
        ${biblioteca[grupo]
          .map(e => `<div style="margin-top:6px;font-size:13px;opacity:.7">${e}</div>`)
          .join('')}
      </div>
    `;
  });
}

function salvarBib() {
  localStorage.setItem('biblioteca', JSON.stringify(biblioteca));
}

/* ---------- CALENDÁRIO ---------- */
function mudarMes(delta) {
  mesVisualizacao.setMonth(mesVisualizacao.getMonth() + delta);
  montarCalendario();
}

function montarCalendario() {
  const grade = document.getElementById('calendario-grade');
  const mesTxt = document.getElementById('mes-atual');
  grade.innerHTML = '';

  const ano = mesVisualizacao.getFullYear();
  const mes = mesVisualizacao.getMonth();

  mesTxt.innerText = new Date(ano, mes)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  for (let i = 0; i < primeiroDia; i++) grade.innerHTML += `<div></div>`;

  for (let d = 1; d <= totalDias; d++) {
    const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const treino = historico[dataStr];
    const cor = treino ? `var(--color-${treino})` : '#222';

    grade.innerHTML += `
      <div class="calendar-day ${treino ? 'has-treino' : ''}"
           style="border-color:${cor};color:${cor}"
           onclick="marcarManual('${dataStr}')">
        ${d}
        ${treino ? `<small style="position:absolute;bottom:4px;font-size:8px">${treino}</small>` : ''}
      </div>
    `;
  }
}

function marcarManual(data) {
  const letra = prompt("Marcar qual treino? (A-E)");
  if (!letra || !"ABCDE".includes(letra.toUpperCase())) return;

  historico[data] = letra.toUpperCase();
  localStorage.setItem('historico', JSON.stringify(historico));
  montarCalendario();
}

/* ---------- VISUAL GLOBAL ---------- */
function mudarFonte(fonte) {
  document.body.classList.remove('font-modern', 'font-sport', 'font-tech');
  document.body.classList.add(fonte);
  localStorage.setItem('cfg_fonte', fonte);
}

function aplicarTemaManual() {
  const bg = document.getElementById('cor-fundo').value;
  const ac = document.getElementById('cor-destaque').value;

  document.documentElement.style.setProperty('--bg-color', bg);
  document.documentElement.style.setProperty('--accent-color', ac);

  localStorage.setItem('cfg_bg', bg);
  localStorage.setItem('cfg_ac', ac);
}

function atualizarCorTreino(letra, cor) {
  document.documentElement.style.setProperty(`--color-${letra}`, cor);

  let cores = JSON.parse(localStorage.getItem('cfg_cores')) || {};
  cores[letra] = cor;
  localStorage.setItem('cfg_cores', JSON.stringify(cores));
}

/* ---------- TREINO DO DIA ---------- */
function carregarTreinoDia() {
  const idx = parseInt(localStorage.getItem('idx_treino') || 0);
  const letra = "ABCDE"[idx];

  document.getElementById('treino-atual-letra').innerText = letra;
  const lista = document.getElementById('lista-dia');
  lista.innerHTML = '';

  const treinos = dadosTreinos[letra].filter(e => e.nome);

  if (treinos.length === 0) {
    lista.innerHTML = `<p style="opacity:.5;text-align:center">
      Nenhum exercício no Treino ${letra}
    </p>`;
    return;
  }

  treinos.forEach((ex, i) => {
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
  const checks = document.querySelectorAll('#lista-dia input[type="checkbox"]');
  const total = checks.length;
  const feitos = [...checks].filter(c => c.checked).length;
  const perc = total ? Math.round((feitos / total) * 100) : 0;

  document.getElementById('progresso-dia').value = perc;
  document.getElementById('percentual').innerText = perc + "%";

  if (perc === 100 && total > 0) {
    setTimeout(finalizarTreino, 400);
  }
}

function finalizarTreino() {
  if (!confirm("Finalizar treino e salvar histórico?")) return;

  const hoje = new Date().toISOString().split('T')[0];
  const idx = parseInt(localStorage.getItem('idx_treino') || 0);
  const letra = "ABCDE"[idx];

  historico[hoje] = letra;
  localStorage.setItem('historico', JSON.stringify(historico));
  localStorage.setItem('idx_treino', (idx + 1) % 5);

  showScreen('dia');
}

/* ---------- INIT ---------- */
window.onload = () => {
  if (localStorage.getItem('cfg_fonte')) mudarFonte(localStorage.getItem('cfg_fonte'));

  if (localStorage.getItem('cfg_bg')) {
    document.getElementById('cor-fundo').value = localStorage.getItem('cfg_bg');
    document.getElementById('cor-destaque').value = localStorage.getItem('cfg_ac');
    aplicarTemaManual();
  }

  const cores = JSON.parse(localStorage.getItem('cfg_cores')) || {};
  Object.keys(cores).forEach(l => atualizarCorTreino(l, cores[l]));

  showScreen('dia');
};
