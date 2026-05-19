# EPIC — System Design & Cloud Infrastructure Learning Path

## Goal

Create a complete learning path to become strong in **System Design, Software Architecture, Cloud Infrastructure, and AWS**, starting from fundamentals and progressing toward senior-level architecture and interview readiness.

This EPIC is designed to be used with Claude Code / Claude as a learning assistant. Each story contains a **Claude-ready prompt** that asks Claude to generate detailed theory, diagrams, examples, exercises, and practical guidance.

---

## Context for Claude

Use this shared context in every prompt if needed:

```text
I am a Senior Software Engineer with strong frontend experience, React, TypeScript, Node.js, APIs, testing, and product engineering experience. However, I want to deeply learn System Design and Cloud Infrastructure from the ground up.

Assume I do not know infrastructure concepts deeply yet. Explain everything from first principles, but with a senior-engineer mindset. Use simple analogies first, then technical depth. Include diagrams using Mermaid when useful. Include AWS-specific examples, but also explain the general architecture concepts so I do not memorize only AWS names.

I want to become strong enough to:
- Design scalable web applications
- Understand cloud infrastructure
- Explain architecture decisions in interviews
- Debug production systems
- Understand AWS services and when to use each
- Compare alternatives and tradeoffs
- Speak confidently about reliability, scalability, security, observability, and cost
```

---

# EPIC 1 — Foundations of System Design and Infrastructure

## Story 1.1 — Understand what System Design means

### Description

As a software engineer, I want to understand what system design means at infrastructure and architecture level, so that I can reason about real production systems.

### Acceptance Criteria

- Explain system design in simple terms.
- Explain the difference between application architecture and infrastructure architecture.
- Explain the main qualities of a good system: scalability, reliability, availability, security, performance, maintainability, observability, and cost.
- Include diagrams showing a basic web app architecture.

### Claude Prompt

```text
Act as a principal software architect and cloud infrastructure mentor.

Teach me what System Design means, specifically from the perspective of backend, cloud, and infrastructure architecture.

Assume I know frontend and API development, but I do not deeply understand infrastructure yet.

Please include:

1. A simple definition of System Design.
2. Difference between:
   - Code architecture
   - Application architecture
   - Infrastructure architecture
   - Cloud architecture
3. The main goals of system design:
   - Scalability
   - Reliability
   - Availability
   - Fault tolerance
   - Security
   - Performance
   - Observability
   - Maintainability
   - Cost optimization
4. Explain each concept with:
   - A simple analogy
   - A technical explanation
   - A real-world example
5. Create a Mermaid diagram of a very basic web application:
   User → Browser → DNS → CDN → Load Balancer → Backend API → Database
6. Explain what each component does.
7. End with 10 interview-style questions and concise answers.
```

---

## Story 1.2 — Learn the full request lifecycle

### Description

As a software engineer, I want to understand what happens when a user opens a website, so that I can visualize the full infrastructure path of a request.

### Acceptance Criteria

- Explain DNS, HTTPS, CDN, load balancer, backend, database, and response flow.
- Include a step-by-step request lifecycle.
- Include Mermaid sequence diagram.
- Include common failure points.

### Claude Prompt

```text
Teach me the full request lifecycle when a user visits a web application.

Example:
A user opens https://myapp.com/dashboard.

Explain step by step what happens from the browser to the backend and back.

Include:

1. DNS resolution.
2. TCP connection.
3. TLS/HTTPS handshake.
4. CDN lookup.
5. Load balancer routing.
6. API gateway if applicable.
7. Backend service processing.
8. Database query.
9. Cache usage if applicable.
10. Response returned to browser.

For each step:
- Explain the concept simply.
- Explain what can go wrong.
- Explain how engineers monitor/debug it.

Include:
- Mermaid sequence diagram.
- Mermaid architecture diagram.
- A simple explanation of latency at each stage.
- 10 common production issues in the request lifecycle.
- 10 interview questions with strong answers.
```

---

# EPIC 2 — Networking Fundamentals for System Design

## Story 2.1 — Learn HTTP, HTTPS, TCP, DNS, and TLS

### Description

As a software engineer, I want to understand core networking concepts, so that I can design and debug web systems.

### Acceptance Criteria

- Explain HTTP, HTTPS, TCP, UDP, DNS, TLS, ports, headers, cookies, and status codes.
- Include diagrams.
- Include practical debugging commands.
- Include interview examples.

### Claude Prompt

```text
Teach me networking fundamentals for system design.

Assume I have used APIs but I do not deeply understand the infrastructure behind them.

Explain:

1. HTTP.
2. HTTPS.
3. TCP.
4. UDP.
5. DNS.
6. TLS/SSL.
7. Ports.
8. Request headers.
9. Response headers.
10. Cookies.
11. HTTP status codes.
12. Keep-alive connections.
13. Connection pooling.
14. Latency vs throughput.

For each concept:
- Explain in simple words.
- Explain technically.
- Give a real example.
- Explain why it matters in system design.

Include:
- Mermaid diagrams.
- Examples using curl.
- How to debug common networking issues.
- Interview questions and answers.
```

