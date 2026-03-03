import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  // Path to your downloaded swagger.json (run `npm run swagger:download` first)
  input: "./swagger.json",

  // Where the generated TypeScript files will be written
  output: {
    path: "./src/api/generated",
    format: "prettier",
    lint: false,
  },

  // Use @hey-api/client-axios so the generated client uses Axios under the hood
  client: "@hey-api/client-axios",
});
