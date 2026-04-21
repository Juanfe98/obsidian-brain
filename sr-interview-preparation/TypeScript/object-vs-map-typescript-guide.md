# JavaScript / TypeScript: Object vs Map

## Goal

This note explains the difference between a normal JavaScript object `{}` and a `Map`, especially for frontend interviews, coding katas, and real-world TypeScript work.

The simplest mental model:

```ts
// Object = model a thing
const user = {
  id: "u1",
  name: "Juan",
  role: "admin",
};

// Map = index things
const usersById = new Map<string, User>();
```

Use an **object** when you are describing a structured entity.

Use a **Map** when you need a dynamic key-value lookup structure.

---

# 1. Basic Definitions

## Normal object

```ts
const obj = {
  id: "u1",
  name: "Juan",
};
```

An object is usually used to represent a structured value with known properties.

Example:

```ts
type User = {
  id: string;
  name: string;
  email: string;
};

const user: User = {
  id: "u1",
  name: "Juan",
  email: "juan@example.com",
};
```

## Map

```ts
const map = new Map();
```

A `Map` is a built-in JavaScript key-value collection designed for dynamic lookups.

Example:

```ts
const usersById = new Map<string, User>();

usersById.set("u1", {
  id: "u1",
  name: "Juan",
  email: "juan@example.com",
});
```

---

# 2. Key Difference: What Are They For?

## Object

Use an object when the data has a meaningful shape.

```ts
const book = {
  id: "b1",
  title: "Clean Code",
  stock: 2,
};
```

This object represents one book.

## Map

Use a `Map` when you are building an index or lookup table.

```ts
const booksById = new Map<string, Book>();

booksById.set("b1", {
  id: "b1",
  title: "Clean Code",
  stock: 2,
});
```

This `Map` represents:

```txt
book id -> book
```

That is a lookup structure.

---

# 3. Key Types

## Object keys

Object keys are mostly:

```ts
string | symbol
```

If you use a number as a key, JavaScript converts it into a string.

```ts
const obj = {
  1: "one",
};

console.log(obj[1]);   // "one"
console.log(obj["1"]); // "one"
```

Internally, the key is treated like `"1"`.

Objects do not handle object keys well:

```ts
const key = { id: 1 };

const obj: Record<string, string> = {};
obj[String(key)] = "value";

console.log(obj);
// { "[object Object]": "value" }
```

That is usually not what you want.

## Map keys

A `Map` can use any value as a key.

```ts
const map = new Map();

map.set("id", "string key");
map.set(1, "number key");
map.set(true, "boolean key");

const objectKey = { id: 1 };
map.set(objectKey, "object key");

console.log(map.get(objectKey));
// "object key"
```

Summary:

```txt
Object -> keys are string/symbol
Map    -> keys can be anything
```

---

# 4. Basic Object Operations

## Create an object

```ts
const user = {
  id: "u1",
  name: "Juan",
};
```

## Read properties

```ts
console.log(user.id);
console.log(user["name"]);
```

## Add or update properties

```ts
user.name = "Juan Felipe";
user["role"] = "admin";
```

In TypeScript, adding undeclared properties may fail if the type does not allow it.

```ts
type User = {
  id: string;
  name: string;
};

const user: User = {
  id: "u1",
  name: "Juan",
};

// user.role = "admin"; // Error: role does not exist on User
```

## Delete a property

```ts
const user = {
  id: "u1",
  name: "Juan",
  role: "admin",
};

delete user.role;

console.log(user);
// { id: "u1", name: "Juan" }
```

## Check if a property exists

Recommended modern way:

```ts
const user = {
  id: "u1",
  name: "Juan",
};

console.log(Object.hasOwn(user, "id"));   // true
console.log(Object.hasOwn(user, "email")); // false
```

Older safe way:

```ts
Object.prototype.hasOwnProperty.call(user, "id");
```

Avoid this for existence checks:

```ts
if (user["id"]) {
  // This checks truthiness, not existence
}
```

Why?

```ts
const data = {
  count: 0,
};

if (data.count) {
  // This will not run, even though count exists
}
```

