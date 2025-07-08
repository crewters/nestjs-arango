# nestjs-arangoose

[![npm version](https://badge.fury.io/js/nestjs-arangoose.svg)](https://badge.fury.io/js/nestjs-arangoose)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ArangoDB module for NestJS with Arangoose integration, providing a clean and type-safe way to interact with ArangoDB in your NestJS applications.

###  THIS IS A WIP - Just in dev phase for now. If you'd like to contribute please open a PR or feel free to fork .

## Installation

```bash
npm install nestjs-arangoose arangoose @arangodb/arangojs
# or
yarn add nestjs-arangoose arangoose @arangodb/arangojs
```

## Features

- **Seamless NestJS Integration**: Full support for NestJS dependency injection and module system
- **Type-Safe Operations**: Built with TypeScript for type safety and better developer experience
- **Flexible Configuration**: Support for both synchronous and asynchronous module initialization
- **Repository Pattern**: Easy-to-use repository pattern for database operations
- **High Availability**: Support for multiple ArangoDB server URLs for high availability setups
- **Schema Validation**: Built-in schema validation using Arangoose
- **Automatic Timestamps**: Optional automatic `createdAt` and `updatedAt` timestamps
- **Query Builder**: Access to the full power of ArangoDB's query builder through arangojs

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

### Building the package

```bash
npm run build
```

### Running tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

MIT © [Crewters](https://github.com/crewters)
