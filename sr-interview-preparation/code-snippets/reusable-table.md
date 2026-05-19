# Reusable Table Pattern

Use this pattern when you need to render a list of objects in a table.

```ts
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Column<T> = {
  key: keyof T;
  label: string;
};

const USERS: User[] = [
  { id: "1", name: "Juan", email: "juan@email.com", role: "Admin" },
  { id: "2", name: "Maria", email: "maria@email.com", role: "Manager" },
  { id: "3", name: "Carlos", email: "carlos@email.com", role: "Agent" },
];

const columns: Column<User>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
];

type DataTableProps<T extends { id: string }> = {
  data: T[];
  columns: Column<T>[];
};

function DataTable<T extends { id: string }>({
  data,
  columns,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={String(column.key)}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {columns.map((column) => (
              <td key={String(column.key)}>
                {String(item[column.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function UsersPage() {
  return (
    <section>
      <h2>Users</h2>

      <DataTable data={USERS} columns={columns} />
    </section>
  );
}
```

## With custom cell rendering

Use this when one column needs special UI, like buttons, badges, formatted dates, or prices.

```ts
type Column<T> = {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
};

const columns: Column<User>[] = [
  {
    key: "name",
    label: "Name",
    render: (user) => user.name,
  },
  {
    key: "email",
    label: "Email",
    render: (user) => user.email,
  },
  {
    key: "role",
    label: "Role",
    render: (user) => <strong>{user.role}</strong>,
  },
  {
    key: "actions",
    label: "Actions",
    render: (user) => (
      <button onClick={() => console.log("Edit user:", user.id)}>
        Edit
      </button>
    ),
  },
];

type DataTableProps<T extends { id: string }> = {
  data: T[];
  columns: Column<T>[];
};

function DataTable<T extends { id: string }>({
  data,
  columns,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {columns.map((column) => (
              <td key={column.key}>
                {column.render(item)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```
