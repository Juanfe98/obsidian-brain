# Senior Software Engineer Interview Guide — Endava JD

## 1. What this role is really asking for

This JD is for a **Senior Frontend / Full-Stack leaning engineer** who can work across the full application lifecycle:

- Understand product requirements.
- Clarify ambiguity with stakeholders.
- Design technical solutions.
- Estimate implementation effort.
- Build clean, tested, maintainable code.
- Review other engineers' work.
- Identify risks early.
- Use modern engineering practices: Git, CI/CD, testing, Agile, DevOps, AI-assisted SDLC.
- Communicate clearly in English with clients and teams.

The role is not only about writing React code. It is about showing that you can **own a feature end-to-end**.

A strong senior-level answer usually includes:

> “I start by clarifying the business goal and constraints, then I propose a simple design, identify risks, split the work into small deliverables, write tests, review performance/accessibility/security concerns, and coordinate with backend/product/QA to release safely.”

---

## 2. How to introduce yourself for this JD

Use a concise answer like this:

> I’m a Senior Software Engineer with 6+ years of experience building frontend and full-stack applications using React, TypeScript, JavaScript, HTML, CSS, Node.js, and backend integrations. I’ve worked on production applications where I had to collaborate with product, backend, QA, design, and platform teams to deliver maintainable features.  
>
> I care a lot about clean code, testing, performance, accessibility, and reducing complexity. I’m comfortable working in Agile teams, reviewing code, clarifying requirements, and proposing technical solutions. Recently, I’ve also been applying AI tools to speed up the SDLC, especially for code reviews, test generation, documentation, and requirement refinement.

---

## 3. Technical topics to prepare

The JD mentions these core areas:

1. JavaScript / TypeScript
2. React / Angular / Vue
3. HTML / CSS
4. Node.js / Next.js / NestJS
5. SQL / databases
6. Git
7. Testing and mocking
8. HTTP / REST / JSON / TCP/IP
9. Design patterns / architecture patterns
10. Clean code / SOLID
11. CI/CD / DevOps
12. Agile / Scrum / Kanban
13. AI in the SDLC
14. Communication and stakeholder collaboration

---

# Part 1 — JavaScript and TypeScript

## 4. JavaScript fundamentals you should know

### Event loop

JavaScript is single-threaded for executing JS code, but the runtime uses queues to handle asynchronous operations.

Main concepts:

- **Call stack**: where synchronous code runs.
- **Macrotask queue**: `setTimeout`, `setInterval`, DOM events, I/O callbacks.
- **Microtask queue**: Promises, `queueMicrotask`.
- **Node.js nextTick queue**: `process.nextTick`, executed before Promise microtasks in Node.

Example:

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");
```

Output:

```txt
A
D
C
B
```

Why?

1. Synchronous code runs first.
2. Promise microtasks run next.
3. Macrotasks like `setTimeout` run after.

Senior explanation:

> The event loop matters when building responsive UIs and scalable backend services because blocking synchronous work can freeze the UI or delay request handling. I avoid heavy synchronous operations in hot paths and use async flows carefully.

---

## 5. `this` in JavaScript

In JavaScript, `this` depends on how a function is called.

```js
const user = {
  name: "Juan",
  sayName() {
    console.log(this.name);
  },
};

user.sayName(); // Juan
```

But if you pass the function as a callback:

```js
const fn = user.sayName;
fn(); // undefined in strict mode
```

Because the function lost its object context.

You can fix it with `bind`:

```js
const boundFn = user.sayName.bind(user);
boundFn(); // Juan
```

Or use an arrow function when you want lexical `this`:

```js
const user = {
  name: "Juan",
  sayNameLater() {
    setTimeout(() => {
      console.log(this.name);
    }, 1000);
  },
};
```

Interview answer:

> Regular functions have dynamic `this`, depending on the caller. Arrow functions do not bind their own `this`; they capture it from the surrounding scope. In React functional components, I rarely deal with `this`, but it is still important when working with callbacks, classes, object methods, or libraries.

---

## 6. TypeScript fundamentals

### Why TypeScript?

TypeScript helps catch bugs earlier by adding static types to JavaScript.

Example:

```ts
type User = {
  id: string;
  name: string;
  email?: string;
};

function getUserName(user: User): string {
  return user.name;
}
```

### Union types

```ts
type Status = "idle" | "loading" | "success" | "error";

function renderStatus(status: Status) {
  if (status === "loading") return "Loading...";
  if (status === "error") return "Something went wrong";
  return "Ready";
}
```

### Generics

Generics let you write reusable code while preserving types.

```ts
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

const number = getFirstItem([1, 2, 3]); // number | undefined
const name = getFirstItem(["Ana", "Juan"]); // string | undefined
```

### Practical generic use case

```ts
type ApiResponse<T> = {
  data: T;
  status: number;
  error?: string;
};

type Product = {
  id: string;
  title: string;
  price: number;
};

async function fetchJson<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);

  if (!response.ok) {
    return {
      data: null as T,
      status: response.status,
      error: "Request failed",
    };
  }

  return {
    data: await response.json(),
    status: response.status,
  };
}

