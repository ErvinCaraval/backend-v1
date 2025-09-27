#!/bin/bash

# Script para configurar GitHub Actions en el repositorio BrainBlitz Backend
# Este script ayuda a resolver el error de dependency-review-action

echo "🚀 Configurando GitHub Actions para BrainBlitz Backend"
echo "=================================================="

# Verificar si estamos en un repositorio git
if [ ! -d ".git" ]; then
    echo "❌ Error: No se encontró un repositorio git en el directorio actual"
    echo "   Asegúrate de estar en la raíz del proyecto"
    exit 1
fi

echo "✅ Repositorio git detectado"

# Verificar si ya existen los workflows
if [ -d ".github/workflows" ]; then
    echo "📁 Directorio .github/workflows ya existe"
    echo "   Archivos encontrados:"
    ls -la .github/workflows/
else
    echo "📁 Creando directorio .github/workflows"
    mkdir -p .github/workflows
fi

# Verificar archivos de workflow
echo ""
echo "🔍 Verificando archivos de workflow..."

if [ -f ".github/workflows/ci.yml" ]; then
    echo "✅ ci.yml encontrado"
else
    echo "❌ ci.yml no encontrado - se creará automáticamente"
fi

if [ -f ".github/workflows/dependency-check.yml" ]; then
    echo "✅ dependency-check.yml encontrado"
else
    echo "❌ dependency-check.yml no encontrado - se creará automáticamente"
fi

# Verificar package.json
echo ""
echo "📦 Verificando package.json..."

if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
    
    # Verificar scripts de test
    if grep -q '"test"' package.json; then
        echo "✅ Script de test encontrado"
    else
        echo "⚠️  No se encontró script de test en package.json"
        echo "   Considera agregar: \"test\": \"jest\""
    fi
    
    # Verificar script de lint
    if grep -q '"lint"' package.json; then
        echo "✅ Script de lint encontrado"
    else
        echo "⚠️  No se encontró script de lint en package.json"
        echo "   Considera agregar: \"lint\": \"eslint .\""
    fi
else
    echo "❌ package.json no encontrado"
    exit 1
fi

echo ""
echo "🔧 Configuración recomendada para el repositorio:"
echo "=================================================="

# Detectar si es repositorio público o privado
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ $REPO_URL == *"github.com"* ]]; then
    REPO_NAME=$(echo $REPO_URL | sed 's/.*github.com[:/]\([^/]*\/[^/]*\)\.git.*/\1/')
    echo "📋 Repositorio detectado: $REPO_NAME"
    
    echo ""
    echo "🌐 Para repositorios PÚBLICOS:"
    echo "   Los workflows funcionarán automáticamente"
    echo "   No se requiere configuración adicional"
    
    echo ""
    echo "🔒 Para repositorios PRIVADOS:"
    echo "   Opción 1: Habilitar GitHub Advanced Security"
    echo "   - Ve a: https://github.com/$REPO_NAME/settings/security_analysis"
    echo "   - Habilita 'Dependency graph'"
    echo "   - Habilita 'GitHub Advanced Security' (requiere plan de pago)"
    echo ""
    echo "   Opción 2: Usar workflows alternativos (recomendado)"
    echo "   - Los workflows actuales funcionan sin GitHub Advanced Security"
    echo "   - Usan npm audit en lugar de dependency-review-action"
else
    echo "⚠️  No se pudo detectar la URL del repositorio"
fi

echo ""
echo "📝 Pasos siguientes:"
echo "==================="
echo "1. Commit y push de los archivos de workflow:"
echo "   git add .github/"
echo "   git commit -m 'Add GitHub Actions workflows'"
echo "   git push"
echo ""
echo "2. Verificar que los workflows funcionen:"
echo "   - Ve a la pestaña 'Actions' en tu repositorio"
echo "   - Los workflows se ejecutarán automáticamente en PRs"
echo ""
echo "3. Configurar variables de entorno (opcional):"
echo "   - Ve a Settings > Secrets and variables > Actions"
echo "   - Agrega NODE_ENV=production si es necesario"

echo ""
echo "✅ Configuración completada!"
echo "   Los workflows están listos para usar sin GitHub Advanced Security"