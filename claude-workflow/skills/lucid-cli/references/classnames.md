# Cloud shape className lookup

Curated `className` values for the four cloud libraries Standard Import supports as native vector
shapes: AWS 2024, Azure 2021, Azure 2024, GCP 2021. Transcribed from Lucid's library
documentation (developer.lucid.co, fetched 2026-07-03); the AWS 2024 names below were additionally
spot-verified by a live create → export probe (Route 53, CloudFront, API Gateway, ALB, EC2, RDS,
ElastiCache, VPC/public-subnet/private-subnet containers all rendered as expected).

Do not invent class names. An unknown `className` is a server `400` with no local validator. If a
service is not listed here, check the per-category catalogs in the library docs, or fall back to an
image (see the coverage-ceiling note in `references/standard-import.md`).

## How to use a className

Service and resource icons use `type: "namedShape"`; group/boundary shapes use
`type: "namedContainer"`. Both take a `className`. Named shapes and containers render their own
built-in catalog label — you do not need to set `text`.

```json
{ "id": "s3", "type": "namedShape", "className": "ArchAmazonSimpleStorageServiceAWS2024", "boundingBox": { "x": 200, "y": 120, "w": 90, "h": 90 } }
```

```json
{ "id": "vpc", "type": "namedContainer", "className": "VirtualPrivateCloudVPCAWS2024", "boundingBox": { "x": 80, "y": 80, "w": 900, "h": 500 } }
```

Naming conventions: AWS 2024 names **end** with `AWS2024`; Azure names end with `Azure2021` or
`Azure2024`; GCP names **start** with `GCP2021` and icon shapes end with `Icon`.

## AWS 2024

### AWS 2024 — common `namedShape` icons

| className | Service |
| --- | --- |
| `ArchAmazonEC2AWS2024` | Amazon EC2 |
| `ArchAWSLambdaAWS2024` | AWS Lambda |
| `ArchAWSFargateAWS2024` | AWS Fargate |
| `ArchAmazonSimpleStorageServiceAWS2024` | Amazon S3 |
| `ArchAmazonEFSAWS2024` | Amazon EFS |
| `ArchAmazonRDSAWS2024` | Amazon RDS |
| `ArchAmazonDynamoDBAWS2024` | Amazon DynamoDB |
| `ArchAmazonAuroraAWS2024` | Amazon Aurora |
| `ArchAmazonElastiCacheAWS2024` | Amazon ElastiCache |
| `ArchAmazonVirtualPrivateCloudAWS2024` | Amazon VPC (icon) |
| `ArchAmazonRoute53AWS2024` | Amazon Route 53 |
| `ArchAmazonCloudFrontAWS2024` | Amazon CloudFront |
| `ArchAmazonAPIGatewayAWS2024` | Amazon API Gateway |
| `ResElasticLoadBalancingApplicationLoadBalancerAWS2024` | Application Load Balancer |
| `ResElasticLoadBalancingNetworkLoadBalancerAWS2024` | Network Load Balancer |
| `ResAmazonVPCNATGatewayAWS2024` | NAT gateway |
| `ResAmazonVPCInternetGatewayAWS2024` | Internet gateway |
| `ArchAmazonSimpleQueueServiceAWS2024` | Amazon SQS |
| `ArchAmazonSimpleNotificationServiceAWS2024` | Amazon SNS |
| `ArchAmazonEventBridgeAWS2024` | Amazon EventBridge |
| `ArchAWSIdentityandAccessManagementAWS2024` | AWS IAM |
| `ArchAWSWAFAWS2024` | AWS WAF |
| `ArchAWSCertificateManagerAWS2024` | AWS Certificate Manager (ACM) |
| `ArchAmazonCloudWatchAWS2024` | Amazon CloudWatch |
| `ArchAWSCloudFormationAWS2024` | AWS CloudFormation |
| `ArchAWSCloudTrailAWS2024` | AWS CloudTrail |
| `ArchAmazonBedrockAWS2024` | Amazon Bedrock |
| `ArchAmazonSageMakerAWS2024` | Amazon SageMaker |

### AWS 2024 — `namedContainer` group shapes

| className | Boundary |
| --- | --- |
| `AWSCloudAWS2024` | AWS Cloud |
| `AWSAccountAWS2024` | AWS Account |
| `RegionAWS2024` | Region |
| `AvailabilityZoneAWS2024` | Availability Zone |
| `VirtualPrivateCloudVPCAWS2024` | VPC |
| `PublicSubnetAWS2024` | Public subnet |
| `PrivateSubnetAWS2024` | Private subnet |
| `SecurityGroupAWS2024` | Security Group |
| `AutoScalingGroupAWS2024` | Auto Scaling Group |
| `EcsClusterContainerAWS2024` | ECS Cluster |
| `EcsEc2ContainerAWS2024` | ECS EC2 |
| `EcsFargateContainerAWS2024` | ECS Fargate |
| `ElasticBeanstalkContainerAWS2024` | Elastic Beanstalk |
| `EC2InstanceContentsAWS2024` | EC2 Instance Contents |
| `ServerContentsAWS2024` | Server Contents |
| `SpotFleetAWS2024` | Spot Fleet |
| `CorporateDataCenterAWS2024` | Corporate Data Center |
| `GenericGroupAWS2024` | Generic Group |
| `AWSStepFunctionsWorkflowAWS2024` | Step Functions Workflow |
| `AWSIoTGreengrassAWS2024` | IoT Greengrass |

