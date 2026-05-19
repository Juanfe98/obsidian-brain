# Reusable Card + List Pattern

Use this pattern when you need to render items using reusable components.

```ts
import { useState } from "react";

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: number;
};

const JOBS: Job[] = [
  {
    id: "1",
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    salary: 120000,
  },
  {
    id: "2",
    title: "Backend Engineer",
    department: "Engineering",
    location: "New York",
    salary: 130000,
  },
  {
    id: "3",
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    salary: 110000,
  },
];

type JobCardProps = {
  job: Job;
  isSelected: boolean;
  onSelect: (jobId: string) => void;
};

function JobCard({ job, isSelected, onSelect }: JobCardProps) {
  return (
    <article
      style={{
        border: isSelected ? "2px solid black" : "1px solid #ccc",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "8px",
      }}
    >
      <h3>{job.title}</h3>

      <p>
        {job.department} - {job.location}
      </p>

      <p>Salary: ${job.salary}</p>

      <button onClick={() => onSelect(job.id)}>
        {isSelected ? "Selected" : "Select"}
      </button>
    </article>
  );
}

type JobListProps = {
  jobs: Job[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
};

function JobList({ jobs, selectedJobId, onSelectJob }: JobListProps) {
  if (jobs.length === 0) {
    return <p>No jobs found.</p>;
  }

  return (
    <div>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSelected={selectedJobId === job.id}
          onSelect={onSelectJob}
        />
      ))}
    </div>
  );
}

export default function JobsPage() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const selectedJob = JOBS.find((job) => job.id === selectedJobId);

  return (
    <section>
      <h2>Jobs</h2>

      <JobList
        jobs={JOBS}
        selectedJobId={selectedJobId}
        onSelectJob={setSelectedJobId}
      />

      {selectedJob && (
        <aside>
          <h3>Selected Job</h3>
          <p>{selectedJob.title}</p>
        </aside>
      )}
    </section>
  );
}
```
