# Form Handling + Basic Validation

Use this pattern when you need controlled inputs, validation, and submit handling.

```ts
import { useState } from "react";

type FormValues = {
  name: string;
  email: string;
  role: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  role: "",
};

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!values.email.includes("@")) {
    errors.email = "Email is invalid";
  }

  if (!values.role) {
    errors.role = "Role is required";
  }

  return errors;
}

export default function UserForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    // Dynamic field update:
    // name="email" updates values.email
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Optional: clear the field error when user edits it again
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      // Example submit request
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      // Reset form after successful submit
      setValues(initialValues);
      setErrors({});
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>

        <input
          id="name"
          name="name"
          value={values.name}
          onChange={handleChange}
        />

        {errors.name && <p>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>

        <input
          id="email"
          name="email"
          value={values.email}
          onChange={handleChange}
        />

        {errors.email && <p>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="role">Role</label>

        <select
          id="role"
          name="role"
          value={values.role}
          onChange={handleChange}
        >
          <option value="">Select role</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="agent">Agent</option>
        </select>

        {errors.role && <p>{errors.role}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save user"}
      </button>
    </form>
  );
}
```

## Form Reactive Errors

```ts
import { useMemo, useState } from "react";

type FormValues = {
  name: string;
  email: string;
  role: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type TouchedFields = Partial<Record<keyof FormValues, boolean>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  role: "",
};

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!values.email.includes("@")) {
    errors.email = "Email is invalid";
  }

  if (!values.role) {
    errors.role = "Role is required";
  }

  return errors;
}

export default function UserForm() {
  const [values, setValues] = useState<FormValues>(initialValues);

  // Tracks which fields the user already interacted with.
  const [touched, setTouched] = useState<TouchedFields>({});

  // Useful to show all errors after the user clicks submit.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived errors:
  // Recalculated whenever values change.
  const errors = useMemo(() => {
    return validateForm(values);
  }, [values]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name } = event.target;

    // Mark field as touched when the user leaves the field.
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const shouldShowError = (field: keyof FormValues) => {
    // Show error if:
    // - user touched the field
    // - or user already tried to submit the form
    return Boolean((touched[field] || hasSubmitted) && errors[field]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setHasSubmitted(true);

    if (hasErrors) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      setValues(initialValues);
      setTouched({});
      setHasSubmitted(false);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>

        <input
          id="name"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={shouldShowError("name")}
        />

        {shouldShowError("name") && <p>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>

        <input
          id="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={shouldShowError("email")}
        />

        {shouldShowError("email") && <p>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="role">Role</label>

        <select
          id="role"
          name="role"
          value={values.role}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={shouldShowError("role")}
        >
          <option value="">Select role</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="agent">Agent</option>
        </select>

        {shouldShowError("role") && <p>{errors.role}</p>}
      </div>

      <button type="submit" disabled={isSubmitting || hasErrors}>
        {isSubmitting ? "Saving..." : "Save user"}
      </button>
    </form>
  );
}

```
