#!/usr/bin/env node

const fs = require('fs');

function getInputJson(filePath) {
  try {
    if (filePath) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return fs.readFileSync(0, 'utf-8'); // Lee desde stdin (pipe)
  } catch (error) {
    console.error(`❌ Error al leer la fuente de datos: ${error.message}`);
    process.exit(1);
  }
}

function main() {
  const [query, filePath] = process.argv.slice(2);

  if (!query) {
    console.error('Error: Debes proporcionar una consulta de JavaScript.');
    console.error("Ejemplo: jstool 'data.filter(u => u.isActive)' archivo.json");
    process.exit(1);
  }

  const jsonString = getInputJson(filePath);
  let data;

  try {
    data = JSON.parse(jsonString);
  } catch (error) {
    console.error(`❌ Error: El JSON de entrada no es válido. ${error.message}`);
    process.exit(1);
  }

  try {
    const resultFunction = new Function('data', `return ${query}`);
    const result = resultFunction(data);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`❌ Error en tu consulta de JavaScript: ${error.message}`);
    process.exit(1);
  }
}

main();