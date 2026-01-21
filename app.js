/* ---------- CONFIGURAÇÃO DE QUANTIDADE DE TREINOS ---------- */
let qtdTreinos = parseInt(localStorage.getItem("qtdTreinos")) || 5;

function definirQtdTreinos(qtd) {
  qtdTreinos = parseInt(qtd);
  localStorage.setItem("qtdTreinos", qtdTreinos);
  renderizarTreinos();
}

/* ---------- TREINOS (renderização da aba) ---------- */
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

function finalizarTreino() {
  if (!confirm("Finalizar treino e salvar histórico?")) return;

  const hoje = new Date().toISOString().split("T")[0];
  const idx = parseInt(localStorage.getItem("idx_treino") || 0);

  historico[hoje] = letras[idx];
  localStorage.setItem("historico", JSON.stringify(historico));

  // alterna apenas dentro da quantidade escolhida
  localStorage.setItem("idx_treino", (idx + 1) % qtdTreinos);

  showScreen("dia");
}

/* ---------- INIT ---------- */
window.onload = () => {
  if (localStorage.getItem("cfg_fonte")) mudarFonte(localStorage.getItem("cfg_fonte"));

  if (localStorage.getItem("cfg_bg")) {
    document.getElementById("cor-fundo").value = localStorage.getItem("cfg_bg");
    document.getElementById("cor-destaque").value = localStorage.getItem("cfg_ac");
    aplicarTemaManual();
  }

  const cores = JSON.parse(localStorage.getItem("cfg_cores")) || {};
  Object.keys(cores).forEach(l => atualizarCorTreino(l, cores[l]));

  // Ajusta seletor de quantidade de treinos
  document.getElementById("qtd-treinos").value = qtdTreinos;

  renderizarTreinos();
  showScreen("dia");
};