const productResponse = await fetchJson<Product>("/api/products/1");
```

Senior explanation:

> I use TypeScript not just to type variables, but to model the domain. Good types make invalid states harder to represent and reduce runtime bugs.

---

# Part 2 — React

## 7. React fundamentals

React is a UI library based on components, state, props, and rendering.

You should be ready to explain:

- Component composition
- Props vs state
- Controlled vs uncontrolled components
- Hooks
- Effects
- Context
- State management
- Performance optimization
- Testing
- Accessibility

---

## 8. Props vs state

```tsx
type UserCardProps = {
  name: string;
  role: string;
};

function UserCard({ name, role }: UserCardProps) {
  return (
    <article>
      <h2>{name}</h2>
      <p>{role}</p>
    </article>
  );
}
```

`props` are passed from parent to child.

`state` belongs to the component:

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((current) => current + 1)}>
      Count: {count}
    </button>
  );
}
```

Interview answer:

> Props represent external input. State represents internal mutable data that affects rendering. I try to keep state as close as possible to where it is needed and lift it only when multiple components need to share it.

---

## 9. Controlled components

```tsx
import { useState } from "react";

function SearchInput() {
  const [query, setQuery] = useState("");

  return (
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Search..."
    />
  );
}
```

Use case:

- Search forms
- Validation
- Dynamic filtering
- Forms where React needs to control the value

Senior explanation:

> Controlled components give React full control over form state, which makes validation and conditional UI easier. For very large forms, I may use a form library to reduce unnecessary re-renders.

---

## 10. `useEffect`

`useEffect` is for synchronizing React with external systems:

- Fetching data
- Subscribing to events
- Timers
- WebSockets
- DOM APIs

Example:

```tsx
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
};

function UsersList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      const response = await fetch("/api/users", {
        signal: controller.signal,
      });

      const data = await response.json();
      setUsers(data);
    }

    loadUsers();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Senior explanation:

> I avoid using `useEffect` for derived state that can be calculated during render. I use it when I need to synchronize with something outside React, like an API, browser event, timer, or subscription.

---

## 11. Avoiding unnecessary `useEffect`

Bad:

```tsx
function ProductSummary({ price, quantity }: { price: number; quantity: number }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(price * quantity);
  }, [price, quantity]);

  return <p>Total: {total}</p>;
}
```

Better:

```tsx
function ProductSummary({ price, quantity }: { price: number; quantity: number }) {
  const total = price * quantity;

  return <p>Total: {total}</p>;
}
```

Why?

Derived values do not need state.

Interview answer:

> A common React mistake is storing derived data in state. This creates extra renders and potential inconsistencies. I prefer deriving values directly unless there is a real reason to persist them.

---

## 12. React performance

Common tools:

- `React.memo`
- `useMemo`
- `useCallback`
- Virtualization
- Code splitting
- Lazy loading
- Avoiding unnecessary state updates
- Keeping component trees simple

Example:

```tsx
import { memo, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
};

const ProductRow = memo(function ProductRow({ product }: { product: Product }) {
  return (
    <li>
      {product.name} - ${product.price}
    </li>
  );
});

function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />

      <ul>
        {filteredProducts.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </ul>
    </>
  );
}
```

Important senior point:

> I do not use memoization everywhere. I use it when there is evidence of expensive computation, unnecessary re-renders, or large lists. Premature memoization can make code harder to read.

---

## 13. React architecture example

For medium/high complexity apps, avoid placing everything inside one component.

Example structure:

```txt
src/
  features/
    users/
      api/
        usersApi.ts
      components/
        UserCard.tsx
        UsersList.tsx
      hooks/
        useUsers.ts
      types/
        user.ts
      utils/
        mapUserResponse.ts
```

Example hook:

```ts
import { useEffect, useState } from "react";
import { getUsers } from "../api/usersApi";
import type { User } from "../types/user";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      try {
        setIsLoading(true);
        setError(null);

        const users = await getUsers(controller.signal);
        setUsers(users);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setError("Unable to load users");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();

    return () => controller.abort();
  }, []);

  return {
    users,
    isLoading,
    error,
  };
}
```

API file:

```ts
import type { User } from "../types/user";

export async function getUsers(signal?: AbortSignal): Promise<User[]> {
  const response = await fetch("/api/users", { signal });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}
```

Component:

```tsx
import { useUsers } from "../hooks/useUsers";

