import { Schema } from 'arangoose';
import { Database } from 'arangojs';

// Import model from arangoose with a type assertion to avoid type issues
const { model } = require('arangoose') as { model: any };

// Base document interface
export interface ArangoDocument {
  _key?: string;
  _id?: string;
  _rev?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

// Define the model type
type ArangoModel<T> = {
  new (data?: Partial<T>): T & { save(): Promise<T> };
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  find(filter?: Partial<T>): Promise<T[]>;
  findByIdAndUpdate(
    id: string, 
    update: Partial<T>, 
    options: { new: boolean }
  ): Promise<T | null>;
  deleteOne(filter: { _id: string }): Promise<{ deletedCount: number }>;
  countDocuments(filter?: Partial<T>): Promise<number>;
};

export class ArangoRepository<T extends ArangoDocument> {
  private model: ArangoModel<T>;

  constructor(
    private readonly collectionName: string,
    private readonly schema: Schema,
    private readonly connection: Database
  ) {
    if (!this.connection) {
      throw new Error('No ArangoDB connection found');
    }
    
    // Add timestamps if not present
    if (!(this.schema as any).obj.createdAt) {
      this.schema.add({
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      });
    }

        // Create the model with proper typing
    this.model = model(
      this.collectionName,
      this.schema,
      this.collectionName,
      { db: this.connection }
    ) as unknown as ArangoModel<T>;
  }

  // Basic CRUD operations
  async create(doc: Partial<T>): Promise<T> {
    const { _id, _key, _rev, ...cleanDoc } = doc as any;
    const newDoc = new this.model(cleanDoc);
    const saved = await newDoc.save();
    return saved as T;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return this.model.findOne(filter);
  }

  async findMany(filter: Partial<T> = {}): Promise<T[]> {
    return this.model.find(filter);
  }

  async findAll(): Promise<T[]> {
    return this.model.find({});
  }

  async update(id: string, update: Partial<T>): Promise<T | null> {
    const { _id, _key, _rev, ...updateData } = update as any;
    updateData.updatedAt = new Date();
    
    return this.model.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async count(filter: Partial<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async exists(filter: Partial<T>): Promise<boolean> {
    const count = await this.count(filter);
    return count > 0;
  }
}