Additional AWS 2024 services beyond this common set exist under per-category catalogs (Analytics,
Compute, Database, Networking, Security, and more), all ending in `AWS2024`.

## Azure 2024

### Azure 2024 — common `namedShape` icons

| className | Service |
| --- | --- |
| `VirtualMachineAzure2024` | Virtual Machine |
| `FunctionAppsAzure2024` | Function Apps |
| `KubernetesServicesAzure2024` | Kubernetes Services |
| `AppServicesAzure2024` | App Services |
| `ContainerInstancesAzure2024` | Container Instances |
| `VMScaleSetsAzure2024` | VM Scale Sets |
| `StorageAccountsAzure2024` | Storage Accounts |
| `AzureFilesharesAzure2024` | Azure Fileshares |
| `AzureSQLAzure2024` | Azure SQL |
| `AzureCosmosDBAzure2024` | Azure Cosmos DB |
| `CacheRedisAzure2024` | Cache Redis |
| `SQLDatabaseAzure2024` | SQL Database |
| `AzureDatabasePostgreSQLServerAzure2024` | Azure Database for PostgreSQL |
| `VirtualNetworksAzure2024` | Virtual Networks |
| `LoadBalancersAzure2024` | Load Balancers |
| `ApplicationGatewaysAzure2024` | Application Gateways |
| `DNSZonesAzure2024` | DNS Zones |
| `FirewallsAzure2024` | Firewalls |
| `FrontDoorAndCDNProfilesAzure2024` | Front Door and CDN Profiles |
| `ExpressRouteCircuitsAzure2024` | ExpressRoute Circuits |
| `APIManagementServicesAzure2024` | API Management Services |
| `CDNProfilesAzure2024` | CDN Profiles |
| `KeyVaultsAzure2024` | Key Vaults |
| `AzureSentinelAzure2024` | Azure Sentinel |
| `EntraIDProtectionAzure2024` | Entra ID Protection |
| `LogicAppsAzure2024` | Logic Apps |
| `EventGridTopicsAzure2024` | Event Grid Topics |
| `AzureServiceBusAzure2024` | Azure Service Bus |
| `MonitorAzure2024` | Monitor |
| `PolicyAzure2024` | Policy |
| `AzureDevOpsAzure2024` | Azure DevOps |
| `AzureOpenAIAzure2024` | Azure OpenAI |

### Azure 2024 — `namedContainer` group shapes

| className | Boundary |
| --- | --- |
| `SubscriptionContainerAzure2024` | Subscription |
| `ResourceGroupContainerAzure2024` | Resource Group |
| `VirtualNetworkContainerAzure2024` | Virtual Network |
| `SubnetContainerAzure2024` | Subnet |
| `SubnetWithNsgContainerAzure2024` | Subnet with NSG |
| `NetworkSecurityGroupContainerAzure2024` | Network Security Group |
| `ApplicationSecurityGroupContainerAzure2024` | Application Security Group |
| `AppServicePlanContainerAzure2024` | App Service Plan |
| `EventHubNamespaceContainerAzure2024` | Event Hub Namespace |

## Azure 2021

### Azure 2021 — common `namedShape` icons

| className | Service |
| --- | --- |
| `VirtualMachineAzure2021` | Virtual Machine |
| `FunctionAppsAzure2021` | Function Apps |
| `KubernetesServicesAzure2021` | Kubernetes Services |
| `AppServicesAzure2021` | App Services |
| `ContainerInstancesAzure2021` | Container Instances |
| `VMScaleSetsAzure2021` | VM Scale Sets |
| `StorageAccountsAzure2021` | Storage Accounts |
| `FileSharesAzure2021` | File Shares |
| `AzureSQLAzure2021` | Azure SQL |
| `AzureCosmosDBAzure2021` | Azure Cosmos DB |
| `CacheRedisAzure2021` | Cache Redis |
| `SQLDatabaseAzure2021` | SQL Database |
| `AzureDatabasePostgreSQLServerAzure2021` | Azure Database for PostgreSQL |
| `VirtualNetworksAzure2021` | Virtual Networks |
| `LoadBalancersAzure2021` | Load Balancers |
| `ApplicationGatewaysAzure2021` | Application Gateways |
| `DNSZonesAzure2021` | DNS Zones |
| `FirewallsAzure2021` | Firewalls |
| `FrontDoorsAzure2021` | Front Doors |
| `ExpressRouteCircuitsAzure2021` | ExpressRoute Circuits |
| `APIManagementServicesAzure2021` | API Management Services |
| `CDNProfilesAzure2021` | CDN Profiles |
| `KeyVaultsAzure2021` | Key Vaults |
| `AzureSentinelAzure2021` | Azure Sentinel |
| `AzureActiveDirectoryAzure2021` | Azure Active Directory |
| `LogicAppsAzure2021` | Logic Apps |
| `EventGridTopicsAzure2021` | Event Grid Topics |
| `ServiceBusAzure2021` | Service Bus |
| `MonitorAzure2021` | Monitor |
| `PolicyAzure2021` | Policy |
| `AzureDevOpsAzure2021` | Azure DevOps |

