---
tags:
  - core-services
  - compute
  - ec2
  - auto-scaling
  - virtual-machines
category: Core Services - Compute
difficulty: intermediate
prerequisites:
  - "[[cloud-computing-basics]]"
  - "[[aws-infrastructure]]"
related:
  - "[[networking-overview]]"
  - "[[databases-overview]]"
---

## Core Services: EC2 - Elastic Amazon EC2 is a virtual machine Compute Cloud

- Amazon EC2 is a virtual machine launched on AWS hardware. 
- AWS Takes care of the hardware, whereas you focus on setting up Amazon EC2 to match your application needs. 

## What you launch

- Websites
- [[databases-overview|Databases]] (though managed database services like RDS are often preferred)
- Analytical applications and more. 

## Flexibility and Control

- Select and configure the EC2 instance to match your application needs and have complete control over this resource. 
- Start and stop the instance when you need or terminate it when you do not need capacity anymore. 

## EC2 Instance Types

Are purpose-built configurations of virtual servers, designed with different resources combinations to help your applications perform at their best. 

According to the instance type, we can determinate the use case:

- General Purpose
- High Performance
- In-memory Databases
- Machine learning
- Distributed File Systems

![[assets/Pasted image 20260109001511.png]]

## EC2 Instance Categories

![[assets/Pasted image 20260109002706.png]]

## Amazon EC2 Auto Scaling

- Dynamic Scaling capabilities, the service will be able to match the demand in a live manner. 
- Scale horizontally to precisely match the current demand and avoid over or under provisioning.
- Amazon EC2 Auto scaling provides several scaling options: 
	- Manual
	- Scheduled
	- Dynamic
	- On Demand
	- Predictive
	If you know that you will have significant (or not enough) traffic in a certain period, you can schedule the service to launch the resources in advance to be ready to serve the traffic.
	- A good example of this might be the stores on sale season like black friday.
	- Also the companies that sell tickets for concerts or sports.

## How EC2 Relates to Other Services

- **[[networking-overview|VPC & Security Groups]]** - EC2 instances run inside VPCs and use Security Groups for firewall rules
- **[[s3]]** - Often used to store application data, backups, or serve static content for EC2-hosted applications
- **[[databases-overview|RDS]]** - Managed database alternative to running databases on EC2 