---

## Story 2.2 — Learn VPCs, subnets, NAT, gateways, and security groups

### Description

As a software engineer, I want to understand cloud networking, especially in AWS, so that I can design secure cloud systems.

### Acceptance Criteria

- Explain VPC, public subnet, private subnet, route tables, NAT Gateway, Internet Gateway, security groups, and NACLs.
- Include AWS diagrams.
- Explain public vs private services.
- Include common mistakes.

### Claude Prompt

```text
Teach me AWS cloud networking from zero.

Focus on:

1. VPC.
2. CIDR blocks.
3. Public subnet.
4. Private subnet.
5. Internet Gateway.
6. NAT Gateway.
7. Route tables.
8. Security Groups.
9. Network ACLs.
10. Bastion hosts.
11. VPC endpoints.
12. PrivateLink.

Assume I do not know cloud networking.

Please include:
- Simple analogies.
- Technical definitions.
- AWS-specific examples.
- Mermaid diagram of a common AWS VPC:
  - Public subnets with load balancer.
  - Private subnets with backend services.
  - Private database subnet.
  - NAT Gateway for outbound internet.
- Explain why databases should usually be private.
- Explain how backend services call the internet from private subnets.
- Explain common security mistakes.
- Add a practical architecture exercise.
- Add interview questions with answers.
```

---

# EPIC 3 — Core Web Architecture Components

## Story 3.1 — Learn DNS, CDN, load balancers, and API gateways

### Description

As a software engineer, I want to understand the first layer of production architecture, so that I know how traffic enters a system.

### Acceptance Criteria

- Explain DNS, CDN, load balancers, reverse proxies, API gateways.
- Compare AWS Route 53, CloudFront, ALB, NLB, API Gateway.
- Include diagrams and tradeoffs.

### Claude Prompt

```text
Teach me the traffic entry layer of a scalable web application.

Explain:

1. DNS.
2. CDN.
3. Reverse proxy.
4. Load balancer.
5. API Gateway.
6. WAF.
7. Rate limiting at the edge.

Use AWS examples:
- Route 53.
- CloudFront.
- AWS WAF.
- Application Load Balancer.
- Network Load Balancer.
- API Gateway.

For each service/concept:
- What problem does it solve?
- When should I use it?
- When should I not use it?
- What are the tradeoffs?
- How does it improve scalability, security, and performance?

Include:
- Mermaid architecture diagrams.
- Request flow examples.
- Comparison table.
- Interview answer: “What happens before a request reaches the backend?”
```

---

## Story 3.2 — Learn stateless backend services and horizontal scaling

### Description

As a software engineer, I want to understand stateless services, so that I can design horizontally scalable APIs.

### Acceptance Criteria

- Explain stateless vs stateful services.
- Explain horizontal vs vertical scaling.
- Explain session storage problems.
- Include AWS ECS/Lambda examples.

### Claude Prompt

```text
Teach me stateless backend architecture and horizontal scaling.

Explain:

1. What stateless means.
2. What stateful means.
3. Why stateless services scale better.
4. Horizontal scaling vs vertical scaling.
5. Why local memory sessions are problematic.
6. Where to store sessions instead:
   - Redis
   - Database
   - JWT
7. How load balancers distribute traffic.
8. Autoscaling concepts.

Use examples with:
- Node.js APIs.
- AWS ECS/Fargate.
- AWS Lambda.
- Application Load Balancer.

Include:
- Mermaid diagram of multiple backend instances behind a load balancer.
- Example of a bad stateful design.
- Example of a better stateless design.
- Common interview questions and answers.
```

---

# EPIC 4 — Databases and Storage Architecture

## Story 4.1 — Learn SQL vs NoSQL

### Description

As a software engineer, I want to understand SQL and NoSQL tradeoffs, so that I can choose the right database for a system.

### Acceptance Criteria

- Explain relational and non-relational databases.
- Compare PostgreSQL, MySQL, DynamoDB, MongoDB.
- Explain consistency, schema, joins, transactions, indexes.
- Include decision framework.

### Claude Prompt

```text
Teach me SQL vs NoSQL databases for system design.

Explain:

1. Relational databases.
2. NoSQL databases.
3. Tables, rows, columns.
4. Documents.
5. Key-value stores.
6. Wide-column stores.
7. Indexes.
8. Joins.
9. Transactions.
10. ACID.
11. Eventual consistency.
12. Strong consistency.
13. CAP theorem in simple terms.

Compare:
- PostgreSQL.
- MySQL.
- DynamoDB.
- MongoDB.
- Redis.

For each:
- Best use cases.
- Weaknesses.
- Scaling model.
- Query model.
- Examples.

Include:
- Decision tree: which database should I choose?
- Mermaid diagrams.
- Interview questions and answers.
```

---

## Story 4.2 — Deep dive into DynamoDB

### Description

As a software engineer, I want to deeply understand DynamoDB, so that I can design scalable AWS systems using it.

### Acceptance Criteria

- Explain partition key, sort key, GSIs, LSIs, access patterns, capacity, hot partitions.
- Include examples and diagrams.
- Include common design mistakes.

