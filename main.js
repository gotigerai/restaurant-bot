import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";
import { history } from './component/trainingData.js';
import { generationConfig, safetySettings } from './component/botConfig.js';
import { autoScrollHistory } from "./component/autoScroll.js";
import { sheetGet, sheetPost, parsePostData, verMensajes, buscar } from "./component/GET_POST.js";
// Initialize the model (GEMINI AI v1.0 pro)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro", generationConfig, safetySettings });




// Llama a sincronizaHoja cuando la página se cargue completamente
window.onload = sincronizaHoja;
function mensajeDeCarga(message) {
  const chatArea = document.getElementById("chat-container");
  chatArea.innerHTML += aiDiv(message);
}

// Function para sincronizar la hoja de calculo al cargar el BOT
async function sincronizaHoja() {
  await sheetGet();
  // Luego de cargar los datos, muestra un mensaje en el chat
  mensajeDeCarga("<b>¡El Documento de Google Sheet se ha sincronizado con éxito!<b>");
}


// Carga Action Buttons cuando se abre el bot - (START)
document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.action-btn');
  buttons.forEach(button => {
    button.addEventListener('click', function () {
      sendTextButton(this.textContent.trim());
    });
  });
});

function sendTextButton(message) {
  const chatArea = document.getElementById("chat-container");
  const userDiv = `<div class="flex items-center gap-2 justify-start userChat">
      <img src="user.jpg" alt="user icon" class="w-10 h-10 rounded-full">
      <p class="bg-gemDeep text-white p-1 rounded-md shadow-md">${message}</p>
  </div>`;
  chatArea.innerHTML += userDiv;

  // Simula la entrada del usuario como si hubiera escrito el mensaje
  getResponse(message).then(aiResponse => {
    let md_text = md().render(aiResponse);
    chatArea.innerHTML += aiDiv(md_text);
    // Llama la Function de autoScroll desde /component
    autoScrollHistory();
  });
}
// Carga Action Buttons cuando se abre el bot - (END)


// GET RESPONSE - (START)
async function getResponse(prompt) {
  // Inicia conversacion con el MODELO AI
  const chat = await model.startChat({ history: history });
  // Envia mensaje del usuario (prompt) al MODELO AI
  const result = await chat.sendMessage(prompt);
  // Extrae la repuesta del MODELO AI en "const response"
  const response = await result.response;
  // Convierte la repuesta del MODELO AI en formato texto y la guarda en "const text"
  const text = response.text();

  console.log("AI BOT:", text); // Continúa con el log para ver la respuesta.


  if (text.toLowerCase().includes("/añadir") && text.match(/número:\s*\d+/i)) {
    console.log("comando añadir y numero detectado");
    const data = parsePostData(text);
    if (data.error) {
      return data.error;  // Muestra mensaje de error si no se extraen correctamente los datos
    }
    return await sheetPost(data);  // Llama a sheetPost si se extraen correctamente
  } else if (text.toLowerCase().includes("/mensajes")) {
    return await verMensajes();
  } else if (text.toLowerCase().includes("/buscar")) {
    const searchTerm = text.split("/buscar")[1].trim();
    const searchResults = buscar(searchTerm);
    if (searchResults.length > 0) {
      const formattedResults = searchResults.map(entry => JSON.stringify(entry)).join("\n");
      return `Resultados encontrados: \n${formattedResults}`;
    } else {
      return "No se encontraron resultados.";
    }
  }

  return text; // Devuelve la respuesta normal si no se activa ningún comando específico
}
// GET RESPONSE - (END)


// handleSubmit function
async function handleSubmit(event) {
  event.preventDefault();

  let userMessage = document.getElementById("prompt");
  const chatArea = document.getElementById("chat-container", "history-chat-div");

  var prompt = userMessage.value.trim();
  if (prompt === "") {
    return;
  }
  console.log("USUARIO:", prompt);

  chatArea.innerHTML += userDiv(prompt);
  userMessage.value = "";

  try {
    const aiResponse = await getResponse(prompt);  // Asumiendo que esto devuelve un objeto

    // Asegurarse de que la respuesta de la AI es una cadena
    let responseText = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);

    let md_text = md().render(responseText); // Renderiza como Markdown solo si es una cadena
    chatArea.innerHTML += aiDiv(md_text);

    let newUserRole = {
      role: "user",
      parts: prompt,
    };
    let newAIRole = {
      role: "model",
      parts: responseText,  // Asegurarse de pasar texto
    };

    history.push(newUserRole);
    history.push(newAIRole);
    console.log("Historial Actual:", history);

    // Llama la Function de autoScroll desde /component
    autoScrollHistory();
  } catch (error) {
    console.error("Error al procesar la respuesta:", error);
    // Considerar mostrar algún mensaje de error en el chat
    chatArea.innerHTML += userDiv("Error al procesar su mensaje, intente de nuevo.");
  }
}


const chatForm = document.getElementById("chat-form");
chatForm.addEventListener("submit", handleSubmit);

chatForm.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) handleSubmit(event);
}
);


// user chat div
export const userDiv = (data) => {
  return `
  <!-- User Chat -->
          <div class="flex items-center gap-2 justify-start userChat">
            <img
              src="user.jpg"
              alt="user icon"
              class="w-10 h-10 rounded-full"
            />
            <p class="bg-gemDeep text-white p-1 rounded-md shadow-md  ">
            ${(data)}
            </p>
          </div>
  `;
};
// AI Chat div
export const aiDiv = (data) => {
  return `
  <!-- AI Chat -->
          <div class="flex gap-2 justify-end aiChat">
            <pre class="bg-gemRegular/40 text-gemDeep p-1 rounded-md shadow-md whitespace-pre-wrap">
            ${(data)}
            </pre>
            <img
              src="roar_favicon.png"
              alt="roar icon"
              class="w-10 h-10 rounded-full"
            />
          </div>
  `;
};

