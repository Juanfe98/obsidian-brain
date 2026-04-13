# TypeScript — Interview Preparation

## Files in this folder

| File | Topics |
|------|--------|
| `typescript-type-system.md` | Structural typing, any vs unknown vs never, union/intersection types, discriminated unions with exhaustiveness, type narrowing (all mechanisms), type vs interface, enums vs string literals, satisfies operator |
| `typescript-advanced-generics.md` | Generics with constraints, all utility types (Partial, Pick, Omit, Record, Exclude, ReturnType, Awaited...), keyof/typeof, index access types, mapped types, conditional types, infer, template literal types, declaration merging, tsconfig strict flags |

## Senior-level differentiators

- `infer` inside conditional types — extract nested types
- Distributive vs non-distributive conditional types
- `noUncheckedIndexedAccess` — why index access returns `T | undefined`
- Mapped types with modifier removal (`-readonly`, `-?`)
- Template literal types for building event handler maps
- `satisfies` vs type annotation — when each is appropriate
- Variance: why `Array<Dog>` is not assignable to `Array<Animal>`