`0`, `false`, and `""` are valid values but falsy.

---

# 5. Basic Map Operations

## Create a Map

```ts
const map = new Map<string, number>();
```

## Set values

```ts
map.set("apple", 3);
map.set("banana", 5);
```

## Get values

```ts
console.log(map.get("apple"));
// 3
```

If the key does not exist:

```ts
console.log(map.get("orange"));
// undefined
```

## Check if a key exists

```ts
console.log(map.has("apple"));
// true
```

## Delete a key

```ts
map.delete("apple");
```

## Clear the whole Map

```ts
map.clear();
```

## Get size

```ts
console.log(map.size);
```

This is cleaner than objects, where you usually need:

```ts
Object.keys(obj).length;
```

---

# 6. Iterating Over Objects

## Object.keys

```ts
const user = {
  id: "u1",
  name: "Juan",
  role: "admin",
};

for (const key of Object.keys(user)) {
  console.log(key);
}
```

Output:

```txt
id
name
role
```

## Object.values

```ts
for (const value of Object.values(user)) {
  console.log(value);
}
```

Output:

```txt
u1
Juan
admin
```

## Object.entries

```ts
for (const [key, value] of Object.entries(user)) {
  console.log(key, value);
}
```

Output:

```txt
id u1
name Juan
role admin
```

This is very useful when you want to transform an object.

```ts
const uppercaseValues = Object.fromEntries(
  Object.entries(user).map(([key, value]) => [key, String(value).toUpperCase()])
);

console.log(uppercaseValues);
```

---

# 7. Iterating Over Maps

Maps are naturally iterable.

```ts
const map = new Map<string, number>();

map.set("apple", 3);
map.set("banana", 5);
map.set("orange", 2);
```

## Iterate over entries

```ts
for (const [key, value] of map) {
  console.log(key, value);
}
```

This is equivalent to:

```ts
for (const [key, value] of map.entries()) {
  console.log(key, value);
}
```

## Iterate over keys

```ts
for (const key of map.keys()) {
  console.log(key);
}
```

## Iterate over values

```ts
for (const value of map.values()) {
  console.log(value);
}
```

## Convert Map keys to array

```ts
const keys = [...map.keys()];

console.log(keys);
// ["apple", "banana", "orange"]
```

## Convert Map values to array

```ts
const values = [...map.values()];

console.log(values);
// [3, 5, 2]
```

## Convert Map entries to array

```ts
const entries = [...map.entries()];

console.log(entries);
// [["apple", 3], ["banana", 5], ["orange", 2]]
```

Because `Map` is iterable, this also works:

```ts
const entries = [...map];
```

---

# 8. Convert Map to Object

Use:

```ts
const obj = Object.fromEntries(map);
```

Example:

```ts
const map = new Map<string, number>([
  ["apple", 3],
  ["banana", 5],
]);

const obj = Object.fromEntries(map);

console.log(obj);
// { apple: 3, banana: 5 }
```

## Important detail with number keys

```ts
const map = new Map<number, string>([
  [1, "one"],
  [2, "two"],
]);

const obj = Object.fromEntries(map);

console.log(obj);
// { "1": "one", "2": "two" }
```

Object keys become strings.

## If Map keys are objects

```ts
const key = { id: 1 };

const map = new Map<object, string>([
  [key, "value"],
]);

const obj = Object.fromEntries(map);

console.log(obj);
// Usually not useful. Object keys are not preserved as object references.
```

If you need object keys, keep using `Map`.

---

# 9. Convert Object to Map

Use:

```ts
const map = new Map(Object.entries(obj));
```

Example:

```ts
const obj = {
  apple: 3,
  banana: 5,
};

const map = new Map(Object.entries(obj));

console.log(map);
// Map(2) { "apple" => 3, "banana" => 5 }
```

In TypeScript, `Object.entries` often loses some type precision, so sometimes you may need explicit typing for advanced cases.

Simple version:

```ts
const fruitCounts: Record<string, number> = {
  apple: 3,
  banana: 5,
};

const fruitMap = new Map<string, number>(
  Object.entries(fruitCounts)
);
```

