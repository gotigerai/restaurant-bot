# Bot para restaurantes
Instalar las dependencias de ser necesario con "npm install" y luego levantar servidor local con "npm run dev" en la terminal

Google Sheet conectada con este bot: https://docs.google.com/spreadsheets/d/1y8ATp2f1LDu7T_bVFacn1S7Eab-wkF8e44Y4DXawIxo/edit#gid=0

Aquí tienes un resumen del flujo del proyecto Gemini AI, incluyendo los nombres específicos de las funciones utilizadas en cada paso del proceso:

1. **Inicialización**:
   - **`sincronizaHoja`** en `main.js`: Se ejecuta al cargar la página para sincronizar los datos con Google Sheets.

2. **Interacción Usuario-Bot**:
   - **`sendTextButton`** en `main.js`: Maneja las interacciones a través de botones.
   - **`getResponse`** en `main.js`: Procesa los mensajes del usuario, consultando al modelo de Gemini AI.

3. **Funcionalidades del Bot**:
   - **`verMensajes`**, **`buscar`**, y **`sheetPost`** en `GET_POST.js`: Estas funciones manejan la visualización de mensajes, la búsqueda de información y la actualización o adición de datos en Google Sheets.

4. **Respuesta y Visualización**:
   - **`aiDiv`** y **`userDiv`** en `main.js`: Formatean y agregan las respuestas y mensajes en el chat.

5. **Gestión de Eventos**:
   - **`handleSubmit`** en `main.js`: Gestiona la entrada de texto del usuario desde el formulario de chat.
   - **`autoScrollHistory`** en `autoScroll.js`: Asegura que el chat se desplace automáticamente hacia los mensajes más recientes después de cada entrada.