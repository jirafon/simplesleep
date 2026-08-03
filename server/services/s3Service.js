const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

function isS3Configured() {
  return Boolean(BUCKET_NAME);
}

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - Original file name
 * @param {String} folder - Folder path in S3 (e.g., 'bitacora', 'orders')
 * @param {String} userId - User ID for organizing files
 * @returns {Promise<{key: string, url: string}>}
 */
async function uploadToS3(fileBuffer, fileName, folder, userId) {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  // Generate unique file name
  const fileExtension = path.extname(fileName);
  const baseName = path.basename(fileName, fileExtension);
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${folder}/${userId}/${uniqueId}-${sanitizedBaseName}${fileExtension}`;

  // Determine content type
  const contentType = getContentType(fileExtension);

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'private', // Private by default, use presigned URLs for access
  });

  await s3Client.send(command);

  // Return the S3 key (we'll generate presigned URLs when needed)
  return {
    key,
    bucket: BUCKET_NAME,
  };
}

/**
 * Get a presigned URL for accessing a file in S3
 * @param {String} key - S3 object key
 * @param {Number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<String>} Presigned URL
 */
async function getPresignedUrl(key, expiresIn = 3600) {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Get content type based on file extension
 * @param {String} extension - File extension (e.g., '.pdf', '.jpg')
 * @returns {String} Content type
 */
function getContentType(extension) {
  const contentTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Upload a PDF file to S3 (for medical orders)
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {String} orderId - Order ID
 * @param {String} userId - User ID
 * @returns {Promise<{key: string, url: string}>}
 */
async function uploadOrderPdfToS3(pdfBuffer, orderId, userId) {
  const fileName = `orden-medica-${orderId}.pdf`;
  return await uploadToS3(pdfBuffer, fileName, 'orders', userId);
}

/**
 * Upload a document to S3 (for bitácora)
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - Original file name
 * @param {String} userId - User ID
 * @param {String} recordType - Type of record (exam, control, consultation, consent)
 * @returns {Promise<{key: string, url: string}>}
 */
async function uploadBitacoraDocumentToS3(fileBuffer, fileName, userId, recordType) {
  return await uploadToS3(fileBuffer, fileName, `bitacora/${recordType}`, userId);
}

module.exports = {
  uploadToS3,
  getPresignedUrl,
  uploadOrderPdfToS3,
  uploadBitacoraDocumentToS3,
  getContentType,
  isS3Configured,
};