---

# 10. JSON Serialization

## Objects serialize naturally

```ts
const user = {
  id: "u1",
  name: "Juan",
};

console.log(JSON.stringify(user));
// {"id":"u1","name":"Juan"}
```

## Maps do not serialize directly

```ts
const map = new Map([
  ["id", "u1"],
  ["name", "Juan"],
]);

console.log(JSON.stringify(map));
// {}
```

To serialize a Map, convert it first.

### Option 1: Convert to object

```ts
const json = JSON.stringify(Object.fromEntries(map));
```

### Option 2: Convert to entries array

```ts
const json = JSON.stringify([...map]);
```

Output shape:

```json
[["id","u1"],["name","Juan"]]
```

To restore it:

```ts
const restoredMap = new Map(JSON.parse(json));
```

---

# 11. Order Behavior

Both objects and maps preserve order in modern JavaScript, but objects have special behavior with integer-like keys.

## Object integer-like key order

```ts
const obj: Record<string, string> = {};

obj["10"] = "ten";
obj["2"] = "two";
obj["1"] = "one";
obj["a"] = "A";

console.log(Object.keys(obj));
// ["1", "2", "10", "a"]
```

Integer-like keys are ordered first.

## Map preserves insertion order exactly

```ts
const map = new Map<string, string>();

map.set("10", "ten");
map.set("2", "two");
map.set("1", "one");
map.set("a", "A");

console.log([...map.keys()]);
// ["10", "2", "1", "a"]
```

If exact insertion order matters, `Map` is more predictable.

---

# 12. Prototype Issues With Objects

Normal objects inherit from `Object.prototype`.

```ts
const obj = {};

console.log("toString" in obj);
// true
```

That can be annoying when using objects as dictionaries.

Safer existence check:

```ts
Object.hasOwn(obj, "toString");
```

You can also create an object with no prototype:

```ts
const dictionary = Object.create(null);

dictionary["toString"] = "safe";

console.log(dictionary["toString"]);
// "safe"
```

But in most modern code, if you need a dynamic dictionary, `Map` is usually cleaner.

---

# 13. TypeScript: Object Types

Objects are excellent for domain models.

```ts
type Book = {
  id: string;
  title: string;
  stock: number;
};

const book: Book = {
  id: "b1",
  title: "Clean Code",
  stock: 2,
};
```

This gives strong property checking.

```ts
book.title = "Clean Architecture";

// book.price = 20; // Error if price is not in Book
```

## Dictionary object with Record

```ts
type User = {
  id: string;
  name: string;
};

const usersById: Record<string, User> = {
  u1: { id: "u1", name: "Juan" },
  u2: { id: "u2", name: "Ana" },
};
```

Access:

```ts
const user = usersById["u1"];
```

`Record<string, User>` means:

```txt
An object where every string key maps to a User.
```

---

# 14. TypeScript: Map Types

```ts
type User = {
  id: string;
  name: string;
};

const usersById = new Map<string, User>();

usersById.set("u1", {
  id: "u1",
  name: "Juan",
});

const user = usersById.get("u1");
```

Important: `Map.get` returns possibly `undefined`.

```ts
const user = usersById.get("u1");
// User | undefined
```

So you often need to check:

```ts
const user = usersById.get("u1");

if (!user) {
  throw new Error("User not found");
}

console.log(user.name);
```

---

# 15. Object vs Map API Comparison

| Operation | Object | Map |
|---|---|---|
| Create | `{}` | `new Map()` |
| Set | `obj[key] = value` | `map.set(key, value)` |
| Get | `obj[key]` | `map.get(key)` |
| Check key | `Object.hasOwn(obj, key)` | `map.has(key)` |
| Delete | `delete obj[key]` | `map.delete(key)` |
| Clear all | recreate object or delete keys | `map.clear()` |
| Size | `Object.keys(obj).length` | `map.size` |
| Iterate entries | `Object.entries(obj)` | `map.entries()` or `map` |
| Iterate keys | `Object.keys(obj)` | `map.keys()` |
| Iterate values | `Object.values(obj)` | `map.values()` |
| JSON | `JSON.stringify(obj)` | convert first |
| Key types | string/symbol | any value |
| Best for | structured data | dynamic lookup/index |

