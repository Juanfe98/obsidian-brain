# Avoid Race Conditions in useEffect

Use this pattern when fetching data based on a changing value like search, filters, selected ID, or page.

```tsx
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

async function fetchUsersBySearch(
  search: string,
  signal: AbortSignal,
): Promise<User[]> {
  const response = await fetch(`/api/users?search=${search}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

export default function UsersSearchPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching users for search:", search);

        const data = await fetchUsersBySearch(search, controller.signal);

        // Only updates state if this request was not cancelled.
        setUsers(data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Previous request was cancelled");
          return;
        }

        console.error("Failed to load users:", error);
        setError("Could not load users");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();

    return () => {
      // Cancels the previous request when search changes
      // or when the component unmounts.
      controller.abort();
    };
  }, [search]);

  return (
    <section>
      <h2>Users</h2>

      <input
        value={search}
        placeholder="Search users"
        onChange={(event) => setSearch(event.target.value)}
      />

      {isLoading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {!isLoading && !error && users.length === 0 && <p>No users found.</p>}

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
