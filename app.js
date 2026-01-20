let dadosTreinos = JSON.parse(localStorage.getItem('dadosTreinos')) || { A: [], B: [], C: [], D: [], E: [] };
let biblioteca = JSON.parse(localStorage.getItem('biblioteca')) || { "Geral": ["Flexão", "Prancha"] };
let historico = JSON.parse(localStorage.getItem('historico')) || {};
let mesVisualizacao = new Date();

// NAVEGAÇÃO
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'dia') carregarTreinoDia();
    if(id === 'biblioteca') renderizarBiblioteca();
    if(id === 'calendario') montarCalendario();
}

// BIBLIOTECA - CRIAÇÃO DE GRUPOS CORRIGIDA
function adicionarGrupo() {
    const input = document.getElementById('novo-grupo-input');
    const nome = input.value.trim();
    if(nome) {
        if(!biblioteca[nome]) {
            biblioteca[nome] = [];
            input.value = '';
            salvarBib();
            renderizarBiblioteca();
        } else { alert("Esse grupo já existe!"); }
    }
}

function adicionarExercicioGrupo(grupo) {
    const nome = prompt(`Novo exercício para ${grupo}:`);
    if(nome) {
        biblioteca[grupo].push(nome);
        salvarBib();
        renderizarBiblioteca();
    }
}

function renderizarBiblioteca() {
    const container = document.getElementById('lista-grupos');
    container.innerHTML = '';
    for(let grupo in biblioteca) {
        container.innerHTML += `
            <div class="config-box">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <strong style="color:var(--accent-color)">${grupo}</strong>
                    <button onclick="adicionarExercicioGrupo('${grupo}')" class="btn-acao" style="padding:2px 8px">+</button>
                </div>
                ${biblioteca[grupo].map(ex => `<div style="padding:8px 0; border-bottom:1px solid #222; font-size:14px;">${ex}</div>`).join('')}
            </div>`;
    }
}
function salvarBib() { localStorage.setItem('biblioteca', JSON.stringify(biblioteca)); }

// CALENDÁRIO CORRIGIDO
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
    mesTxt.innerText = new Date(ano, mes).toLocaleDateString('pt-BR', {month:'long', year:'numeric'});

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

    // Espaços vazios
    for(let i=0; i<primeiroDiaSemana; i++) grade.innerHTML += `<div></div>`;

    for(let d=1; d<=totalDiasMes; d++) {
        const dataStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const treinoFeito = historico[dataStr];
        const corBorda = treinoFeito ? `var(--color-${treinoFeito})` : '#333';
        
        grade.innerHTML += `
            <div class="calendar-day ${treinoFeito ? 'has-treino' : ''}" 
                 style="border: 2px solid ${corBorda}; color: ${treinoFeito ? corBorda : '#fff'}">
                ${d}
                ${treinoFeito ? `<small style="position:absolute; bottom:2px; font-size:7px;">${treinoFeito}</small>` : ''}
            </div>`;
    }
}

// VISUAIS E CORES
function mudarLayout(l) {
    document.body.classList.remove('layout-cards', 'layout-list', 'layout-glass');
    document.body.classList.add(l);
    localStorage.setItem('cfg_layout', l);
}

function mudarFonte(f) {
    document.body.classList.remove('font-modern', 'font-sport', 'font-tech');
    document.body.classList.add(f);
    localStorage.setItem('cfg_fonte', f);
}

function aplicarTemaManual() {
    const f = document.getElementById('cor-fundo').value;
    const d = document.getElementById('cor-destaque').value;
    document.documentElement.style.setProperty('--bg-color', f);
    document.documentElement.style.setProperty('--accent-color', d);
    localStorage.setItem('cfg_f', f); localStorage.setItem('cfg_d', d);
}

function atualizarCorTreino(l, c) {
    document.documentElement.style.setProperty(`--color-${l}`, c);
    let cores = JSON.parse(localStorage.getItem('cfg_cores_cal')) || {};
    cores[l] = c;
    localStorage.setItem('cfg_cores_cal', JSON.stringify(cores));
}

// TREINO DO DIA
function carregarTreinoDia() {
    let idx = parseInt(localStorage.getItem('idx_treino') || 0);
    let l = "ABCDE"[idx];
    document.getElementById('treino-atual-letra').innerText = l;
    let lista = document.getElementById('lista-dia');
    lista.innerHTML = '';
    const treinosValidos = dadosTreinos[l].filter(e => e.nome);
    
    if(treinosValidos.length === 0) {
        lista.innerHTML = `<p style="text-align:center; opacity:0.5;">Nenhum exercício configurado para o Treino ${l}. Vá na aba Treinos.</p>`;
        return;
    }

    treinosValidos.forEach((ex, i) => {
        lista.innerHTML += `
            <div class="lista-item">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${ex.nome}</strong>
                    <input type="checkbox" onchange="atualizarProgresso()" style="width:25px; height:25px;">
                </div>
                <small>${ex.peso}kg</small>
            </div>`;
    });
}

function atualizarProgresso() {
    const checks = document.querySelectorAll('#lista-dia input[type="checkbox"]');
    const marcados = Array.from(checks).filter(c => c.checked).length;
    const total = checks.length;
    const perc = Math.round((marcados / total) * 100);
    document.getElementById('progresso-dia').value = perc;
    document.getElementById('percentual').innerText = perc + "%";
    
    if(perc === 100) {
        setTimeout(() => {
            if(confirm("Treino finalizado! Salvar no histórico?")) {
                let h = new Date().toISOString().split('T')[0];
                let idx = parseInt(localStorage.getItem('idx_treino') || 0);
                historico[h] = "ABCDE"[idx];
                localStorage.setItem('historico', JSON.stringify(historico));
                localStorage.setItem('idx_treino', (idx + 1) % 5);
                showScreen('dia');
            }
        }, 500);
    }
}

// INICIALIZAÇÃO
window.onload = () => {
    if(localStorage.getItem('cfg_layout')) mudarLayout(localStorage.getItem('cfg_layout'));
    if(localStorage.getItem('cfg_fonte')) mudarFonte(localStorage.getItem('cfg_fonte'));
    if(localStorage.getItem('cfg_f')) {
        document.getElementById('cor-fundo').value = localStorage.getItem('cfg_f');
        document.getElementById('cor-destaque').value = localStorage.getItem('cfg_d');
        aplicarTemaManual();
    }
    const cores = JSON.parse(localStorage.getItem('cfg_cores_cal')) || {};
    Object.keys(cores).forEach(l => atualizarCorTreino(l, cores[l]));
    showScreen('dia');
};