### Claude Prompt

```text
Teach me DynamoDB from zero to interview-ready.

Assume I know normal SQL databases, but I do not understand DynamoDB deeply.

Explain:

1. What DynamoDB is.
2. Why it is different from SQL.
3. Tables.
4. Items.
5. Attributes.
6. Partition key.
7. Sort key.
8. Composite primary key.
9. Access patterns.
10. Global Secondary Indexes.
11. Local Secondary Indexes.
12. Query vs Scan.
13. Hot partitions.
14. Provisioned capacity vs on-demand.
15. Read Capacity Units and Write Capacity Units.
16. Strong vs eventual consistency.
17. DynamoDB Streams.
18. TTL.
19. Single-table design.
20. Common anti-patterns.

Use a real example:
Design DynamoDB tables for a group expense app where users create groups, add expenses, assign expenses to people, and calculate balances.

Include:
- Data model options.
- Access patterns.
- Mermaid diagrams.
- Example items.
- Query examples.
- Mistakes to avoid.
- Interview questions and answers.
```

---

## Story 4.3 — Learn object storage with S3

### Description

As a software engineer, I want to understand object storage, so that I can design systems that store files, images, PDFs, and exports.

### Acceptance Criteria

- Explain object storage vs block storage vs file storage.
- Explain S3 buckets, objects, keys, permissions, lifecycle policies, presigned URLs.
- Include file upload architecture.

### Claude Prompt

```text
Teach me AWS S3 and object storage from zero.

Explain:

1. Object storage.
2. Difference between object, file, and block storage.
3. S3 buckets.
4. S3 objects.
5. Object keys.
6. Metadata.
7. Versioning.
8. Lifecycle policies.
9. Storage classes.
10. Encryption.
11. Bucket policies.
12. IAM permissions.
13. Presigned URLs.
14. Direct browser uploads to S3.
15. Serving files through CloudFront.

Use a real example:
A CV builder app where users upload PDFs/DOCX files and export generated PDFs.

Include:
- Upload flow diagram.
- Secure download flow diagram.
- Mermaid diagrams.
- Common mistakes.
- Cost considerations.
- Interview questions and answers.
```

---

# EPIC 5 — Caching and Performance

## Story 5.1 — Learn caching strategies

### Description

As a software engineer, I want to understand caching, so that I can reduce latency and database load.

### Acceptance Criteria

- Explain browser cache, CDN cache, app cache, Redis, DB cache.
- Explain TTL, invalidation, cache-aside, write-through, write-behind.
- Include diagrams and examples.

### Claude Prompt

```text
Teach me caching for system design from zero.

Explain:

1. Why caching exists.
2. Browser caching.
3. CDN caching.
4. Application-level caching.
5. Distributed cache.
6. Redis.
7. Memcached.
8. Database query caching.
9. TTL.
10. Cache invalidation.
11. Cache-aside pattern.
12. Write-through cache.
13. Write-behind cache.
14. Read-through cache.
15. Stale data.
16. Cache stampede.
17. Cache warming.

Use examples with:
- Product catalog.
- User profile.
- Dashboard metrics.
- CV preview/export app.

Include:
- Mermaid diagrams.
- Comparison table.
- When not to cache.
- Common bugs caused by caching.
- Interview questions and answers.
```

---

## Story 5.2 — Learn performance engineering basics

### Description

As a software engineer, I want to understand performance from infrastructure and backend perspectives, so that I can diagnose slow systems.

### Acceptance Criteria

- Explain latency, throughput, concurrency, p95, p99, bottlenecks.
- Explain database indexing, pagination, compression, batching.
- Include debugging framework.

### Claude Prompt

```text
Teach me backend and infrastructure performance engineering for system design.

Explain:

1. Latency.
2. Throughput.
3. Concurrency.
4. p50, p95, p99 latency.
5. Bottlenecks.
6. CPU-bound vs IO-bound work.
7. Connection pooling.
8. Database indexing.
9. Pagination.
10. Payload size.
11. Compression.
12. Batching.
13. N+1 queries.
14. Async processing.
15. CDN optimization.

Include:
- How to investigate a slow endpoint.
- What metrics to check first.
- How to decide if the bottleneck is frontend, network, backend, cache, or database.
- Mermaid debugging flowchart.
- Interview questions and answers.
```

---

# EPIC 6 — Async Processing, Queues, and Event-Driven Architecture

## Story 6.1 — Learn queues and background workers

### Description

As a software engineer, I want to understand queues and workers, so that I can design systems that process heavy tasks asynchronously.

### Acceptance Criteria

- Explain queues, workers, SQS, RabbitMQ, retries, DLQ, idempotency.
- Include diagrams and examples.
- Explain when to move work out of request/response.

### Claude Prompt

