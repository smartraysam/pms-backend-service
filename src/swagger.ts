import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PMS API Documentation",
      version: "1.0.0",
      description:
        "This is a PMS API application built with Express and TypeScript.",
    },
    servers: [
      {
        url: "http://localhost:3000", // Update with your base URL
      },
    ],
  },
  apis: ['./src/routes/**/*.ts'],

};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
