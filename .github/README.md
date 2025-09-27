# GitHub Actions Workflows

Este directorio contiene los workflows de GitHub Actions para el proyecto BrainBlitz Backend.

## Workflows Disponibles

### 1. CI/CD Pipeline (`ci.yml`)
- **Trigger**: Push y Pull Requests a las ramas `main` y `develop`
- **Funciones**:
  - Ejecuta tests en múltiples versiones de Node.js (18.x, 20.x)
  - Verifica linting del código
  - Ejecuta tests unitarios e integración
  - Realiza auditoría de seguridad básica
  - Construye el proyecto

### 2. Dependency Security Check (`dependency-check.yml`)
- **Trigger**: Pull Requests y programado diariamente
- **Funciones**:
  - Auditoría de seguridad de dependencias con `npm audit`
  - Verificación de dependencias desactualizadas
  - Generación de reportes de seguridad
  - Alerta sobre vulnerabilidades críticas y altas

## Configuración Requerida

### Variables de Entorno
Asegúrate de configurar las siguientes variables en tu repositorio:

```bash
# En Settings > Secrets and variables > Actions
NODE_ENV=production
```

### Dependencias Opcionales
Para funcionalidades avanzadas, puedes instalar:

```bash
npm install -g npm-audit-ci
```

## Solución de Problemas

### Error: "Dependency review is not supported"
Si encuentras este error, significa que el repositorio no tiene habilitado GitHub Advanced Security. Las soluciones son:

1. **Para repositorios públicos**: Los workflows actuales funcionan sin configuración adicional
2. **Para repositorios privados**: 
   - Opción A: Habilitar GitHub Advanced Security (requiere plan de pago)
   - Opción B: Usar los workflows actuales que no requieren GitHub Advanced Security

### Habilitar GitHub Advanced Security (Opcional)
Si quieres usar la funcionalidad completa de revisión de dependencias:

1. Ve a `Settings > Security & analysis`
2. Habilita "Dependency graph"
3. Para repositorios privados, habilita "GitHub Advanced Security"

## Personalización

### Modificar Niveles de Auditoría
Edita `.audit-ci.json` para ajustar los niveles de severidad:

```json
{
  "low": false,        // Ignorar vulnerabilidades bajas
  "moderate": true,    // Alertar sobre vulnerabilidades moderadas
  "high": true,        // Alertar sobre vulnerabilidades altas
  "critical": true     // Fallar en vulnerabilidades críticas
}
```

### Agregar Tests Personalizados
Modifica `ci.yml` para incluir tests específicos de tu proyecto:

```yaml
- name: Run custom tests
  run: |
    npm run test:integration
    npm run test:e2e
```

## Monitoreo

Los workflows generan:
- Reportes de cobertura de tests
- Reportes de seguridad de dependencias
- Artefactos de build
- Logs detallados de cada paso

Revisa la pestaña "Actions" en tu repositorio para ver el estado de los workflows.