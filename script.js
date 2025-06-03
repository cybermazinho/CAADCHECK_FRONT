const API_BASE = 'http://192.168.0.18:8080'; // Altere conforme necessário

// Função para atualizar recursos do sistema
function atualizarRecursos() {
  fetch(`${API_BASE}/recursos`)
    .then(response => response.json())
    .then(data => {
      // CPU
      const cpuPercent = parseFloat(data.cpu.match(/[\d.]+/)[0]);
      document.getElementById('cpu-usage').textContent = data.cpu;
      document.getElementById('cpu-bar').style.width = `${cpuPercent}%`;

      // RAM
      const ramMatch = data.ram.match(/([\d.]+) GB \/ ([\d.]+) GB \(([\d.]+)%\)/);
      const ramUsed = ramMatch[1];
      const ramTotal = ramMatch[2];
      const ramPercent = ramMatch[3];
      document.getElementById('ram-usage').textContent = `${ramUsed}/${ramTotal} RAM`;
      document.getElementById('ram-bar').style.width = `${ramPercent}%`;

      // Disco
      const diskMatch = data.disk.match(/([\d.]+) GB \/ ([\d.]+) GB \(([\d.]+)%\)/);
      const diskPercent = diskMatch[3];
      document.getElementById('disk-usage').textContent = `${diskPercent}% HD`;
      document.getElementById('disk-bar').style.width = `${diskPercent}%`;
    })
    .catch(error => console.error('Erro ao obter recursos:', error));
}

// Função para atualizar conectividade com a internet
function atualizarConectividade() {
  fetch(`${API_BASE}/internet`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('embrasnet-dow').textContent = `DOWNLOAD: ${data.download.toFixed(2)} Mbps`;
      document.getElementById('embrasnet-up').textContent = `UPLOAD: ${data.upload.toFixed(2)} Mbps`;
       document.getElementById('embrasnet-ip').textContent = `IP: ${data.local_ip} Mbps`;
        document.getElementById('embrasnet-ping').textContent = `PING: ${data.ping.toFixed(2)} Mbps`;
    })
    .catch(error => console.error('Erro ao obter conectividade:', error));
}

function atualizarProcessos() {
  fetch(`${API_BASE}/process`)
    .then(response => response.json())
    .then(data => {
      const processList = document.getElementById('process-list');
      processList.innerHTML = '';

      // Mapeamento do nome real para nome amigável (exibição)
      const nomesExibicao = {
        "MoniIntegracao.exe": "MONI INT",
        "MoniERP.exe": "MONI ERP",
        "MoniServidor.exe": "MONI SERVER",
        "MoniGPRS.exe": "MONI GPRS",
        "MoniTarefas.exe": "MONI TAREFAS",
        "MoniMobile.exe": "MONI MOBILE"
      };

      // Itera sobre o objeto retornado (nomeReal: ativo)
      for (const [nomeReal, ativo] of Object.entries(data)) {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2';

        const statusDot = document.createElement('div');
        statusDot.className = `w-4 h-4 rounded-full ${
          ativo ? 'bg-green-500 icon-piscar-green' : 'bg-red-500 icon-piscar-red'
        }`;
        div.appendChild(statusDot);

        const span = document.createElement('span');
        span.textContent = nomesExibicao[nomeReal] || nomeReal; // Usa nome amigável ou o real se não achar
        div.appendChild(span);

        processList.appendChild(div);
      }
    })
    .catch(error => console.error('Erro ao obter processos:', error));
}


function atualizarBackups() {
  fetch(`${API_BASE}/backups`)
    .then(response => response.json())
    .then(data => {
      const backupList = document.getElementById('backup-list');
      backupList.innerHTML = '';

      const backups = data.origem_vs_local;

      // Pega as entradas (nome, status) como array
      const entries = Object.entries(backups);

      // Pega os últimos 10 (se tiver menos que 10, pega todos)
      const ultimos10 = entries.slice(-7);

      // Cria os elementos para os últimos 10
      for (const [nome, status] of ultimos10) {
        const div = document.createElement('div');
        div.className = 'flex justify-between bg-white p-2 rounded shadow';
        div.textContent = nome;

        const span = document.createElement('span');
        span.textContent = status;
        div.appendChild(span);

        backupList.appendChild(div);
      }
    })
    .catch(error => console.error('Erro ao obter backups:', error));
}

// Função para atualizar todos os dados
function atualizarTudo() {
  atualizarRecursos();
  atualizarConectividade();
  atualizarProcessos();
  atualizarBackups();
}

// Atualiza os dados ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  atualizarTudo();
  // Atualiza os dados a cada 60 segundos
  setInterval(atualizarTudo, 60000);
});
