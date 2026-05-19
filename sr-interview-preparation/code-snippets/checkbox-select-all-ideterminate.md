# Selection Pattern: Toggle Item / Select All / Indeterminate

Use this pattern when you need to select rows, cards, or list items.

```tsx
import { useEffect, useRef, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

const USERS: User[] = [
  { id: "1", name: "Juan Montaña", email: "juan@email.com" },
  { id: "2", name: "Maria Gomez", email: "maria@email.com" },
  { id: "3", name: "Carlos Perez", email: "carlos@email.com" },
];

export default function UsersSelectionTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const selectedCount = selectedIds.length;
  const totalCount = USERS.length;

  const isAllSelected = selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  useEffect(() => {
    if (selectAllRef.current) {
      // Important:
      // "indeterminate" is not a normal React prop.
      // It must be set directly on the DOM input.
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleToggleUser = (userId: string) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(userId);

      if (isSelected) {
        // Remove item if it was already selected.
        return prev.filter((id) => id !== userId);
      }

      // Add item if it was not selected.
      return [...prev, userId];
    });
  };

  const handleToggleAll = () => {
    setSelectedIds((prev) => {
      const allSelected = prev.length === USERS.length;

      if (allSelected) {
        // If all rows are selected, clicking again clears selection.
        return [];
      }

      // Otherwise, select every row.
      return USERS.map((user) => user.id);
    });
  };

  return (
    <section>
      <h2>Users</h2>

      <p>
        Selected {selectedCount} of {totalCount}
      </p>

      <table>
        <thead>
          <tr>
            <th>
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleAll}
                aria-label="Select all users"
              />
            </th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          {USERS.map((user) => {
            const isSelected = selectedIds.includes(user.id);

            return (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleUser(user.id)}
                    aria-label={`Select ${user.name}`}
                  />
                </td>

                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button disabled={selectedIds.length === 0}>Delete selected</button>
    </section>
  );
}
```
