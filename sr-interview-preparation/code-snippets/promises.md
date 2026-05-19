# Promises

## Normal Promise.All

```ts
const fetchDashboardData = async () => {
  try {
    console.log("Fetching dashboard data...");

    // These requests run in parallel, not one after another.
    // This is faster than awaiting each request separately.
    const [users, roles, permissions] = await Promise.all([
      fetch("/api/users").then((res) => res.json()),
      fetch("/api/roles").then((res) => res.json()),
      fetch("/api/permissions").then((res) => res.json()),
    ]);

    // Useful log during development to confirm the shape of the data.
    console.log("Users:", users);
    console.log("Roles:", roles);
    console.log("Permissions:", permissions);

    return {
      users,
      roles,
      permissions,
    };
  } catch (error) {
    // Important: Promise.all fails if one request fails.
    console.error("Failed to fetch dashboard data:", error);

    throw error;
  }
};
```

## Promise with Mapped calls.

```ts
const jobsWithBenchmarks = await Promise.all(
  jobs.map(async (job) => {
    console.log("Fetching benchmark for job:", job.jobKey);

    const benchmark = await fetchJobBenchmark(job.jobKey);

    // This keeps the original job data and adds the benchmark result.
    return {
      ...job,
      benchmark,
    };
  }),
);

console.log("Jobs with benchmarks:", jobsWithBenchmarks);

// Example use Case
const jobs = [
  { jobKey: "frontend", title: "Frontend Engineer" },
  { jobKey: "backend", title: "Backend Engineer" },
];

// Result after Promise.all:
[
  {
    jobKey: "frontend",
    title: "Frontend Engineer",
    benchmark: {
      averageSalary: 120000,
    },
  },
  {
    jobKey: "backend",
    title: "Backend Engineer",
    benchmark: {
      averageSalary: 130000,
    },
  },
];
```

## Promises.AllSettled

Use Promise.allSettled when partial success is acceptable.

```ts
const results = await Promise.allSettled([
  fetch("/api/users").then((res) => res.json()),
  fetch("/api/roles").then((res) => res.json()),
  fetch("/api/permissions").then((res) => res.json()),
]);

// Each result will have a status: "fulfilled" or "rejected".
console.log("All settled results:", results);

const successfulResults = results
  .filter((result) => result.status === "fulfilled")
  .map((result) => result.value);

const failedResults = results.filter((result) => result.status === "rejected");

console.log("Successful requests:", successfulResults);
console.log("Failed requests:", failedResults);

// Exaple Result
const test = [
  {
    status: "fulfilled",
    value: [{ id: 1, name: "Juan" }],
  },
  {
    status: "rejected",
    reason: "Request failed",
  },
];
```
