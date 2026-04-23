/** @type {import('orval').Options} */
export default {
  api: {
    input: {
      target: '../backend/WebApi/swagger.json',
      override: {
        transformer: './orval-transformer.cjs',
      },
    },
    output: {
      clean: true,
      client: 'react-query',
      indexFiles: true,
      mock: {
        delay: 1000,
        type: 'msw',
        useExamples: true,
      },
      mode: 'tags-split',
      override: {
        header: () => '//@ts-nocheck\n',
        mutator: {
          name: 'customInstance',
          path: './app/api/mutators/custom-instance.ts',
        },
        query: {
          useQuery: true,
        },
      },
      prettier: true,
      schemas: './app/api/models',
      target: './app/api/endpoints/api.ts',
    },
  },
}
