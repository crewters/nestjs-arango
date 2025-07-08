import { DynamicModule, Global, Module, Provider, Logger } from '@nestjs/common';
import { Database } from 'arangojs';
import { ARANGO_CONNECTION, ARANGO_MODULE_OPTIONS } from './arango.constants';
import { ArangoModuleOptions, ArangoModuleAsyncOptions, ArangoModuleOptionsFactory } from './interfaces/arango-options.interface';

@Global()
@Module({})
export class ArangoModule {
  private static readonly logger = new Logger('ArangoModule');

  static forRoot(options: ArangoModuleOptions): DynamicModule {
    const arangoConnectionProvider: Provider = {
      provide: ARANGO_CONNECTION,
      useFactory: async (): Promise<Database> => {
        try {
          const { url, database, auth, ...rest } = options;
          
          ArangoModule.logger.log(`Connecting to ArangoDB at ${url}...`);
          
          // Create a new database connection
          const db = new Database({
            url,
            databaseName: database,
            auth,
            ...rest
          });
          
          // Test the connection
          try {
            await db.version();
            ArangoModule.logger.log(`Successfully connected to database: ${database}`);
            return db;
          } catch (connectError) {
            const errorMessage = connectError instanceof Error ? connectError.message : 'Unknown error';
            ArangoModule.logger.error('Failed to establish ArangoDB connection:', errorMessage);
            throw new Error(`Connection failed: ${errorMessage}`);
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          ArangoModule.logger.error('ArangoDB Connection Error:', errorMessage);
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
    const providers: Provider[] = [];
    
    if (options.useExisting || options.useFactory) {
      providers.push({
        provide: ARANGO_MODULE_OPTIONS,
        useFactory: options.useFactory || (async () => {
          const factory = new (options.useExisting || options.useClass)!();
          return factory.createArangoOptions();
        }),
        inject: options.inject || [],
      });
    }

    providers.push({
      provide: ARANGO_CONNECTION,
      useFactory: async (moduleOptions: ArangoModuleOptions) => {
        try {
          const { url, database, auth, ...rest } = moduleOptions;
          
          ArangoModule.logger.log(`Connecting to ArangoDB at ${url}...`);
          
          // Create a new database connection
          const db = new Database({
            url,
            databaseName: database,
            auth,
            ...rest
          });
          
          // Test the connection
          await db.version();
          ArangoModule.logger.log(`Successfully connected to database: ${database}`);
          return db;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          ArangoModule.logger.error('ArangoDB Connection Error:', errorMessage);
          throw new Error(`Unable to connect to ArangoDB: ${errorMessage}`);
        }
      },
      inject: [ARANGO_MODULE_OPTIONS],
    });
    
    return {
      module: ArangoModule,
      imports: options.imports || [],
      providers: [
        ...providers,
        ...(options.extraProviders || []),
      ],
      exports: [ARANGO_CONNECTION],
    };
  }
}