export function UsersList() {
  const { users, isLoading, error } = useUsers();

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Senior explanation:

> I like separating API logic, domain types, hooks, and UI components. This makes testing easier and prevents components from becoming too large.

---

# Part 3 — HTML and CSS

## 14. Semantic HTML

Good semantic HTML improves accessibility, SEO, and maintainability.

Bad:

```html
<div onclick="submitForm()">Submit</div>
```

Better:

```html
<button type="submit">Submit</button>
```

Use native elements first:

- Navigation: `nav`
- Main content: `main`
- Independent content: `article`
- Section of page: `section`
- Button action: `button`
- Navigation link: `a`
- Form fields: `label`, `input`, `select`, `textarea`

Interview answer:

> I prefer native semantic HTML first because it gives keyboard behavior, accessibility, and browser support for free. I only add ARIA when native HTML cannot express the required behavior.

---

## 15. CSS layout: Flexbox vs Grid

Use **Flexbox** for one-dimensional layouts:

```css
.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}
```

Use **Grid** for two-dimensional layouts:

```css
.dashboard {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.5rem;
}
```

Use Grid for page layouts:

```css
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.content {
  display: grid;
  grid-template-columns: 240px 1fr 240px;
}
```

Senior answer:

> If the layout mainly flows in one direction, I start with Flexbox. If I need rows and columns at the same time, I use Grid. I also think about responsiveness from the beginning, not as an afterthought.

---

## 16. Accessibility basics

Checklist:

- Use semantic elements.
- Every input should have a label.
- Interactive elements should be keyboard accessible.
- Use visible focus states.
- Use `alt` text for meaningful images.
- Use `aria-label` only when text is not visible.
- Do not use `div` as a button.
- Use `role="alert"` for important dynamic errors.

Example:

```tsx
function LoginForm() {
  return (
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="email" />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" autoComplete="current-password" />

      <button type="submit">Sign in</button>
    </form>
  );
}
```

---

# Part 4 — Node.js, REST, and backend basics

## 17. Node.js

Node.js is a JavaScript runtime commonly used for building APIs, backend services, scripts, and real-time applications.

Strengths:

- Good for I/O-heavy applications.
- Uses non-blocking async operations.
- Strong ecosystem.
- Same language across frontend and backend.

Weaknesses:

- CPU-heavy tasks can block the event loop.
- Requires care with error handling and async flows.

Interview answer:

> Node.js is strong for APIs, BFFs, real-time apps, and services that perform many network or database operations. For CPU-heavy workloads, I would consider worker threads, queues, or another service specialized for that workload.

---

## 18. Express REST API example

```ts
import express from "express";

const app = express();

app.use(express.json());

type User = {
  id: string;
  name: string;
};

const users: User[] = [
  { id: "1", name: "Ana" },
  { id: "2", name: "Juan" },
];

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.get("/api/users/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.json(user);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

Senior improvement:

- Validate input.
- Use proper error middleware.
- Avoid leaking internal errors.
- Add logging.
- Add tests.
- Use database repositories.
- Add authentication/authorization when required.

---

## 19. REST principles

REST APIs commonly use HTTP methods:

- `GET`: read data
- `POST`: create data
- `PUT`: replace data
- `PATCH`: partially update data
- `DELETE`: remove data

Example:

```txt
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

Status codes:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`

Senior answer:

> I try to design APIs around resources, use consistent status codes, validate inputs, return predictable error shapes, and avoid exposing internal implementation details.

---

## 20. JSON API error response example

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User was not found",
    "requestId": "req-123"
  }
}
```

Why include `requestId`?

It helps trace production issues across logs.

---

# Part 5 — SQL and databases

## 21. SQL basics

Example table:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Insert:

```sql
INSERT INTO users (name, email)
VALUES ('Juan', 'juan@example.com');
```

Select:

```sql
SELECT id, name, email
FROM users
WHERE email = 'juan@example.com';
```

Update:

```sql
UPDATE users
SET name = 'Juan Felipe'
WHERE id = 1;
```

Delete:

```sql
DELETE FROM users
WHERE id = 1;
```

---

## 22. Joins

Example:

```sql
SELECT
  orders.id AS order_id,
  users.name AS customer_name,
  orders.total
FROM orders
INNER JOIN users ON users.id = orders.user_id;
```

Common joins:

- `INNER JOIN`: matching rows from both tables.
- `LEFT JOIN`: all rows from left table, matching rows from right table.
- `RIGHT JOIN`: all rows from right table, matching rows from left table.
- `FULL JOIN`: all rows from both sides.

Senior answer:

> I use joins to model relationships between entities. I pay attention to indexes, query plans, and avoiding N+1 query issues when using ORMs.

---

## 23. Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
```

Indexes improve read performance but add overhead to writes.

Interview answer:

> Indexes help queries find rows faster, especially for filtering, joining, or sorting. But they are not free: they consume storage and slow down inserts/updates, so I add them based on query patterns.

---

# Part 6 — Clean code and SOLID

## 24. Clean code principles

Good code should be:

- Simple
- Readable
- Testable
- Cohesive
- Low coupling
- Explicit
- Easy to change

Bad:

```ts
function process(data: any) {
  // does validation, formatting, API calls, logging, UI state updates
}
```

Better:

```ts
function validateUserInput(input: UserInput): ValidationResult {
  // validation only
}

function mapInputToPayload(input: UserInput): CreateUserPayload {
  // mapping only
}

async function createUser(payload: CreateUserPayload): Promise<User> {
  // API call only
}
```

Senior answer:

> Clean code is not about making code look fancy. It is about reducing cognitive load and making future changes safer.

---

## 25. SOLID principles

### S — Single Responsibility Principle

A function/class/component should have one clear reason to change.

Bad:

```ts
function UserProfile() {
  // fetches user
  // validates permissions
  // formats data
  // renders UI
  // tracks analytics
}
```

Better:

```txt
useUserProfileData()
canViewUserProfile()
formatUserDisplayName()
UserProfileView
trackUserProfileViewed()
```

---

### O — Open/Closed Principle

Code should be open for extension but closed for modification.

Bad:

```ts
function calculateDiscount(type: string, price: number) {
  if (type === "premium") return price * 0.8;
  if (type === "regular") return price * 0.9;
  return price;
}
```

Better:

```ts
type DiscountStrategy = (price: number) => number;

const discountStrategies: Record<string, DiscountStrategy> = {
  premium: (price) => price * 0.8,
  regular: (price) => price * 0.9,
  none: (price) => price,
};

function calculateDiscount(type: string, price: number) {
  const strategy = discountStrategies[type] ?? discountStrategies.none;
  return strategy(price);
}
```

---

### L — Liskov Substitution Principle

Subtypes should be replaceable without breaking behavior.

Practical frontend example:

```ts
type PaymentProvider = {
  pay(amount: number): Promise<void>;
};

class StripeProvider implements PaymentProvider {
  async pay(amount: number) {
    // Stripe implementation
  }
}

class PayPalProvider implements PaymentProvider {
  async pay(amount: number) {
    // PayPal implementation
  }
}
```

Any provider should work where `PaymentProvider` is expected.

---

### I — Interface Segregation Principle

Do not force consumers to depend on things they do not use.

Bad:

```ts
type UserService = {
  getUser: () => Promise<User>;
  createUser: () => Promise<User>;
  deleteUser: () => Promise<void>;
  exportUsers: () => Promise<Blob>;
};
```

Better:

```ts
type UserReader = {
  getUser: () => Promise<User>;
};

type UserWriter = {
  createUser: () => Promise<User>;
  deleteUser: () => Promise<void>;
};
```

---

### D — Dependency Inversion Principle

High-level modules should depend on abstractions, not concrete implementations.

```ts
type Logger = {
  info(message: string): void;
  error(message: string): void;
};

function createUserService(logger: Logger) {
  return {
    createUser(name: string) {
      logger.info(`Creating user ${name}`);
    },
  };
}
```

This allows replacing the logger in tests.

---

# Part 7 — Design patterns

## 26. Factory pattern

Use a factory when object creation has logic.

```ts
type NotificationChannel = "email" | "sms";

type NotificationSender = {
  send(message: string): Promise<void>;
};

class EmailSender implements NotificationSender {
  async send(message: string) {
    console.log(`Sending email: ${message}`);
  }
}

class SmsSender implements NotificationSender {
  async send(message: string) {
    console.log(`Sending SMS: ${message}`);
  }
}

function createNotificationSender(channel: NotificationChannel): NotificationSender {
  if (channel === "email") return new EmailSender();
  if (channel === "sms") return new SmsSender();

  throw new Error("Unsupported channel");
}
```

Use case:

- Payment providers
- Notification channels
- Feature flag based implementations
- Different API clients per environment

---

## 27. Strategy pattern

Use Strategy when behavior changes depending on context.

```ts
type SortStrategy<T> = (items: T[]) => T[];

const sortByName: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => a.name.localeCompare(b.name));

