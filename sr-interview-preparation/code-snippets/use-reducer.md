# useReducer for Complex State

Use `useReducer` when state updates become related or when `useState` starts spreading across many handlers.

```tsx
import { useReducer } from "react";

type User = {
  id: string;
  name: string;
  role: string;
};

type State = {
  users: User[];
  search: string;
  selectedRole: string;
  isLoading: boolean;
  error: string | null;
};

type Action =
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_SELECTED_ROLE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_FILTERS" };

const initialState: State = {
  users: [],
  search: "",
  selectedRole: "",
  isLoading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_USERS":
      return {
        ...state,
        users: action.payload,
      };

    case "SET_SEARCH":
      return {
        ...state,
        search: action.payload,
      };

    case "SET_SELECTED_ROLE":
      return {
        ...state,
        selectedRole: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "RESET_FILTERS":
      return {
        ...state,
        search: "",
        selectedRole: "",
      };

    default:
      return state;
  }
}

const USERS: User[] = [
  { id: "1", name: "Juan", role: "admin" },
  { id: "2", name: "Maria", role: "manager" },
  { id: "3", name: "Carlos", role: "agent" },
];

export default function UsersPage() {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    users: USERS,
  });

  const visibleUsers = state.users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(state.search.toLowerCase());

    const matchesRole =
      state.selectedRole === "" || user.role === state.selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <section>
      <h2>Users</h2>

      <input
        value={state.search}
        placeholder="Search users"
        onChange={(event) =>
          dispatch({
            type: "SET_SEARCH",
            payload: event.target.value,
          })
        }
      />

      <select
        value={state.selectedRole}
        onChange={(event) =>
          dispatch({
            type: "SET_SELECTED_ROLE",
            payload: event.target.value,
          })
        }
      >
        <option value="">All roles</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="agent">Agent</option>
      </select>

      <button type="button" onClick={() => dispatch({ type: "RESET_FILTERS" })}>
        Reset filters
      </button>

      {visibleUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {visibleUsers.map((user) => (
            <li key={user.id}>
              {user.name} - {user.role}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```
