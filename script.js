

// Adiciona um evento que dispara toda vez que o usuário digita no campo de CEP
document.getElementById('cepInput').addEventListener('input', function(e) {
    // Remove todos os caracteres que não são números
    let value = e.target.value.replace(/\D/g, '');
    
    // Se tiver mais de 5 dígitos, adiciona o hífen automaticamente
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    e.target.value = value;
});

// ===== VERIFICAÇÃO COM TECLA ENTER =====
document.getElementById('cepInput').addEventListener('keypress', function(e) {
    // Verifica se a tecla pressionada foi o Enter
    if (e.key === 'Enter') {
        checkCEP(); 
    }
});

// ===== FUNÇÃO PRINCIPAL - VERIFICAR CEP =====
// Esta é a função principal que consulta a API dos Correios
async function checkCEP() {
    const cepInput = document.getElementById('cepInput');
    const resultDiv = document.getElementById('result');
    const checkButton = document.getElementById('checkButton');
    
    // Remove a formatação do CEP (tira o hífen) para enviar à API
    const cep = cepInput.value.replace(/\D/g, '');

    // ===== VALIDAÇÃO =====
    // Verifica se o CEP tem exatamente 8 dígitos
    if (cep.length !== 8) {
        showResult('error', 'CEP Inválido', 'Por favor, digite um CEP válido com 8 dígitos.');
        return; // Interrompe a execução se o CEP for inválido
    }

    // ===== ESTADO DE LOADING =====
    // Desabilita o botão para evitar múltiplos cliques
    checkButton.disabled = true;
    // Muda o texto do botão e adiciona um spinner animado
    checkButton.innerHTML = 'Verificando<span class="spinner"></span>';
    // Esconde resultados anteriores
    resultDiv.style.display = 'none';

    // ===== CONSULTA À API =====
    try {
        // Faz a requisição para a API ViaCEP
        // await pausa a execução até a resposta chegar
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        
        // Converte a resposta para JSON
        const data = await response.json();

        // ===== PROCESSAMENTO DA RESPOSTA =====
        // Verifica se a API retornou erro (CEP não existe)
        if (data.erro) {
            showResult('error', 'CEP não encontrado', 'O CEP informado não foi encontrado na base dos Correios.');
        } else {
            // ===== VERIFICAÇÃO DE ÁREA DE ATENDIMENTO =====
            // Verifica se o estado (UF) é São Paulo
            const isAtendido = data.uf === 'SP';
            
            // Monta o HTML com as informações do endereço
            const addressInfo = `
                <div class="address-info">
                    <strong>Endereço encontrado:</strong><br>
                    ${data.logradouro || 'N/A'}<br>
                    ${data.bairro || 'N/A'} - ${data.localidade}/${data.uf}<br>
                    CEP: ${data.cep}
                </div>
            `;

            // ===== EXIBIÇÃO DO RESULTADO =====
            // Se for de São Paulo, mostra mensagem de sucesso
            if (isAtendido) {
                showResult(
                    'success', // Tipo: sucesso (verde)
                    '✓ Ótima notícia!', // Título
                    `Atendemos sua região! Entre em contato conosco para começar seu projeto.${addressInfo}` // Mensagem
                );
            } else {
                // Se não for de SP, mostra mensagem informativa
                showResult(
                    'info', // Tipo: informação (amarelo)
                    'Região não atendida', // Título
                    `No momento atendemos apenas o estado de São Paulo. Sua região: ${data.localidade}/${data.uf}.${addressInfo}<br><br>Entre em contato conosco para projetos especiais!` // Mensagem
                );
            }
        }
    } catch (error) {
        // ===== TRATAMENTO DE ERROS =====
        // Se houver erro na requisição (sem internet, API fora do ar, etc)
        showResult('error', 'Erro na consulta', 'Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.');
    } finally {
        // ===== RESTAURAÇÃO DO BOTÃO =====
        // Este bloco SEMPRE executa, com erro ou sucesso
        // Reabilita o botão
        checkButton.disabled = false;
        // Volta o texto original do botão
        checkButton.textContent = 'Verificar';
    }
}

// ===== FUNÇÃO AUXILIAR - EXIBIR RESULTADO =====
// Esta função cuida da exibição visual dos resultados
function showResult(type, title, message) {
    // Obtém o elemento onde o resultado será exibido
    const resultDiv = document.getElementById('result');
    
    // Define as classes CSS baseado no tipo (success, error, info)
    // Isso muda as cores e estilos do resultado
    resultDiv.className = `result ${type}`;
    
    // Monta o HTML interno com título e mensagem
    resultDiv.innerHTML = `
        <div class="result-title">${title}</div>
        <div>${message}</div>
    `;
    
    // Torna o resultado visível
    resultDiv.style.display = 'block';
}

// ===== SMOOTH SCROLL PARA NAVEGAÇÃO =====
// Adiciona rolagem suave quando clicar nos links do menu
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Para cada link que começa com #
    anchor.addEventListener('click', function (e) {
        // Previne o comportamento padrão (pular direto para a seção)
        e.preventDefault();
        
        // Encontra o elemento alvo usando o href do link
        const target = document.querySelector(this.getAttribute('href'));
        
        // Se o elemento existe na página
        if (target) {
            // Rola suavemente até ele
            target.scrollIntoView({
                behavior: 'smooth', // Rolagem suave
                block: 'start' // Alinha no topo da viewport
            });
        }
    });
});