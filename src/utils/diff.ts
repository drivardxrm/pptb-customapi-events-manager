import { EntityService } from '../services/EntityService';
import { toNullable } from './string';

interface DiffOptions<T extends Record<string, unknown>> {
  skipKeys?: Array<keyof T>;
  lookupKeys?: Partial<Record<keyof T, [string, EntityService]>>;
}

// Build the payload for Create operations
export const buildCreatePayload = <T extends Record<string, any>>(
  next: T,
  options: DiffOptions<T> = {}
) => {
  const payload: Record<string, unknown> = {};
  const skip = new Set(options.skipKeys ?? []);

  (Object.keys(next) as Array<keyof T>).forEach((key) => {
    if (skip.has(key)) {
      return;
    }

    const nextValue = next[key];

    let payloadkey = key as string;
    

    if (typeof nextValue === 'string') {
      
      let payloadValue = toNullable(nextValue as string);

      if (options.lookupKeys && options.lookupKeys[key]) {
        const service = options.lookupKeys[key][1];

        payloadkey = `${options.lookupKeys[key][0]}@odata.bind`;
        payloadValue = service.getOdataLookupTemplate(payloadValue);
      }

      payload[payloadkey] = payloadValue;
    }
    else
    {
      payload[payloadkey] = nextValue;
    }

  });

  return payload;
};

// Build the payload for Update operations
export const buildUpdatePayload = <T extends Record<string, any>>(
  current: T,
  next: T,
  options: DiffOptions<T> = {}
) => {
  const payload: Record<string, unknown> = {};
  const skip = new Set(options.skipKeys ?? []);

  (Object.keys(next) as Array<keyof T>).forEach((key) => {
    if (skip.has(key)) {
      return;
    }

    const nextValue = next[key];
    const currentValue = current[key];

    if (nextValue === currentValue) {
      return;
    }

    let payloadkey = key as string;
    

    if (typeof nextValue === 'string') {
      
      let payloadValue = toNullable(nextValue as string);

      if (options.lookupKeys && options.lookupKeys[key]) {
        const service = options.lookupKeys[key][1];

        payloadkey = `${options.lookupKeys[key][0]}@odata.bind`;
        payloadValue = service.getOdataLookupTemplate(payloadValue);
      }

      payload[payloadkey] = payloadValue;
    }
    else
    {
      payload[payloadkey] = nextValue;
    }

  });

  return payload;
};
