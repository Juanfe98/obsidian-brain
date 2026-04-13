---
tags:
  - comparison
  - storage
  - s3
  - ebs
  - efs
category: Comparisons
difficulty: intermediate
related:
  - "[[s3]]"
  - "[[ec2]]"
---

# storage-options-comparison

Understanding when to use each AWS storage service is crucial for building efficient architectures.

## Quick Decision Guide

```
Need to store files/objects? → S3
Need block storage for EC2? → EBS
Need shared file system? → EFS
Need archive storage? → S3 Glacier
Need high-performance cache? → ElastiCache
```

## Detailed Comparison

| Feature | [[s3]] | EBS | EFS |
|---------|--------|-----|-----|
| **Type** | Object Storage | Block Storage | File Storage |
| **Use Case** | Files, backups, data lakes | EC2 boot/data volumes | Shared file systems |
| **Access Pattern** | HTTP/S API | Attached to single EC2 | Network file system (NFS) |
| **Durability** | 99.999999999% (11 nines) | 99.8-99.9% | 99.999999999% (11 nines) |
| **Availability** | 99.99% | 99.99% | 99.99% |
| **Scope** | Regional (multi-AZ) | Single AZ | Regional (multi-AZ) |
| **Max Size** | Unlimited | 16 TiB per volume | Unlimited |
| **Performance** | Moderate | Very high (provisioned IOPS) | High, scalable |
| **Pricing Model** | Pay per GB stored + requests | Pay per GB provisioned | Pay per GB used |
| **Concurrent Access** | Unlimited | Single EC2 instance | Multiple EC2 instances |
| **Protocol** | REST API | Block device | NFS v4 |

## When to Use Each Service

### Use [[s3]] When:
✅ Storing static website content
✅ Hosting images, videos, documents
✅ Backup and archiving
✅ Data lakes for analytics
✅ Content distribution (with CloudFront)
✅ Object-level storage with metadata
✅ Need 11 nines durability

❌ **Don't use for:**
- Database storage (use [[databases-overview|RDS]] or EBS)
- OS boot volumes (use EBS)
- Shared file systems requiring POSIX (use EFS)

### Use EBS When:
✅ EC2 boot volumes
✅ Database storage on [[ec2]]
✅ Need consistent, low-latency performance
✅ Transactional workloads
✅ Need point-in-time snapshots
✅ Single instance access

❌ **Don't use for:**
- Shared access across instances (use EFS)
- Archival storage (use S3 Glacier)
- Static content delivery (use S3)

### Use EFS When:
✅ Content management systems
✅ Web serving with multiple servers
✅ Shared development environments
✅ Container storage (EKS/ECS)
✅ Need POSIX-compliant file system
✅ Multiple [[ec2]] instances need concurrent access

❌ **Don't use for:**
- Object storage (use S3)
- Boot volumes (use EBS)
- Windows file shares (use FSx for Windows)

## S3 Storage Classes Deep Dive

| Storage Class | Use Case | Retrieval Time | Min Storage | Cost |
|---------------|----------|----------------|-------------|------|
| **S3 Standard** | Frequently accessed data | Immediate | None | $$$$ |
| **S3 Intelligent-Tiering** | Unknown/changing access patterns | Immediate | None | $$$ |
| **S3 Standard-IA** | Infrequently accessed | Immediate | 30 days | $$ |
| **S3 One Zone-IA** | Infrequent, non-critical data | Immediate | 30 days | $ |
| **S3 Glacier Instant** | Archive, instant retrieval | Immediate | 90 days | $$ |
| **S3 Glacier Flexible** | Archive, occasional access | Minutes to hours | 90 days | $ |
| **S3 Glacier Deep Archive** | Long-term archive | 12-48 hours | 180 days | ¢ |

### S3 Storage Class Decision Flow

```
Is data accessed frequently (>1/month)?
├─ YES → S3 Standard
└─ NO → Is access pattern predictable?
    ├─ NO → S3 Intelligent-Tiering
    └─ YES → How often accessed?
        ├─ Few times/year → Need fast retrieval?
        │   ├─ YES → S3 Glacier Instant Retrieval
        │   └─ NO → S3 Glacier Flexible Retrieval
        └─ Rarely (7-10 years) → S3 Glacier Deep Archive
```

## EBS Volume Types

| Volume Type | Use Case | IOPS | Throughput | Size |
|-------------|----------|------|------------|------|
| **gp3 (General Purpose SSD)** | Most workloads | Up to 16,000 | 1,000 MB/s | 1 GiB - 16 TiB |
| **gp2 (General Purpose SSD)** | Legacy general purpose | Up to 16,000 | 250 MB/s | 1 GiB - 16 TiB |
| **io2 (Provisioned IOPS SSD)** | Databases, critical apps | Up to 64,000 | 1,000 MB/s | 4 GiB - 16 TiB |
| **st1 (Throughput HDD)** | Big data, data warehouses | 500 | 500 MB/s | 125 GiB - 16 TiB |
| **sc1 (Cold HDD)** | Infrequent access | 250 | 250 MB/s | 125 GiB - 16 TiB |

## Common Architecture Patterns

### Pattern 1: Web Application
```
EC2 (with EBS boot volume)
├─ Static content → S3
├─ User uploads → S3
└─ Application data → EBS volume
```

### Pattern 2: Content Management System
```
Multiple EC2 instances
├─ Shared media files → EFS
├─ Static assets → S3
└─ Database files → EBS (on database server)
```

### Pattern 3: Data Processing Pipeline
```
Raw data → S3
├─ Processing → EC2 with EBS
└─ Results → S3 (Glacier for archive)
```

## Cost Optimization Tips

1. **S3 Lifecycle Policies**
   - Transition objects to cheaper storage classes over time
   - Example: Standard → Standard-IA (30 days) → Glacier (90 days)

2. **EBS Snapshots**
   - Store snapshots in S3 (cheaper than keeping volumes)
   - Only incremental changes are stored

3. **EFS Storage Classes**
   - Use EFS Infrequent Access for files not accessed regularly
   - Can save up to 92% on storage costs

4. **Right-sizing**
   - Don't over-provision EBS volumes
   - Use S3 analytics to optimize storage class usage

## Key Exam Points

- **S3** = Object storage, 11 nines durability, unlimited scale
- **EBS** = Block storage, single AZ, attached to one EC2
- **EFS** = Network file system, multi-AZ, concurrent access
- **S3 Standard-IA** = Minimum 30 days storage
- **S3 Glacier** = Archive storage with retrieval delays
- **EBS snapshots** = Stored in S3, incremental backups

## Related Notes

- [[s3]] - Detailed S3 features and use cases
- [[ec2]] - How EC2 uses EBS volumes
- [[aws-infrastructure]] - Understanding AZs impact on storage choice

---

**See Also:**
- [[databases-overview|Database Comparison]] - For database storage options
- [[04-study-aids/Quick Reference - Storage|Storage Quick Reference]] - Cheat sheet
