import 'reflect-metadata';

// Mock the reflect-metadata API for Jest
if (!Reflect.defineMetadata) {
  Reflect.defineMetadata = function(metadataKey: any, metadataValue: any, target: any, propertyKey?: string | symbol) {
    if (!target.__metadata__) {
      target.__metadata__ = {};
    }
    if (!target.__metadata__[metadataKey]) {
      target.__metadata__[metadataKey] = {};
    }
    if (propertyKey) {
      target.__metadata__[metadataKey][propertyKey] = metadataValue;
    } else {
      target.__metadata__[metadataKey] = metadataValue;
    }
  } as any;
}

if (!Reflect.getMetadata) {
  Reflect.getMetadata = function(metadataKey: any, target: any, propertyKey?: string | symbol) {
    if (!target.__metadata__) {
      return undefined;
    }
    if (!target.__metadata__[metadataKey]) {
      return undefined;
    }
    if (propertyKey) {
      return target.__metadata__[metadataKey][propertyKey];
    }
    return target.__metadata__[metadataKey];
  } as any;
}

if (!Reflect.hasMetadata) {
  Reflect.hasMetadata = function(metadataKey: any, target: any, propertyKey?: string | symbol) {
    if (!target.__metadata__) {
      return false;
    }
    if (!target.__metadata__[metadataKey]) {
      return false;
    }
    if (propertyKey) {
      return target.__metadata__[metadataKey].hasOwnProperty(propertyKey);
    }
    return true;
  } as any;
}

// Mock NestJS SetMetadata
jest.mock('@nestjs/common', () => {
  const original = jest.requireActual('@nestjs/common');
  return {
    ...original,
    SetMetadata: (metadataKey: string, metadataValue: any) => {
      return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
        return descriptor;
      };
    }
  };
});

// Global test setup
beforeAll(() => {
  // Ensure reflect-metadata is available
  if (typeof Reflect === 'undefined' || !Reflect.getMetadata) {
    throw new Error('Reflect metadata is not available');
  }
});
