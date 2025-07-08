import { DynamicModule, Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { Database } from 'arangojs';
import { ARANGO_CONNECTION } from './arango.constants';

interface ArangoModelOptions {
  name: string;
  schema: any;
  collection?: string;
}

type ArangoModel = {
  collection: any; // Using any to avoid type issues with arangojs
  schema: any;
  name: string;
};

@Global()
@Module({})
export class ArangoFeatureModule implements OnModuleInit {
  private readonly logger = new Logger(ArangoFeatureModule.name);

  static forFeature(models: ArangoModelOptions[]): DynamicModule {
    const logger = new Logger(ArangoFeatureModule.name);
    
    const providers = models.map(modelDef => ({
      provide: `ARANGO_MODEL_${modelDef.name}`,
      useFactory: async (db: Database) => {
        if (!db) {
          throw new Error('No database connection available');
        }
        
        try {
          const collectionName = modelDef.collection || modelDef.name.toLowerCase();
          
          // Create or get the collection
          let collection;
          const collections = await db.listCollections();
          const collectionExists = collections.some((c: { name: string }) => c.name === collectionName);
          
          if (collectionExists) {
            collection = db.collection(collectionName);
          } else {
            collection = await db.createCollection(collectionName);
            logger.log(`Created new collection: ${collectionName}`);
          }
          
          // Create model instance
          const model: ArangoModel = {
            collection,
            schema: modelDef.schema,
            name: modelDef.name
          };
          
          logger.log(`Registered model: ${modelDef.name} -> ${collectionName}`);
          return model;
          
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`Failed to create model ${modelDef.name}: ${errorMessage}`);
        }
      },
      inject: [ARANGO_CONNECTION],
    }));

    return {
      module: ArangoFeatureModule,
      providers,
      exports: providers,
    };
  }

  onModuleInit() {
    this.logger.log('ArangoFeatureModule initialized');
  }
}