const sortByCreatedDate: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

function sortUsers(users: User[], strategy: SortStrategy<User>) {
  return strategy(users);
}
```

Use case:

- Sorting
- Pricing rules
- Discount rules
- Feature-specific behavior

---

## 28. Adapter pattern

Use Adapter when integrating with external APIs that do not match your domain.

External API:

```ts
type ExternalUserResponse = {
  user_id: string;
  full_name: string;
};
```

Internal domain:

```ts
type User = {
  id: string;
  name: string;
};
```

Adapter:

```ts
function mapExternalUserToUser(response: ExternalUserResponse): User {
  return {
    id: response.user_id,
    name: response.full_name,
  };
}
```

Senior answer:

> I use adapters to isolate external API shapes from the rest of the application. If the API changes, I update the adapter instead of touching many UI components.

---

## 29. MVVM

MVVM means:

- **Model**: domain data and business rules.
- **View**: UI.
- **ViewModel**: prepares data and actions for the view.

React example:

```ts
type Product = {
  id: string;
  title: string;
  price: number;
};

function useProductViewModel(product: Product) {
  return {
    title: product.title.toUpperCase(),
    formattedPrice: `$${product.price.toFixed(2)}`,
  };
}
```

View:

```tsx
function ProductCard({ product }: { product: Product }) {
  const viewModel = useProductViewModel(product);

  return (
    <article>
      <h2>{viewModel.title}</h2>
      <p>{viewModel.formattedPrice}</p>
    </article>
  );
}
```

Senior answer:

> In React, custom hooks can act like a ViewModel by keeping data preparation and UI behavior outside the presentational component.

---

# Part 8 — Testing and mocking

## 30. Testing pyramid

Common layers:

1. Unit tests
2. Integration tests
3. End-to-end tests

Senior explanation:

> I prefer having many unit/integration tests and fewer E2E tests for critical flows. E2E tests are valuable, but they are slower and more fragile, so they should cover the most important user journeys.

---

## 31. Unit test example with Vitest

```ts
import { describe, expect, it } from "vitest";