---

# 16. Performance Notes

For small data, the difference usually does not matter.

But generally:

## Map is better for dynamic collections

Good when you do many:

```ts
set
get
has
delete
clear
size
iteration
```

Example:

```ts
const cache = new Map<string, ApiResponse>();
```

## Object is better for structured records

Good when your data has a fixed shape:

```ts
const user = {
  id: "u1",
  name: "Juan",
  role: "admin",
};
```

## Avoid repeated `.find()` inside `.map()`

Naive approach:

```ts
const usersWithOrders = users.map((user) => {
  const userOrders = orders.filter((order) => order.userId === user.id);

  return {
    ...user,
    orders: userOrders,
  };
});
```

Depending on the data, this can become expensive.

Better approach: build a lookup first.

```ts
const ordersByUserId = new Map<string, Order[]>();

for (const order of orders) {
  const currentOrders = ordersByUserId.get(order.userId) ?? [];
  currentOrders.push(order);
  ordersByUserId.set(order.userId, currentOrders);
}

const usersWithOrders = users.map((user) => ({
  ...user,
  orders: ordersByUserId.get(user.id) ?? [],
}));
```

This is a common senior frontend pattern.

---

# 17. Practical Example: Frequency Counter With Map

```ts
function frequencyCounter<T>(array: T[]): Map<T, number> {
  const frequency = new Map<T, number>();

  for (const item of array) {
    const currentCount = frequency.get(item) ?? 0;
    frequency.set(item, currentCount + 1);
  }

  return frequency;
}

console.log(frequencyCounter([1, 2, 2, 3, 3, 3]));
// Map(3) { 1 => 1, 2 => 2, 3 => 3 }

console.log(frequencyCounter(["a", "b", "a"]));
// Map(2) { "a" => 2, "b" => 1 }
```

Convert result to object:

```ts
const result = frequencyCounter(["a", "b", "a"]);
const obj = Object.fromEntries(result);

console.log(obj);
// { a: 2, b: 1 }
```

---

# 18. Practical Example: Frequency Counter With Object

```ts
function frequencyCounter(array: string[]): Record<string, number> {
  const frequency: Record<string, number> = {};

  for (const item of array) {
    frequency[item] = (frequency[item] ?? 0) + 1;
  }

  return frequency;
}

console.log(frequencyCounter(["a", "b", "a"]));
// { a: 2, b: 1 }
```

This is clean when keys are strings.

For generic values, `Map<T, number>` is safer.

---

# 19. Practical Example: Dedupe By Key With Set

```ts
function dedupeByKey<T, K extends keyof T>(array: T[], key: K): T[] {
  const seen = new Set<T[K]>();
  const result: T[] = [];

  for (const item of array) {
    const keyValue = item[key];

    if (seen.has(keyValue)) {
      continue;
    }

    seen.add(keyValue);
    result.push(item);
  }

  return result;
}

const items = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 1, name: "Apple 2" },
];

console.log(dedupeByKey(items, "id"));
// [
//   { id: 1, name: "Apple" },
//   { id: 2, name: "Banana" }
// ]
```

Here `Set` is enough because we only need to track seen IDs.

---

# 20. Practical Example: Key By ID With Map

```ts
type User = {
  id: string;
  name: string;
};

const users: User[] = [
  { id: "u1", name: "Juan" },
  { id: "u2", name: "Ana" },
];

const usersById = new Map<string, User>();

for (const user of users) {
  usersById.set(user.id, user);
}

console.log(usersById.get("u1"));
// { id: "u1", name: "Juan" }
```

Generic `keyBy` with `Map`:

```ts
function keyBy<T, K extends keyof T>(array: T[], key: K): Map<T[K], T> {
  const result = new Map<T[K], T>();

  for (const item of array) {
    result.set(item[key], item);
  }

  return result;
}
```

Usage:

```ts
const usersById = keyBy(users, "id");
```

---

# 21. Practical Example: Key By ID With Object

