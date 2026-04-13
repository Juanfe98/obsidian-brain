---
tags:
  - core-services
  - databases
  - rds
  - aurora
  - dynamodb
  - nosql
  - relational
category: Core Services - Databases
difficulty: intermediate
prerequisites:
  - "[[cloud-computing-basics]]"
  - "[[aws-infrastructure]]"
related:
  - "[[ec2]]"
  - "[[s3]]"
  - "[[networking-overview]]"
---

There are different ways of running or using databases in aws

- You can use [[ec2]] to set up and manually configure your database service.
- You can use managed-purpose built database services.
	- With a managed database we simplify the set up and configuration.
	- Managed databases will take care of time consuming and complex activities. 

## Database types - Use Cases - Corresponding AWS Services

![[databases-types-aws.png]]

## Relational Databases

### Amazon Aurora

MySQL and PostgreSQL-compatible **relational database** built in the cloud for the cloud.

![[aws-aurora.png]]

- It is compatible with Mysql.
- Supports high availability and durability and you can run it serverless.
- Can run the database with multi-regional replicas.

### Amazon RDS (Relational Database Service)

![[aws-rds.png]]

Set up, operate, and scale a relational database in the cloud with just a few clicks.

Amazon RDS is a web service that makes it easier to set up, operate, and scale a relational database in the AWS Cloud. It provides cost-efficient, resizable capacity for an industry-standard relational database and manages common database administration tasks.

Managed means you still have the power to decide how the database will be launched, but Amazon RDS will launch it for you. You can set up, operate, and scale a relational database in the cloud with just a few clicks. Amazon RDS is compatible with multiple engines, and you can use it to launch the Amazon Aurora database. 

Choose from seven popular engines: Amazon Aurora with MySQL compatibility, Amazon Aurora with PostgreSQL compatibility, MySQL, MariaDB, PostgreSQL, Oracle, and SQL Server.

- We can choose RDS to launch the database in the multi [[aws-infrastructure|AZ]] configuration for high availability. 

## Amazon DynamoDB (Key - Value Database)

- With DynamoDB, you can achieve **single-digit millisecond performance at any scale.**
- It is a **fully managed, serverless, nonrelational database**.
- DynamoDB is a great choice when you're looking for **seamless database scalability**. DynamoDB will automatically scale to meet demand.
- DynamoDB is also an excellent choice for workloads that involve working with databases, **flexible schemas**, and **high throughput** (with many read/write requests).

## Other Database Services

### In Memory Database

- Amazon Elasti Cache
	- Unlock microsecond latency
	- Scalable cashing service
- Amazon Memory DB for Redis
	- Compatible 
	- Durable

### Document Database

- Amazon DocumentDB
		- Scale JSON workloads with ease
		- Enterprise ready-document DB service compatible with MongoDB

## How Databases Relate to Other Services

- **[[ec2]]** - You can run databases on EC2 for full control, but managed services are often preferred
- **[[networking-overview|VPC]]** - RDS and other databases run inside VPCs for network isolation
- **[[s3]]** - Use S3 for database backups, data lakes, and archiving database exports
