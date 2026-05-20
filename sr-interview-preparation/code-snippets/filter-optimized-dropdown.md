# Filter

## Optimized filter

```ts
function getFilterOptions(users: User[]): FilterOptions {
  const departmentSet = new Set<string>();
  const roleSet = new Set<User["role"]>();

  for (const user of users) {
    if (!user.active) continue;

    departmentSet.add(user.department);
    roleSet.add(user.role);
  }

  return {
    departments: Array.from(departmentSet).sort((a, b) => a.localeCompare(b)),
    roles: Array.from(roleSet).sort((a, b) => a.localeCompare(b)),
  };
}
```
