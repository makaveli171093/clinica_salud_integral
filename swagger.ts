import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "API Clínica Salud Integral",
    description:
      "Documentación interactiva de la API con control de roles, soft delete y reglas clínicas.",
    version: "1.0.0",
  },
  host: "localhost:3000",
  basePath: "/api",
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "Introduce tu token con el prefijo Bearer: 'Bearer <token>'",
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/routes/index.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
