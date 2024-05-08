# Roar google sheet
Instalar las dependencias de ser necesario con "npm install" y luego levantar servidor local con "npm run dev"

Google Sheet conectada con este bot: https://docs.google.com/spreadsheets/d/1NzUo2G9RK4mO2FfOg8vSvXu7VTo0GtDRVZ-KggmANdI/edit#gid=0

#main.js
Aquí tienes un resumen conciso del flujo y funciones del código descrito:

1. **Inicialización del Modelo**:
   - Se crea una instancia del modelo `GoogleGenerativeAI` con una clave API, utilizando configuraciones específicas para el modelo `gemini-1.0-pro`.

2. **Carga de Datos al Iniciar**:
   - `loadDataOnStart()`: Carga automáticamente los datos de una hoja de cálculo de Google al cargar la página, utilizando `sheetGet()` para realizar la solicitud GET y manejar errores.

3. **Interacción del Usuario**:
   - `handleSubmit(event)`: Procesa la entrada del usuario, enviando y recibiendo mensajes del modelo de AI y mostrando los resultados en la interfaz.
   - `getResponse(prompt)`: Interpreta la respuesta del modelo y ejecuta comandos especiales como `/añadir`, `/buscar`, y `/mensajes` para interactuar con la hoja de cálculo.

4. **Manejo de Datos y Comandos Específicos**:
   - `sheetPost(data)`: Envía datos a la hoja de cálculo y valida la entrada antes de enviarla.
   - `parseAddCommand(response)`, `handleMessagesCommand()`, y `searchInSheetData(searchTerm)`: Extraen y manipulan datos según comandos específicos para agregar, mostrar o buscar información en la hoja de cálculo.

5. **Funciones de Ayuda para la UI**:
   - `displayChatMessage(message)`, `userDiv(data)`, `aiDiv(data)`: Manejan la presentación de mensajes en la interfaz del usuario, utilizando Markdown para el formateo.

Este flujo describe cómo el código facilita una interacción fluida con el chatbot y maneja dinámicamente los datos de una hoja de cálculo en línea, integrando funcionalidades específicas según las respuestas del modelo de AI.


#Component/autoScroll.js:
Resumen conciso de la función `autoScrollHistory`:

1. **Localización del Contenedor**: La función busca el contenedor de mensajes del chat por su ID `history-chat-div`.

2. **Comprobación de Existencia**: Si no se encuentra el contenedor, se muestra un error en la consola y se detiene la ejecución de la función.

3. **Manejo del Encabezado del Chat**: Se busca el encabezado del chat para determinar su altura, que se usa para ajustar el desplazamiento.

4. **Recopilación de Mensajes del Usuario**: Se obtienen todos los mensajes del usuario y se verifica cuántos hay.

5. **Desplazamiento Automático al Último Mensaje**: Si hay mensajes, la función desplaza automáticamente el contenedor para mostrar el último mensaje del usuario, ajustando la posición por la altura del encabezado, con un efecto de desplazamiento suave.

6. **Exportación de la Función**: La función se exporta para ser utilizada en otras partes del código si es necesario.

Esta función asegura que el usuario siempre tenga vista del último mensaje intercambiado en el chat, mejorando así la interacción en la interfaz.
