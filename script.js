// =========================================================================
// CONFIGURAÇÕES GERAIS (Regras de Negócio)
// =========================================================================
const CONFIG = {
    storageKey: "@MogiAutoCenter:v4", // Atualizado para garantir limpeza de cache
    // Fechamento às 18h significa que o último serviço começa às 17h
    horariosSemana: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
    // Sábado fecha às 13h, último serviço começa às 12h
    horariosSabado: ["08:00", "09:00", "10:00", "11:00", "12:00"] 
};

// =========================================================================
// CAMADA DE DADOS (Persistência LocalStorage)
// =========================================================================
const Database = {
    getAll: () => {
        try { return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || []; } 
        catch (e) { return []; }
    },
    save: (agendamento) => {
        const dados = Database.getAll();
        agendamento.id = Date.now().toString(36);
        agendamento.status = 'Agendado';
        dados.push(agendamento);
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(dados));
    },
    updateStatus: (id, novoStatus) => {
        const dados = Database.getAll().map(item => item.id === id ? { ...item, status: novoStatus } : item);
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(dados));
    },
    delete: (id) => {
        const dados = Database.getAll().filter(item => item.id !== id);
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(dados));
    },
    getHorariosOcupados: (data) => {
        return Database.getAll()
            .filter(item => item.data === data && item.status !== 'Cancelado')
            .map(item => item.horario);
    }
};

// =========================================================================
// UTILITÁRIOS E FORMATAÇÕES (Helpers)
// =========================================================================
const Utils = {
    formatarDataBR: (dataISO) => dataISO ? dataISO.split('-').reverse().join('/') : '',
    
    mascaraTelefone: (evento) => {
        let v = evento.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        if (v.length > 8) v = v.replace(/(\d{5})(\d)/, '$1-$2');
        evento.target.value = v;
    },
    
    // Notificação inteligente com variação de cores (Sucesso ou Erro)
    mostrarNotificacao: (mensagem, tipo = 'sucesso') => {
        const div = document.createElement('div');
        const corBg = tipo === 'sucesso' ? 'bg-blue-700' : 'bg-red-600';
        const icone = tipo === 'sucesso' ? '✅' : '⚠️';
        
        div.className = `fixed top-5 right-5 px-6 py-4 rounded-xl shadow-2xl text-white font-bold transition-all duration-300 ${corBg} transform translate-y-0 opacity-100 z-50`;
        div.innerText = `${icone} ${mensagem}`;
        document.body.appendChild(div);
        
        setTimeout(() => {
            div.classList.add('opacity-0', '-translate-y-2');
            setTimeout(() => div.remove(), 300);
        }, 3500);
    }
};

