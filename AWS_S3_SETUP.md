# Configuración de AWS S3 para Documentos

Este proyecto utiliza AWS S3 para almacenar documentos médicos (PDFs e imágenes) de forma segura.

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env` en el directorio `server/`:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=nombre-de-tu-bucket
```

Las credenciales de AWS deben resolverse desde el entorno de ejecucion o el perfil de la infraestructura, no desde variables explicitas en este archivo.

## Configuración del Bucket S3

1. **Crear un bucket en AWS S3:**
   - Ve a la consola de AWS S3
   - Crea un nuevo bucket con un nombre único
   - Configura la región (recomendado: us-east-1 o la más cercana a tus usuarios)

2. **Configurar permisos del bucket:**
   - Los archivos se almacenan como privados por defecto
   - El acceso se otorga mediante URLs presignadas (válidas por tiempo limitado)
   - Asegúrate de que tu IAM user tenga permisos para:
     - `s3:PutObject` - Para subir archivos
     - `s3:GetObject` - Para leer archivos
     - `s3:DeleteObject` - (Opcional) Para eliminar archivos

3. **Crear un usuario IAM con permisos:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject"
         ],
         "Resource": "arn:aws:s3:::nombre-de-tu-bucket/*"
       }
     ]
   }
   ```

4. **Obtener las credenciales:**
   - Access Key ID
   - Secret Access Key
   - Agrégalas a tu archivo `.env`

## Estructura de Archivos en S3

Los archivos se organizan de la siguiente manera:

```
bucket-name/
├── orders/
│   └── {userId}/
│       └── {uniqueId}-orden-medica-{orderId}.pdf
└── bitacora/
    ├── exam/
    │   └── {userId}/
    │       └── {uniqueId}-{fileName}
    ├── control/
    │   └── {userId}/
    │       └── {uniqueId}-{fileName}
    ├── consultation/
    │   └── {userId}/
    │       └── {uniqueId}-{fileName}
    └── consent/
        └── {userId}/
            └── {uniqueId}-{fileName}
```

## Funcionalidades Implementadas

### 1. Subida de Documentos en Bitácora
- Los usuarios pueden subir hasta 5 archivos (PDFs o imágenes) al agregar un registro
- Tamaño máximo: 10MB por archivo
- Formatos permitidos: PDF, JPG, JPEG, PNG, GIF, WEBP

### 2. Almacenamiento de Órdenes Médicas
- Cuando se genera una orden médica en PDF, se sube automáticamente a S3
- Se mantiene una copia local como respaldo
- Las URLs presignadas son válidas por 1 año para órdenes médicas

### 3. Visualización de Documentos
- Los documentos se acceden mediante URLs presignadas (válidas por 1 hora)
- Se generan bajo demanda cuando el usuario solicita ver un documento
- Los documentos son privados y solo accesibles por el usuario propietario

## Seguridad

- Todos los archivos se almacenan como privados en S3
- El acceso se controla mediante URLs presignadas con expiración
- Se verifica que el usuario tenga permisos antes de generar URLs
- Los archivos se organizan por usuario para facilitar la gestión

## Notas Importantes

- Si no se configuran las variables de entorno de AWS, el sistema funcionará sin S3:
  - Los PDFs de órdenes se guardarán solo localmente
  - Los documentos de bitácora no se podrán subir
  - El sistema seguirá funcionando normalmente para otras funcionalidades

- Las URLs presignadas expiran después del tiempo especificado:
  - Órdenes médicas: 1 año
  - Documentos de bitácora: 1 hora
