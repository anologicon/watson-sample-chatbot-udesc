const textInput = document.getElementById('textInput');
const chat = document.getElementById('chat');

let context = {};

var lembretes = [{}];

var lembreteAtual = 0;
var ultima = 0;
var cadastrandoLembrete = false;
var contexto = '';

const templateChatMessage = (message, from) => `
  <div class="from-${from}">
    <div class="message-inner">
      <p>${message}</p>
    </div>
  </div>
  `;

// Crate a Element and append to chat
const InsertTemplateInTheChat = (template) => {
  const div = document.createElement('div');
  div.innerHTML = template;

  chat.appendChild(div);

  document.getElementById('chat').scrollBy(0, 10000000000000)
};

// Calling server and get the watson output
const getWatsonMessageAndInsertTemplate = async (text = '') => {
  const uri = '/conversation/';

  const response = await (await fetch(uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      context,
    }),
  })).json();

  context = response.context;

  console.log(context);

  intent = response.intents[0];

  if (context.finalizado !== true) {
    cadastrandoLembrete = true
  } else {
    cadastrandoLembrete = false
  }

  if (intent) {
    contexto = intent.intent
  }

  var lembrete = lembretes[lembreteAtual];

  if (contexto == 'cadastrar-lembrete' ) {
    if (cadastrandoLembrete == true) {
      lembrete.data = context.data;
      lembrete.tipoLembrete = context.tipoLembrete;
      lembrete.time = context.time;

    } else {
      if (lembrete.descricao == undefined) {
        lembrete.descricao = context.descricao;
      }
      lembreteAtual++
      lembretes.push({});
      contexto = undefined;
    }
  }

  if (contexto == 'recuperar-lembrete') {

    var template = '';

    console.log(lembretes);
    lembretes.forEach((element) => {
      if(element.data !== undefined) {

        template += `- Você tem ${element.tipoLembrete} dia ${element.data} as ${element.time} sobre ${element.descricao} <br>`;
      }
    });

    const templateLI = templateChatMessage(template, 'watson');

    InsertTemplateInTheChat(templateLI);

    return true;
  }

  const templateNormal = templateChatMessage(response.output.text, 'watson');

  InsertTemplateInTheChat(templateNormal);
};

textInput.addEventListener('keydown', (event) => {
  if (event.keyCode === 13 && textInput.value) {
    // Send the user message
    getWatsonMessageAndInsertTemplate(textInput.value);

    const template = templateChatMessage(textInput.value, 'user');
    InsertTemplateInTheChat(template);

    // Clear input box for further messages
    textInput.value = '';
  }
});


getWatsonMessageAndInsertTemplate();
