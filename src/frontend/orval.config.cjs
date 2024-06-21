/** @type {import('orval').Options} */
export default {
  api: {
    input: {
      target: '../backend/WebApi/swagger.json',
      // override: {
      //   transformer: './src/api/transformer/add-version.js',
      // },
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
          path: './src/api/mutators/custom-instance.ts',
        },
        query: {
          useQuery: true,
        },
      },
      prettier: true,
      schemas: './src/api/models',
      target: './src/api/endpoints/api.ts',
    },
  },
}
