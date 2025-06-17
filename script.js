// Define a base da API que será utilizada nas requisições
const API_BASE = 'http://127.0.0.1:8080'; // Altere conforme necessário

// Função para atualizar informações de CPU, RAM e Disco
function atualizarRecursos() {
  fetch(`${API_BASE}/recursos`)
    .then(response => response.json())
    .then(data => {
      // CPU
      const cpuPercent = parseFloat(data.cpu.match(/[\d.]+/)[0]); // Extrai o valor percentual numérico da CPU
      document.getElementById('cpu-usage').textContent = data.cpu; // Exibe o texto de uso da CPU
      document.getElementById('cpu-bar').style.width = `${cpuPercent}%`; // Atualiza a barra de uso da CPU

      // RAM
      const ramMatch = data.ram.match(/([\d.]+) GB \/ ([\d.]+) GB \(([\d.]+)%\)/); // Extrai dados de uso da RAM
      const ramUsed = ramMatch[1];
      const ramTotal = ramMatch[2];
      const ramPercent = ramMatch[3];
      document.getElementById('ram-usage').textContent = `${ramUsed}/${ramTotal} RAM`; // Exibe uso da RAM
      document.getElementById('ram-bar').style.width = `${ramPercent}%`; // Atualiza a barra de RAM

      // Disco
      const diskMatch = data.disk.match(/([\d.]+) GB \/ ([\d.]+) GB \(([\d.]+)%\)/); // Extrai dados do disco
      const diskPercent = diskMatch[3];
      document.getElementById('disk-usage').textContent = `${diskPercent}% HD`; // Exibe uso do disco
      document.getElementById('disk-bar').style.width = `${diskPercent}%`; // Atualiza a barra de disco
    })
    .catch(error => console.error('Erro ao obter recursos:', error)); // Captura erro
}

// Função para atualizar conectividade com a internet
function atualizarConectividade() {
  fetch(`${API_BASE}/internet`)
    .then(response => response.json())
    .then(data => {
      // Atualiza os elementos HTML com as informações de ping, jitter e perda de pacote
      document.getElementById('embrasnet-status').textContent = `Status: ${data.status}`;
      document.getElementById('embrasnet-ping').textContent = data.ping_ms !== null
        ? `Ping médio: ${data.ping_ms.toFixed(2)} ms`
        : 'Ping médio: N/A';
      document.getElementById('embrasnet-jitter').textContent = data.jitter_ms !== null
        ? `Jitter: ${data.jitter_ms.toFixed(2)} ms`
        : 'Jitter: N/A';
      document.getElementById('embrasnet-packet-loss').textContent = `Perda de pacotes: ${data.packet_loss_pct.toFixed(2)} %`;
    })
    .catch(error => {
      // Se der erro, mostra mensagem de erro no HTML
      console.error('Erro ao obter conectividade:', error);
      document.getElementById('embrasnet-status').textContent = 'Erro ao carregar status';
      document.getElementById('embrasnet-ping').textContent = '-';
      document.getElementById('embrasnet-jitter').textContent = '-';
      document.getElementById('embrasnet-packet-loss').textContent = '-';
    });
}

// Função para atualizar os processos em execução
function atualizarProcessos() {
  fetch(`${API_BASE}/process`)
    .then(response => response.json())
    .then(data => {
      const processList = document.getElementById('process-list');
      processList.innerHTML = ''; // Limpa a lista antes de atualizar

      // Nomes amigáveis para exibição
      const nomesExibicao = {
        "MoniIntegracao.exe": "MONI INT",
        "MoniERP.exe": "MONI ERP",
        "MoniServidor.exe": "MONI SERVER",
        "MoniGPRS.exe": "MONI GPRS",
        "MoniTarefas.exe": "MONI TAREFAS",
        "MoniMobile.exe": "MONI MOBILE",
        "DUC40.exe": "DUC"
      };

      // Cria os elementos da interface com base no status de cada processo
      for (const [nomeReal, ativo] of Object.entries(data)) {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2';

        // Indicador de status (bolinha colorida)
        const statusDot = document.createElement('div');
        statusDot.className = `w-4 h-4 rounded-full ${
          ativo ? 'bg-green-500 icon-piscar-green' : 'bg-red-500 icon-piscar-red'
        }`;
        div.appendChild(statusDot);

        // Nome do processo
        const span = document.createElement('span');
        span.textContent = nomesExibicao[nomeReal] || nomeReal;
        div.appendChild(span);

        processList.appendChild(div); // Adiciona à lista
      }
    })
    .catch(error => console.error('Erro ao obter processos:', error));
}

// Função para atualizar a lista de backups
function atualizarBackups() {
  fetch(`${API_BASE}/backups`)
    .then(response => response.json())
    .then(data => {
      const backupList = document.getElementById('backup-list');
      backupList.innerHTML = ''; // Limpa a lista

      const backups = data.origem_vs_local;
      const entries = Object.entries(backups); // Converte objeto em array

      // Itera e cria elementos para exibir o status de cada backup
      for (const [nome, status] of entries) {
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

// Função assíncrona para verificar status do DDNS
async function verificarDDNS() {
  try {
    const response = await fetch(`${API_BASE}/ddns`);
    const data = await response.json();
    const statusEl = document.getElementById("ddns-status");

    if (data.match === true) {
      statusEl.textContent = "ON";
      statusEl.classList.remove("bg-red-400");
      statusEl.classList.add("bg-green-400", "text-white");
    } else {
      statusEl.textContent = "OFF";
      statusEl.classList.remove("bg-green-400");
      statusEl.classList.add("bg-red-400", "text-white");
    }
  } catch (erro) {
    // Em caso de erro na requisição
    const statusEl = document.getElementById("ddns-status");
    statusEl.textContent = "Erro";
    statusEl.classList.remove("bg-green-400", "bg-red-400");
    statusEl.classList.add("bg-gray-400", "text-white");
    console.error("Erro ao verificar DDNS:", erro);
  }
}

// Função para verificar o status do dispositivo ESP32
function atualizarStatusESP() {
  fetch(`${API_BASE}/esp-status`)
    .then(response => {
      if (!response.ok) throw new Error('Erro na resposta da rede');
      return response.json();
    })
    .then(data => {
      const statusIndicator = document.getElementById('status-indicator');
      if (data === "True") {
        statusIndicator.innerHTML = '<span class="text-green-600">ONLINE</span>';
      } else if (data === "False") {
        statusIndicator.innerHTML = '<span class="text-red-600">OFFLINE</span>';
      } else {
        statusIndicator.innerHTML = '<span class="text-gray-600">INDEFINIDO</span>';
      }
    })
    .catch(error => {
      console.error('Erro ao buscar o status do ESP:', error);
      const statusIndicator = document.getElementById('status-indicator');
      statusIndicator.innerHTML = '<span class="text-red-600">ERRO</span>';
    });
}

// Função principal que chama todas as outras para atualizar os dados
function atualizarTudo() {
  atualizarRecursos();
  atualizarConectividade();
  atualizarProcessos();
  atualizarBackups();
  verificarDDNS();
  atualizarStatusESP();
}

// Quando a página carregar, executa a atualização e repete a cada 60 segundos
document.addEventListener('DOMContentLoaded', () => {
  atualizarTudo();
  setInterval(atualizarTudo, 60000); // Atualiza a cada 1 minuto
});
