// Función para hacer scroll automático al último mensaje del usuario
function autoScrollHistory() {
  // Obtener el contenedor del historial
  const chatbox = document.getElementById("history-chat-div");

  // Asegurarse de que el contenedor esté disponible
  if (!chatbox) {
    console.error("Elemento 'history-chat-div' no encontrado");
    return;
  }

  // Obtener el header del chat para calcular su altura
  const headerChat = document.querySelector(".headerChat");
  const headerHeight = headerChat ? headerChat.offsetHeight : 0;

  // Obtener todos los mensajes del usuario usando la clase `userChat`
  const userMessages = chatbox.getElementsByClassName("userChat");  // Asegúrate de que la clase esté correctamente escrita
  console.log("autoScroll Activado, Mensajes encontrados N°:",userMessages.length);

  // Continuar solo si hay mensajes del usuario disponibles
  if (userMessages.length > 0) {
    // Obtener el último mensaje del usuario
    const lastUserMessage = userMessages[userMessages.length - 1];

    // Desplazar al comienzo del último mensaje del usuario con efecto suave
    chatbox.scrollTo({
      top: lastUserMessage.offsetTop - headerHeight,  // Ajuste para la altura del header
      behavior: 'smooth'
    });
  }
}
export {autoScrollHistory};
