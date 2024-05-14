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
        // await sheetGet();

    } catch (error) {
        console.error('Error al enviar los datos:', error);
        return `Error al enviar los datos: ${error.message}`;
    }
}
// Function para solicitudes con endpoint POST - (END)


// Función para manejar el comando /Mensajes o mostrar los mensajes en el chat (START)
async function verMensajes() {
    await sheetGet();
    console.log("Activando la función verMensajes.");
    if (sheetData && sheetData.length > 0) {
        const formattedResults = sheetData.map(entry => `N°: **${entry.Numero}**, Fecha: **${entry.Fecha}**, Hora: **${entry.Hora}**, Mensaje: **${entry.Mensaje}**`).join("\n\n");
        return `Aquí están tus mensajes:\n${formattedResults}`;
    } else {
        return "No se encontraron mensajes.";
    }
}
// Función para manejar el comando /Mensajes (END)


export { sheetGet, sheetPost, verMensajes, sheetData };