### Azure 2021 — `namedContainer` group shapes

| className | Boundary |
| --- | --- |
| `SubscriptionAzure2021` | Subscription |
| `ResourceGroupAzure2021` | Resource Group |
| `VirtualNetworkAzure2021` | Virtual Network |
| `SubnetAzure2021` | Subnet |
| `SubnetWithNetworkSecurityGroupAzure2021` | Subnet with NSG |
| `AppServicePlanAzure2021` | App Service Plan |
| `LogoContainerAzure2021` | Azure (logo boundary) |

## GCP 2021

### GCP 2021 — common `namedShape` icons

| className | Service |
| --- | --- |
| `GCP2021ComputeEngineIcon` | Compute Engine |
| `GCP2021CloudFunctionsIcon` | Cloud Functions |
| `GCP2021AppEngineIcon` | App Engine |
| `GCP2021CloudRunIcon` | Cloud Run |
| `GCP2021GoogleKubernetesEngineIcon` | Google Kubernetes Engine |
| `GCP2021CloudStorageIcon` | Cloud Storage |
| `GCP2021PersistentDiskIcon` | Persistent Disk |
| `GCP2021FilestoreIcon` | Filestore |
| `GCP2021CloudSQLIcon` | Cloud SQL |
| `GCP2021CloudSpannerIcon` | Cloud Spanner |
| `GCP2021BigtableIcon` | Bigtable |
| `GCP2021FirestoreIcon` | Firestore |
| `GCP2021MemorystoreIcon` | Memorystore |
| `GCP2021DatastoreIcon` | Datastore |
| `GCP2021VirtualPrivateCloudIcon` | Virtual Private Cloud |
| `GCP2021CloudDNSIcon` | Cloud DNS |
| `GCP2021CloudLoadBalancingIcon` | Cloud Load Balancing |
| `GCP2021CloudArmorIcon` | Cloud Armor |
| `GCP2021CloudNATIcon` | Cloud NAT |
| `GCP2021CloudVPNIcon` | Cloud VPN |
| `GCP2021CloudInterconnectIcon` | Cloud Interconnect |
| `GCP2021BigqueryIcon` | BigQuery |
| `GCP2021DataflowIcon` | Dataflow |
| `GCP2021PubsubIcon` | Pub/Sub |
| `GCP2021DataprocIcon` | Dataproc |
| `GCP2021VertexaiIcon` | Vertex AI |
| `GCP2021IdentityAndAccessManagementIcon` | Identity and Access Management |
| `GCP2021KeyManagementServiceIcon` | Key Management Service |
| `GCP2021CloudLoggingIcon` | Cloud Logging |
| `GCP2021CloudMonitoringIcon` | Cloud Monitoring |

### GCP 2021 — `namedContainer` group shapes

| className | Boundary |
| --- | --- |
| `GCP2021GoogleCloudLogoContainer` | Google Cloud |
| `GCP2021ContainerAccount` | Account |
| `GCP2021ContainerRegion` | Region |
| `GCP2021ContainerZone` | Zone |
| `GCP2021ContainerSubNetwork` | SubNetwork |
| `GCP2021ContainerKubernetesCluster` | Kubernetes Cluster |
| `GCP2021ContainerPod` | Pod |
| `GCP2021ContainerInstanceGroup` | Instance Group |
| `GCP2021ContainerReplicaPool` | Replica Pool |
| `GCP2021ContainerFirewall` | Firewall |
| `GCP2021ContainerProjectZoneCloudServiceProvider` | Project Zone / Cloud Service Provider |
| `GCP2021ContainerLogicalGroupingOfServicesInstances` | Logical grouping of services / instances |
| `GCP2021ContainerSystem1` | System 1 |
| `GCP2021ContainerUser1` | User 1 |
| `GCP2021ContainerExternalSaaSProviders` | External SaaS Providers |
| `GCP2021ContainerExternalDataSources` | External Data Sources |
| `GCP2021ContainerExternalInfrastructure1stParty` | External Infrastructure (1st party) |
| `GCP2021ContainerExternalInfrastructure3rdParty` | External Infrastructure (3rd party) |
| `GCP2021ContainerColoDCOnPremises` | Colo / DC / On-premises |
| `GCP2021ContainerOptionalComponent` | Optional Component |
