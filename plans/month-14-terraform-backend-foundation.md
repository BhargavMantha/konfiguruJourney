# Month 14: Terraform Backend Foundation

**Created:** 2025-11-15
**Phase:** Multi-Target Backend Development (Months 13-18)
**Timeline:** Month 14 of 24
**Prerequisites:** Konfiguru v0.6 (IR implementation complete)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Learning Objectives](#learning-objectives)
3. [Why Terraform Backend](#why-terraform-backend)
4. [Technical Architecture](#technical-architecture)
5. [Weekly Breakdown](#weekly-breakdown)
6. [Deliverables](#deliverables)
7. [Success Criteria](#success-criteria)
8. [Resources](#resources)

---

## Executive Summary

**Goal:** Implement Terraform backend foundation for Konfiguru, enabling compilation from Konfiguru DSL to Terraform HCL configurations.

**Why This Matters:**
With IR complete (Month 13), you can now add backend targets beyond Kubernetes. Terraform is the first new target because:
1. **Industry Standard:** Most companies use Terraform for infrastructure
2. **Multi-Cloud:** Supports AWS, GCP, Azure, and 1000+ providers
3. **Career Value:** Terraform skills are highly marketable
4. **Certification Path:** HashiCorp Terraform Associate (Month 18)

**Key Outcomes:**
- Terraform HCL generation from IR
- AWS provider integration
- Basic resource types supported (Compute, Storage, Network, Database)
- Foundation for complete Terraform support (Month 15)

**Architecture:**
```
Konfiguru DSL
     ↓
   [Lexer/Parser/Type Checker]
     ↓
    AST
     ↓
[AST → IR Transform]
     ↓
     IR
     ↓
[Backend Selector]
     ↓
  ┌────┴────┐
  ↓         ↓
K8s      Terraform Backend  ← NEW (Month 14)
YAML        HCL
```

---

## Learning Objectives

### Terraform Fundamentals
- **HCL Syntax:** HashiCorp Configuration Language structure
- **Provider Architecture:** How Terraform providers work
- **Resource Blocks:** Terraform resource syntax and patterns
- **State Management:** Basics of Terraform state (deep dive in Month 15)

### Terraform on AWS
- **AWS Provider:** Configuration and usage
- **Core Resources:** EC2, S3, VPC, RDS
- **Resource Dependencies:** depends_on, implicit dependencies
- **Data Sources:** Querying existing infrastructure

### Go + Terraform Integration
- **HCL Generation:** Programmatic HCL creation
- **terraform-json:** Generating Terraform JSON format
- **Provider Selection:** Choosing correct provider based on target cloud
- **Resource Mapping:** IR → Terraform resource translation

---

## Why Terraform Backend

### Market Demand

**Terraform Usage:**
- **3M+ downloads/week** on registry
- **Used by 80%+** of Fortune 500
- **AWS, GCP, Azure** all support Terraform officially
- **Job postings:** 10,000+ roles requiring Terraform

**Konfiguru Value Proposition:**
```konfiguru
// 15 lines of Konfiguru DSL
service webapp {
  image: "nginx:latest"
  port: 80
  replicas: 3
}

database postgres {
  version: "15"
  storage: 20GB
}

// Compiles to 200+ lines of Terraform
$ konfiguru compile --target=terraform app.kfg

Output:
- main.tf (150 lines)
- variables.tf (30 lines)
- outputs.tf (20 lines)
```

### Technical Benefits

**Why Add Terraform After K8s:**
1. **Different Deployment Model:** Infrastructure-as-Code vs container orchestration
2. **Multi-Cloud Support:** AWS, GCP, Azure with same DSL
3. **Stateful Infrastructure:** Persistent resources (DBs, networks, storage)
4. **Team Familiarity:** Most companies already use Terraform

**IR Makes This Easy:**
```go
// Same IR resource
&ir.Resource{
    Type: ir.Compute,
    Properties: map[string]ir.Value{
        "image": ir.String("nginx:latest"),
        "replicas": ir.Int(3),
    },
}

// K8s Backend
→ Deployment with 3 replicas

// Terraform Backend (NEW)
→ aws_ecs_service with desired_count = 3
→ OR aws_instance count = 3
→ OR google_compute_instance_group
```

---

## Technical Architecture

### Terraform HCL Overview

**HCL Syntax:**
```hcl
# Provider configuration
provider "aws" {
  region = "us-west-2"
}

# Resource block
resource "aws_instance" "web" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"

  tags = {
    Name = "webapp"
  }
}

# Output
output "instance_ip" {
  value = aws_instance.web.public_ip
}
```

### IR → Terraform Mapping

#### Mapping Strategy

```go
// pkg/backends/terraform/mapper.go
package terraform

type ResourceMapper struct {
    provider string  // "aws", "gcp", "azure"
}

func (m *ResourceMapper) MapResource(r *ir.Resource) (Resource, error) {
    switch r.Type {
    case ir.Compute:
        return m.mapCompute(r)
    case ir.Storage:
        return m.mapStorage(r)
    case ir.Network:
        return m.mapNetwork(r)
    case ir.Database:
        return m.mapDatabase(r)
    default:
        return nil, fmt.Errorf("unsupported resource type: %v", r.Type)
    }
}
```

#### Resource Type Mappings

**Compute Resources:**
```go
func (m *ResourceMapper) mapCompute(r *ir.Resource) (Resource, error) {
    switch m.provider {
    case "aws":
        // Container workload → ECS
        if r.Properties["image"] != nil {
            return m.generateECSService(r)
        }
        // VM workload → EC2
        return m.generateEC2Instance(r)

    case "gcp":
        return m.generateComputeInstance(r)

    case "azure":
        return m.generateVirtualMachine(r)
    }
}
```

**Storage Resources:**
```go
func (m *ResourceMapper) mapStorage(r *ir.Resource) (Resource, error) {
    switch m.provider {
    case "aws":
        return m.generateS3Bucket(r)  // Object storage
        // OR m.generateEBSVolume(r)   // Block storage

    case "gcp":
        return m.generateGCSBucket(r)

    case "azure":
        return m.generateStorageAccount(r)
    }
}
```

**Network Resources:**
```go
func (m *ResourceMapper) mapNetwork(r *ir.Resource) (Resource, error) {
    switch m.provider {
    case "aws":
        return m.generateVPC(r)
        // May also generate: subnets, route tables, security groups

    case "gcp":
        return m.generateVPCNetwork(r)

    case "azure":
        return m.generateVirtualNetwork(r)
    }
}
```

**Database Resources:**
```go
func (m *ResourceMapper) mapDatabase(r *ir.Resource) (Resource, error) {
    engine := r.Properties["engine"].(ir.StringVal).Val

    switch m.provider {
    case "aws":
        return m.generateRDSInstance(r, engine)

    case "gcp":
        return m.generateCloudSQL(r, engine)

    case "azure":
        return m.generateAzureDatabase(r, engine)
    }
}
```

### HCL Generation

#### Terraform Resource Struct

```go
// pkg/backends/terraform/resource.go
package terraform

type Resource struct {
    Type       string                 // "aws_instance", "aws_s3_bucket"
    Name       string                 // Resource name
    Attributes map[string]interface{} // Resource attributes
    DependsOn  []string               // Explicit dependencies
}

type Block struct {
    Type      string                 // "resource", "provider", "output"
    Labels    []string               // ["aws_instance", "web"]
    Attributes map[string]interface{}
    Blocks    []Block                // Nested blocks
}
```

#### HCL Writer

```go
// pkg/backends/terraform/writer.go
package terraform

type HCLWriter struct {
    buf *bytes.Buffer
}

func (w *HCLWriter) WriteResource(r Resource) error {
    fmt.Fprintf(w.buf, "resource \"%s\" \"%s\" {\n", r.Type, r.Name)

    // Write attributes
    for key, val := range r.Attributes {
        w.writeAttribute(key, val, 1)
    }

    // Write depends_on if present
    if len(r.DependsOn) > 0 {
        w.writeDependsOn(r.DependsOn)
    }

    fmt.Fprintf(w.buf, "}\n\n")
    return nil
}

func (w *HCLWriter) writeAttribute(key string, val interface{}, indent int) {
    prefix := strings.Repeat("  ", indent)

    switch v := val.(type) {
    case string:
        fmt.Fprintf(w.buf, "%s%s = \"%s\"\n", prefix, key, v)
    case int:
        fmt.Fprintf(w.buf, "%s%s = %d\n", prefix, key, v)
    case bool:
        fmt.Fprintf(w.buf, "%s%s = %v\n", prefix, key, v)
    case map[string]interface{}:
        fmt.Fprintf(w.buf, "%s%s = {\n", prefix, key)
        for k, v := range v {
            w.writeAttribute(k, v, indent+1)
        }
        fmt.Fprintf(w.buf, "%s}\n", prefix)
    case []interface{}:
        fmt.Fprintf(w.buf, "%s%s = [\n", prefix, key)
        for _, item := range v {
            w.writeAttribute("", item, indent+1)
        }
        fmt.Fprintf(w.buf, "%s]\n", prefix)
    }
}
```

### Example: Complete Transformation

**Konfiguru DSL Input:**
```konfiguru
service webapp {
  image: "nginx:latest"
  port: 80
  replicas: 2

  env {
    DB_HOST: database.internal
  }
}
```

**IR (from Month 13):**
```go
&ir.Resource{
    ID:   "webapp",
    Type: ir.Compute,
    Properties: map[string]ir.Value{
        "image":    ir.String("nginx:latest"),
        "port":     ir.Int(80),
        "replicas": ir.Int(2),
        "env": ir.Map(map[string]ir.Value{
            "DB_HOST": ir.String("database.internal"),
        }),
    },
}
```

**Terraform HCL Output:**
```hcl
# Provider configuration
provider "aws" {
  region = "us-west-2"
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "konfiguru-cluster"
}

# Task Definition
resource "aws_ecs_task_definition" "webapp" {
  family                   = "webapp"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name  = "webapp"
      image = "nginx:latest"
      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "DB_HOST"
          value = "database.internal"
        }
      ]
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "webapp" {
  name            = "webapp"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.webapp.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.main.id]
    security_groups  = [aws_security_group.webapp.id]
    assign_public_ip = true
  }
}

# Security Group
resource "aws_security_group" "webapp" {
  name        = "webapp-sg"
  description = "Security group for webapp"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

---

## Weekly Breakdown

### Week 1: Terraform HCL Study (Days 1-7)

**Goal:** Master Terraform HCL syntax and understand provider architecture.

**Learning:**
- HashiCorp Learn: Terraform Fundamentals
- HCL syntax and structure
- Provider configuration
- Resource blocks and attributes

**Building:**
- Terraform backend package structure
- HCL writer utilities
- Provider registry

**Deliverables:**
- `pkg/backends/terraform/` package initialized
- HCL writer implementation
- Basic Terraform examples
- Design document for IR → Terraform mapping

**Daily Breakdown:**
- **Day 1:** Install Terraform, complete "Get Started" tutorials
- **Day 2:** Study HCL syntax, write manual Terraform configs
- **Day 3:** Study Terraform provider architecture
- **Day 4:** Design IR → Terraform mapping strategy
- **Day 5:** Implement HCL writer utilities
- **Day 6:** Write tests for HCL generation
- **Day 7:** Week review, validate HCL output with `terraform validate`

---

### Week 2: Terraform Provider Implementation (Days 8-14)

**Goal:** Implement AWS provider integration and basic resource mapping.

**Learning:**
- AWS provider documentation
- ECS vs EC2 decision logic
- VPC and networking basics
- IAM roles and policies

**Building:**
- AWS provider configuration
- Provider selection logic
- Basic resource mappers

**Deliverables:**
- AWS provider integration
- Provider configuration generation
- Resource type detection
- 20+ unit tests

**Daily Breakdown:**
- **Day 8:** AWS provider study and configuration
- **Day 9:** Implement provider selection logic
- **Day 10:** Detect resource type from IR
- **Day 11:** Basic AWS resource templates
- **Day 12:** Provider credentials handling
- **Day 13:** Region and availability zone selection
- **Day 14:** Week review, integration testing

---

### Week 3: Terraform Resource Generation (Days 15-21)

**Goal:** Implement complete resource generators for all IR types.

**Learning:**
- ECS Fargate architecture
- S3 bucket policies
- VPC/subnet design
- RDS configuration

**Building:**
- Compute → ECS/EC2 generator
- Storage → S3/EBS generator
- Network → VPC/Subnet generator
- Database → RDS generator

**Deliverables:**
- Complete resource generators for 4 IR types
- Attribute mapping logic
- Dependency resolution
- 40+ tests

**Daily Breakdown:**
- **Day 15:** Compute → AWS ECS Service
- **Day 16:** Compute → AWS EC2 Instance (alternative)
- **Day 17:** Storage → AWS S3 Bucket
- **Day 18:** Network → AWS VPC + Subnets
- **Day 19:** Database → AWS RDS Instance
- **Day 20:** Security groups and IAM roles
- **Day 21:** Week review, end-to-end testing

---

### Week 4: Terraform Backend Testing (Days 22-30)

**Goal:** Comprehensive testing and validation of generated Terraform code.

**Learning:**
- `terraform validate` command
- `terraform plan` output analysis
- Terraform testing best practices
- CI/CD for Terraform

**Building:**
- Terraform validation integration
- Test suite expansion
- Example programs
- Documentation

**Deliverables:**
- Terraform validation tests
- 60+ comprehensive tests
- Example Konfiguru → Terraform programs
- Month 14 complete documentation

**Daily Breakdown:**
- **Day 22:** Implement `terraform validate` integration
- **Day 23:** `terraform plan` output testing
- **Day 24:** Multi-resource dependency testing
- **Day 25:** Provider switching tests (AWS regions)
- **Day 26:** Error handling and validation
- **Day 27:** Performance benchmarking
- **Day 28:** Documentation and examples
- **Day 29:** End-to-end integration tests
- **Day 30:** Month review, v0.7.0-alpha tag

---

## Deliverables

### Code Deliverables

**1. Terraform Backend Package**
```
pkg/backends/terraform/
├── backend.go         // Backend interface implementation
├── provider.go        // Provider selection and config
├── mapper.go          // IR → Terraform resource mapping
├── hcl_writer.go      // HCL generation utilities
├── resources/
│   ├── compute.go     // ECS/EC2 generation
│   ├── storage.go     // S3/EBS generation
│   ├── network.go     // VPC/Subnet generation
│   └── database.go    // RDS generation
├── validation.go      // Terraform validate integration
└── terraform_test.go  // Comprehensive tests
```

**2. Generated Terraform Structure**
```
output/
├── main.tf            // Primary resources
├── variables.tf       // Input variables
├── outputs.tf         // Output values
└── provider.tf        // Provider configuration
```

**3. CLI Integration**
```go
// cmd/konfiguru/compile.go
konfiguru compile --target=terraform app.kfg

// Generates Terraform files in ./terraform/
```

### Documentation Deliverables

**Terraform Backend Guide:**
- IR → Terraform mapping rules
- Supported resource types
- Provider configuration
- Usage examples

**Code Examples:**
```konfiguru
// examples/terraform/simple-web/app.kfg
service webapp {
  image: "nginx:latest"
  port: 80
  replicas: 2
}
```

Compiles to complete Terraform configuration.

---

## Success Criteria

### Technical Milestones

**Week 1 Complete:**
- [ ] Terraform installed and working
- [ ] HCL syntax understood
- [ ] HCL writer implemented
- [ ] Can generate valid HCL programmatically

**Week 2 Complete:**
- [ ] AWS provider integration working
- [ ] Provider selection logic implemented
- [ ] Basic resource mapping complete
- [ ] 20+ tests passing

**Week 3 Complete:**
- [ ] All 4 IR types generate Terraform resources
- [ ] Compute → ECS/EC2 working
- [ ] Storage, Network, Database working
- [ ] 40+ tests passing

**Month 14 Complete:**
- [ ] Terraform backend foundation complete (~1200 lines)
- [ ] Can compile Konfiguru DSL → Terraform HCL
- [ ] `terraform validate` passes on generated code
- [ ] 80+ comprehensive tests passing
- [ ] Documentation complete
- [ ] Ready for Month 15 (advanced Terraform features)

### Code Metrics

- **Terraform Backend:** ~1200 lines production code
- **Tests:** ~800 lines test code
- **Test Coverage:** >85%
- **Documentation:** ~40 pages

### Validation Criteria

**Generated Terraform Must:**
1. Pass `terraform validate` (no syntax errors)
2. Pass `terraform plan` (valid resource configuration)
3. Include proper provider configuration
4. Handle dependencies correctly (depends_on)
5. Generate idiomatic Terraform code

---

## Resources

### Essential Reading

**Terraform:**
- [HashiCorp Learn - Terraform Fundamentals](https://learn.hashicorp.com/terraform)
- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [HCL Syntax Specification](https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md)

**AWS Services:**
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS VPC Documentation](https://docs.aws.amazon.com/vpc/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)

**Go + Terraform:**
- [terraform-json](https://pkg.go.dev/github.com/hashicorp/terraform-json) - Terraform JSON format
- [hcl/v2](https://pkg.go.dev/github.com/hashicorp/hcl/v2) - HCL parser/writer

### Terraform Tutorials

**HashiCorp Learn (Complete These):**
1. Get Started - AWS
2. Configuration Language
3. Modules
4. State Management (preview for Month 15)

### Tools

- **Terraform CLI:** Install latest version (1.5+)
- **AWS CLI:** For credential configuration
- **terraform-docs:** Generate documentation from Terraform
- **tflint:** Terraform linter

---

## Risk Mitigation

### Risk 1: Terraform Complexity
**Mitigation:** Start with simplest resources (S3 bucket). Add complexity incrementally. Month 14 is foundation only.

### Risk 2: AWS Provider Size
**Mitigation:** Support only 5 core resource types in Month 14. Add more in Month 15.

### Risk 3: HCL Generation Bugs
**Mitigation:** Use `terraform validate` and `terraform plan` in tests. Catch errors early.

### Risk 4: Provider Credentials
**Mitigation:** Don't generate credentials in code. Document manual AWS CLI configuration.

---

## Month 14 Timeline

| Week | Focus | Lines of Code | Tests |
|------|-------|---------------|-------|
| 1 | HCL Study & Writer | ~300 | 15 |
| 2 | Provider Integration | ~400 | 20 |
| 3 | Resource Generation | ~500 | 40 |
| 4 | Testing & Validation | ~300 | 25 |
| **Total** | | **~1500 lines** | **100+ tests** |

**Time Commitment:** 13.5 hours/week × 4 weeks = 54 hours

---

## Next Steps (Month 15 Preview)

With Terraform backend foundation complete, Month 15 focuses on **advanced Terraform features:**
- Terraform modules
- Variable and output management
- State management and remote backends
- Multi-provider support (GCP, Azure)

**Preparation for Month 15:**
- Read Terraform modules documentation
- Understand remote state concepts
- Review GCP and Azure provider docs

---

**Document Status:** Complete
**Last Updated:** 2025-11-15
**Next Review:** End of Month 14

---

*This is Month 14 of your 24-month journey to Platform Architect expertise.*
