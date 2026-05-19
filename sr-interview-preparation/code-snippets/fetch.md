# Fetch Data in React: Loading / Error / Success

Use this pattern when the component needs to load data from an API.

```ts
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // AbortController cancels the request if the component unmounts
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/users", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: User[] = await response.json();

        setUsers(data);
      } catch (error) {
        // Ignore AbortError because it means the request was intentionally cancelled
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setError("Could not load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();

    return () => {
      // Cleanup avoids keeping unnecessary network work alive
      controller.abort();
    };
  }, []);

  if (isLoading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <section>
      <h2>Users</h2>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

## Abstracted logic

```ts
async function fetchProducts<T>(
  signal: AbortSignal,
): Promise<FetchResponse<T[]>> {
  try {
    const response = await fetch(PRODUCTS_ENDPOINT, { signal });

    if (!response.ok) {
      return {
        data: null,
        error: "An error has occurred",
      };
    }

    const data = (await response.json()) as T[];

    return {
      data,
      error: null,
    };
  } catch (error) {
    // Abort is not really an app error; usually it means the component unmounted
    // or a newer request replaced this one.
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        data: null,
        error: null,
      };
    }

    return {
      data: null,
      error: "An error has occurred",
    };
  }
}

useEffect(() => {
  const abortController = new AbortController();
  const { signal } = abortController;

  const getProducts = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await fetchProducts<Product>(signal);

    // Avoid updating state after the request was aborted.
    if (abortController.signal.aborted) return;

    if (error) {
      setError("An error occurred fetching products");
    } else {
      setProducts(data ?? []);
    }

    setLoading(false);
  };

  getProducts();

  return () => {
    abortController.abort();
  };
}, []);
```
