
# BrainBlitz Backend

## Producción

**Backend en producción:**
👉 [https://backend-v1-2nej.onrender.com](https://backend-v1-2nej.onrender.com)


## Descripción General

Este backend es la API y servidor en tiempo real para el juego de trivia multijugador BrainBlitz. Permite gestionar usuarios, partidas, preguntas y la generación de preguntas con IA. Está construido con Node.js, Express, Socket.io y Firebase, y es completamente agnóstico de frontend: cualquier aplicación web, móvil o de escritorio puede consumir sus endpoints y eventos de sockets.

**Requisitos previos:**
- Node.js >= 18
- Archivo `.env` con las variables necesarias (ver ejemplo abajo)
- Archivo `serviceAccountKey.json` de Firebase en la carpeta `backend/`

**Advertencia:**
El único entry point válido es `hybridServer.js`. No uses ni modifiques otros archivos de arranque.

---

---


## Características principales
- **API RESTful** para usuarios, partidas y preguntas.
- **Websockets (Socket.io)** para partidas en tiempo real.
- **Generación de preguntas con IA** (Groq/OpenAI, hasta 50 por petición).
- **Documentación Swagger** disponible en [`http://localhost:5000/api-docs`](http://localhost:5000/api-docs).
- **Autenticación Firebase**.

---

---


## Estructura de Carpetas y Archivos Clave

```
backend/
  controllers/    # Lógica de endpoints
  routes/         # Definición de rutas Express
  services/       # Lógica de negocio y utilidades
  swagger/        # Documentación OpenAPI (swagger.yaml)
  firebase.js     # Configuración de Firebase
  hybridServer.js # Servidor principal (Express + Socket.io)
  package.json    # Dependencias y scripts
  .env            # Variables de entorno (no se sube al repo)
  serviceAccountKey.json # Clave de servicio de Firebase (no se sube al repo)
```

---


## Endpoints REST principales

> **La documentación interactiva y completa está en `/api-docs`** (Swagger UI). Incluye ejemplos reales y todos los parámetros posibles.

### Usuarios
- `POST /api/users/register` — Registrar un nuevo usuario
- `POST /api/users/login` — (Referencia, login se maneja en frontend con Firebase)
- `POST /api/users/recover-password` — Recuperar contraseña
- `GET /api/users/me/stats?uid=...` — Obtener estadísticas del usuario (solo UID y stats)
- `GET /api/users/me/history` — (Deshabilitado, siempre devuelve [])


### Partidas
- `GET /api/games` — Listar partidas públicas
- (Websocket) `createGame`, `joinGame`, `startGame`, `submitAnswer` — Flujo en tiempo real


### Preguntas
- `GET /api/questions` — Listar todas las preguntas
- `POST /api/questions` — Crear una pregunta
- `POST /api/questions/bulk` — Crear varias preguntas
- `PUT /api/questions/{id}` — Actualizar pregunta
- `DELETE /api/questions/{id}` — Eliminar pregunta


### IA
- `POST /api/ai/generate-questions` — Generar preguntas con IA (máximo 50 por petición)
- `GET /api/ai/topics` — Temas disponibles
- `GET /api/ai/difficulty-levels` — Niveles de dificultad

---


## Uso desde cualquier frontend

- **REST:** Consume los endpoints con fetch, axios, etc. desde cualquier app.
- **Websockets:** Conéctate a `ws://<host>:5000` usando Socket.io para crear/join partidas y recibir eventos en tiempo real.
- **Autenticación:** Usa Firebase Auth en el frontend y pasa el token JWT en los endpoints que lo requieran.
- **Swagger:** Consulta `/api-docs` para ver y probar todos los endpoints.

---


## Ejemplo de flujo de juego (Websocket)
1. El usuario genera preguntas con IA (`POST /api/ai/generate-questions`).
2. Crea la partida vía socket (`createGame`), enviando las preguntas generadas.
3. Otros jugadores se unen (`joinGame`).
4. El host inicia la partida (`startGame`).
5. Los jugadores responden (`submitAnswer`).
6. El backend gestiona el avance y puntajes.

## Notas recientes
- El historial de partidas y los datos personales (email, nombre) han sido eliminados del perfil y de las respuestas de la API.
- El endpoint `/api/users/me/history` está deshabilitado y solo devuelve un array vacío.
- El endpoint `/api/users/me/stats` solo devuelve UID y estadísticas.

---


## Variables de entorno importantes

Ejemplo de `.env`:
```
PORT=5000
GROQ_API_KEY=tu_api_key_groq
GROQ_MODEL=llama-3.1-8b-instant
# OPENAI_API_KEY=tu_api_key_openai (opcional)
# OPENAI_MODEL=gpt-3.5-turbo (opcional)
# Configuración de Firebase: ver serviceAccountKey.json
```

---


## Cómo levantar el backend

1. Instala dependencias:
  ```bash
  npm install
  ```
2. Asegúrate de tener `.env` y `serviceAccountKey.json` en la carpeta `backend/`.
3. Inicia el servidor:
  ```bash
  npm start
  # o
  node hybridServer.js
  ```
4. Accede a la documentación interactiva en [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## Troubleshooting y recomendaciones

- Si Swagger UI no muestra todos los endpoints, revisa que `swagger.yaml` no tenga errores de sintaxis (usa https://editor.swagger.io/ para validar).
- Si tienes errores de claves duplicadas en YAML, revisa que no haya dos veces la misma clave en un objeto.
- Si la generación de preguntas IA falla, revisa tu API Key y el límite de cuota de Groq/OpenAI.
- El backend solo debe arrancarse con `hybridServer.js`.
- Si usas Firebase, asegúrate de que el archivo `serviceAccountKey.json` sea válido y corresponda a tu proyecto.

---

---


## Contacto y soporte

Para dudas o mejoras, revisa el código fuente o la documentación Swagger. El backend está listo para integrarse con cualquier frontend moderno.
Si encuentras errores, revisa primero la consola y la documentación Swagger antes de abrir un issue.