```ts
type User = {
  id: string;
  name: string;
};

const users: User[] = [
  { id: "u1", name: "Juan" },
  { id: "u2", name: "Ana" },
];

const usersById: Record<string, User> = {};

for (const user of users) {
  usersById[user.id] = user;
}

console.log(usersById["u1"]);
// { id: "u1", name: "Juan" }
```

Generic-ish object version:

```ts
function keyByToObject<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T> {
  const result: Record<string, T> = {};

  for (const item of array) {
    const objectKey = String(item[key]);
    result[objectKey] = item;
  }

  return result;
}
```

Why convert to string?

Because object keys are strings/symbols.

---

# 22. Practical Example: Library Inventory With Map

```ts
interface Book {
  id: string;
  title: string;
  stock: number;
}

class LibraryInventory {
  private catalog: Map<string, Book>;

  constructor(books: Book[]) {
    this.catalog = new Map(books.map((book) => [book.id, { ...book }]));
  }

  isAvailable(id: string): boolean {
    const book = this.catalog.get(id);
    return Boolean(book && book.stock > 0);
  }

  checkout(id: string): void {
    const book = this.catalog.get(id);

    if (!book || book.stock <= 0) {
      throw new Error("Book is not available");
    }

    book.stock -= 1;
  }

  returnBook(id: string): void {
    const book = this.catalog.get(id);

    if (!book) {
      throw new Error("Book not found");
    }

    book.stock += 1;
  }

  getCatalog(): Book[] {
    return Array.from(this.catalog.values()).map((book) => ({ ...book }));
  }
}
```

Why `Map` is good here:

```txt
book id -> book
```

That gives O(1) lookup by book ID.

---

# 23. Mutable vs Immutable Updates in a Map

## Mutable update

```ts
const book = catalog.get(id);

if (book) {
  book.stock -= 1;
}
```

This works because `book` is an object reference.

Pros:

```txt
simple
fast
less memory allocation
okay when data is private and controlled
```

Cons:

```txt
can cause side effects if references are shared
not ideal for React state
does not create a new object reference
```

## Immutable object update inside Map

```ts
const book = catalog.get(id);

if (book) {
  catalog.set(id, {
    ...book,
    stock: book.stock - 1,
  });
}
```

Pros:

```txt
creates a new Book object
safer if references are shared
closer to React/Redux/Zustand patterns
```

Important nuance:

This replaces the object, but the Map itself is still the same Map instance.

For React state, you usually need a new Map too:

```ts
setCatalog((prev) => {
  const next = new Map(prev);
  const book = next.get(id);

  if (!book) {
    return prev;
  }

  next.set(id, {
    ...book,
    stock: book.stock - 1,
  });

  return next;
});
```

This creates:

```txt
new Map reference
new Book object reference
```

That is more React-friendly.

---

# 24. Copy At Boundaries, Mutate Internally

For class-based domain logic, a strong practical rule is:

```txt
copy at boundaries
mutate internally when controlled
return copies to outside callers
```

Example:

```ts
class LibraryInventory {
  private catalog: Map<string, Book>;

  constructor(books: Book[]) {
    // Copy when data enters
    this.catalog = new Map(books.map((book) => [book.id, { ...book }]));
  }

  checkout(id: string): void {
    const book = this.catalog.get(id);

    if (!book || book.stock <= 0) {
      throw new Error("Book is not available");
    }

    // Controlled internal mutation
    book.stock -= 1;
  }

  getCatalog(): Book[] {
    // Copy when data leaves
    return Array.from(this.catalog.values()).map((book) => ({ ...book }));
  }
}
```

This protects the class from external code mutating internal state.

---

# 25. When To Use Object

Use object when:

```txt
you are modeling a thing
the properties are known
you need JSON serialization
you are creating API payloads
you are creating config objects
you want strong domain typing
```

Examples:

```ts
const user = {
  id: "u1",
  name: "Juan",
  role: "admin",
};
```

```ts
const payload = {
  userId: "u1",
  productIds: ["p1", "p2"],
};
```

```ts
const config = {
  retries: 3,
  timeout: 5000,
};
```

