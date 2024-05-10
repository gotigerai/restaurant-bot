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
        console.log('Solicitud GET Exitosa:', sheetData);
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

        console.log("Solicitud POST Exitosa, datos enviados al servidor:", result); // Log de la respuesta del servidor

        // Sincronizar nuevamente la hoja de cálculo
        await sheetGet();

    } catch (error) {
        console.error('Error al enviar los datos:', error);
        return `Error al enviar los datos: ${error.message}`;
    }
}
// Function para solicitudes con endpoint POST - (END)






// *****PARSEO DE PARAMETROS POST Y COMANDOS: /MENSAJES /BUSCAR*****
function parsePostData(response) {
    const numberPattern = /Número:\s*(\d+)/i;
    const fechaPattern = /Fecha:\s*([\d\/]+)/i;
    // Ajuste para capturar la hora en formatos de 24 horas o con AM/PM
    const horaPattern = /Hora:\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*/i;
    const messagePattern = /Mensaje:\s*([\s\S]*?);/i;

    const numero = (response.match(numberPattern) || [])[1]?.trim();
    const fechaRaw = (response.match(fechaPattern) || [])[1]?.trim();
    const horaRaw = (response.match(horaPattern) || [])[1]?.trim();
    let mensaje = (response.match(messagePattern) || [])[1]?.trim();

    // Validación y formateo de la fecha
    let fecha = moment(fechaRaw, ["DD-MM-YYYY", "DD/MM/YYYY", "DD-MM-YY", "DD/MM/YY"], true);
    if (!fecha.isValid()) {
        console.error("Invalid date provided:", fechaRaw);
        return { error: "Fecha inválida." };
    }

    // Validación y formateo de la hora
    let hora = moment(horaRaw, ["h:mm A", "H:mm"], true);  // Formatos 12 y 24 horas
    if (!hora.isValid()) {
        console.error("Invalid time provided:", horaRaw);
        return { error: "Hora inválida." };
    }

    console.log("Extracted Numero:", numero);
    console.log("Extracted Mensaje:", mensaje);
    console.log("Extracted Fecha:", fecha.format("DD/MM/YYYY"));
    console.log("Extracted Hora:", hora.format("HH:mm"));  // Formato de 24 horas

    let data = {
        Numero: numero,
        Mensaje: mensaje,
        Hora: hora.format("HH:mm"),  // Usar formato de 24 horas
        Fecha: fecha.format("DD/MM/YYYY"),
        error: null
    };

    if (!numero) {
        data.error = "El número es un detalle requerido y está faltando.";
        return data;
    }
    if (!mensaje) {
        data.error = "Mensaje inválido o faltante";
        return data;
    }
    if (!fechaRaw) {
        data.error = "Fecha inválida o faltante";
        return data;
    }
    if (!horaRaw) {
        data.error = "Hora inválida o faltante";
        return data;
    }
    console.log("Parseo de DATA:", data);
    return data; // Retorna el objeto data con la información extraída del parseo (Numero, Mensaje, Hora, Fecha)
}





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