// =========================================================================
// INICIALIZAÇÃO DA APLICAÇÃO (Controllers)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------------------------------
    // CONTROLLER: TELA DO CLIENTE
    // ---------------------------------------------------------
    const form = document.getElementById('formAgendamento');
    if (form) {
        const inputData = document.getElementById('inputData');
        const selectHorario = document.getElementById('selectHorario');
        const inputTelefone = document.getElementById('inputTelefone');
        const selectServico = document.getElementById('selectServico');

        // Impede de agendar no passado (Ajuste para fuso do Brasil)
        const hoje = new Date();
        const yyyy = hoje.getFullYear();
        const mm = String(hoje.getMonth() + 1).padStart(2, '0');
        const dd = String(hoje.getDate()).padStart(2, '0');
        const dataDeHojeISO = `${yyyy}-${mm}-${dd}`;
        inputData.min = dataDeHojeISO;

        inputTelefone.addEventListener('input', Utils.mascaraTelefone);

        // REGRA DE NEGÓCIO CORE: Validação de Dias e Horários Disponíveis
        inputData.addEventListener('change', (e) => {
            const dataEscolhida = e.target.value;
            
            if (!dataEscolhida) {
                selectHorario.disabled = true;
                selectHorario.innerHTML = '<option value="">Defina a data primeiro</option>';
                return;
            }

            // Correção de Timezone (Garante que a data lida é exatamente a clicada no Brasil)
            const dataObj = new Date(dataEscolhida + "T12:00:00");
            const diaDaSemana = dataObj.getDay(); // 0 = Domingo, 1 = Seg, 6 = Sáb

            // Regra 1: Domingos bloqueados
            if (diaDaSemana === 0) {
                selectHorario.disabled = true;
                selectHorario.innerHTML = '<option value="">Fechado aos Domingos</option>';
                Utils.mostrarNotificacao('A oficina não funciona aos domingos.', 'erro');
                inputData.value = ''; // Limpa o campo
                return;
            }

            selectHorario.disabled = false;
            selectHorario.innerHTML = '<option value="">Selecione o horário...</option>';
            
            // Regra 2: Carrega horários baseados no dia da semana
            const horariosDoDia = (diaDaSemana === 6) ? CONFIG.horariosSabado : CONFIG.horariosSemana;
            const ocupados = Database.getHorariosOcupados(dataEscolhida);
            
            // Regra 3 (Sênior): Bloquear horas do passado se o agendamento for para "hoje"
            const isHoje = dataEscolhida === dataDeHojeISO;
            const horaAtual = new Date().getHours();

            horariosDoDia.forEach(hora => {
                const horaInteira = parseInt(hora.split(':')[0]);
                const isOcupado = ocupados.includes(hora);
                const isPassado = isHoje && (horaInteira <= horaAtual);

                let disabled = '';
                let textoHora = hora;

                if (isOcupado) {
                    disabled = 'disabled';
                    textoHora = `${hora} (Esgotado)`;
                } else if (isPassado) {
                    disabled = 'disabled';
                    textoHora = `${hora} (Encerrado)`;
                }

                selectHorario.innerHTML += `<option value="${hora}" ${disabled}>${textoHora}</option>`;
            });
        });

        // Submit Form
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            Database.save({
                nome: document.getElementById('inputNome').value,
                telefone: inputTelefone.value,
                servico: selectServico.value,
                data: inputData.value,
                horario: selectHorario.value
            });
            Utils.mostrarNotificacao('Agendamento salvo com sucesso!');
            form.reset();
            selectHorario.disabled = true;
            selectHorario.innerHTML = '<option value="">Defina a data primeiro</option>';
        });
    }

    // ---------------------------------------------------------
    // CONTROLLER: TELA ADMIN (Oficina)
    // ---------------------------------------------------------
    const tabela = document.getElementById('tabelaAgendamentos');
    if (tabela) {
        const inputFiltro = document.getElementById('inputFiltroData');
        const btnLimpar = document.getElementById('btnLimparFiltro');
        const dashboardCards = document.getElementById('dashboardCards');

        window.renderizarTabela = () => {
            let dados = Database.getAll();
            
            const pendentes = dados.filter(d => d.status === 'Agendado' || d.status === 'Confirmado').length;
            const concluidos = dados.filter(d => d.status === 'Concluído').length;
            const cancelados = dados.filter(d => d.status === 'Cancelado').length;
            
            dashboardCards.innerHTML = `
                <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><p class="text-sm font-semibold text-gray-500">Total Geral</p><p class="text-3xl font-bold text-gray-900 mt-1">${dados.length}</p></div>
                <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><p class="text-sm font-semibold text-gray-500">No Pátio</p><p class="text-3xl font-bold text-blue-600 mt-1">${pendentes}</p></div>
                <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><p class="text-sm font-semibold text-gray-500">Concluídos</p><p class="text-3xl font-bold text-green-600 mt-1">${concluidos}</p></div>
                <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><p class="text-sm font-semibold text-gray-500">Cancelados</p><p class="text-3xl font-bold text-red-600 mt-1">${cancelados}</p></div>
            `;

            if (inputFiltro.value) {
                dados = dados.filter(item => item.data === inputFiltro.value);
                btnLimpar.classList.remove('hidden');
            } else {
                btnLimpar.classList.add('hidden');
            }

            dados.sort((a, b) => new Date(a.data) - new Date(b.data));
            tabela.innerHTML = '';

            if (dados.length === 0) {
                tabela.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-gray-500 font-medium border-b border-gray-100">Nenhum veículo encontrado no sistema.</td></tr>`;
                return;
            }

            dados.forEach(item => {
                let corStatus = 'bg-gray-100 text-gray-700';
                if(item.status === 'Confirmado') corStatus = 'bg-blue-100 text-blue-800 font-bold';
                if(item.status === 'Concluído') corStatus = 'bg-green-100 text-green-800 font-bold';
                if(item.status === 'Cancelado') corStatus = 'bg-red-100 text-red-800 font-bold';

                tabela.innerHTML += `
                    <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                        <td class="px-6 py-4">
                            <div class="font-bold text-gray-900">${item.nome}</div>
                            <div class="text-sm text-gray-500">${item.telefone}</div>
                        </td>
                        <td class="px-6 py-4 font-medium text-gray-800">${item.servico}</td>
                        <td class="px-6 py-4">
                            <div class="font-bold text-gray-900">${Utils.formatarDataBR(item.data)}</div>
                            <div class="text-sm text-gray-500">${item.horario}</div>
                        </td>
                        <td class="px-6 py-4">
                            <select onchange="window.mudarStatus('${item.id}', this.value)" 
                                class="text-sm py-1.5 px-3 rounded-lg border outline-none cursor-pointer ${corStatus} transition w-full">
                                <option value="Agendado" ${item.status === 'Agendado' ? 'selected' : ''}>Agendado</option>
                                <option value="Confirmado" ${item.status === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                                <option value="Concluído" ${item.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                                <option value="Cancelado" ${item.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                            </select>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <button onclick="window.deletarRegistro('${item.id}')" class="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition p-2 rounded-lg font-bold" title="Apagar">
                                X
                            </button>
                        </td>
                    </tr>
                `;
            });
        };

        window.mudarStatus = (id, novoStatus) => {
            Database.updateStatus(id, novoStatus);
            window.renderizarTabela();
        };

        window.deletarRegistro = (id) => {
            if(confirm("Confirma a exclusão deste agendamento?")) {
                Database.delete(id);
                window.renderizarTabela();
            }
        };

        inputFiltro.addEventListener('change', window.renderizarTabela);
        btnLimpar.addEventListener('click', () => {
            inputFiltro.value = '';
            window.renderizarTabela();
        });

        window.renderizarTabela();
    }
});