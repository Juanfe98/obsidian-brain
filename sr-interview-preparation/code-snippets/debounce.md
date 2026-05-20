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

```ts
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value]);

  return debouncedValue;
}

export default function DebounceChallenge() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedValue = useDebounce(searchQuery, 2000);
  console.log("debouncedValue -> ", debouncedValue);
  console.log("Search-> ", searchQuery);

  useEffect(() => {
    const ac = new AbortController();
    const signal = ac.signal;
    if (!debouncedValue) {
      return;
    }
    const fetchInfo = async () => await searchUsers(debouncedValue);
    fetchInfo();

    return () => {
      ac.abort("Clean up side effects");
    };
  }, [debouncedValue]);

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(ev.target.value);
  };

  return (
    <div className="autocomplete-wrapper">
      <label htmlFor="user-search">User Search</label>
      {/* TODO: build the component */}

      <input
        className="autocomplete-input"
        list="users"
        id="user-search"
        name="user-search"
        placeholder="Search User"
        onChange={handleInputChange}
        type="text"
      />

      <datalist className="autocomplete-dropdown" id="users">
        <option value="Bogotá"></option>
        <option value="Medellín"></option>
        <option value="Cali"></option>
        <option value="Barranquilla"></option>
      </datalist>
    </div>
  );
}

```
