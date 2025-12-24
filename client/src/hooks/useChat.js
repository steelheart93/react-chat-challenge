import { useEffect, useState } from "react";
import io from "socket.io-client";

// COMENTA O BORRA ESTO:
// const socket = io.connect('http://localhost:3001');

// PON ESTO (Sin la barra / al final):
const socket = io.connect("https://chat-server-react.onrender.com");

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    // Escuchar mensajes nuevos
    socket.on("receive_message", (data) => {
      // IMPORTANTE: Usar la función de callback de setMessages para asegurar
      // que siempre tenemos el estado anterior más reciente.
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cargar historial
    socket.on("load_history", (history) => {
      setMessages(history);
    });

    // Limpieza de eventos al desmontar
    return () => {
      socket.off("receive_message");
      socket.off("load_history");
    };
  }, []); // El array vacío asegura que esto solo se ejecute una vez al montar el hook

  const joinRoom = (user, roomName) => {
    if (user && roomName) {
      setUsername(user);
      setRoom(roomName);
      socket.emit("join_room", roomName);
      setIsJoined(true);
      // Limpiamos los mensajes al cambiar de sala para que no se mezclen
      setMessages([]);
    }
  };

  const sendMessage = (text) => {
    if (text.trim() && room && username) {
      const messageData = {
        room,
        user: username,
        text,
        time: new Date(), // Usar una fecha real
      };
      // Enviamos al servidor. El servidor lo retransmitirá y lo recibiremos en 'receive_message'
      socket.emit("send_message", messageData);
    }
  };

  return { messages, username, room, isJoined, joinRoom, sendMessage };
};
