import moment from 'moment-timezone';
// Variable global para almacenar datos de la hoja de calculo
let sheetData = null;
// API GET y POST (variables de entorno)
const API_ENDPOINTS = {
    get: import.meta.env.VITE_API_GSHEET_GET,
    post: import.meta.env.VITE_API_GSHEET_POST,
};




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






// *****PARSEO DE PARAMETROS POST Y COMANDOS: /MENSAJES /BUSCAR*****

// Parseo para los parámetros de POST - (START)
function parsePostData(response) {
    const numberPattern = /Número:\s*\**\s*([^\n\r\*]*)\**/i;
    const messagePattern = /Mensaje:\s*\**\s*([^\n\r\*]*)\**/i;
    const horaPattern = /Hora:\s*\**\s*((?:\d{1,2}:\d{2})(?:\s*AM|PM)?)\**/i;
    const fechaPattern = /Fecha:\s*\**\s*(\d{2}\/\d{2}\/\d{4})\**/i;

    const numero = (response.match(numberPattern) || [])[1]?.trim();
    const mensaje = (response.match(messagePattern) || [])[1]?.trim();
    let hora = (response.match(horaPattern) || [])[1]?.trim();
    let fecha = (response.match(fechaPattern) || [])[1]?.trim();

    console.log("Extracted Fecha:", fecha);
    console.log("Extracted Hora:", hora);

    // Convertir fecha y hora a la zona horaria de México
    let fechaHora = moment.tz(`${fecha} ${hora}`, "DD/MM/YYYY HH:mm", "America/Mexico_City");
    if (!fechaHora.isValid()) {
        console.error("Invalid date or time provided:", fecha, hora);
        return { error: "Fecha u hora inválida proporcionada." };
    }

    fecha = fechaHora.format("DD/MM/YYYY");
    hora = fechaHora.format("HH:mm");

    console.log("Fecha convertida:", fecha);
    console.log("Hora convertida:", hora);

    let data = {
        Numero: numero,
        Mensaje: mensaje,
        Hora: hora,
        Fecha: fecha,
        error: null
    };

    if (!numero) {
        data.error = "El número es un detalle requerido y está faltando.";
        return data;
    }

    return data; // Retorna el objeto data con la información extraída
}
// Parseo para los parámetros de POST - (END)


// Función para manejar el comando /Mensajes (START)
async function verMensajes() {
    await sheetGet();
    if (sheetData && sheetData.length > 0) {
        const formattedResults = sheetData.map(entry => `Número: ${entry.Numero}, Mensaje: ${entry.Mensaje}`).join("\n\n");
        return `Aquí están tus mensajes:\n${formattedResults}`;
    } else {
        return "No se encontraron mensajes.";
    }
}
// Función para manejar el comando /Mensajes (END)


// Función para manejar el comando /Buscar (START)
function buscar(searchTerm) {
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
  // Función para manejar el comando /Buscar (END)


export { sheetGet, sheetPost, parsePostData, verMensajes, buscar };