function calculateTotal(price: number, quantity: number) {
  return price * quantity;
}

describe("calculateTotal", () => {
  it("returns price multiplied by quantity", () => {
    expect(calculateTotal(10, 3)).toBe(30);
  });
});
```

---

## 32. React Testing Library example

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <button onClick={() => setCount((current) => current + 1)}>
      Count: {count}
    </button>
  );
}

describe("Counter", () => {
  it("increments count when clicking the button", async () => {
    const user = userEvent.setup();

    render(<Counter />);

    await user.click(screen.getByRole("button", { name: /count: 0/i }));

    expect(screen.getByRole("button", { name: /count: 1/i })).toBeInTheDocument();
  });
});
```

Senior answer:

> I test behavior, not implementation details. I prefer queries like `getByRole` because they are closer to how users and assistive technologies interact with the UI.

---

## 33. Mocking API calls

With MSW:

```ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: "1", name: "Ana" },
      { id: "2", name: "Juan" },
    ]);
  }),
];
```

Why MSW?

- Mocks at network level.
- Useful for tests and local development.
- More realistic than mocking implementation details.

Senior answer:

> For API mocking, I prefer network-level mocks such as MSW because the component still uses the real fetch/client logic. That gives more confidence than mocking internal functions directly.

---

# Part 9 — Git

## 34. Git basics

Commands to know:

```bash
git status
git checkout -b feature/my-feature
git add .
git commit -m "Add user profile loading state"
git push origin feature/my-feature
```

Useful commands:

```bash
git log --oneline
git diff
git stash
git rebase main
git cherry-pick <commit>
```

Senior answer:

> I try to keep pull requests focused, with clear commits when possible. I prefer small, reviewable changes because they reduce risk and make feedback faster.

---

## 35. Code review mindset

When reviewing PRs, look for:

- Correctness
- Readability
- Simplicity
- Tests
- Edge cases
- Accessibility
- Security
- Performance
- Consistency with project patterns

Example review comment:

> Nice improvement. One suggestion: we could extract this condition into a named helper to make the intent clearer and easier to test.

---

# Part 10 — HTTP, REST, JSON, TCP/IP

## 36. HTTP request lifecycle

When a browser calls an API:

1. DNS resolves the domain.
2. TCP connection is established.
3. TLS handshake happens for HTTPS.
4. Browser sends HTTP request.
5. Server processes request.
6. Server sends response.
7. Browser parses response.

Senior explanation:

> I do not need to know every low-level detail daily, but understanding the request lifecycle helps debug latency, CORS, caching, DNS, TLS, and API failures.

---

## 37. HTTP headers

Common headers:

```txt
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
Cache-Control: no-cache
```

Example fetch:

```ts
async function createUser(payload: { name: string }) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return response.json();
}
```

---

## 38. CORS

CORS controls whether a browser allows frontend code from one origin to call another origin.

Example:

```txt
Frontend: https://app.example.com
API:      https://api.example.com
```

The API must allow the frontend origin.

Senior answer:

> CORS is enforced by browsers. The server needs to return the correct headers, like `Access-Control-Allow-Origin`, depending on the allowed frontend origins.

---

# Part 11 — CI/CD and DevOps

## 39. CI/CD

CI/CD means:

- **Continuous Integration**: automatically validate code changes.
- **Continuous Delivery/Deployment**: automatically prepare or deploy releases.

Typical pipeline:

```txt
Pull Request opened
  -> install dependencies
  -> lint
  -> typecheck
  -> unit tests
  -> integration tests
  -> build
  -> security checks
  -> deploy to staging
  -> run smoke tests
  -> deploy to production
```

Example GitHub Actions:

```yaml
name: CI

on:
  pull_request:
    branches:
      - main

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

Senior answer:

> A good CI/CD pipeline gives confidence that changes are safe before merging. I expect at least linting, type checking, tests, and build validation in PRs.

---

## 40. Deployment strategies

Common strategies:

### Blue-green deployment

Two environments:

- Blue: current production
- Green: new version

Traffic switches from blue to green when ready.

### Canary deployment

Release to a small percentage of users first.

Example:

```txt
5% users -> new version
Monitor errors and metrics
25% users -> new version
100% users -> new version
```

### Feature flags

Deploy code but control availability with configuration.

```ts
if (featureFlags.newCheckoutExperience) {
  return <NewCheckout />;
}