```text
Teach me queues and background processing for system design.

Explain:

1. What a queue is.
2. Why queues are useful.
3. Producer.
4. Consumer.
5. Worker.
6. Message.
7. Visibility timeout.
8. Dead-letter queue.
9. Retries.
10. Backoff.
11. Idempotency.
12. At-least-once delivery.
13. Exactly-once delivery as a practical myth.
14. Ordering.
15. Fanout.

Use AWS examples:
- SQS.
- SNS.
- EventBridge.
- Lambda workers.

Use real examples:
- Processing uploaded CVs.
- Sending emails.
- Generating PDFs.
- Processing payments.
- Updating search indexes.

Include:
- Mermaid diagrams.
- Failure scenarios.
- How to prevent duplicate processing.
- Interview questions and answers.
```

---

## Story 6.2 — Learn event-driven architecture

### Description

As a software engineer, I want to understand event-driven systems, so that I can design decoupled and scalable architectures.

### Acceptance Criteria

- Explain events, publishers, subscribers, event bus, streams.
- Compare queues, pub/sub, Kafka, EventBridge, DynamoDB Streams.
- Include diagrams and tradeoffs.

### Claude Prompt

```text
Teach me event-driven architecture from zero.

Explain:

1. What an event is.
2. Event producer.
3. Event consumer.
4. Event bus.
5. Pub/Sub.
6. Streams.
7. Event sourcing.
8. CQRS, only at a conceptual level.
9. Webhooks.
10. Domain events.
11. Integration events.

Compare:
- SQS.
- SNS.
- EventBridge.
- Kafka.
- DynamoDB Streams.
- Kinesis.

Use an example:
A user uploads a CV:
- API stores metadata.
- File goes to S3.
- Event is emitted.
- Worker extracts text.
- AI service parses data.
- Database is updated.
- User is notified.

Include:
- Mermaid architecture diagram.
- Mermaid sequence diagram.
- Tradeoffs.
- Failure handling.
- Interview questions and answers.
```

---

# EPIC 7 — Reliability, Availability, and Fault Tolerance

## Story 7.1 — Learn availability and fault tolerance

### Description

As a software engineer, I want to understand reliability concepts, so that I can design systems that survive failures.

### Acceptance Criteria

- Explain high availability, fault tolerance, redundancy, failover, multi-AZ, multi-region.
- Include diagrams.
- Include AWS examples.

### Claude Prompt

```text
Teach me reliability, high availability, and fault tolerance for system design.

Explain:

1. Availability.
2. Reliability.
3. Fault tolerance.
4. Redundancy.
5. Single point of failure.
6. Multi-AZ.
7. Multi-region.
8. Failover.
9. Active-active.
10. Active-passive.
11. Graceful degradation.
12. Disaster recovery.
13. RTO.
14. RPO.

Use AWS examples:
- ALB across multiple Availability Zones.
- ECS services across multiple subnets.
- RDS Multi-AZ.
- DynamoDB global tables.
- Route 53 failover routing.
- S3 durability.

Include:
- Mermaid diagrams.
- Common architecture mistakes.
- How to explain tradeoffs in interviews.
- Interview questions and answers.
```

---

## Story 7.2 — Learn retries, timeouts, circuit breakers, and idempotency

### Description

As a software engineer, I want to understand defensive distributed-system patterns, so that I can build resilient services.

### Acceptance Criteria

- Explain retries, exponential backoff, jitter, timeouts, circuit breaker, bulkhead, idempotency.
- Include examples and failure scenarios.

### Claude Prompt

```text
Teach me resilience patterns in distributed systems.

Explain:

1. Timeout.
2. Retry.
3. Exponential backoff.
4. Jitter.
5. Circuit breaker.
6. Bulkhead.
7. Rate limiting.
8. Throttling.
9. Idempotency.
10. Deduplication.
11. Poison messages.
12. Dead-letter queues.

For each concept:
- Explain with a simple analogy.
- Explain technically.
- Show a real backend example.
- Explain when to use it.
- Explain when it can be harmful.

Use examples:
- Calling a payment API.
- Processing SQS messages.
- Retrying an AI provider call.
- Uploading and processing CV files.

Include:
- Mermaid flowcharts.
- Common interview questions and answers.
```

---

# EPIC 8 — Security Architecture

## Story 8.1 — Learn authentication and authorization

### Description

As a software engineer, I want to understand auth architecture, so that I can design secure APIs and applications.

### Acceptance Criteria

- Explain authentication, authorization, sessions, JWT, OAuth2, OIDC, RBAC, ABAC.
- Include diagrams and examples.
- Include AWS Cognito and IAM overview.

### Claude Prompt

```text
Teach me authentication and authorization architecture from zero.

Explain:

1. Authentication.
2. Authorization.
3. Sessions.
4. Cookies.
5. JWT.
6. OAuth 2.0.
7. OpenID Connect.
8. Access tokens.
9. Refresh tokens.
10. RBAC.
11. ABAC.
12. API keys.
13. Service-to-service authentication.
14. AWS IAM.
15. AWS Cognito.

For each:
- Explain simply.
- Explain technically.
- Give a real example.
- Explain common security mistakes.

Include:
- Mermaid login flow diagram.
- Mermaid API authorization flow.
- Comparison between session-based auth and JWT.
- Interview questions and answers.
```

---

## Story 8.2 — Learn cloud security fundamentals

