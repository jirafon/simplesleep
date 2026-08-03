#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para copiar archivos de build del frontend a la carpeta public del servidor
 * Se ejecuta después de que npm run build completa en el cliente
 */

const srcBuild = path.join(__dirname, '../../client/build');
const destPublic = path.join(__dirname, '../public');

console.log('\n========================================');
console.log('📋 COPIANDO ARCHIVOS DE BUILD');
console.log('========================================');
console.log(`   Script ubicación: ${__dirname}`);
console.log(`   Origen: ${srcBuild}`);
console.log(`   Destino: ${destPublic}`);
console.log('');

// Verificar que la carpeta source existe
if (!fs.existsSync(srcBuild)) {
  console.error(`❌ ERROR: Carpeta de build NO encontrada`);
  console.error(`   Ruta esperada: ${srcBuild}`);
  console.error('');
  console.error('   Causas posibles:');
  console.error('   1. El build del cliente no se ejecutó correctamente');
  console.error('   2. La estructura de carpetas no es la esperada');
  console.error('   3. El build se creó en otra ubicación');
  console.error('');
  console.error('   Verificar con: ls -la ../../client/');
  process.exit(1);
}

console.log('✅ Carpeta de build encontrada');

// Listar contenido de la carpeta build
const buildContents = fs.readdirSync(srcBuild);
console.log(`   Archivos en build (${buildContents.length} items):`);
buildContents.slice(0, 10).forEach(file => {
  const filePath = path.join(srcBuild, file);
  const stat = fs.statSync(filePath);
  const type = stat.isDirectory() ? '[DIR]' : '[FILE]';
  console.log(`     ${type} ${file}`);
});
if (buildContents.length > 10) {
  console.log(`     ... y ${buildContents.length - 10} más`);
}
console.log('');

// Verificar que index.html existe en source
const srcIndexPath = path.join(srcBuild, 'index.html');
if (!fs.existsSync(srcIndexPath)) {
  console.error('❌ ERROR: index.html NO encontrado en la carpeta de build');
  console.error(`   Ruta esperada: ${srcIndexPath}`);
  process.exit(1);
}
console.log('✅ index.html encontrado en build source');
console.log('');

// Crear la carpeta destino si no existe
if (!fs.existsSync(destPublic)) {
  fs.mkdirSync(destPublic, { recursive: true });
  console.log(`✅ Carpeta destino creada: ${destPublic}`);
} else {
  console.log(`✅ Carpeta destino ya existe: ${destPublic}`);
}
console.log('');

// Función recursiva para copiar archivos
let copiedFiles = 0;
let copiedDirs = 0;

function copyDir(src, dest) {
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
        copiedDirs++;
      }
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      copiedFiles++;
    }
  });
}

console.log('📦 Iniciando copia de archivos...');
try {
  copyDir(srcBuild, destPublic);
  console.log(`✅ Archivos copiados exitosamente`);
  console.log(`   Directorios: ${copiedDirs}`);
  console.log(`   Archivos: ${copiedFiles}`);
  console.log('');
  
  // Verificar que index.html fue copiado
  const indexPath = path.join(destPublic, 'index.html');
  if (fs.existsSync(indexPath)) {
    const indexSize = fs.statSync(indexPath).size;
    console.log(`✅ index.html verificado en destino`);
    console.log(`   Ubicación: ${indexPath}`);
    console.log(`   Tamaño: ${indexSize} bytes`);
    console.log('');
    
    // Listar algunos archivos del destino para confirmar
    const destContents = fs.readdirSync(destPublic);
    console.log(`✅ Contenido de ${destPublic}:`);
    destContents.slice(0, 10).forEach(file => {
      const filePath = path.join(destPublic, file);
      const stat = fs.statSync(filePath);
      const type = stat.isDirectory() ? '[DIR]' : '[FILE]';
      console.log(`     ${type} ${file}`);
    });
    if (destContents.length > 10) {
      console.log(`     ... y ${destContents.length - 10} más`);
    }
    console.log('');
    
    console.log('========================================');
    console.log('✅ COPIA COMPLETADA EXITOSAMENTE');
    console.log('========================================');
    process.exit(0);
  } else {
    console.error('❌ ERROR: index.html NO encontrado después de copiar');
    console.error(`   Ruta esperada: ${indexPath}`);
    process.exit(1);
  }
} catch (error) {
  console.error('');
  console.error('========================================');
  console.error('❌ ERROR AL COPIAR ARCHIVOS');
  console.error('========================================');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