return <OldCheckout />;
```

Senior answer:

> I like feature flags when we need safer releases, A/B testing, or gradual rollout. But flags should be cleaned up after the feature is fully released to avoid long-term complexity.

---

# Part 12 — Agile

## 41. Scrum

Common Scrum ceremonies:

- Sprint planning
- Daily standup
- Refinement
- Review/demo
- Retrospective

Senior answer:

> In Agile teams, I try to clarify scope early, break work into small deliverables, communicate blockers quickly, and keep tickets updated so stakeholders have visibility.

---

## 42. Kanban

Kanban focuses on flow:

- Backlog
- Ready
- In progress
- Review
- Done

Useful concepts:

- WIP limits
- Cycle time
- Continuous delivery
- Bottleneck detection

Senior answer:

> Scrum works well with planned iterations. Kanban works well when work arrives continuously, like support, platform, or operational teams.

---

# Part 13 — AI in the SDLC

## 43. What “AI in SDLC / spec-driven development” means

This JD explicitly mentions:

> Good understanding and practical experience in applying AI in the SDLC, spec-driven development.

They may ask how you use AI at work.

A strong answer:

> I use AI as an engineering assistant, not as an autopilot. I use it to refine requirements, generate edge cases, draft tests, explain unfamiliar code, create documentation, and review alternatives. But I always validate the output, run tests, check security implications, and make sure the solution follows project patterns.

---

## 44. AI use cases in SDLC

### Requirement clarification

Prompt example:

```txt
Given this user story, identify missing requirements, edge cases, and acceptance criteria.
```

### Test generation

Prompt example:

```txt
Generate unit test cases for this function. Include happy path, edge cases, invalid input, and error scenarios.
```

### Code review assistant

Prompt example:

```txt
Review this pull request for readability, performance, accessibility, security, and test coverage.
```

### Documentation

Prompt example:

```txt
Create developer documentation explaining how this module works, including setup, dependencies, and troubleshooting.
```

### Debugging

Prompt example:

```txt
Given this error log and the related code, suggest possible root causes and a debugging plan.
```

Senior answer:

> AI helps accelerate repetitive tasks, but I still own the technical decisions. I treat AI output like a junior engineer suggestion: useful, but requiring review.

---

## 45. Spec-driven development example

Instead of jumping directly into code, first define a clear spec:

```md
## Feature: User notification settings

### Goal
Allow users to enable or disable email notifications.

### Requirements
- User can see current notification preference.
- User can toggle email notifications.
- Saving shows loading state.
- Errors are displayed in an accessible way.
- The UI should be disabled while saving.

### Acceptance Criteria
- Given notifications are enabled, when the user toggles off and saves, the backend receives `emailNotificationsEnabled: false`.
- Given the save request fails, when the error is returned, the user sees an error message.
- Given the save is in progress, when the user clicks save again, duplicate requests are prevented.
```

Then ask AI to generate:

- Edge cases
- Test plan
- Component design
- API contract
- Implementation draft

Senior answer:

> Spec-driven development reduces ambiguity before implementation. It is especially helpful with AI because the quality of the output depends heavily on the clarity of the input.

---

# Part 14 — Architecture and estimation

## 46. How to design a medium/high complexity feature

Example feature:

> Build a notification preferences page.

Senior approach:

1. Clarify requirements.
2. Identify frontend and backend responsibilities.
3. Define API contract.
4. Define state model.
5. Design UI states.
6. Consider validation and error handling.
7. Add tests.
8. Add analytics/logging if needed.
9. Release behind a feature flag if risky.
10. Monitor after release.

Example API contract:

```txt
GET /api/users/:id/notification-settings

Response:
{
  "emailNotificationsEnabled": true,
  "smsNotificationsEnabled": false
}
```

```txt
PATCH /api/users/:id/notification-settings

Request:
{
  "emailNotificationsEnabled": false
}

Response:
{
  "emailNotificationsEnabled": false,
  "smsNotificationsEnabled": false
}
```

UI states:

```txt
loading
success
empty
saving
error
unauthorized
```

Senior answer:

> Before implementing, I try to make the state model explicit. Many UI bugs happen because loading, empty, error, and partial states are not clearly defined.

---

## 47. How to estimate work

A senior estimate should include assumptions and risks.

Example:

> I would split this into API integration, UI implementation, validation/error states, tests, QA support, and release. If the API contract is already stable, I’d estimate lower. If the backend contract is still undefined or there are design gaps, I’d call that out as a risk and add buffer.

Breakdown:

```txt
Requirement clarification: 0.5 day
API integration: 1 day
UI implementation: 1-2 days
Error/loading/accessibility states: 0.5 day
Unit/integration tests: 1 day
QA fixes/review: 0.5-1 day
```

Senior answer:

> I avoid giving estimates without assumptions. I prefer to explain what is included, what is unknown, and which risks could change the estimate.

---

# Part 15 — Production mindset

## 48. Observability

For production apps, think about:

- Logs
- Metrics
- Alerts
- Tracing
- Error monitoring
- Request IDs
- Dashboards

Example log:

```ts
logger.error({
  message: "Failed to create user",
  userId,
  requestId,
  error,
});
```

Senior answer:

> Good observability helps reduce time to detect and resolve production issues. I try to include meaningful logs and request IDs, especially around integrations and critical user flows.

---

## 49. Error handling

Frontend example:

```tsx
function ErrorMessage({ message }: { message: string }) {
  return (
    <p role="alert">
      {message}
    </p>
  );
}
```

Backend example:

```ts
app.use((error, req, res, next) => {
  req.log.error({ error }, "Unhandled request error");

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      requestId: req.id,
    },
  });
});
```

Senior answer:

> I avoid exposing internal errors to users. I log technical details internally and show user-friendly messages in the UI.

---

# Part 16 — Security basics

## 50. Frontend security

Know these:

- XSS
- CSRF
- CORS
- Authentication vs authorization
- Secure token storage
- Input validation
- Output escaping
- Dependency vulnerabilities

### XSS

Bad:

```tsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

