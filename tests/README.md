# 🧪 Guía Completa de Testing - BrainBlitz Backend

## 📋 Resumen Ejecutivo

Esta suite de pruebas cubre **TODAS** las 18 Historias de Usuario (HU19-HU36) del backend BrainBlitz. Incluye pruebas unitarias, de integración y manuales para garantizar la calidad y funcionalidad completa del sistema.

## 🎯 Cobertura de Historias de Usuario

### ✅ Usuarios (HU19-21)
- **HU19**: Registro de usuario - `tests/unit/controllers/usersController.test.js`
- **HU20**: Recuperación de contraseña - `tests/unit/controllers/usersController.test.js`
- **HU21**: Consulta de estadísticas - `tests/unit/controllers/usersController.test.js`

### ✅ Partidas (HU22-27)
- **HU22**: Listado de partidas públicas - `tests/unit/controllers/gamesController.test.js`
- **HU23**: Creación de partidas - `tests/integration/websockets/gameFlow.test.js`
- **HU24**: Unirse a partidas - `tests/integration/websockets/gameFlow.test.js`
- **HU25**: Inicio de partida - `tests/integration/websockets/gameFlow.test.js`
- **HU26**: Responder preguntas - `tests/integration/websockets/gameFlow.test.js`
- **HU27**: Resultados finales - `tests/integration/websockets/gameFlow.test.js`

### ✅ Preguntas (HU28-32)
- **HU28**: Listado de preguntas - `tests/unit/controllers/questionsController.test.js`
- **HU29**: Creación manual - `tests/unit/controllers/questionsController.test.js`
- **HU30**: Creación masiva - `tests/unit/controllers/questionsController.test.js`
- **HU31**: Actualización - `tests/unit/controllers/questionsController.test.js`
- **HU32**: Eliminación - `tests/unit/controllers/questionsController.test.js`

### ✅ IA (HU33-36)
- **HU33**: Generación de preguntas IA - `tests/unit/controllers/aiController.test.js`
- **HU34**: Consulta de temas IA - `tests/unit/controllers/aiController.test.js`
- **HU35**: Niveles de dificultad IA - `tests/unit/controllers/aiController.test.js`
- **HU36**: Preguntas IA para juego específico - `tests/unit/controllers/aiController.test.js`

## 🚀 Cómo Ejecutar las Pruebas

### 1. Instalación de Dependencias
```bash
npm install --save-dev jest supertest socket.io-client nock @types/jest
```

### 2. Comandos de Ejecución
```bash
# Todas las pruebas
npm test

# Con reporte de cobertura
npm run test:coverage

# Solo pruebas unitarias
npm run test:unit

# Solo pruebas de integración  
npm run test:integration

# Modo desarrollo (watch)
npm run test:watch
```

### 3. Configuración del Entorno
```bash
# Crear archivo .env.test (opcional)
cp .env .env.test

# Variables necesarias para testing
GROQ_API_KEY=test-key-for-mocking
NODE_ENV=test
```

## 📊 Métricas de Calidad Esperadas

- **Cobertura de Código**: >85%
- **Pruebas Unitarias**: 100% de controladores cubiertos
- **Pruebas de Integración**: Flujos completos de WebSocket y API
- **Tiempo de Ejecución**: <30 segundos para toda la suite

## 🔧 Estructura Detallada

### Pruebas Unitarias (`tests/unit/`)
```
controllers/
├── usersController.test.js      # HU19, HU20, HU21
├── questionsController.test.js  # HU28, HU29, HU30, HU31, HU32
├── aiController.test.js         # HU33, HU34, HU35, HU36
└── gamesController.test.js      # HU22
```

### Pruebas de Integración (`tests/integration/`)
```
websockets/
└── gameFlow.test.js            # HU23, HU24, HU25, HU26, HU27

api/
└── fullFlow.test.js            # Flujos completos end-to-end
```

### Pruebas Manuales (`tests/manual/`)
```
├── postman-collection.json     # Colección Postman completa
└── websocket-test.html         # Interfaz web para testing WebSockets
```

## 🎯 Casos de Prueba Críticos

### Casos de Éxito ✅
- Registro exitoso con datos válidos
- Generación de preguntas IA funcional
- Flujo completo de partida multijugador
- CRUD completo de preguntas
- Listado correcto de partidas públicas

### Casos de Error ❌
- Registro con email duplicado
- Generación IA sin API key
- Unirse a partida inexistente
- Crear preguntas sin autenticación
- Responder en partida no iniciada

### Casos Edge 🔄
- Múltiples usuarios simultáneos
- Timeouts de API externa
- Desconexiones durante partida
- Datos malformados
- Límites de preguntas excedidos

## 🛠️ Herramientas de Testing

### Automatizadas
- **Jest**: Framework principal de testing
- **Supertest**: Testing de endpoints HTTP
- **Socket.io-client**: Testing de WebSockets
- **Nock**: Mocking de APIs externas

### Manuales
- **Postman**: Testing de API REST
- **WebSocket Tester**: Interfaz web personalizada
- **Swagger UI**: Documentación interactiva

## 📈 Reportes y Métricas

### Cobertura de Código
```bash
npm run test:coverage
# Genera reporte HTML en coverage/lcov-report/index.html
```

### Resultados por HU
Cada test está etiquetado con su HU correspondiente para tracking individual:
```javascript
describe('POST /register - HU19', () => {
  test('Debe registrar un usuario exitosamente', async () => {
    // Test implementation
  });
});
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Tests fallan por Firebase**
   - Verificar que los mocks estén configurados en `setup.js`
   - Revisar que no se hagan llamadas reales a Firebase

2. **Tests de IA fallan**
   - Verificar mock de axios en `aiController.test.js`
   - Asegurar que `GROQ_API_KEY` esté configurada

3. **WebSocket tests timeout**
   - Aumentar timeout en `jest.config.js`
   - Verificar que el servidor de prueba se inicie correctamente

### Debugging
```bash
# Ejecutar test específico con debug
npm test -- --testNamePattern="HU19" --verbose

# Ver logs detallados
DEBUG=* npm test
```

## 🎉 Validación Final

Para validar que todas las HUs están cubiertas:

1. **Ejecutar suite completa**: `npm run test:coverage`
2. **Verificar cobertura**: >85% en todos los módulos
3. **Revisar reporte HTML**: Abrir `coverage/lcov-report/index.html`
4. **Testing manual**: Importar Postman collection y probar endpoints críticos
5. **WebSocket testing**: Abrir `websocket-test.html` y probar flujo completo

¡Con esta suite de pruebas tienes cobertura completa de todas las 18 Historias de Usuario del backend BrainBlitz! 🚀