---

# 26. When To Use Map

Use `Map` when:

```txt
you need a dynamic key-value collection
you need frequent get/set/has/delete
you need reliable size
you need non-string keys
you need exact insertion order
you are building indexes or caches
you are matching data from different arrays
```

Examples:

```ts
const usersById = new Map<string, User>();
```

```ts
const frequency = new Map<string, number>();
```

```ts
const cache = new Map<string, ApiResponse>();
```

```ts
const selectedItems = new Set<string>();
```

---

# 27. Common Interview Patterns

## Pattern 1: Replace repeated `.find()` with Map

Naive:

```ts
const result = orders.map((order) => ({
  ...order,
  user: users.find((user) => user.id === order.userId),
}));
```

This can be O(n * m).

Optimized:

```ts
const usersById = new Map(users.map((user) => [user.id, user]));

const result = orders.map((order) => ({
  ...order,
  user: usersById.get(order.userId),
}));
```

This is usually O(n + m).

## Pattern 2: Use Set for uniqueness

```ts
const uniqueIds = new Set(items.map((item) => item.id));
```

## Pattern 3: Use Map for grouping

```ts
type Product = {
  id: string;
  category: string;
  name: string;
};

function groupByCategory(products: Product[]): Map<string, Product[]> {
  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const currentGroup = groups.get(product.category) ?? [];
    currentGroup.push(product);
    groups.set(product.category, currentGroup);
  }

  return groups;
}
```

## Pattern 4: Object for API payload

```ts
const payload = {
  title: "New post",
  body: "Hello",
  authorId: "u1",
};

await fetch("/api/posts", {
  method: "POST",
  body: JSON.stringify(payload),
});
```

---

# 28. Big O Summary

## Object lookup

```ts
obj[key]
```

Usually O(1).

## Map lookup

```ts
map.get(key)
```

Usually O(1).

## Array find

```ts
array.find((item) => item.id === id)
```

O(n).

## Repeated find inside map

```ts
arrayA.map((a) => arrayB.find((b) => b.id === a.id))
```

Can become O(n * m), often simplified to O(n²) when arrays have similar size.

## Build Map first

```ts
const byId = new Map(arrayB.map((b) => [b.id, b]));

arrayA.map((a) => byId.get(a.id));
```

Usually O(n + m).

This is one of the most important frontend interview optimization patterns.

---

# 29. Common Mistakes

## Mistake 1: Using object as key in plain object

```ts
const key = { id: 1 };
const obj: Record<string, string> = {};

obj[String(key)] = "value";

console.log(obj);
// { "[object Object]": "value" }
```

Use `Map` for object keys.

## Mistake 2: Checking value instead of existence

```ts
if (obj[key]) {
  // Wrong if value can be 0, false, or ""
}
```

Better:

```ts
Object.hasOwn(obj, key);
```

For Map:

```ts
map.has(key);
```

## Mistake 3: Forgetting `Map.get` can return undefined

```ts
const user = usersById.get("u1");

// user.name; // TypeScript error: user may be undefined
```

Fix:

```ts
if (!user) {
  throw new Error("User not found");
}

console.log(user.name);
```

## Mistake 4: Expecting JSON.stringify(Map) to work

```ts
JSON.stringify(new Map([["a", 1]]));
// "{}"
```

Convert first:

```ts
JSON.stringify(Object.fromEntries(map));
```

## Mistake 5: Using object when Map is clearer

If you are constantly doing:

```ts
get
set
has
delete
size
```

A `Map` may be clearer.

---

# 30. Final Senior Rule

Use **objects** for structured data:

```ts
const user = {
  id: "u1",
  name: "Juan",
};
```

Use **Map** for lookup/index/cache/dynamic key-value collections:

```ts
const usersById = new Map<string, User>();
```

Use **Set** when you only care about uniqueness or membership:

```ts
const selectedIds = new Set<string>();
```

The most important interview idea:

```txt
Arrays are good for ordered lists.
Objects are good for structured records.
Maps are good for fast dynamic lookup.
Sets are good for uniqueness.
```
