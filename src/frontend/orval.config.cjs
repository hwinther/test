/** @type {import('orval').Options} */
export default {
  api: {
    output: {
      mode: 'tags-split',
      target: './src/api/endpoints/api.ts',
      schemas: './src/api/models',
      client: 'react-query',
      mock: {
        type: 'msw',
        delay: 1000,
        useExamples: true,
      },
      prettier: true,
      clean: true,
      indexFiles: true,
      override: {
        mutator: {
          path: './src/api/mutators/custom-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
        },
        header: () => '//@ts-nocheck\n',
      },
    },
    input: {
      target: '../backend/WebApi/swagger.json',
      // override: {
      //   transformer: './src/api/transformer/add-version.js',
      // },
    },
  },
}
