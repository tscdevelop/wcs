import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation - Warehouse Control System',
      version: '1.0.0',
      description: 'Develop by Transformative Solutions Center',
      contact: {
        name: 'Transformative Solutions Center',
        email: 'Transformative.developer@gmail.com'
      },
      servers: [
        {
          url: 'http://localhost:3502'
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      parameters: {
        lng: {
          name: 'lng',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            example: 'en',
            default: 'en', // กำหนดค่า default
          },
          description: 'เปลี่ยนภาษา [Thai=th,English=en] (GET /api/xxx?lng=th)',
        },
        acceptLanguage: {
          name: 'Accept-Language',
          in: 'header',
          required: false,
          schema: {
            type: 'string',
            example: 'en',
            default: 'en', // กำหนดค่า default
          },
          description: 'เปลี่ยนภาษา [Thai=th,English=en] (HTTP header Accept-Language=th)',
        },
      }, 
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // ระบุ path ของไฟล์ที่มีการเขียน API
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

const customOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Documentation",
  swaggerOptions: {
    docExpansion: 'none', // ใช้ใน swaggerOptions เพื่อกำหนดให้ collapse
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, customOptions));

export default app;