### Description

As a software engineer, I want to understand cloud security, so that I can avoid unsafe infrastructure designs.

### Acceptance Criteria

- Explain least privilege, encryption, secrets, IAM, WAF, private subnets, audit logs.
- Include AWS examples.
- Include security checklist.

### Claude Prompt

```text
Teach me AWS cloud security fundamentals for system design.

Explain:

1. Principle of least privilege.
2. IAM users, groups, roles, policies.
3. Resource-based policies.
4. Secrets management.
5. AWS Secrets Manager.
6. Parameter Store.
7. Encryption at rest.
8. Encryption in transit.
9. KMS.
10. WAF.
11. Security groups.
12. Private subnets.
13. Public exposure risks.
14. Audit logs.
15. CloudTrail.
16. GuardDuty.
17. Dependency/security scanning.

Include:
- Secure AWS web application diagram.
- Common insecure architecture examples.
- Security checklist for web apps.
- Interview questions and answers.
```

---

# EPIC 9 — Observability and Production Debugging

## Story 9.1 — Learn logs, metrics, and traces

### Description

As a software engineer, I want to understand observability, so that I can debug production systems confidently.

### Acceptance Criteria

- Explain logs, metrics, traces, correlation IDs, dashboards, alerts, SLOs, SLIs.
- Include Datadog, CloudWatch, Splunk, OpenTelemetry examples.
- Include debugging workflow.

### Claude Prompt

```text
Teach me observability for production systems.

Explain:

1. Logs.
2. Metrics.
3. Traces.
4. Correlation IDs.
5. Structured logging.
6. Dashboards.
7. Alerts.
8. SLI.
9. SLO.
10. SLA.
11. Error rate.
12. Latency percentiles.
13. Throughput.
14. Saturation.
15. Distributed tracing.
16. OpenTelemetry.

Use tools:
- Datadog.
- CloudWatch.
- Splunk.
- Grafana.
- Prometheus.

Include:
- Mermaid diagram showing a request trace across services.
- Example log fields.
- Example dashboard metrics.
- How to debug a 500 error spike.
- How to debug high latency.
- Interview questions and answers.
```

---

## Story 9.2 — Learn incident response and runbooks

### Description

As a software engineer, I want to understand incident response, so that I can handle production failures professionally.

### Acceptance Criteria

- Explain incident severity, rollback, mitigation, root cause analysis, postmortems.
- Include runbook examples.
- Include interview examples.

### Claude Prompt

```text
Teach me incident response for software engineers.

Explain:

1. What an incident is.
2. Severity levels.
3. Detection.
4. Triage.
5. Mitigation.
6. Rollback.
7. Communication.
8. Root cause analysis.
9. Postmortem.
10. Action items.
11. Runbooks.
12. On-call basics.

Use examples:
- API outage.
- Database latency spike.
- Failed deployment.
- Queue backlog.
- Third-party provider outage.

Include:
- Incident response checklist.
- Example runbook.
- Example postmortem.
- Interview answer: “Tell me about a production issue you handled.”
```

---

# EPIC 10 — Deployment, CI/CD, Containers, and IaC

## Story 10.1 — Learn CI/CD and deployment strategies

### Description

As a software engineer, I want to understand CI/CD and deployment strategies, so that I can safely ship production changes.

### Acceptance Criteria

- Explain pipelines, build, test, deploy, artifacts, environments.
- Explain blue/green, canary, rolling deploys, feature flags.
- Include diagrams.

### Claude Prompt

```text
Teach me CI/CD and deployment strategies from zero.

Explain:

1. CI.
2. CD.
3. Build pipeline.
4. Test pipeline.
5. Deployment pipeline.
6. Artifacts.
7. Environments: dev, staging, production.
8. Rolling deployment.
9. Blue/green deployment.
10. Canary deployment.
11. Feature flags.
12. Rollbacks.
13. Database migration deployment risks.
14. Release monitoring.

Use tools:
- GitHub Actions.
- Docker.
- AWS ECS.
- AWS Lambda.
- Terraform/CDK.
- ArgoCD conceptually.

Include:
- Mermaid CI/CD pipeline diagram.
- Deployment strategy comparison table.
- Real example of deploying a Node.js API.
- Interview questions and answers.
```

---

## Story 10.2 — Learn Docker and container orchestration

### Description

As a software engineer, I want to understand containers and orchestration, so that I can reason about modern deployment systems.

### Acceptance Criteria

- Explain Docker, images, containers, registries, ECS, EKS, Kubernetes.
- Include architecture diagrams.
- Include when to choose ECS vs Lambda vs Kubernetes.

### Claude Prompt

```text
Teach me Docker and container orchestration from zero.

Explain:

1. What a container is.
2. What a Docker image is.
3. Dockerfile.
4. Container registry.
5. Environment variables.
6. Volumes.
7. Networking.
8. Docker Compose.
9. ECS.
10. Fargate.
11. EKS.
12. Kubernetes basics:
    - Pod
    - Deployment
    - Service
    - Ingress
    - ConfigMap
    - Secret
    - HPA
13. When to choose ECS.
14. When to choose Kubernetes.
15. When to choose Lambda instead.

Include:
- Mermaid diagrams.
- Example deployment of a Node.js API.
- Common production issues.
- Interview questions and answers.
```

