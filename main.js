import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";
import { history } from './component/trainingData.js';
import { generationConfig, safetySettings } from './component/botConfig.js';
import { autoScrollHistory } from "./component/autoScroll.js";

// Initialize the model
const genAI = new GoogleGenerativeAI(`${import.meta.env.VITE_API_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro", generationConfig, safetySettings });

const API_ENDPOINTS = {
  get: import.meta.env.VITE_API_GSHEET_GET,
  post: import.meta.env.VITE_API_GSHEET_POST,
  put: import.meta.env.VITE_API_GSHEET_PUT
};

// Variable global para almacenar datos del spreadsheet
let sheetData = null;
// Inicializa markdown-it con la opción linkify habilitada
const mdParser = new md({
  linkify: true,  // Autoconvierte URL-like text a enlaces
  html: true      // Permite HTML en el output
});





// Function para sincronizar la hoja de calculoa l cargar el BOT - (START)
async function loadDataOnStart() {
  await sheetGet();
  // Luego de cargar los datos, muestra un mensaje en el chat
  displayChatMessage("El Documento de Google Sheet se ha sincronizado con éxito!");
}
// Llama a loadDataOnStart cuando la página se cargue completamente
window.onload = loadDataOnStart;
function displayChatMessage(message) {
  const chatArea = document.getElementById("chat-container");
  chatArea.innerHTML += aiDiv(message);
}
// Function para sincronizar la hoja de calculoa l cargar el BOT - (END)

// Function para solicitudes con endpoint GET - (START)
async function sheetGet() {
  const endpointUrl = API_ENDPOINTS.get;

  try {
      const response = await fetch(endpointUrl);
      if (!response.ok) {
          console.error('Failed to fetch data:', response.status);
          sheetData = null;
          return;
      }
      sheetData = await response.json();
      console.log('Data fetched successfully:', sheetData);
  } catch (error) {
      console.error('Error fetching data from the spreadsheet:', error);
      sheetData = null;
  }
}
// F
// Function para solicitudes con endpoint GET - (END)


// Function para solicitudes con endpoint POST - (START)
async function sheetPost(data) {
  // Validación de datos
  function validateData(data) {
    let errors = [];
    if (!data.Numero) { // Asegúrate de que 'Numero' está presente
      errors.push("El campo 'Numero' es obligatorio.");
    }
    return errors;
  }

  const validationErrors = validateData(data);
  if (validationErrors.length > 0) {
    return `Error de validación: ${validationErrors.join(" ")}`;
  }

  // Creando la cadena de consulta a partir de los datos
  const queryParams = new URLSearchParams(data).toString();

  try {
    const response = await fetch(`${API_ENDPOINTS.post}?${queryParams}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} details: ${result.message || 'Unknown error'}`);
    }

    console.log("Datos enviados con éxito, respuesta del servidor:", result); // Log de la respuesta del servidor

    // Sincronizar nuevamente la hoja de cálculo
    await sheetGet();

  } catch (error) {
    console.error('Error al enviar los datos:', error);
    return `Error al enviar los datos: ${error.message}`;
  }
}
// Function para solicitudes con endpoint POST - (END)



// GET RESPONSE - (START)
async function getResponse(prompt) {
  const chat = await model.startChat({ history: history });
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const text = response.text();

  console.log("AI Response Text:", text); // Continúa con el log para ver la respuesta.

  // Utiliza una detección más precisa del comando "/añadir"
  if (text.toLowerCase().includes("/añadir") && text.match(/número:\s*\d+/i)) {
    const data = parseAddCommand(text);
    if (data.error) {
      return data.error;  // Muestra mensaje de error si no se extraen correctamente los datos
    }
    return await sheetPost(data);  // Llama a sheetPost si se extraen correctamente
  } else if (text.toLowerCase().includes("/mensajes")) {
    return await handleMessagesCommand();
  } else if (text.toLowerCase().includes("/buscar")) {
    const searchTerm = text.split("/buscar")[1].trim();
    const searchResults = searchInSheetData(searchTerm);
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


// Parseo para los parámetros de POST - (START)
function parseAddCommand(response) {
  console.log("Parsing response for /añadir command:", response); // Log para depuración
  const numberPattern = /Número:\s*\**\s*([^\n\r\*]*)\**/i;
  const messagePattern = /Mensaje:\s*\**\s*([^\n\r\*]*)\**/i;

  const numero = (response.match(numberPattern) || [])[1]?.trim();
  const mensaje = (response.match(messagePattern) || [])[1]?.trim();

  let data = {
    Numero: numero,
    Mensaje: mensaje,
    error: null
  };

  if (!numero) { // Verifica si el campo número está presente
    data.error = "El número es un detalle requerido y está faltando.";
    return data;
  }

  return data; // Retorna el objeto data con la información extraída
}
// Parseo para los parámetros de POST - (END)



// Función para manejar el comando /Mensajes
async function handleMessagesCommand() {
  await sheetGet();
  if (sheetData && sheetData.length > 0) {
      const formattedResults = sheetData.map(entry => `Número: ${entry.Numero}, Mensaje: ${entry.Mensaje}`).join("\n");
      return `Aquí están tus mensajes:\n${formattedResults}`;
  } else {
      return "No se encontraron mensajes.";
  }
}

// Función para manejar el comando /Buscar
function searchInSheetData(searchTerm) {
  const results = [];
  // Asegúrate de que sheetData no está vacío y searchTerm no es nulo
  if (sheetData && searchTerm) {
    sheetData.forEach(entry => {
      // Busca en cada campo del objeto
      Object.values(entry).forEach(value => {
        if (value.toString().toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push(entry);
        }
      });
    });
  }
  return results;
}


// handleSubmit function
async function handleSubmit(event) {
  event.preventDefault();

  let userMessage = document.getElementById("prompt");
  const chatArea = document.getElementById("chat-container", "history-chat-div");

  var prompt = userMessage.value.trim();
  if (prompt === "") {
    return;
  }

  console.log("usermessage", prompt);

  chatArea.innerHTML += userDiv(prompt);
  userMessage.value = "";
  const aiResponse = await getResponse(prompt);
  let md_text = md().render(aiResponse);
  chatArea.innerHTML += aiDiv(md_text);

  let newUserRole = {
    role: "user",
    parts: prompt,
  };
  let newAIRole = {
    role: "model",
    parts: aiResponse,
  };

  history.push(newUserRole);
  history.push(newAIRole);
  console.log(history);

  // Llama la Function de autoScroll desde /component
  autoScrollHistory();
}

const chatForm = document.getElementById("chat-form");
chatForm.addEventListener("submit", handleSubmit);

chatForm.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) handleSubmit(event);
});



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
            ${mdParser.render(data)}
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
            ${mdParser.render(data)}
            </pre>
            <img
              src="roar_favicon.png"
              alt="roar icon"
              class="w-10 h-10 rounded-full"
            />
          </div>
  `;
};

