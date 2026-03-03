# generated/

This folder is **auto-generated** — do not edit files here manually.

## How it gets created

1. Make sure the ASP.NET Core backend is running (`https://localhost:7290`).
2. From the `client/` folder run:

```bash
# Step A – download the latest OpenAPI spec from the running backend
npm run swagger:download

# Step B – regenerate the TypeScript client
npm run swagger:generate

# Or both in one command:
npm run swagger:sync
```

## What gets generated

| File | Purpose |
|------|---------|
| `index.ts` | Re-exports everything |
| `types.gen.ts` | TypeScript interfaces matching every DTO (LoginDto, RegisterDto, UserResponseDto, …) |
| `services.gen.ts` | One typed function per API endpoint |
| `schemas.gen.ts` | Zod/JSON schemas (if enabled) |

## Usage example

```tsx
import { AuthService, UserService } from "../api/generated";

// Login
await AuthService.login({ requestBody: { username: "alice", password: "abc123" } });

// Get all users
const { data } = await UserService.getAllUsers();
```
