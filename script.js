const API_BASE = 'http://localhost:5000'; // Altere conforme necessário

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
      document.getElementById('oi-velocidade').textContent = `VEL ${data.download.toFixed(2)} Mbps`;
      document.getElementById('embrasnet-velocidade').textContent = `VEL ${data.upload.toFixed(2)} Mbps`;
    })
    .catch(error => console.error('Erro ao obter conectividade:', error));
}

// Função para atualizar processos em execução
function atualizarProcessos() {
  fetch(`${API_BASE}/process`)
    .then(response => response.json())
    .then(data => {
      const processList = document.getElementById('process-list');
      processList.innerHTML = '';

      const processos = [
        { nome: 'MONI SERVE', ativo: data.process },
        { nome: 'MONI MOBILE', ativo: true },
        { nome: 'MONI GPRS', ativo: false },
        { nome: 'MONI TRACKER', ativo: true },
        { nome: 'MONI SEARCH', ativo: false },
        { nome: 'Intelbras (ESP32)', ativo: true }
      ];

      processos.forEach(proc => {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2';

        const statusDot = document.createElement('div');
        statusDot.className = `w-4 h-4 rounded-full ${proc.ativo ? 'bg-green-500 icon-piscar-green' : 'bg-red-500 icon-piscar-red'}`;
        div.appendChild(statusDot);

        const span = document.createElement('span');
        span.textContent = proc.nome;
        div.appendChild(span);

        processList.appendChild(div);
      });
    })
    .catch(error => console.error('Erro ao obter processos:', error));
}

// Função para atualizar status dos backups
function atualizarBackups() {
  fetch(`${API_BASE}/backups`)
    .then(response => response.json())
    .then(data => {
      const backupList = document.getElementById('backup-list');
      backupList.innerHTML = '';

      const backups = data.origem_vs_local;
      for (const [nome, status] of Object.entries(backups)) {
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
