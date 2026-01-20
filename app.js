const TREINOS = ['A', 'B', 'C', 'D', 'E'];
const salvar = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));
const carregar = (chave, padrao) => {
  const dado = localStorage.getItem(chave);
  return dado ? JSON.parse(dado) : padrao;
};

const treinoVazio = () => Array.from({ length: 10 }, () => ({ nome: '', serie: '', repeticao: '', peso: '', feito: false }));
let dadosTreinos = carregar('dadosTreinos', { A: treinoVazio(), B: treinoVazio(), C: treinoVazio(), D: treinoVazio(), E: treinoVazio() });
let indiceTreinoAtual = carregar('indiceTreinoAtual', 0);
let historico = carregar('historico', {});
let dataVisualizacao = new Date();

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    if(screenId === 'dia') carregarTreinoDia();
    if(screenId === 'calendario') montarCalendario();
}

function salvarConfig() {
    const qtd = document.getElementById('select-qtd').value;
    localStorage.setItem('qtd_treinos', qtd);
    aplicarQuantidade(qtd);
}

function aplicarQuantidade(qtd) {
    TREINOS.forEach((letra, index) => {
        const btn = document.getElementById(`btn-${letra}`);
        if (btn) btn.style.display = (index < qtd) ? 'inline-block' : 'none';
    });
}

function openTreino(letra) {
  const container = document.getElementById('treino-container');
  container.innerHTML = `<h3>Treino ${letra}</h3>`;
  dadosTreinos[letra].forEach((ex, i) => {
    container.innerHTML += `
      <div style="margin-bottom:8px">
        <input placeholder="Exercicio" value="${ex.nome}" oninput="atualizar('${letra}',${i},'nome',this.value)">
        <input placeholder="S" value="${ex.serie}" oninput="atualizar('${letra}',${i},'serie',this.value)">
        <input placeholder="R" value="${ex.repeticao}" oninput="atualizar('${letra}',${i},'repeticao',this.value)">
        <input placeholder="Kg" value="${ex.peso}" oninput="atualizar('${letra}',${i},'peso',this.value)">
      </div>`;
  });
}

function atualizar(letra, i, campo, valor) {
  dadosTreinos[letra][i][campo] = valor;
  salvar('dadosTreinos', dadosTreinos);
}

function carregarTreinoDia() {
  const qtdAtual = carregar('qtd_treinos', 5);
  const letra = TREINOS[indiceTreinoAtual];
  document.getElementById('treino-atual').innerText = letra;
  const lista = document.getElementById('lista-dia');
  lista.innerHTML = '';
  let feitos = 0, validos = 0;

  dadosTreinos[letra].forEach((ex, i) => {
    if (ex.nome.trim() !== '') {
      validos++;
      if (ex.feito) feitos++;
      lista.innerHTML += `
        <label style="display:block; margin:10px 0;">
          <input type="checkbox" ${ex.feito ? 'checked' : ''} onchange="concluirExercicio('${letra}',${i},this.checked)">
          ${ex.nome} (${ex.serie}x${ex.repeticao} - ${ex.peso})
        </label>`;
    }
  });

  let percentual = validos === 0 ? 0 : Math.round((feitos / validos) * 100);
  document.getElementById('progresso-dia').value = percentual;
  document.getElementById('percentual').innerText = percentual + '%';
  if (percentual === 100 && validos > 0) finalizarTreino(letra, qtdAtual);
}

function concluirExercicio(letra, i, status) {
  dadosTreinos[letra][i].feito = status;
  salvar('dadosTreinos', dadosTreinos);
  carregarTreinoDia();
}

function finalizarTreino(letra, qtd) {
  const status = document.getElementById('status-final');
  status.style.display = 'block';
  status.innerText = 'TREINO CONCLUÍDO!';
  
  const agora = new Date();
  const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
  
  historico[hoje] = letra;
  salvar('historico', historico);

  indiceTreinoAtual = (indiceTreinoAtual + 1) % qtd;
  salvar('indiceTreinoAtual', indiceTreinoAtual);

  setTimeout(() => {
    status.style.display = 'none';
    dadosTreinos[letra].forEach(ex => ex.feito = false);
    salvar('dadosTreinos', dadosTreinos);
    carregarTreinoDia();
    montarCalendario();
  }, 1500);
}

function mudarMes(direcao) {
    dataVisualizacao.setMonth(dataVisualizacao.getMonth() + direcao);
    montarCalendario();
}

function montarCalendario() {
    const grade = document.getElementById('calendario-grade');
    const labelMes = document.getElementById('mes-atual');
    grade.innerHTML = '';
    const ano = dataVisualizacao.getFullYear();
    const mes = dataVisualizacao.getMonth();
    labelMes.innerText = dataVisualizacao.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    const contadores = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    for (let i = 0; i < primeiroDiaSemana; i++) grade.innerHTML += `<div></div>`;

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataKey = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const treino = historico[dataKey] || "";
        
        if (treino && contadores[treino] !== undefined) contadores[treino]++;

        grade.innerHTML += `
            <div class="calendar-day ${treino ? 'has-training' : ''}" onclick="editarDia('${dataKey}')">
                <span>${dia}</span>
                <small>${treino}</small>
            </div>`;
    }
    document.getElementById('total-treinos').innerText = Object.keys(historico).length;
    TREINOS.forEach(letra => {
        const el = document.getElementById(`count-${letra}`);
        if (el) el.innerText = contadores[letra];
    });
}

function editarDia(data) {
    const novo = prompt(`Treino para ${data} (A, B, C, D, E ou vazio):`, historico[data] || "");
    if (novo !== null) {
        if (novo.trim() === "") delete historico[data];
        else historico[data] = novo.toUpperCase();
        salvar('historico', historico);
        montarCalendario();
    }
}

function resetarMes() {
    if (confirm("Apagar registros do mês atual?")) {
        const prefixo = `${dataVisualizacao.getFullYear()}-${String(dataVisualizacao.getMonth() + 1).padStart(2, '0')}`;
        Object.keys(historico).forEach(d => { if(d.startsWith(prefixo)) delete historico[d]; });
        salvar('historico', historico);
        montarCalendario();
    }
}

window.onload = () => {
    const salva = carregar('qtd_treinos', 5);
    if(document.getElementById('select-qtd')) document.getElementById('select-qtd').value = salva;
    aplicarQuantidade(salva);
    showScreen('dia'); // Define o treino do dia como tela inicial
};
