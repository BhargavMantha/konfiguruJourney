# Month 13: Intermediate Representation (IR) Design

**Created:** 2025-11-15
**Phase:** Multi-Target Backend Development (Months 13-18)
**Timeline:** Month 13 of 24
**Prerequisites:** Konfiguru v0.5.0 (K8s backend complete)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Learning Objectives](#learning-objectives)
3. [Why Intermediate Representation](#why-intermediate-representation)
4. [Technical Architecture](#technical-architecture)
5. [Weekly Breakdown](#weekly-breakdown)
6. [Deliverables](#deliverables)
7. [Success Criteria](#success-criteria)
8. [Resources](#resources)

---

## Executive Summary

**Goal:** Design and implement a target-agnostic Intermediate Representation (IR) that decouples Konfiguru's frontend (lexer, parser, type checker) from its backends (K8s, Terraform, CloudFormation).

**Why This Matters:**
Currently, Konfiguru directly generates Kubernetes YAML from the AST. To support multiple targets (Terraform, CloudFormation), you need an IR layer that represents infrastructure intent without platform-specific details.

**Key Outcomes:**
- IR specification and design document
- AST → IR transformation layer
- IR optimization passes
- Refactored K8s backend to consume IR
- Foundation for Terraform/CloudFormation backends

**Architecture Shift:**
```
Before (v0.5):
AST → K8s Backend → YAML

After (v0.6+):
AST → IR → Multi-Backend Architecture
           ├→ K8s Backend → YAML
           ├→ Terraform Backend → HCL (Month 14-15)
           └→ CloudFormation Backend → JSON (Month 16)
```

---

## Learning Objectives

### Compiler Theory
- **IR Design Principles:** Platform-agnostic representation, optimization opportunities
- **LLVM IR Study:** Learn from production compiler IR design
- **Go SSA:** Study Go's own Static Single Assignment form
- **Optimization Passes:** Dead code elimination, constant folding, dependency ordering

### Distributed Systems (DDIA Chapters 1-4)
- **Data Models:** How different systems represent infrastructure (K8s vs Terraform vs CFN)
- **Encoding:** Serialization formats (YAML, JSON, HCL)
- **Replication & Partitioning:** Multi-region infrastructure patterns
- **Storage:** State management across targets (K8s etcd vs Terraform state)

### Go Advanced Patterns
- **Visitor Pattern:** Traverse IR for transformations
- **Builder Pattern:** Construct IR nodes
- **Strategy Pattern:** Pluggable backend selection
- **Interface Design:** Clean abstractions for multi-backend support

---

## Why Intermediate Representation

### Problem: Direct AST-to-K8s Generation Doesn't Scale

**Current Limitation (v0.5):**
```go
// AST node directly knows about K8s
func (s *ServiceDeclaration) ToK8s() *appsv1.Deployment {
    // Tight coupling to Kubernetes
}
```

**Issues:**
1. **Duplication:** Each backend would duplicate AST traversal logic
2. **No Optimization:** Can't optimize across backends
3. **Tight Coupling:** AST changes break all backends
4. **Testing:** Hard to test backend-agnostic logic

### Solution: Intermediate Representation Layer

**With IR (v0.6+):**
```go
// AST → IR (platform-agnostic)
func (s *ServiceDeclaration) ToIR() *ir.Resource {
    return &ir.Resource{
        Type: ir.Compute,
        Properties: map[string]ir.Value{
            "image": ir.String(s.Image),
            "replicas": ir.Int(s.Replicas),
        },
    }
}

// IR → Multiple Backends
func (r *ir.Resource) ToK8s() *appsv1.Deployment { }
func (r *ir.Resource) ToTerraform() *hcl.Block { }
func (r *ir.Resource) ToCloudFormation() map[string]interface{} { }
```

**Benefits:**
1. **Decoupling:** AST doesn't know about backends
2. **Optimization:** IR passes can optimize before codegen
3. **Testing:** Test IR independently of backends
4. **Extensibility:** Add new backends easily

---

## Technical Architecture

### IR Design Philosophy

**Principles:**
1. **Target-Agnostic:** No K8s/Terraform/CFN-specific concepts
2. **Infrastructure Intent:** Represent WHAT, not HOW
3. **Optimization-Friendly:** Enable transformations (dead code, constant folding)
4. **Strongly Typed:** Type-safe IR nodes
5. **Traversable:** Support visitor pattern for transformations

### Core IR Concepts

#### 1. Resource Types (Universal Infrastructure Primitives)

```go
// pkg/ir/resource.go
package ir

type ResourceType int

const (
    // Compute resources
    Compute ResourceType = iota  // Service, container, VM

    // Storage resources
    Storage                      // Persistent volume, S3 bucket, disk

    // Network resources
    Network                      // VPC, subnet, load balancer
    NetworkEndpoint             // Service endpoint, ingress

    // Database resources
    Database                    // RDS, Cloud SQL, StatefulSet
    Cache                       // Redis, Memcached

    // Configuration resources
    ConfigMap                   // Environment variables, config files
    Secret                      // Credentials, certificates

    // Observability resources
    Monitor                     // Metrics, alerts
    LogSink                     // Log aggregation
)
```

#### 2. IR Node Structure

```go
// pkg/ir/ir.go
package ir

type Resource struct {
    ID           string              // Unique identifier
    Type         ResourceType        // Resource category
    Name         string              // Resource name
    Properties   map[string]Value    // Key-value properties
    Dependencies []string            // IDs of dependent resources
    Metadata     Metadata            // Additional metadata
}

type Value interface {
    Type() ValueType
    String() string
}

type ValueType int

const (
    StringValue ValueType = iota
    IntValue
    BoolValue
    FloatValue
    ListValue
    MapValue
    ReferenceValue  // Reference to another resource
)

type Metadata struct {
    Labels      map[string]string
    Annotations map[string]string
    Namespace   string           // Logical grouping
    Region      string           // Geographic region
    CloudProvider string         // aws, gcp, azure, k8s
}
```

#### 3. IR Value Types

```go
// pkg/ir/value.go
package ir

type StringVal struct {
    Val string
}

func (s StringVal) Type() ValueType { return StringValue }
func (s StringVal) String() string  { return s.Val }

type IntVal struct {
    Val int64
}

func (i IntVal) Type() ValueType { return IntValue }
func (i IntVal) String() string  { return fmt.Sprintf("%d", i.Val) }

type ReferenceVal struct {
    ResourceID string
    Property   string  // Optional: reference specific property
}

func (r ReferenceVal) Type() ValueType { return ReferenceValue }
func (r ReferenceVal) String() string  { return fmt.Sprintf("ref:%s.%s", r.ResourceID, r.Property) }

// Helper constructors
func String(s string) Value { return StringVal{Val: s} }
func Int(i int64) Value     { return IntVal{Val: i} }
func Ref(id string) Value   { return ReferenceVal{ResourceID: id} }
```

#### 4. IR Graph

```go
// pkg/ir/graph.go
package ir

type Graph struct {
    Resources map[string]*Resource  // ID → Resource
    Edges     map[string][]string   // ID → Dependencies
}

func NewGraph() *Graph {
    return &Graph{
        Resources: make(map[string]*Resource),
        Edges:     make(map[string][]string),
    }
}

func (g *Graph) AddResource(r *Resource) {
    g.Resources[r.ID] = r
    g.Edges[r.ID] = r.Dependencies
}

// Topological sort for dependency ordering
func (g *Graph) TopologicalSort() ([]*Resource, error) {
    // Kahn's algorithm implementation
}

// Detect circular dependencies
func (g *Graph) HasCycle() bool {
    // DFS-based cycle detection
}
```

### AST → IR Transformation

#### Transformation Pipeline

```
Konfiguru DSL
     ↓
  [Lexer]
     ↓
  [Parser]
     ↓
   AST
     ↓
[Type Checker]
     ↓
[Semantic Analyzer]
     ↓
[AST → IR Transform]  ← NEW (Month 13)
     ↓
     IR
     ↓
[IR Optimizer]        ← NEW (Month 13)
     ↓
  Optimized IR
     ↓
[Backend Selector]
     ↓
  ┌─────┴─────┐
  ↓           ↓
K8s Backend  Terraform Backend
```

#### Example Transformation

**Konfiguru DSL Input:**
```konfiguru
service webapp {
  image: "nginx:1.21"
  port: 80
  replicas: 3

  env {
    DB_HOST: database.internal
    DB_PORT: "5432"
  }

  depends_on: [database]
}

database postgres {
  version: "15"
  storage: 20GB
}
```

**AST Representation:**
```go
&ast.ServiceDeclaration{
    Name: "webapp",
    Image: "nginx:1.21",
    Port: 80,
    Replicas: 3,
    Env: map[string]string{
        "DB_HOST": "database.internal",
        "DB_PORT": "5432",
    },
    DependsOn: []string{"database"},
}

&ast.DatabaseDeclaration{
    Name: "postgres",
    Version: "15",
    Storage: "20GB",
}
```

**IR Representation:**
```go
&ir.Resource{
    ID:   "webapp",
    Type: ir.Compute,
    Name: "webapp",
    Properties: map[string]ir.Value{
        "image":    ir.String("nginx:1.21"),
        "port":     ir.Int(80),
        "replicas": ir.Int(3),
        "env": ir.Map(map[string]ir.Value{
            "DB_HOST": ir.String("database.internal"),
            "DB_PORT": ir.String("5432"),
        }),
    },
    Dependencies: []string{"postgres"},
    Metadata: ir.Metadata{
        CloudProvider: "k8s",  // Inferred from compilation target
    },
}

&ir.Resource{
    ID:   "postgres",
    Type: ir.Database,
    Name: "postgres",
    Properties: map[string]ir.Value{
        "engine":  ir.String("postgresql"),
        "version": ir.String("15"),
        "storage": ir.Int(20),  // Normalized to GB
    },
    Dependencies: []string{},
    Metadata: ir.Metadata{
        CloudProvider: "k8s",
    },
}
```

**Backend-Specific Codegen:**

**Kubernetes Backend:**
```yaml
# webapp → Deployment + Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: webapp
        image: nginx:1.21
        env:
        - name: DB_HOST
          value: database.internal
```

**Terraform Backend (Future):**
```hcl
# webapp → AWS ECS Service
resource "aws_ecs_service" "webapp" {
  name            = "webapp"
  desired_count   = 3
  task_definition = aws_ecs_task_definition.webapp.arn
}
```

### IR Optimization Passes

#### Pass 1: Dead Code Elimination

```go
// pkg/ir/optimize/deadcode.go
package optimize

func EliminateDeadCode(g *ir.Graph) *ir.Graph {
    // Remove resources not referenced by any dependency chain
    // Starting from "root" resources (those with no dependents)
}
```

**Example:**
```konfiguru
service webapp { depends_on: [database] }
database postgres { }
cache redis { }  // DEAD CODE - not referenced
```

After optimization, `cache redis` is removed from IR.

#### Pass 2: Constant Folding

```go
// pkg/ir/optimize/constants.go
package optimize

func FoldConstants(g *ir.Graph) *ir.Graph {
    // Resolve compile-time constants
    // Example: replicas: 2 + 1 → replicas: 3
}
```

#### Pass 3: Dependency Ordering

```go
// pkg/ir/optimize/order.go
package optimize

func OptimizeDependencyOrder(g *ir.Graph) ([]*ir.Resource, error) {
    // Topological sort with parallelization hints
    // Group independent resources for parallel deployment
}
```

**Example:**
```
Resources: [A, B, C, D]
Dependencies:
  A → B
  A → C
  B → D
  C → D

Optimized Order:
  Layer 1: [A]          // Deploy first
  Layer 2: [B, C]       // Deploy in parallel
  Layer 3: [D]          // Deploy after B and C
```

---

## Weekly Breakdown

### Week 1: IR Research & Design (Days 1-7)

**Goal:** Understand IR design principles and draft Konfiguru IR specification.

**Learning:**
- LLVM IR architecture
- Go SSA form study
- DDIA Chapter 1-2 (Data models, encoding)

**Building:**
- IR design document
- Prototype IR node types
- IR value system design

**Deliverables:**
- `docs/architecture/ir-design.md` - Complete IR specification
- `pkg/ir/types.go` - IR type definitions (not implemented)
- Research notes on LLVM, Go SSA

**Daily Breakdown:**
- **Day 1:** IR research (LLVM, SSA)
- **Day 2:** Survey existing IRs (LLVM, MLIR, Go SSA)
- **Day 3:** Design IR node structure
- **Day 4:** Design IR value types
- **Day 5:** Design IR graph representation
- **Day 6:** Draft IR specification document
- **Day 7:** Week review, finalize IR design

---

### Week 2: IR Implementation (Days 8-14)

**Goal:** Implement core IR data structures and graph representation.

**Learning:**
- Graph algorithms (topological sort, cycle detection)
- Visitor pattern in Go
- DDIA Chapter 3 (Storage and retrieval)

**Building:**
- `pkg/ir/resource.go` - Resource types
- `pkg/ir/value.go` - Value types
- `pkg/ir/graph.go` - Graph structure
- Comprehensive tests

**Deliverables:**
- Complete IR package with tests
- Topological sort implementation
- Cycle detection algorithm
- 50+ unit tests

**Daily Breakdown:**
- **Day 8:** Implement Resource struct
- **Day 9:** Implement Value types (String, Int, Bool, etc.)
- **Day 10:** Implement ReferenceValue for cross-resource refs
- **Day 11:** Implement IR Graph structure
- **Day 12:** Implement topological sort (Kahn's algorithm)
- **Day 13:** Implement cycle detection (DFS-based)
- **Day 14:** Week review, comprehensive testing

---

### Week 3: AST → IR Transformation (Days 15-21)

**Goal:** Build transformation layer from AST to IR.

**Learning:**
- Visitor pattern for AST traversal
- Type-safe transformations
- DDIA Chapter 4 (Encoding and evolution)

**Building:**
- `pkg/ir/transform/` - Transformation package
- AST → IR converters for each AST node type
- Property normalization (e.g., "20GB" → 20)

**Deliverables:**
- Complete AST → IR transformer
- Integration tests with real Konfiguru DSL
- Property normalization logic
- 30+ transformation tests

**Daily Breakdown:**
- **Day 15:** Transform framework design
- **Day 16:** ServiceDeclaration → IR.Compute
- **Day 17:** DatabaseDeclaration → IR.Database
- **Day 18:** StorageDeclaration → IR.Storage
- **Day 19:** NetworkDeclaration → IR.Network
- **Day 20:** Property normalization (units, types)
- **Day 21:** Week review, integration testing

---

### Week 4: IR Optimization & K8s Refactor (Days 22-30)

**Goal:** Implement IR optimization passes and refactor K8s backend to consume IR.

**Learning:**
- Compiler optimizations
- Refactoring patterns
- DDIA Chapter 1-4 review

**Building:**
- `pkg/ir/optimize/` - Optimization passes
- Refactor `pkg/backends/kubernetes/` to use IR
- IR → K8s mapping layer

**Deliverables:**
- Dead code elimination pass
- Constant folding pass
- Dependency ordering optimizer
- Refactored K8s backend (IR-based)
- All existing K8s tests passing

**Daily Breakdown:**
- **Day 22:** Dead code elimination pass
- **Day 23:** Constant folding pass
- **Day 24:** Dependency ordering optimizer
- **Day 25:** Refactor K8s backend structure
- **Day 26:** Implement IR → K8s Deployment mapping
- **Day 27:** Implement IR → K8s Service mapping
- **Day 28:** Implement IR → K8s StatefulSet mapping
- **Day 29:** Integration testing (end-to-end)
- **Day 30:** Month review, v0.6.0-alpha tag

---

## Deliverables

### Code Deliverables

**1. IR Package (`pkg/ir/`)**
```
pkg/ir/
├── ir.go              // Core IR types
├── resource.go        // Resource struct
├── value.go           // Value types
├── graph.go           // Graph structure
├── metadata.go        // Metadata types
├── transform/
│   ├── transform.go   // AST → IR transformer
│   └── normalize.go   // Property normalization
├── optimize/
│   ├── deadcode.go    // Dead code elimination
│   ├── constants.go   // Constant folding
│   └── order.go       // Dependency ordering
└── ir_test.go         // Comprehensive tests
```

**2. Refactored K8s Backend**
```
pkg/backends/kubernetes/
├── backend.go         // IR → K8s interface
├── deployment.go      // IR.Compute → Deployment
├── service.go         // IR.NetworkEndpoint → Service
├── statefulset.go     // IR.Database → StatefulSet
└── mapper.go          // IR → K8s resource mapping
```

**3. Documentation**
```
docs/architecture/
├── ir-design.md       // Complete IR specification
├── ir-transformations.md  // AST → IR rules
└── ir-optimizations.md    // Optimization passes
```

### Documentation Deliverables

**IR Design Document (`docs/architecture/ir-design.md`):**
- IR philosophy and principles
- Resource type taxonomy
- Value type system
- Graph representation
- Optimization pass specifications
- Backend integration guide

**Transformation Guide (`docs/architecture/ir-transformations.md`):**
- AST → IR mapping rules
- Property normalization rules
- Type inference rules
- Dependency resolution

---

## Success Criteria

### Technical Milestones

**Week 1 Complete:**
- [ ] IR design document finished (30+ pages)
- [ ] IR node types designed
- [ ] Value system designed
- [ ] Graph structure designed

**Week 2 Complete:**
- [ ] IR package implemented (~500 lines)
- [ ] Topological sort working
- [ ] Cycle detection working
- [ ] 50+ IR tests passing

**Week 3 Complete:**
- [ ] AST → IR transformer complete
- [ ] All Konfiguru DSL constructs transform to IR
- [ ] Property normalization working
- [ ] 30+ transformation tests passing

**Month 13 Complete:**
- [ ] IR package production-ready
- [ ] 3 optimization passes implemented
- [ ] K8s backend refactored to use IR
- [ ] All existing K8s tests passing (regression-free)
- [ ] v0.6.0-alpha tagged
- [ ] Foundation for Terraform backend (Month 14)

### Code Metrics

- **IR Package:** ~800 lines production code
- **Transformation:** ~400 lines
- **Optimization:** ~300 lines
- **Tests:** ~1000 lines test code
- **Documentation:** ~100 pages (IR design, architecture)

### Knowledge Checkpoints

**Can you answer YES?**
- [ ] I understand what an IR is and why compilers use it
- [ ] I can explain Konfiguru's IR design decisions
- [ ] I know how to implement topological sort
- [ ] I understand cycle detection algorithms
- [ ] I can design platform-agnostic abstractions
- [ ] I've read DDIA Chapters 1-4

---

## Resources

### Essential Reading

**Compiler Design:**
- [LLVM IR Language Reference](https://llvm.org/docs/LangRef.html)
- [Go SSA Package](https://pkg.go.dev/golang.org/x/tools/go/ssa)
- [Crafting Interpreters - Ch 13](https://craftinginterpreters.com/classes.html) - Review

**Distributed Systems:**
- **"Designing Data-Intensive Applications" (DDIA) - Chapters 1-4:**
  - Chapter 1: Reliable, Scalable, Maintainable Applications
  - Chapter 2: Data Models and Query Languages
  - Chapter 3: Storage and Retrieval
  - Chapter 4: Encoding and Evolution

**Graph Algorithms:**
- [Topological Sort](https://en.wikipedia.org/wiki/Topological_sorting)
- [Kahn's Algorithm](https://www.geeksforgeeks.org/topological-sorting-indegree-based-solution/)
- [Cycle Detection](https://www.geeksforgeeks.org/detect-cycle-in-a-graph/)

### Reference Implementations

**Study These IRs:**
1. **LLVM IR:** https://llvm.org/docs/LangRef.html
   - Platform-agnostic representation
   - SSA form
   - Optimization passes

2. **Go SSA:** https://pkg.go.dev/golang.org/x/tools/go/ssa
   - Go's internal IR
   - Type-safe transformations

3. **Terraform Provider Schema:** https://www.terraform.io/docs/extend/schemas/index.html
   - Resource abstraction patterns

### Tools

- **Graphviz:** Visualize IR dependency graphs
- **go-callvis:** Visualize Go package dependencies
- **pprof:** Profile IR transformation performance

---

## Risk Mitigation

### Risk 1: IR Too Complex
**Mitigation:** Start simple, iterate. First IR should handle basic resources only. Add complexity in Month 14-15.

### Risk 2: K8s Refactor Breaks Tests
**Mitigation:** TDD approach. Keep old K8s backend working, run tests continuously. Refactor incrementally.

### Risk 3: Scope Creep
**Mitigation:** IR v1 doesn't need to be perfect. Focus on 5 core resource types (Compute, Storage, Network, Database, Config). Extend later.

### Risk 4: Performance Issues
**Mitigation:** Benchmark early (Day 22). IR transformations should be <100ms for typical programs.

---

## Month 13 Timeline

| Week | Focus | Lines of Code | Tests |
|------|-------|---------------|-------|
| 1 | Research & Design | 0 (design docs) | 0 |
| 2 | IR Implementation | ~500 | 50+ |
| 3 | AST → IR Transform | ~400 | 30+ |
| 4 | Optimization & Refactor | ~700 | 40+ |
| **Total** | | **~1600 lines** | **120+ tests** |

**Time Commitment:** 13.5 hours/week × 4 weeks = 54 hours

---

## Next Steps (Month 14 Preview)

With IR foundation complete, Month 14 focuses on **Terraform Backend Foundation:**
- Study Terraform HCL syntax
- IR → Terraform resource mapping
- Basic Terraform provider selection (AWS, GCP)
- Generate simple Terraform configurations

**Preparation for Month 14:**
- Install Terraform
- Complete HashiCorp Learn tutorials (intro level)
- Read Terraform Registry documentation
- Review AWS provider docs

---

**Document Status:** Complete
**Last Updated:** 2025-11-15
**Next Review:** End of Month 13

---

*This is Month 13 of your 24-month journey to Platform Architect expertise.*
