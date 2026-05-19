# Deboung Strategy

## Normal debounce in a component

```ts
export default function UsersSearch() {
  const [users] = useState<User[]>(USERS);

  // Immediate value: updates on every keystroke
  const [search, setSearch] = useState("");

  // Debounced value: updates after the user stops typing
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    // Creates a timer every time search changes
    const timerId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    // Cleanup: removes the previous timer before creating a new one
    return () => {
      window.clearTimeout(timerId);
    };
  }, [search]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = debouncedSearch.toLowerCase().trim();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [users, debouncedSearch]);

  return (
    <section>
      <h2>Users</h2>

      <input
        type="text"
        value={search}
        placeholder="Search by name or email"
        onChange={(event) => setSearch(event.target.value)}
      />

      <p>
        Showing {filteredUsers.length} of {users.length} users
      </p>

      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <strong>{user.name}</strong> - {user.email}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

## Debounce as a custom hook