---

## Story 10.3 — Learn Infrastructure as Code

### Description

As a software engineer, I want to understand Infrastructure as Code, so that I can create repeatable and versioned infrastructure.

### Acceptance Criteria

- Explain Terraform, CDK, CloudFormation, Pulumi.
- Explain state, drift, plan/apply, modules, environments.
- Include examples.

### Claude Prompt

```text
Teach me Infrastructure as Code from zero.

Explain:

1. What Infrastructure as Code is.
2. Why it matters.
3. Terraform.
4. AWS CDK.
5. CloudFormation.
6. Pulumi.
7. State files.
8. Drift.
9. Plan/apply workflow.
10. Modules.
11. Workspaces/environments.
12. Secrets in IaC.
13. CI/CD for infrastructure.

Compare:
- Terraform vs CDK vs CloudFormation vs Pulumi.

Include:
- Example architecture described in IaC:
  - VPC
  - ALB
  - ECS service
  - DynamoDB table
  - S3 bucket
- Mermaid diagram.
- Interview questions and answers.
```

---

# EPIC 11 — AWS Core Services Learning Path

## Story 11.1 — Learn AWS service map

### Description

As a software engineer, I want to understand the main AWS services, so that I know which service solves which problem.

### Acceptance Criteria

- Explain AWS service categories.
- Include service decision matrix.
- Include diagrams.

### Claude Prompt

```text
Create a beginner-friendly AWS service map for system design.

Group services by category:

1. Compute:
   - EC2
   - Lambda
   - ECS
   - Fargate
   - EKS
2. Networking:
   - VPC
   - Route 53
   - CloudFront
   - ALB
   - NLB
   - API Gateway
3. Storage:
   - S3
   - EBS
   - EFS
4. Databases:
   - RDS
   - Aurora
   - DynamoDB
   - ElastiCache
   - OpenSearch
5. Messaging/events:
   - SQS
   - SNS
   - EventBridge
   - Kinesis
6. Security:
   - IAM
   - Cognito
   - KMS
   - Secrets Manager
   - WAF
7. Observability:
   - CloudWatch
   - CloudTrail
   - X-Ray
8. DevOps:
   - CodePipeline
   - ECR
   - CloudFormation
   - CDK

For each service:
- What it is.
- What problem it solves.
- When to use it.
- When not to use it.
- Common alternatives.
- Interview explanation.

Include:
- AWS architecture cheat sheet.
- Mermaid diagrams.
- Service comparison tables.
```

---

## Story 11.2 — Design a complete AWS web app architecture

### Description

As a software engineer, I want to design a complete AWS web application architecture, so that I can connect all learned concepts.

### Acceptance Criteria

- Include frontend hosting, API layer, backend compute, DB, storage, queue, observability, security.
- Include diagrams.
- Include design tradeoffs.

### Claude Prompt

```text
Design a complete scalable AWS architecture for a web application.

Use this scenario:
A CV Builder app where users can:
- Create an account.
- Upload a CV PDF/DOCX.
- Parse the CV with an AI provider.
- Edit generated CV content.
- Export a PDF.
- Save multiple CV versions.

Please design the architecture using AWS.

Include:

1. Frontend hosting:
   - S3 + CloudFront or Amplify.
2. Authentication:
   - Cognito or alternative.
3. API layer:
   - API Gateway or ALB.
4. Backend compute:
   - Lambda vs ECS/Fargate comparison.
5. Database:
   - DynamoDB vs RDS comparison.
6. File storage:
   - S3.
7. Async processing:
   - SQS/EventBridge/Lambda workers.
8. AI provider integration.
9. Caching:
   - CloudFront and/or Redis.
10. Observability:
    - CloudWatch, logs, metrics, traces.
11. Security:
    - IAM, private subnets, secrets, encryption.
12. CI/CD:
    - GitHub Actions, ECR, deploy flow.
13. Cost considerations.
14. Failure handling.

Include:
- Mermaid high-level architecture diagram.
- Mermaid sequence diagram for CV upload and parsing.
- Mermaid deployment diagram.
- Tradeoff table.
- Interview-style explanation.
```

---

# EPIC 12 — System Design Interview Practice

## Story 12.1 — Learn a system design answer framework

### Description

As a software engineer, I want a repeatable framework for answering system design interviews, so that I can organize my thoughts clearly.

### Acceptance Criteria

- Include interview framework.
- Include questions to ask.
- Include diagram approach.
- Include tradeoff explanation.

### Claude Prompt

```text
Teach me a repeatable framework for system design interviews.

I need a structured way to answer any system design question.

Include:

1. How to clarify requirements.
2. Functional requirements.
3. Non-functional requirements.
4. Capacity estimation basics.
5. API design.
6. Data model.
7. High-level architecture.
8. Deep dives.
9. Bottlenecks.
10. Scaling strategy.
11. Reliability strategy.
12. Security strategy.
13. Observability strategy.
14. Cost considerations.
15. Tradeoffs.
16. Final summary.

Create a reusable template I can memorize.

Include:
- Example answer structure.
- Mermaid diagram example.
- Common mistakes.
- Senior-level phrases to use.
- Interview checklist.
```

