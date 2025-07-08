import { Type } from '@nestjs/common';

export interface ArangoAuthOptions {
  username: string;
  password: string;
}

export interface ArangoModuleOptions {
  url: string | string[];
  databaseName?: string;
  auth?: ArangoAuthOptions;
  extra?: Record<string, any>;
}

export interface ArangoModuleOptionsFactory {
  createArangoOptions(): Promise<ArangoModuleOptions> | ArangoModuleOptions;
}

export interface ArangoModuleAsyncOptions {
  imports?: any[];
  useExisting?: Type<ArangoModuleOptionsFactory>;
  useClass?: Type<ArangoModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ArangoModuleOptions> | ArangoModuleOptions;
  inject?: any[];
  extraProviders?: any[];
}