Better:

```tsx
<p>{userInput}</p>
```

React escapes text by default.

Senior answer:

> I avoid rendering raw HTML unless absolutely necessary. If required, I sanitize it carefully and review the source of the content.

---

## 51. Authentication vs authorization

Authentication:

> Who are you?

Authorization:

> What are you allowed to do?

Example:

```ts
function canDeleteUser(currentUser: User) {
  return currentUser.role === "admin";
}
```

Senior answer:

> Frontend authorization improves UX, but backend authorization is mandatory. The backend must enforce permissions because frontend checks can be bypassed.

---

# Part 17 — Common interview questions and strong answers

## 52. Tell me about yourself

> I’m a Senior Software Engineer with strong experience in React, TypeScript, JavaScript, frontend architecture, testing, and backend integrations. I’ve worked on production applications where quality, maintainability, and collaboration were critical.  
>
> I usually contribute across the lifecycle: clarifying requirements, proposing technical approaches, implementing features, writing tests, reviewing code, and supporting releases. I’m comfortable working with cross-functional teams and I care about clean code, performance, accessibility, and clear communication.

---

## 53. How do you handle unclear requirements?

> I start by identifying the business goal and the user problem. Then I list the unknowns and clarify them with product, design, backend, or QA. If something is still uncertain, I document assumptions and propose a small, safe implementation path. I also like to define acceptance criteria before implementation so everyone aligns on what “done” means.

---

## 54. How do you approach a complex feature?

> I break it down. First, I clarify the requirements and constraints. Then I design the data flow, API contract, UI states, edge cases, and testing strategy. I split the work into smaller tickets or PRs if possible. For risky changes, I consider feature flags, incremental rollout, and monitoring.

---

## 55. How do you ensure code quality?

> I rely on several layers: clean code principles, TypeScript, linting, code reviews, unit and integration tests, accessibility checks, and CI validation. I also try to keep PRs small and focused so reviewers can give better feedback.

---

## 56. How do you handle disagreements in code reviews?

> I try to focus on the technical trade-off, not personal preference. If there is an established team pattern, I usually follow it. If I disagree, I explain my reasoning, provide examples, and stay open to feedback. The goal is to improve the codebase, not to win the discussion.

---

## 57. How do you debug production issues?

> I start by understanding the impact and scope. Then I check logs, metrics, recent deployments, feature flags, and error reports. I try to reproduce the issue if possible. Once the root cause is identified, I prioritize a safe fix, validate it, and document learnings to prevent recurrence.

---

## 58. What makes a good React component?

> A good React component has a clear responsibility, readable props, predictable rendering, accessibility, and testable behavior. I prefer separating data fetching or business logic into hooks and keeping presentational components focused on UI.

---

## 59. How do you apply SOLID in frontend development?

> I apply SOLID by keeping components and functions focused, separating concerns, depending on abstractions when integrating services, and making behavior extensible through composition or strategies instead of large conditional blocks.

---

## 60. How do you use AI in your development process?

> I use AI to accelerate parts of the SDLC: clarifying requirements, generating test cases, reviewing code, drafting documentation, and exploring implementation alternatives. But I always validate the output, run tests, check security and performance implications, and adapt the result to the project’s standards.

---

# Part 18 — Practical coding exercises to prepare

## 61. Implement native map

```ts
function nativeMap<T, U>(
  items: T[],
  callback: (item: T, index: number, array: T[]) => U
): U[] {
  const result: U[] = [];

  for (let index = 0; index < items.length; index++) {
    result.push(callback(items[index], index, items));
  }

  return result;
}

const numbers = [1, 2, 3];

const doubled = nativeMap(numbers, (number) => number * 2);

console.log(doubled); // [2, 4, 6]
```

What to explain:

> The function is generic, so it works with any input and output type. It also follows the native `map` callback signature: item, index, and original array.

---

## 62. Debounce

```ts
function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: TArgs) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

const search = debounce((query: string) => {
  console.log("Searching:", query);
}, 500);

search("r");
search("re");
search("rea");
search("react");
```

Use case:

- Search input
- Resize events
- Scroll events
- API call optimization

---

## 63. Remove duplicates

```ts
function removeDuplicates<T>(items: T[]): T[] {
  return [...new Set(items)];
}

console.log(removeDuplicates([1, 2, 2, 3])); // [1, 2, 3]
```

For objects:

```ts
type User = {
  id: string;
  name: string;
};

function removeDuplicateUsers(users: User[]): User[] {
  const seen = new Set<string>();

  return users.filter((user) => {
    if (seen.has(user.id)) {
      return false;
    }

    seen.add(user.id);
    return true;
  });
}
```

---

## 64. Group by

