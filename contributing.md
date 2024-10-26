# Contributing to Byzantium

First off, thanks for considering contributing to Byzantium! If you can make compile-time checks more powerful than they already are, we want your help.

## Table of Contents

-   [Code of Conduct](#code-of-conduct)
-   [The Development Process](#the-development-process)
-   [Environment Setup](#environment-setup)
-   [Making Contributions](#making-contributions)
-   [Type System Guidelines](#type-system-guidelines)
-   [Testing Guidelines](#testing-guidelines)
-   [Documentation Guidelines](#documentation-guidelines)
-   [Pull Request Process](#pull-request-process)
-   [Release Process](#release-process)

## Code of Conduct

Let's keep it simple:

1. Be nice
2. Be professional
3. Don't be the person who writes runtime type checks
4. Help others
5. Accept feedback gracefully

For more details, see our ~~[Code of Conduct](CODE_OF_CONDUCT.md)~~ (Doesn't Exist Yet... Todo).

## The Development Process

### Branches

-   `main`: Protected branch, represents the latest stable release
-   `develop`: Main development branch
-   `feature/*`: For new features
-   `fix/*`: For bug fixes
-   `docs/*`: For documentation updates

### Type System Philosophy

Remember our core principles:

1. If it can be checked at compile time, it must be checked at compile time
2. Types should be descriptive and self-documenting
3. Error messages should be helpful and precise
4. Performance is non-negotiable - zero runtime overhead

## Environment Setup

```bash
# Clone the repository
git clone https://github.com/byzantium/byzantium.git
cd byzantium

# Run tests
npm test
#or
yarn test
```

### Required Tools

-   Node.js 18+
-   pnpm 8+
-   TypeScript 5.0+
-   A good sense of humor (optional but recommended)

## Making Contributions

### 1. Choose Your Battle

-   Check the issues page
-   Look for `good first issue` labels if you're new
-   Create an issue if you find a bug or have a feature idea

### 2. Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR-USERNAME/byzantium.git
cd byzantium
git remote add upstream https://github.com/byzantium/byzantium.git
```

### 3. Branch

```bash
git checkout -b feature/awesome-new-type-check
```

## Type System Guidelines

### DO:

```typescript
// Use descriptive type names
type ValidateUserPermissions<T> = Assert<
    Is.On<T, "permissions">,
    "User permissions missing"
>;

// Compose complex checks clearly
type IsAdminUser = And<Is.Instance<User>, Is.In<User["roles"], "admin">>;

// Provide helpful error messages
type ValidateEmail<Email> = Assert<
    Is<Email, string>,
    `Email must be a string, received ${To.TypeString<Email>}`
>;
```

### DON'T:

```typescript
// Don't use any
type BadCheck = Is<T, any>;

// Don't create unnecessarily complex types
type OverEngineered = Or<
    And<Is<T, string>, Is<T, number>>, // This is impossible
    Is<T, never>
>;

// Don't use runtime checks
type BadImplementation = {
    validate: (data: unknown) => boolean; // No runtime validation!
};
```

## Testing Guidelines

Yes, we still write tests (oh, the irony). But we test the right things:

```typescript
// Good - Testing type system behavior
type TestCase = Assert<
    Is<NumberToString<123>, "123">,
    "Number to string conversion failed"
>;

// Bad - Testing runtime behavior
const test = () => {
    const result = validateUser(data);
    expect(result).toBe(true); // We don't do that here
};
```

### Test Structure

```typescript
// tests/get.test.ts
namespace GetTests {
    namespace TypeString {
        type TypeString = Get.TypeString<{ a: 1; b: "2" }>;
        type Expected = "Record<string, string>" | "Record<string, number>";
        type TestTypeString = Assert<
            //    ^?
            Is<TypeString, Expected>,
            "Should provide a string representation of the type"
        >;

        const GenericFunction = <T, U>(
            value: T,
            arg: {
                type: Get.TypeString<T>;
            }
        ) => {};

        //@ts-expect-error: should match the type name
        const invalid = GenericFunction(3, { type: 3 });
        const valid = GenericFunction(3, { type: "number" });
    }
}
```

## Documentation Guidelines

### Type Documentation

```typescript
/**
 * Validates that a type has all required user properties
 * @template T - The type to validate
 * @typedef {Assert} ValidateUser
 * @example
 * type User = ValidateUser<{
 *   id: string;
 *   name: string;
 * }>;
 */
type ValidateUser<T> = Assert<
    Is.All<[Is.On<T, "id">, Is.On<T, "name">]>,
    "Invalid user shape"
>;
```

### Example Code

-   Always include practical examples
-   Show both success and failure cases
-   Explain error messages
-   Include performance implications

## Pull Request Process

1. **Before Submitting**

    - ~~Run all tests (`pnpm test`)~~ still working on this
    - ~~Run type checks (`pnpm type-check`)~~ still working on this
    - Update documentation
    - Add tests for new features
    - Update README if needed

2. **PR Template**

    ```markdown
    ## Description

    Brief description of changes

    ## Type of Change

    -   [ ] Bug fix
    -   [ ] New feature
    -   [ ] Breaking change
    -   [ ] Documentation update

    ## Type System Impact

    -   Performance implications
    -   Breaking changes
    -   New type capabilities

    ## Testing

    -   Describe test cases
    -   How to verify changes

    ## Documentation

    -   List documentation updates
    ```

3. **Review Process**
    - One approvals required (Until contributions are in full swing. Then at least 2)
    - All checks must pass (When there are tests ofc.)
    - No runtime type checking smuggled in

## Release Process

1. **Version Bump**

    ```bash
    npm|yarn|deno version <major|minor|patch>
    ```

2. **Release Notes**

    - List all changes
    - Highlight breaking changes
    - Include migration guides
    - Thank contributors

3. **Publishing**
    ```bash
    npx jsr publish
    ```

## Recognition

Contributors get:

-   Their name in the README
-   A warm fuzzy feeling
-   Bragging rights about making TypeScript even more powerful
-   Zero runtime type checks in their karma

## Questions?

-   Create an issue
-   Start a discussion
-   Send a carrier pigeon (not recommended)

Remember: The best contribution is one that removes runtime type checks.

---

_Note: By contributing to this project, you agree to write witty commit messages and never ever suggest adding runtime type validation._