---

## Story 12.2 — Practice designing common systems

### Description

As a software engineer, I want to practice common system design questions, so that I can prepare for interviews.

### Acceptance Criteria

- Include multiple architecture exercises.
- Include expected solution structure.
- Include diagrams and tradeoffs.

### Claude Prompt

```text
Create a system design interview practice pack for me.

For each system, provide:
- Problem statement.
- Clarifying questions.
- Functional requirements.
- Non-functional requirements.
- API design.
- Data model.
- High-level architecture.
- Scaling concerns.
- Reliability concerns.
- Security concerns.
- Observability.
- Tradeoffs.
- Mermaid diagram.
- Strong interview answer.

Systems to include:

1. URL shortener.
2. File upload and processing system.
3. Notification system.
4. Real-time chat.
5. News feed.
6. E-commerce product catalog.
7. Payment processing workflow.
8. CV builder and PDF export system.
9. Group expense app.
10. Analytics dashboard.
11. Video/image upload platform.
12. Feature flag system.
```

---

# EPIC 13 — Hands-On Labs

## Story 13.1 — Build a small scalable AWS API

### Description

As a software engineer, I want to build a small AWS-backed API, so that I can practice cloud architecture hands-on.

### Acceptance Criteria

- Include step-by-step implementation plan.
- Include AWS services.
- Include local development.
- Include deployment.
- Include observability.

### Claude Prompt

```text
Design a hands-on lab for me to build a small scalable AWS API.

Project:
A simple Notes API where users can create, read, update, and delete notes.

Use:
- Node.js or Python backend.
- REST API.
- AWS Lambda or ECS/Fargate.
- DynamoDB.
- API Gateway or ALB.
- S3 only if needed.
- CloudWatch logs.
- GitHub Actions for deployment.
- Terraform or AWS CDK for infrastructure.

Please provide:
1. Architecture overview.
2. Mermaid diagram.
3. Folder structure.
4. API contract.
5. DynamoDB data model.
6. Infrastructure components.
7. Step-by-step implementation tasks.
8. Testing strategy.
9. Deployment strategy.
10. Observability checklist.
11. Failure scenarios to test.
12. Stretch goals.
```

---

## Story 13.2 — Build an event-driven file processing system

### Description

As a software engineer, I want to build an event-driven file processing system, so that I can understand S3, queues, workers, and async architecture.

### Acceptance Criteria

- Include S3 upload.
- Include SQS or EventBridge.
- Include Lambda worker.
- Include status tracking.
- Include diagrams.

### Claude Prompt

```text
Design a hands-on lab for an event-driven file processing system.

Project:
A user uploads a PDF. The system stores the file, processes it asynchronously, extracts text, and updates the processing status.

Use AWS:
- S3 for file storage.
- API Gateway or backend API for generating presigned upload URLs.
- DynamoDB for metadata and status.
- SQS or EventBridge for processing events.
- Lambda worker for processing.
- CloudWatch for logs and metrics.

Please provide:
1. Architecture overview.
2. Mermaid high-level diagram.
3. Mermaid sequence diagram.
4. API contract.
5. DynamoDB table design.
6. S3 bucket structure.
7. Event schema.
8. Worker behavior.
9. Retry and DLQ strategy.
10. Idempotency strategy.
11. Security considerations.
12. Step-by-step implementation plan.
13. Testing plan.
14. Interview explanation.
```

---

# EPIC 14 — Final Capstone

## Story 14.1 — Design a production-ready CV Builder architecture

### Description

As a software engineer, I want to produce a complete architecture document for a production CV Builder app, so that I can apply all system design concepts.

### Acceptance Criteria

- Include functional and non-functional requirements.
- Include full architecture.
- Include AWS services.
- Include diagrams.
- Include API design and data model.
- Include scaling, security, observability, and cost.
- Include interview explanation.

### Claude Prompt

```text
Help me create a production-ready system design document for a CV Builder application.

The app allows users to:
- Sign up and log in.
- Create CVs.
- Import CVs from PDF/DOCX.
- Parse CV content using an AI provider.
- Edit CV sections.
- Preview templates.
- Export PDFs.
- Save multiple versions.
- Share download links.

Create a full system design document with:

1. Problem statement.
2. Functional requirements.
3. Non-functional requirements.
4. Assumptions.
5. Capacity estimation.
6. API design.
7. Data model.
8. AWS architecture.
9. Frontend hosting.
10. Backend compute choice.
11. Database choice.
12. File storage.
13. Async processing.
14. AI provider integration.
15. Caching strategy.
16. Security architecture.
17. Observability architecture.
18. CI/CD.
19. Disaster recovery.
20. Cost optimization.
21. Tradeoffs.
22. Alternatives considered.
23. Mermaid architecture diagram.
24. Mermaid sequence diagrams:
    - Login.
    - Upload CV.
    - Parse CV.
    - Export PDF.
25. Final interview-style explanation.

Explain everything in beginner-friendly language first, then add senior-level technical depth.
```

