# Byzantium 🏛️

_Because your types should be as robust as the Byzantine Empire_

## About

Byzantium is a sophisticated compile-time assertion library for TypeScript that moves interface contract validation from runtime to compile time. By leveraging TypeScript's advanced type system, Byzantium enables developers to catch type-related issues during development, eliminating the need for most runtime checks and unit tests.

## Why Byzantium?

Just as the Byzantine Empire stood for over a millennium through strict protocols and robust defensive systems, Byzantium helps your codebase stand the test of time by moving contract validation from runtime to compile time.

## Philosophy

> "The best error message is the one that never shows up."
>
> -   [Thomas Fuchs](https://medium.com/@thomasfuchs/how-to-write-an-error-message-883718173322)

Byzantium embraces this philosophy by preventing errors at compile time rather than catching them at runtime. Our core beliefs:

1. Type systems exist to prevent errors, not just document them
2. Runtime type checking is often redundant when you have a strong type system
3. Interface contracts should be enforced by the compiler, not unit tests
4. Performance critical code shouldn't waste cycles on preventable checks

## Features

### Type Assertions

The foundation of Byzantium is its powerful assertion system:

```typescript
interface ValidUser {
    username: string;
    password: string;
}
interface InvalidUser {
    username: number;
    password: string;
}

// Basic type assertion
type ValidateUser<User> = Assert<
    //assert that User is of type {username, password}
    Is.Type<
        User,
        {
            username: string;
            password: string;
        }
    >,
    //custom compile time exceptions
    "User requires both a username and password",
    User
>;

function loginUser<T>(user: ValidateUser<T>) {
    // .... business logic
}

declare const user1: ValidUser;
declare const user2: InvalidUser;

loginUser(user1);
loginUser(user2);
/**        ~~~~~
 *           └───── Type Exception! "User requires both a username and password"
 */

// Panic on impossible code paths
type Unreachable = Assert.Panic<"This should never happen">;

// Mark unfinished code
type InProgress = Assert.Todo<"Implement user validation">;
```

### Type Predicates

Test and combine type conditions with readable, expressive syntax:

```typescript
// Simple type equality
type IsString<T> = Is<T, string>;

// Check if type has property
type HasId<T> = Is.On<T, "id">;

// Check if value exists in type
type ContainsAdmin = Is.In<UserRoles, "admin">;

// Function argument validation
type ValidateArgs = Is.For<typeof myFunction, [string, number]>;

// Function return type validation
type ValidateReturn = Is.From<typeof myFunction, Promise<void>>;
```

### Logical Operators

Compose complex type conditions:

```typescript
// Combine conditions
type IsAdminUser<User> = And<
    Is<User, AdminUser>,
    Is.On<User, "adminPrivileges">
>;

// Alternative conditions
type IsUserOrAdmin = Or<IsUser, IsAdmin>;

// Negative conditions
type IsNotGuest = Is.Not<IsGuest>;

// Complex combinations
type IsValidRequest = And<
    Is.On<Request, "body">,
    Or<Is.In<Request["method"], "POST">, Is.In<Request["method"], "PUT">>
>;
```

### Control Flow

Handle conditional type logic with clarity:

```typescript
// Simple if-then-else
type Result = If<IsAdmin, AdminDashboard, UserDashboard>;

// Switch statement for types
type Response = Switch<
    UserRole,
    {
        admin: AdminResponse;
        user: UserResponse;
        guest: GuestResponse;
    }
>;
```

## Real-World Impact

### DevOps Benefits

#### 1. Faster Development Cycles

-   Catch errors at compile time, not in CI/CD
-   Reduce time spent writing and maintaining unit tests
-   Faster feedback loop during development

#### 2. Improved CI/CD Performance

```typescript
// Before: Runtime validation in tests
describe("User Service", () => {
    it("validates user properties", async () => {
        const user = await userService.getUser();
        expect(user.id).toBeDefined();
        expect(typeof user.id).toBe("string");
        // ... many more assertions
    });
});

// After: Compiler handles validation
type ValidUser = Assert<
    {
        id: string;
        email: string;
        roles: UserRole[];
    },
    "Invalid user shape"
>;

function getUser(): Promise<ValidUser> {
    // Types guaranteed at compile time
}
```

#### 3. Resource Optimization

-   Reduced CPU usage in production
-   Lower memory footprint
-   Fewer dependencies to maintain

#### 4. Better Error Detection

```typescript
// Before: Runtime errors in production
function processUser(user: any) {
    if (!user?.id) throw new Error("Invalid user");
    if (!user?.roles?.includes("admin")) throw new Error("Unauthorized");
    // ... more runtime checks
}

// After: Compile-time guarantees
type AdminUser = Assert<
    And<Is<User, AdminUser>, Is.In<User["roles"], "admin">>,
    "Unauthorized access attempt"
>;

function processUser(user: AdminUser) {
    // Safe to process - types guaranteed
}
```

## Advanced Usage

### Custom Type Guards

Create reusable type guards for common patterns:

```typescript
type HasRequiredKeys<T, K extends keyof any> = Assert<
    Is.All<[Is.On<T, K>, Is.Not<Is.In<T[K], undefined>>]>,
    `Missing required keys: ${K}`
>;

// Usage
type ValidRequest = HasRequiredKeys<Request, "body" | "headers">;
```

### Generic Type Constraints

Enforce constraints on generic types:

```typescript
type ValidArray<T> = Assert<Is.Instance<T, unknown[]>, "Expected array type">;

type ValidPromise<T> = Assert<
    Is.Instance<T, Promise<unknown>>,
    "Expected promise type"
>;
```

### Type-Safe API Responses

Ensure API responses match expected shapes:

```typescript
type APIResponse<T> = Assert<
    And<Is.On<T, "status">, Is.On<T, "data">>,
    "Invalid API response shape"
>;
```

## Performance Considerations

Byzantium's compile-time checks have zero runtime overhead. Here's a performance comparison:

```typescript
// Runtime checking: ~1.2ms overhead per 1000 operations
function beforeCheck(user: any): user is User {
    return (
        typeof user === "object" &&
        typeof user.id === "string" &&
        Array.isArray(user.roles)
    );
}

// Byzantium: 0ms overhead - all checks at compile time
type ValidUser = Assert<User, "Invalid user">;
function afterCheck(user: ValidUser) {
    // No runtime checks needed
}
```

## Installation

```bash
# deno
deno add jsr:@constantine/byzantium

# npm (and npm-like systems)
npx jsr add @constantine/byzantium
yarn dlx jsr add @constantine/byzantium
pnpm dlx jsr add @constantine/byzantium
bunx jsr add @constantine/byzantium
```

## Configuration

### TSConfig Requirements

```json
{
    "compilerOptions": {
        "strict": true,
        "strictNullChecks": true,
        "noImplicitAny": true
    }
}
```

### ESLint Integration

Recommended ESLint configuration to maximize Byzantium's benefits:

```json
{
    "rules": {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/strict-boolean-expressions": "error"
    }
}
```

## Contributing

We welcome contributions! Please check our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Run tests: `pnpm test`
4. Build: `pnpm build`

## License

MIT - Free as in "free from runtime type checks"

---

_Written in TypeScript, debugged in production (just kidding - that's what Byzantium prevents)_ 🛡️
