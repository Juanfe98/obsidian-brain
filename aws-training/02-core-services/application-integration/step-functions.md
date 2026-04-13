---
tags:
  - core-services
  - application-integration
  - step-functions
  - orchestration
  - workflows
category: Core Services - Application Integration
difficulty: beginner
prerequisites:
  - "[[cloud-computing-basics]]"
  - "[[aws-infrastructure]]"
related:
  - "[[ec2]]"
  - "[[networking-overview]]"
  - "[[databases-overview]]"
---

## AWS Step Functions

AWS Step Functions is a serverless orchestration service that lets you coordinate multiple AWS services into structured, visual workflows.
It is a workflow orchestration service.

### What does Step Functions do?

AWS Step Functions is a serverless workflow orchestration service that makes it possible for you coordinate multiple AWS services into structured, visual workflows. You can think of it as a conductor in an orchestra, where you're coordinating different Amazon Web Services (AWS) services to work together harmoniously.

Step Functions helps you to build applications by breaking them down into individual steps or tasks. These tasks can include processing data with AWS Lambda functions, running containers on Amazon Elastic Container Service (Amazon ECS), or making decisions based on business logic. The service automatically manages the sequence of these tasks to make sure each step executes in the right order and at the right time.

## Purpose

- Coordinate multiple AWS services into automated workflows
- Build visual workflows without managing the underlying infrastructure
- Define the steps and transitions of your application logic as a state machine
- Step Functions provides a visual representation of your workflow (called a state machine), showing how your application's components connect and interact with each other.
- The service handles coordination details, such as tracking the status of each step, managing timeouts, and achieving proper task execution.

## Problems Step Functions Can Solve

Step Functions helps you to coordinate multiple AWS services into flexible workflows. Step Functions helps you address the following challenges.

- Complex workflow orchestration
  - These services include Lambda functions, Amazon Simple Queue Service (Amazon SQS) queues, and Amazon DynamoDB. 
- Code complexity
  - Step Functions frees up developers to focus on the core functionality of their applications, rather than managing the flow of execution. 
- Resiliency
  - Step Functions provides features like state tracking, retries, and error handling, making it convenient to debug and recover from failures in distributed systems. 

## Benefits

- Visual Interface
- Error Handling
  - Step Functions provides automatic retry mechanisms and fallback states for failed executions. You can define custom error handling for different failure scenarios. This helps your workflows remain resilient and maintain business continuity without extensive error-handling code.
- Service Integration
  - Step Functions manages the underlying service communications, state management, and data passing between services.
- State Tracing
  - Step Functions automatically tracks the state of each workflow execution, maintaining detailed execution history and current status.

## Key Concepts

-

## Pricing

With Step Functions, you pay only for what you use.
You are charged for the number of state transitions within your workflows. A state transition occurs when your workflow moves from one step to the next. The cost per state transition varies for Standard and Express Workflows, as follows:

- Standard Workflows have a lower cost per transition but higher startup latency.

- Express Workflows have lower latency but higher cost per transition.



## Typical Use Cases

-

## How Step Functions Relates to Other Services

- **Other Application Integration services** — SQS, SNS, EventBridge work alongside Step Functions for messaging and event-driven patterns
