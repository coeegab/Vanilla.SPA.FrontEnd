// Define uma string contendo uma opção vazia para um dropdown.
var ownerOptions = '<option value="">-- Selecione --</option>';

// Define uma função chamada myHome.
function myHome() {
    // Chama a função changeTitle com o argumento 'Novo Documento'.
    changeTitle('Novo Documento');
    
    // Chama a função getOwnersToSelect.
    getOwnersToSelect();
    
    // Verifica se sessionStorage.openTab é indefinido; se verdadeiro, define-o como 'item'.
    if (sessionStorage.openTab == undefined)
        sessionStorage.openTab = 'item'
    
    // Chama a função showTab com o argumento de sessionStorage.openTab.
    showTab(sessionStorage.openTab);
    
    // Configura um manipulador de eventos de clique para o botão com o id 'btnNewOwner' para mostrar a guia 'owner'.
    $('#btnNewOwner').click(() => { showTab('owner') });
    
    // Configura um manipulador de eventos de clique para o botão com o id 'btnNewItem' para mostrar a guia 'item'.
    $('#btnNewItem').click(() => { showTab('item'); });
    
    // Configura um manipulador de eventos de envio para formulários dentro de elementos com a classe 'tabs', chamando a função sendData.
    $('.tabs form').submit(sendData);
}

// Define uma função chamada sendData, recebendo um parâmetro de evento.
function sendData(ev) {
    // Impede o comportamento padrão de envio do formulário.
    ev.preventDefault();

    // Cria um objeto vazio formJSON para armazenar os dados do formulário.
    var formJSON = {};
    
    // Cria um objeto FormData a partir do elemento de formulário no evento.
    const formData = new FormData(ev.target);
    
    // Itera sobre os dados do formulário, preenche o formJSON e atualiza os valores dos inputs correspondentes.
    formData.forEach((value, key) => {
        formJSON[key] = stripTags(value);
        $('#' + key).val(formJSON[key]);
    });

    // Verifica por valores vazios em formJSON; se encontrado, retorna falso.
    for (const key in formJSON)
        if (formJSON[key] == '')
            return false;

    // Chama a função saveData com formJSON como argumento.
    saveData(formJSON);
    
    // Retorna falso para evitar o comportamento padrão de envio do formulário.
    return false;
}

// Define uma função chamada saveData, recebendo formJSON como parâmetro.
function saveData(formJSON) {
    // Constrói uma URL de requisição com base na URL base da API da aplicação e no tipo de formJSON.
    requestURL = `${app.apiBaseURL}/${formJSON.type}s`;
    
    // Remove a propriedade 'type' de formJSON.
    delete formJSON.type;

    // Ajusta o nome da propriedade se 'ownerName' ou 'itemName' estiver presente em formJSON.
    if (formJSON.ownerName != undefined) {
        formJSON['name'] = formJSON.ownerName;
        delete formJSON.ownerName;
    }

    if (formJSON.itemName != undefined) {
        formJSON['name'] = formJSON.itemName;
        delete formJSON.itemName;
    }

    // Usa o AJAX do jQuery para fazer uma requisição POST para a URL construída.
    $.ajax({
        type: "POST",
        url: requestURL,
        data: JSON.stringify(formJSON),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    })
        .done(() => {
            // Se bem-sucedido, atualiza viewHTML com uma mensagem de sucesso.
            viewHTML = `
                <form>
                    <h3>Oba!</h3>
                    <p>Cadastro efetuado com sucesso.</p>
                    <p>Obrigado...</p>
                </form>
            `;
        })
        .fail((error) => { // Se falhar, atualiza viewHTML com uma mensagem de erro.
            console.error('Erro:', error.status, error.statusText, error.responseJSON);
            viewHTML = `
                <form>
                    <h3>Oooops!</h3>
                    <p>Não foi possível realizar o cadastro. Ocorreu uma falha no servidor.</p>
                </form>
            `;
        })
        .always(() => {
            // Atualiza o conteúdo dos elementos com a classe 'tabBlock' com viewHTML.
            $('.tabBlock').html(viewHTML);
            // Reseta os formulários com os ids 'formNewOwner' e 'formNewItem'.
            $('#formNewOwner').trigger('reset');
            $('#formNewItem').trigger('reset');
        });

    // Retorna falso para evitar o comportamento padrão de envio do formulário.
    return false;
}

// Define uma função chamada showTab com um parâmetro tabName.
function showTab(tabName) {
    // Reseta os formulários com os ids 'formNewOwner' e 'formNewItem'.
    $('#formNewOwner').trigger('reset');
    $('#formNewItem').trigger('reset');

    // Declaração switch com base no valor de tabName.
    switch (tabName) {
        // Se tabName for 'owner', mostra 'tabOwner', esconde 'tabItem' e atualiza as classes dos botões e sessionStorage.
        case 'owner':
            $('#tabOwner').show();
            $('#tabItem').hide();
            $('#btnNewOwner').attr('class', 'active');
            $('#btnNewItem').attr('class', 'inactive');
            sessionStorage.openTab = 'owner';
            break;
        // Se tabName for 'item', mostra 'tabItem', esconde 'tabOwner' e atualiza as classes dos botões.
        case 'item':
            $('#tabItem').show();
            $('#tabOwner').hide();
            $('#btnNewItem').attr('class', 'active');
            $('#btnNewOwner').attr('class', 'inactive');
            break;
    }
}

// Define uma função chamada getOwnersToSelect.
function getOwnersToSelect() {
    // Constrói uma URL de requisição para owners com base na URL base da API da aplicação.
    requestURL = `${app.apiBaseURL}/owners`;

    // Usa o GET do jQuery para buscar dados da URL construída.
    $.get(requestURL)
        .done((apiData) => {
            // Se bem-sucedido, itera sobre os dados para popular ownerOptions e atualiza o conteúdo do dropdown.
            apiData.forEach((item) => {
                ownerOptions += `<option value="${item.id}">${item.id} - ${item.name}</option>`;
            });

            $('#owner').html(ownerOptions);
        })
        .fail((error) => {
            // Se falhar, registra uma mensagem de erro.
            console.error('Erro:', error.status, error.statusText, error.responseJSON);
        });
}

// Configura um manipulador de evento ready do documento, chamando a função myHome.
$(document).ready(myHome);
