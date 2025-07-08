import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { ARANGO_CONNECTION, ARANGO_MODULE_OPTIONS } from './arango.constants';
import { ArangoModuleAsyncOptions, ArangoModuleOptions, ArangoModuleOptionsFactory } from './interfaces/arango-options.interface';

// Import connect from arangoose with a type assertion to avoid type issues
const { connect } = require('arangoose') as { connect: (url: string, options?: any) => Promise<void> };

@Global()
@Module({})
export class ArangoModule {
  static forRoot(options: ArangoModuleOptions): DynamicModule {
    const arangoConnectionProvider: Provider = {
      provide: ARANGO_CONNECTION,
      useFactory: async (): Promise<Database> => {
        try {
          // Create a new database instance
          // Use the first URL if an array is provided
          const dbUrl = Array.isArray(options.url) ? options.url[0] : options.url;
          const db = new Database({
            url: dbUrl,
            databaseName: options.databaseName || '_system',
            auth: options.auth,
            ...options.extra,
          });
          
          // Test the connection
          await db.version();
          
          // Connect using arangoose for ODM functionality
          // Use the first URL if an array is provided
          const connectUrl = Array.isArray(options.url) ? options.url[0] : options.url;
          await connect(connectUrl, {
            database: options.databaseName || '_system',
            auth: options.auth,
            ...options.extra,
          });
          
          return db;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`Unable to connect to ArangoDB: ${errorMessage}`);
        }
      },
    };

    return {
      module: ArangoModule,
      providers: [arangoConnectionProvider],
      exports: [arangoConnectionProvider],
    };
  }

  static forRootAsync(options: ArangoModuleAsyncOptions): DynamicModule {
    const connectionProvider: Provider = {
      provide: ARANGO_CONNECTION,
      useFactory: async (moduleOptions: ArangoModuleOptions): Promise<Database> => {
        try {
          // Create a new database instance
          // Use the first URL if an array is provided
          const dbUrl = Array.isArray(moduleOptions.url) ? moduleOptions.url[0] : moduleOptions.url;
          const db = new Database({
            url: dbUrl,
            databaseName: moduleOptions.databaseName || '_system',
            auth: moduleOptions.auth,
            ...moduleOptions.extra,
          });
          
          // Test the connection
          await db.version();
          
          // Connect using arangoose for ODM functionality
          // Use the first URL if an array is provided
          const connectUrl = Array.isArray(moduleOptions.url) ? moduleOptions.url[0] : moduleOptions.url;
          await connect(connectUrl, {
            database: moduleOptions.databaseName || '_system',
            auth: moduleOptions.auth,
            ...moduleOptions.extra,
          });
          
          return db;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`Unable to connect to ArangoDB: ${errorMessage}`);
        }
      },
      inject: [ARANGO_MODULE_OPTIONS],
    };

    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: ArangoModule,
      imports: options.imports || [],
      providers: [...asyncProviders, connectionProvider],
      exports: [connectionProvider],
    };
  }

  private static createAsyncProviders(options: ArangoModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<ArangoModuleOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: ArangoModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: ARANGO_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<ArangoModuleOptionsFactory>,
    ];

    return {
      provide: ARANGO_MODULE_OPTIONS,
      useFactory: async (optionsFactory: ArangoModuleOptionsFactory) =>
        await optionsFactory.createArangoOptions(),
      inject,
    };
  }
}