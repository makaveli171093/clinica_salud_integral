// El seed heredado contenía registros clínicos de demostración y borraba tablas.
// Se conserva únicamente en el punto base anterior, no en la nueva migración.
console.error('Seed deshabilitado. Para iniciar NestJS use pnpm db:deploy y pnpm admin:create.');
process.exitCode = 1;
