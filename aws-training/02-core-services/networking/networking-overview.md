---
tags:
  - core-services
  - networking
  - vpc
  - route53
  - dns
  - security-groups
  - subnets
category: Core Services - Networking
difficulty: intermediate
prerequisites:
  - "[[cloud-computing-basics]]"
  - "[[aws-infrastructure]]"
related:
  - "[[ec2]]"
  - "[[s3]]"
  - "[[databases-overview]]"
---

# Amazon VPC (Virtual Private Cloud)

Amazon VPC is a **logically isolated virtual network** in AWS where you control networking for your resources (IP ranges, subnets, routing, and traffic rules).

## Key things to know
- **CIDR block**: Your VPC's IP range (e.g., `10.0.0.0/16`).
- **Subnets**: Smaller IP ranges inside the VPC. Each subnet is in **one [[aws-infrastructure|Availability Zone]]**.
  - **Public subnet**: Has a route to an **Internet Gateway (IGW)**.
  - **Private subnet**: No direct route to the IGW.
- **Route tables**: Decide where traffic goes (local within VPC, to IGW, to NAT, to VPN, etc.). Each subnet is associated with a route table.
- **Internet Gateway (IGW)**: Enables inbound/outbound internet connectivity for resources in public subnets (when routing + public IP/EIP is configured).
- **NAT Gateway**: Lets resources in **private subnets** make outbound internet calls (updates, external APIs) without being publicly reachable.
- **Security Groups (SGs)**: Stateful firewall rules attached to resources (commonly [[ec2]], ALB, ENIs). You allow inbound/outbound traffic by protocol/port/source.
- **Network ACLs (NACLs)**: Optional subnet-level stateless rules (less commonly your primary control compared to SGs).
- **VPC Endpoints (Private connectivity)**:
  - **Gateway endpoints** (e.g., [[s3]]/[[databases-overview|DynamoDB]]) or **Interface endpoints** (PrivateLink) for private access to AWS services without going over the public internet.
- **Connectivity options**:
  - **VPC Peering / Transit Gateway** (VPC-to-VPC networking)
  - **VPN / Direct Connect** (connect to on-prem)

## What problems VPC solves
- Create **private networks** for workloads and data.
- Control **who can talk to what** and **how traffic routes**.
- Support common patterns like “public entry + private app + private DB”.

---

# Amazon Route 53

Amazon Route 53 is AWS’s **DNS service** (plus optional domain registration and health checks). DNS translates human-friendly names into targets computers can reach.

## Key things to know
- **DNS basics**: `api.example.com` → IP address or another DNS name.
- **Hosted Zone**: Container for DNS records for a domain.
  - **Public hosted zone**: Internet-facing DNS.
  - **Private hosted zone**: DNS names resolvable only inside one/more VPCs.
- **Record types (most common)**:
  - **A**: name → IPv4 address
  - **AAAA**: name → IPv6 address
  - **CNAME**: name → another DNS name (not allowed at the zone apex like `example.com`)
  - **Alias record (Route 53 feature)**: name → certain AWS resources (works at the zone apex and behaves like DNS mapping without a traditional CNAME at root).
- **TTL (Time To Live)**: How long resolvers cache a DNS answer. Lower TTL = faster changes, higher TTL = more caching.
- **Routing policies** (how Route 53 chooses answers):
  - **Simple**: one record
  - **Weighted**: split traffic by percentage (useful for gradual rollout)
  - **Latency-based**: route to lowest-latency region
  - **Failover**: primary/secondary with health checks
  - **Geolocation / Geoproximity**: route based on user location
  - **Multi-value**: return multiple healthy records
- **Health checks (optional)**: Route 53 can monitor endpoints and use that for failover decisions.
- **Delegation / Nameservers**: To use Route 53 as the DNS authority, your domain’s registrar must point the domain’s **NS records** to Route 53’s nameservers.

## What problems Route 53 solves
- Manage DNS reliably at scale.
- Control traffic routing (failover, weighted splits, latency routing).
- Centralize domain + DNS management (if you choose to register domains there).

## How Networking Relates to Other Services

- **[[ec2]]** - EC2 instances run inside VPC subnets and use Security Groups for access control
- **[[databases-overview|RDS]]** - Database instances run inside VPC subnets for network isolation
- **[[s3]]** - Access S3 privately using VPC Gateway Endpoints without internet gateway