```ts
function groupBy<T, TKey extends string | number>(
  items: T[],
  getKey: (item: T) => TKey
): Record<TKey, T[]> {
  return items.reduce((groups, item) => {
    const key = getKey(item);

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);

    return groups;
  }, {} as Record<TKey, T[]>);
}

const users = [
  { name: "Ana", role: "admin" },
  { name: "Juan", role: "user" },
  { name: "Maria", role: "admin" },
];

const grouped = groupBy(users, (user) => user.role);

console.log(grouped);
```

---

## 65. Find removable indices problem

Problem:

> Given two strings, `str1` and `str2`, where `str1` has exactly one extra character, return the indices in `str1` that can be removed to make `str1 === str2`.

Simple solution:

```ts
function findRemovableIndices(str1: string, str2: string): number[] {
  const result: number[] = [];

  if (str1.length !== str2.length + 1) {
    return [-1];
  }

  for (let index = 0; index < str1.length; index++) {
    const candidate = str1.slice(0, index) + str1.slice(index + 1);

    if (candidate === str2) {
      result.push(index);
    }
  }

  return result.length > 0 ? result : [-1];
}

console.log(findRemovableIndices("abdgggda", "abdggda")); // [3, 4, 5]
```

Optimized mindset:

> Start simple first. If asked to optimize, then think about avoiding repeated string creation. In interviews, correctness and explanation matter a lot.

---

# Part 19 — Real-life project examples you can mention

## 66. Example: Feature flag rollout

Situation:

> We needed to release a new user experience, but only for a specific group of users.

Approach:

- Added feature flag.
- Kept old and new implementations available.
- Added tests for both states.
- Released safely.
- Removed flag after full rollout.

Answer:

> I used a feature flag to reduce release risk and support gradual rollout. I made sure both paths were tested and documented the cleanup work to avoid keeping dead code long term.

---

## 67. Example: API integration with error states

Situation:

> The frontend needed to call a backend endpoint and show different UI states.

Approach:

- Defined response type.
- Added loading, success, empty, and error states.
- Used a custom hook.
- Added tests.
- Logged errors when needed.

Answer:

> I made the UI states explicit because many bugs happen when loading or error states are handled as an afterthought.

---

## 68. Example: Improving maintainability

Situation:

> A component became too large and difficult to maintain.

Approach:

- Extracted business logic into hooks.
- Extracted reusable UI pieces.
- Added tests around behavior.
- Kept public API simple.

Answer:

> I usually refactor by preserving behavior first, adding tests if missing, and then extracting responsibilities gradually.

---

## 69. Example: Reducing production risk

Situation:

> A change touched a critical user flow.

Approach:

- Added unit/integration tests.
- Used feature flag.
- Added monitoring.
- Coordinated with QA.
- Released incrementally.

Answer:

> For risky changes, I prefer incremental delivery and observability. The goal is not only to ship but to ship safely.

---

# Part 20 — Questions you can ask the interviewer

Ask 2–3 of these:

1. What type of projects would I be joining first?
2. Is the role more frontend-focused or full-stack?
3. What are the main technologies used by the current team?
4. How does the team handle code reviews and technical decision-making?
5. What does success look like for this role in the first three months?
6. How do teams at Endava apply AI in the SDLC today?
7. What are the main technical challenges the team is currently facing?
8. How mature are the CI/CD and testing practices in the project?

---

# Part 21 — Final interview cheat sheet

## Strong themes to repeat

Use these ideas naturally:

- “I clarify requirements before coding.”
- “I prefer simple, maintainable solutions.”
- “I keep UI states explicit.”
- “I test behavior, not implementation details.”
- “I use TypeScript to model the domain.”
- “I use feature flags for safer releases.”
- “I prefer small, focused PRs.”
- “I treat AI as an assistant, not an autopilot.”
- “I care about accessibility and semantic HTML.”
- “I communicate risks early.”
- “I like aligning with existing project patterns.”
- “I optimize when there is a real problem or measurable risk.”

---

## 90-second final pitch

> I think my experience fits this role because I’ve worked on production frontend and full-stack applications using React, TypeScript, JavaScript, backend integrations, testing, and Agile collaboration. I’m comfortable not only implementing features but also clarifying requirements, proposing solutions, reviewing code, and supporting releases.  
>
> I care about clean code, maintainability, accessibility, performance, and safe delivery. I also like using AI tools in a responsible way to improve the SDLC, especially for test generation, documentation, code review, and requirement refinement.  
>
> What I bring is a mix of hands-on implementation, product thinking, and senior engineering practices.

---

# Part 22 — Last-day study plan

## 1 day before the interview

Focus on:

1. React hooks and state management
2. TypeScript types/generics
3. Testing with React Testing Library
4. SOLID and design patterns
5. HTTP/REST
6. SQL joins and indexes
7. CI/CD basics
8. AI in SDLC
9. Behavioral examples

## 2 hours before the interview

Review:

- Your intro
- 3 real project examples
- 5 technical concepts
- 3 questions for the interviewer

## During the interview

Remember:

- Be concise first.
- Add examples when needed.
- Say assumptions clearly.
- Do not pretend knowledge.
- Think like a senior: trade-offs, risks, maintainability, testing, communication.

