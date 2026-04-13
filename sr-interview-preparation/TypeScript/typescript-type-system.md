# TypeScript — Type System Fundamentals

## Glossary

| Term | Meaning |
|------|---------|
| **Structural typing** | Types are compatible if they have the same shape (properties/methods), regardless of name |
| **Nominal typing** | Types are compatible only if they have the same name (Java, C#) — TypeScript does NOT use this |
| **Type alias** | A name given to a type using `type` keyword — can represent any type |
| **Interface** | A contract describing the shape of an object — extendable, mergeable |
| **Union type** | A value that can be one of several types: `A \| B` |
| **Intersection type** | A value that must satisfy multiple types simultaneously: `A & B` |
| **Discriminated union** | A union of types that share a common literal field used to distinguish them |
| **Literal type** | An exact value as a type: `"admin"`, `42`, `true` |
| **Type narrowing** | Reducing a broad type to a more specific one inside a conditional block |
| **Type guard** | A runtime check that narrows a type: `typeof`, `instanceof`, `in`, custom guards |
| **`never`** | A type that represents the impossible — no value can have this type |
| **`unknown`** | The type-safe version of `any` — must be narrowed before use |
| **`any`** | Opts out of type checking — avoid it |
| **`satisfies`** | Validates a value matches a type without widening the inferred type (TS 4.9) |

---

## Structural Typing — TypeScript's foundation

TypeScript checks **shape, not name**. If it looks like a duck and quacks like a duck, it is a duck.

**Why does TypeScript work this way?**
TypeScript was designed to model JavaScript, which has always been structurally typed at runtime — JS doesn't care what "class" an object came from, only what properties it has. Structural typing also makes it easy to work with plain objects, third-party libraries, and JSON data without creating explicit class hierarchies.

**The rule the compiler follows:** "Does this value have at least the properties the type requires?" If yes, the assignment is valid — extra properties are ignored (with one exception: fresh object literals get *excess property checking* to catch typos).

```typescript
interface Point {
    x: number;
    y: number;
}

// This object is assignable to Point even though it wasn't declared as one
const point = { x: 10, y: 20, label: 'origin' }; // has extra property
const p: Point = point; // ✅ valid — has x and y (extra props are fine when assigning via variable)

// Excess property checking — only at point of OBJECT LITERAL assignment
const p2: Point = { x: 10, y: 20, label: 'origin' }; // ❌ error — direct literal gets extra prop check

// Structural compatibility in function parameters
function printPoint(p: Point) { console.log(p.x, p.y); }

class Coordinate {
    constructor(public x: number, public y: number) {}
}
printPoint(new Coordinate(1, 2)); // ✅ valid — Coordinate has x and y
```

---

## Primitive types & Literal types

**Type widening — the default behavior TypeScript applies:**
When you declare a variable with `let`, TypeScript assumes the value might change later, so it *widens* the type to the general category. `let x = "hello"` gives `x` the type `string`, not the literal `"hello"`. With `const`, TypeScript knows the value can never change, so it keeps the literal type: `const x = "hello"` gives `x` the type `"hello"`.

**What `as const` does:**
`as const` tells TypeScript to treat the entire expression as if every value is a `const` — infer the narrowest possible literal type, and make every property `readonly`. Without it, TypeScript widens object property types to `string`, `number`, `boolean`. With it, TypeScript locks them to their exact literal values. This is especially useful when you need the exact string values to be preserved as types (e.g., passing to a function that expects a specific union).

```typescript
// Primitives
let name: string    = "Juan";
let age: number     = 30;
let active: boolean = true;
let nothing: null   = null;
let undef: undefined = undefined;
let big: bigint     = 9007199254740991n;
let sym: symbol     = Symbol("id");

// Literal types — exact values
type Direction = "north" | "south" | "east" | "west";
type StatusCode = 200 | 400 | 404 | 500;
type Toggle = true | false; // same as boolean but explicit

// Const assertion — infers narrowest literal types
const config = {
    endpoint: "https://api.example.com",
    retries: 3,
} as const;
// type: { readonly endpoint: "https://api.example.com"; readonly retries: 3 }
// Without as const: { endpoint: string; retries: number }
```

---

## any vs unknown vs never

**The type hierarchy — think of it as a set of all possible values:**
- `unknown` is the **top type** — every possible value belongs to it. It's the safest type to receive something you don't know yet, because TypeScript forces you to prove what it is before using it.
- `never` is the **bottom type** — the empty set. No value can ever be assigned to `never`. It represents something that logically cannot happen: the return of a function that always throws, or a switch branch that should be unreachable.
- `any` is not part of this hierarchy — it's an **escape hatch** that completely disables type checking in both directions. You can assign `any` to anything and anything to `any`. Use it only as a last resort.

**Why `never` is useful for exhaustiveness:** In a switch over a discriminated union, after all cases are handled, TypeScript narrows the remaining type to `never` (nothing is left). Assigning it to a variable typed as `never` compiles cleanly. If you add a new variant to the union but forget to add a case, the variable assignment fails — TypeScript catches the missing case at compile time.

```typescript
// any — turns off type checking. AVOID.
let val: any = "hello";
val.nonExistent.method(); // ✅ TypeScript says OK — but crashes at runtime

// unknown — type-safe. Must narrow before use.
let input: unknown = "hello";
input.toUpperCase(); // ❌ Error: input is unknown

// Must narrow first:
if (typeof input === "string") {
    input.toUpperCase(); // ✅ narrowed to string
}

// never — the bottom type. No value can be never.
// Used for:

// 1. Exhaustiveness checks in switch statements
function handleDirection(dir: "north" | "south") {
    switch (dir) {
        case "north": return "Going north";
        case "south": return "Going south";
        default:
            const _exhaustive: never = dir; // ✅ unreachable — dir is never
            throw new Error(`Unhandled: ${_exhaustive}`);
    }
}

// 2. Functions that never return
function throwError(msg: string): never {
    throw new Error(msg);
}

// 3. Filtering impossible states in conditional types
type NonNullable<T> = T extends null | undefined ? never : T;
```

---

## Union & Intersection types

**Think in sets — union and intersection come from set theory:**
- A **union** (`A | B`) means: the set of all values that belong to A *or* B. The resulting type only lets you use what is *common* to all members (since you don't know which one you have at runtime).
- An **intersection** (`A & B`) means: the set of values that belong to A *and* B simultaneously. The resulting type has *all* properties from both types combined.

**Why can't you access unique properties of a union without narrowing?**
If you have `string | number`, TypeScript doesn't know which it is at that point. `.toUpperCase()` only exists on `string` — calling it on a `number` would crash. TypeScript enforces that you prove which member you have (via narrowing) before accessing members that aren't shared.

### Union — OR

```typescript
// A value can be one of several types
type StringOrNumber = string | number;

function format(value: StringOrNumber): string {
    if (typeof value === "string") {
        return value.toUpperCase(); // narrowed to string
    }
    return value.toFixed(2); // narrowed to number
}

// Union of object types
type AdminUser = { role: "admin"; permissions: string[] };
type GuestUser = { role: "guest"; sessionExpiry: Date };
type User = AdminUser | GuestUser;
```

### Intersection — AND

```typescript
// A value must satisfy ALL types simultaneously
type WithTimestamps = {
    createdAt: Date;
    updatedAt: Date;
};

type WithId = {
    id: string;
};

// Product has id, createdAt, AND updatedAt
type Product = WithId & WithTimestamps & {
    name: string;
    price: number;
};
```

---

## Discriminated Unions — the most powerful pattern

**Why discriminated unions are more reliable than checking optional properties:**
When you have a union of objects, TypeScript can't narrow just by checking if a property *exists* (it might exist but be `undefined`). A discriminated union solves this by requiring each type to have a *shared* property with a *unique literal value*. Since the discriminant field is always present and always a specific value, TypeScript can narrow the entire type just by reading that one field — no ambiguity possible.

**The key requirement:** the discriminant field must be a literal type (a specific string, number, or boolean), not just a `string`. `kind: string` doesn't work — TypeScript can't distinguish `"loading"` from `"success"` if both are just `string`.

A union of types sharing a **common literal field** (discriminant) that uniquely identifies each variant.

```typescript
// Each type has a unique "kind" literal field — the discriminant
type LoadingState = { kind: "loading" };
type SuccessState = { kind: "success"; data: User[] };
type ErrorState   = { kind: "error";   message: string };

type FetchState = LoadingState | SuccessState | ErrorState;

function render(state: FetchState): string {
    switch (state.kind) {
        case "loading": return "Loading...";
        case "success": return `${state.data.length} users`; // state is SuccessState here
        case "error":   return `Error: ${state.message}`;    // state is ErrorState here
        default:
            const _exhaustive: never = state; // TypeScript errors if a case is missed
            throw new Error("Unhandled state");
    }
}
```

### Discriminated unions vs type predicates

```typescript
// Without discriminated union — messy type narrowing
type Result = { success: true; data: User } | { success: false; error: string };

function handle(result: Result) {
    if (result.success) {
        console.log(result.data); // narrowed to { success: true; data: User }
    } else {
        console.log(result.error); // narrowed to { success: false; error: string }
    }
}
```

---

## Type Guards & Narrowing

**What narrowing actually is — control flow analysis:**
TypeScript performs *control flow analysis* as it reads your code from top to bottom. At every point, it tracks which types are still possible for a variable based on what checks have been performed. When you write `if (typeof x === "string")`, TypeScript records: "inside this block, x can only be string." After the block ends, the original union resumes.

This is purely a compile-time analysis — no runtime overhead. TypeScript is modelling what JavaScript checks actually guarantee.

**The four mechanisms, ranked by what they narrow:**
- `typeof` — narrows primitive types (`string`, `number`, `boolean`, `symbol`, `bigint`, `function`, `undefined`)
- `instanceof` — narrows class instances (anything constructed with `new`)
- `in` — narrows based on property existence (useful for plain objects and interfaces)
- Custom type guard (`x is Type`) — you write the runtime check, TypeScript trusts your return value

TypeScript narrows union types inside conditional blocks based on checks.

### Built-in type guards

```typescript
type Input = string | number | null | undefined | string[];

function process(input: Input) {
    // typeof — narrows primitives
    if (typeof input === "string") {
        input.toUpperCase(); // string
    }

    // null/undefined checks
    if (input != null) {
        // input is string | number | string[] (not null or undefined)
    }

    // instanceof — narrows class instances
    if (input instanceof Date) {
        input.getFullYear(); // Date
    }

    // Array.isArray
    if (Array.isArray(input)) {
        input.join(", "); // string[]
    }

    // in — checks for property existence
    if (input !== null && typeof input === "object" && "length" in input) {
        // input has a length property
    }
}
```

### Custom type guard — `is` keyword

```typescript
interface Dog { breed: string; bark(): void }
interface Cat { indoor: boolean; meow(): void }

type Pet = Dog | Cat;

// Type predicate: if this returns true, TypeScript narrows to Dog
function isDog(pet: Pet): pet is Dog {
    return (pet as Dog).bark !== undefined;
}

function interact(pet: Pet) {
    if (isDog(pet)) {
        pet.bark();  // ✅ TypeScript knows it's a Dog
    } else {
        pet.meow();  // ✅ TypeScript knows it's a Cat
    }
}
```

### Assertion function

```typescript
// Assertion: if the function returns, TypeScript assumes the condition is true
function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error(`Expected string, got ${typeof value}`);
    }
}

function processInput(input: unknown) {
    assertIsString(input);
    // After assertIsString, TypeScript knows input is string
    console.log(input.toUpperCase());
}
```

---

## type vs interface

**The conceptual difference:**
An `interface` is an *open type* — you can add properties to it later (in the same file or another file) via declaration merging. This is intentional: it allows third-party libraries and the TypeScript standard library itself to be extended by users without modifying the original source.

A `type` alias is a *closed name* — once defined, it's sealed. You can't reopen it. In return, `type` is far more expressive: it can name a union, an intersection, a primitive, a mapped type, a conditional type — things that don't fit the concept of a "declared interface".

**Declaration merging in practice:** When TypeScript sees two `interface` declarations with the same name in scope, it merges them into one. This is how you add `user` to Express's `Request` object, or add custom properties to the browser's `Window`. With `type`, the same name twice is an error.

| Feature | `type` | `interface` |
|---------|--------|-------------|
| Object shape | ✅ | ✅ |
| Primitives/literals | ✅ `type Name = string` | ❌ |
| Union | ✅ `type X = A \| B` | ❌ |
| Intersection | ✅ `type X = A & B` | ✅ via `extends` |
| Extension | ✅ via `&` | ✅ via `extends` |
| Declaration merging | ❌ error | ✅ same name = merged |
| Computed keys | ✅ `type X = { [K in T]: ... }` | ❌ |
| Recursive types | ✅ (with care) | ✅ |

```typescript
// interface — extendable, mergeable
interface Animal {
    name: string;
}
interface Dog extends Animal {
    breed: string;
}

// Declaration merging — only interfaces
interface Window {
    myCustomProp: string; // adds to existing Window type
}

// type — more expressive for complex types
type EventName = "click" | "hover" | "focus";
type Nullable<T> = T | null;
type StringMap = { [key: string]: string };
```

**Rule of thumb:**
- Use `interface` for object shapes that others will extend or implement
- Use `type` for everything else: unions, mapped types, utility types, primitives

---

## Enums vs String Literal Unions

**What enums actually compile to — and why that matters:**
A TypeScript enum is not erased at compile time. It generates a real JavaScript object: `{ North: "NORTH", South: "SOUTH", ... }`. This means your bundle includes that object even if it's just used as a type. It also means you can iterate over it at runtime with `Object.values(Direction)`.

**The hidden danger of numeric enums:** If you don't assign string values, TypeScript generates a *numeric* enum with a reverse mapping: `{ 0: "North", North: 0 }`. This means `Direction[0] === "North"` at runtime. Any `number` is assignable to a numeric enum, which completely breaks type safety — `Direction.North` and `42` are both valid `Direction` values.

**Why string literal unions are safer:** They are purely compile-time. No JavaScript is generated, no runtime object exists, no reverse mapping, no possibility of numeric confusion. The values are just strings — they serialize naturally to JSON and need no import.

```typescript
// Enum — generates runtime JavaScript code
enum Direction {
    North = "NORTH",
    South = "SOUTH",
    East  = "EAST",
    West  = "WEST",
}
const dir: Direction = Direction.North; // "NORTH"

// String literal union — no runtime code, pure TypeScript
type DirectionLiteral = "NORTH" | "SOUTH" | "EAST" | "WEST";
const dir2: DirectionLiteral = "NORTH";
```

**Prefer string literal unions over enums because:**
- No runtime JS generated (smaller bundle)
- Works naturally with JSON APIs
- Better exhaustiveness checking
- No need to import an enum just to use its values

**Use enums when:** you need to iterate over values, or you want a real runtime object.

---

## satisfies — validate without widening (TS 4.9)

**The problem it solves — the tension between annotation and inference:**
When you write `const x: SomeType = { ... }`, TypeScript widens the inferred type of `x` to `SomeType`. You lose the specific knowledge of what you actually wrote. For example, if `SomeType` has a field typed as `string | string[]`, and you wrote `"red"`, TypeScript now considers it `string | string[]` — you can't call `.toUpperCase()` on it without narrowing.

`satisfies` separates two concerns that a type annotation conflates:
1. **Validation** — "does this value match the expected shape?" (what `satisfies` does)
2. **Widening** — "what type does this variable have going forward?" (what annotation does)

With `satisfies`, TypeScript validates the structure against the type but keeps the *inferred* type for each property. You get the safety of the check without losing the specificity of what you wrote.

**Simple mental model:** annotation says *"treat this as T"* — satisfies says *"check this is T, but remember what it actually is"*.

```typescript
type Color = "red" | "green" | "blue";
type Theme = { [key: string]: Color | string[] };

// Without satisfies — TypeScript widens the type
const palette = {
    red:   [255, 0, 0],
    green: "#00ff00",
};
palette.red.map(x => x); // ✅ works — but TypeScript doesn't know it's an array

// With satisfies — validates against Theme but preserves the inferred type
const palette2 = {
    red:   [255, 0, 0],
    green: "#00ff00",
    blue:  [0, 0, 255],
} satisfies Theme;

palette2.red.map(x => x);    // ✅ TypeScript knows red is number[] (not Color | string[])
palette2.green.toUpperCase(); // ✅ TypeScript knows green is string
```

`satisfies` = "check that this matches the type, but don't widen my inferred type to that type."

---

## Interview answers

### What is structural typing in TypeScript?
TypeScript checks compatibility by shape, not by name. If an object has all the required properties of a type, it is assignable to that type — regardless of what class it came from or what name it was declared with. This is the opposite of nominal typing in Java/C#.

### What is the difference between unknown and any?
`any` disables type checking — you can do anything with an `any` value without errors. `unknown` is the type-safe alternative — you can't do anything with it until you narrow it with a type check. `unknown` is what you should use for values you don't know the type of at compile time.

### What is a discriminated union?
A union of object types that share a common literal property (the discriminant). This common field lets TypeScript narrow to the exact type inside switch/if statements, and enables exhaustiveness checking with `never`.

### What is the difference between type and interface?
Both describe object shapes. `interface` is extendable via `extends`, supports declaration merging, and is more verbose. `type` is more versatile: it can represent unions, intersections, primitives, mapped types, and computed properties. Use `interface` for public APIs that others may extend; `type` for complex type expressions.

### When would you choose string literal unions over enums?
Almost always. String literal unions produce no runtime JavaScript, work naturally with JSON, have better exhaustiveness checking in switches, and don't require imports. Use enums only when you need to iterate over all values or need a real runtime object.

### What is the satisfies operator?
A TS 4.9 operator that validates a value against a type at the assignment point without widening the inferred type. Unlike a type annotation, `satisfies` lets TypeScript infer the specific type of each property while still checking that the overall structure is valid.
