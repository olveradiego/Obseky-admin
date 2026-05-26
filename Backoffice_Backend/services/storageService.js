// Archivo: services/storageService.js
// Proposito: Abstracción del almacenamiento de archivos para soportar local o en la nube (S3)

const fs = require('fs');
const path = require('path');
// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local';

// Directorio por defecto para almacenamiento local
const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', 'uploadsQRCards');

/*
// Configuración de cliente S3 (descomentar y configurar cuando se use AWS)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});
*/

/**
 * Guarda un archivo en el proveedor de almacenamiento configurado
 * @param {string} filename Nombre del archivo
 * @param {Buffer} buffer Contenido del archivo
 * @returns {Promise<string>} URL o ruta de acceso al archivo
 */
const saveFile = async (filename, buffer) => {
  if (STORAGE_PROVIDER === 's3') {
    /*
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) throw new Error("AWS_S3_BUCKET_NAME no configurado");
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: buffer,
      ContentType: 'application/pdf',
    });
    
    await s3Client.send(command);
    return `https://${bucketName}.s3.amazonaws.com/${filename}`;
    */
    throw new Error("El proveedor S3 no está completamente implementado. Requiere @aws-sdk/client-s3");
  } else {
    // Modo local
    if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
      fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
    }
    const outputPath = path.join(LOCAL_UPLOAD_DIR, filename);
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }
};

module.exports = {
  saveFile,
};
