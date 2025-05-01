import { defineFunction } from "@aws-amplify/backend";

export const funct = defineFunction({
    // optionally specify a name for the Function (defaults to directory name)
    name: 'team22 - lambda',
    // optionally specify a path to your handler (defaults to "./handler.ts")
    entry: './handler.ts'
  });