---

# Suggested Learning Order

Follow this order:

```text
1. EPIC 1 — Foundations
2. EPIC 2 — Networking
3. EPIC 3 — Core Web Architecture
4. EPIC 4 — Databases and Storage
5. EPIC 5 — Caching and Performance
6. EPIC 6 — Async and Event-Driven Architecture
7. EPIC 7 — Reliability and Fault Tolerance
8. EPIC 8 — Security
9. EPIC 9 — Observability
10. EPIC 10 — Deployment, Containers, IaC
11. EPIC 11 — AWS Core Services
12. EPIC 12 — Interview Practice
13. EPIC 13 — Hands-On Labs
14. EPIC 14 — Capstone
```

---

# Weekly Study Plan

## Week 1 — Foundations and Request Flow

- EPIC 1
- EPIC 2
- Draw 3 diagrams manually:
  - Basic web app
  - Request lifecycle
  - AWS VPC

## Week 2 — Traffic, Scaling, and APIs

- EPIC 3
- Practice explaining:
  - CDN vs Load Balancer
  - API Gateway vs ALB
  - Stateless services
  - Horizontal scaling

## Week 3 — Data Layer

- EPIC 4
- Practice:
  - SQL vs NoSQL decision
  - DynamoDB access patterns
  - S3 upload/download design

## Week 4 — Performance and Async

- EPIC 5
- EPIC 6
- Practice:
  - Cache-aside
  - Queue-based processing
  - Event-driven CV parsing flow

## Week 5 — Reliability, Security, Observability

- EPIC 7
- EPIC 8
- EPIC 9
- Practice:
  - Incident debugging
  - Auth flows
  - Retry/idempotency explanations

## Week 6 — Deployment and AWS

- EPIC 10
- EPIC 11
- Practice:
  - ECS vs Lambda
  - Terraform vs CDK
  - CI/CD deployment strategies

## Week 7 — Interview Practice

- EPIC 12
- Do at least 5 system design mocks:
  - URL shortener
  - Notification system
  - File processing system
  - Group expense app
  - CV builder

## Week 8 — Capstone

- EPIC 13
- EPIC 14
- Build one hands-on lab.
- Produce one full architecture document.
- Practice explaining it in 5 minutes.

---

# Definition of Done

You can consider this learning path complete when you can confidently explain:

```text
- How a request travels through the internet and cloud infrastructure.
- How to design scalable stateless services.
- When to use CDN, load balancer, API Gateway, cache, queue, and database.
- How to choose between SQL, NoSQL, DynamoDB, Redis, and S3.
- How to design async processing with queues and workers.
- How to make a system reliable using retries, DLQs, failover, and idempotency.
- How to secure AWS systems using IAM, private subnets, encryption, and secrets.
- How to monitor systems with logs, metrics, traces, dashboards, and alerts.
- How to deploy systems using CI/CD, containers, serverless, and IaC.
- How to answer system design interviews with structure and tradeoffs.
```

---

# Final Claude Master Prompt

Use this when you want Claude to generate the entire learning path in one shot:

```text
Act as a principal software architect, AWS cloud architect, and senior interviewer.

Create a complete learning path for me to become strong in System Design, Software Architecture, Cloud Infrastructure, and AWS.

My background:
- Senior Software Engineer.
- Strong frontend, React, TypeScript, Node.js, APIs, testing, and product engineering experience.
- Limited deep infrastructure knowledge.
- I want beginner-friendly explanations first, then senior-level depth.
- I want to prepare for real projects and interviews.

Create the learning path with:

1. Ordered modules.
2. Theory per module.
3. Simple analogies.
4. Technical explanations.
5. AWS-specific services.
6. Cloud-agnostic concepts.
7. Mermaid diagrams.
8. Hands-on labs.
9. Interview questions and answers.
10. Real-world scenarios.
11. Common mistakes.
12. Tradeoff tables.
13. Weekly study plan.
14. Final capstone project.

Topics to include:
- Request lifecycle
- DNS, HTTP, TLS, networking
- VPC, subnets, NAT, gateways, security groups
- CDN, load balancers, API gateways
- Stateless services and horizontal scaling
- SQL vs NoSQL
- DynamoDB deep dive
- S3 and object storage
- Caching and Redis
- Queues and event-driven architecture
- SQS, SNS, EventBridge, Kafka conceptually
- Reliability, failover, RTO/RPO
- Retries, backoff, circuit breakers, idempotency
- Auth, OAuth2, JWT, IAM, Cognito
- Cloud security
- Observability: logs, metrics, traces, SLOs
- CI/CD
- Docker, ECS, Lambda, Kubernetes basics
- Infrastructure as Code: Terraform, CDK
- Cost optimization
- System design interview framework
- Architecture diagrams
- Capstone: production-ready CV Builder app on AWS

Make it practical and easy to understand. Explain every term because I am still learning infrastructure.
```
