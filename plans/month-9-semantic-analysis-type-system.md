# Month 9: Semantic Analysis & Type System - Implementation Plan

**Created:** 2025-11-15
**Phase:** Core Konfiguru Development (Months 7-12)
**Timeline:** Month 9 of 36
**Weekly Commitment:** 13.5 hours
**Main Deliverable:** Type Checker + Symbol Table + Semantic Validator

---

## Overview

Month 9 adds **semantic understanding** to Konfiguru. You'll build the type system, symbol table, and semantic analyzer that validate programs beyond syntax. This ensures Konfiguru catches errors at compile time, not deployment time.

**In parallel:** AWS Solutions Architect Associate (SAA) exam preparation begins.

---

## Learning Objectives

By the end of Month 9, you will:

- ✅ Implement scoped symbol table for variable resolution
- ✅ Build comprehensive type system (primitives, resources, collections)
- ✅ Create semantic analyzer with validation rules
- ✅ Detect undefined variables and type errors
- ✅ Build dependency graph from resource references
- ✅ Detect circular dependencies
- ✅ Begin AWS SAA preparation (EC2, VPC, S3, IAM)
- ✅ Pass AWS SAA Certification exam

---

## Weekly Breakdown

### Week 1: Symbol Table (Days 1-7)
**Deliverable:** Complete symbol table implementation

- Design symbol table architecture
- Implement scoped symbol storage
- Variable resolution across scopes
- Resource name resolution
- Dotted identifier resolution (service.port)
- 20+ symbol table tests

**Code Output:** ~300 lines

---

### Week 2: Type System (Days 8-14)
**Deliverable:** Comprehensive type system

- Define type system architecture
- Primitive types (int, string, bool, float)
- Size types (GB, Mi, m)
- Collection types (list, map)
- Resource types (service, database, storage, etc.)
- Type inference engine
- Type compatibility checking
- 30+ type system tests

**Code Output:** ~400 lines

---

### Week 3: Semantic Validation (Days 15-21)
**Deliverable:** Full semantic analyzer

- Semantic analyzer structure
- Undefined variable detection
- Undefined resource detection
- Type mismatch detection
- Dependency graph construction
- Circular dependency detection
- Resource attribute validation
- 30+ semantic tests

**Code Output:** ~400 lines

---

### Week 4: Testing & AWS SAA Prep (Days 22-30)
**Deliverable:** Production-ready semantic analysis + AWS SAA certification

- Comprehensive semantic tests
- Error message quality
- AWS SAA: EC2, VPC, S3
- AWS SAA: RDS, Lambda, IAM
- Semantic analyzer optimization
- Integration testing
- AWS SAA: Practice exams
- **AWS SAA EXAM**

**Code Output:** ~200 lines (tests)

**Month 9 Total:** ~1,300 lines + AWS SAA Certification

---

## Detailed Implementation

### Symbol Table Architecture

```go
// pkg/semantic/symboltable.go
package semantic

import "konfiguru/pkg/ast"

type Symbol struct {
    Name     string
    Type     Type
    Kind     SymbolKind  // Variable, Resource, Type
    Node     ast.Node    // AST node where defined
}

type SymbolKind int

const (
    VariableSymbol SymbolKind = iota
    ResourceSymbol
    TypeSymbol
)

type SymbolTable struct {
    scopes  []map[string]*Symbol
    current int  // Current scope depth
}

func NewSymbolTable() *SymbolTable {
    return &SymbolTable{
        scopes:  []map[string]*Symbol{make(map[string]*Symbol)},
        current: 0,
    }
}

func (st *SymbolTable) BeginScope() {
    st.scopes = append(st.scopes, make(map[string]*Symbol))
    st.current++
}

func (st *SymbolTable) EndScope() {
    st.scopes = st.scopes[:len(st.scopes)-1]
    st.current--
}

func (st *SymbolTable) Define(name string, symbol *Symbol) error {
    scope := st.scopes[st.current]
    if _, exists := scope[name]; exists {
        return fmt.Errorf("symbol %q already defined in this scope", name)
    }
    scope[name] = symbol
    return nil
}

func (st *SymbolTable) Resolve(name string) (*Symbol, error) {
    // Search from current scope outward
    for i := st.current; i >= 0; i-- {
        if symbol, exists := st.scopes[i][name]; exists {
            return symbol, nil
        }
    }
    return nil, fmt.Errorf("undefined symbol: %q", name)
}
```

---

### Type System

```go
// pkg/semantic/types.go
package semantic

type Type interface {
    String() string
    Equals(other Type) bool
    Compatible(other Type) bool  // Can be assigned
}

// Primitive types
type IntType struct{}
type FloatType struct{}
type StringType struct{}
type BoolType struct{}

// Size type (100GB, 512Mi, 200m)
type SizeType struct {
    Unit string  // GB, Mi, m, etc.
}

// Collection types
type ListType struct {
    ElementType Type
}

type MapType struct {
    KeyType   Type
    ValueType Type
}

// Resource types
type ResourceType struct {
    Kind string  // "service", "database", etc.
}

// Type inference
func InferType(node ast.Expr, symbols *SymbolTable) (Type, error) {
    switch n := node.(type) {
    case *ast.IntLiteral:
        return &IntType{}, nil
    case *ast.FloatLiteral:
        return &FloatType{}, nil
    case *ast.StringLiteral:
        return &StringType{}, nil
    case *ast.BoolLiteral:
        return &BoolType{}, nil
    case *ast.SizeLiteral:
        return &SizeType{Unit: n.Unit}, nil
    case *ast.Identifier:
        symbol, err := symbols.Resolve(n.Name)
        if err != nil {
            return nil, err
        }
        return symbol.Type, nil
    case *ast.ListLiteral:
        if len(n.Elements) == 0 {
            return &ListType{ElementType: &IntType{}}, nil  // Default
        }
        elemType, err := InferType(n.Elements[0], symbols)
        if err != nil {
            return nil, err
        }
        return &ListType{ElementType: elemType}, nil
    // ... more cases
    default:
        return nil, fmt.Errorf("cannot infer type for %T", node)
    }
}
```

---

### Semantic Analyzer

```go
// pkg/semantic/analyzer.go
package semantic

import "konfiguru/pkg/ast"

type Analyzer struct {
    symbols      *SymbolTable
    dependencies *DependencyGraph
    errors       []error
}

func NewAnalyzer() *Analyzer {
    return &Analyzer{
        symbols:      NewSymbolTable(),
        dependencies: NewDependencyGraph(),
        errors:       []error{},
    }
}

func (a *Analyzer) Analyze(program *ast.Program) error {
    // Pass 1: Collect all declarations
    for _, decl := range program.Declarations {
        if err := a.collectDeclaration(decl); err != nil {
            a.errors = append(a.errors, err)
        }
    }

    // Pass 2: Resolve references and check types
    for _, decl := range program.Declarations {
        if err := a.checkDeclaration(decl); err != nil {
            a.errors = append(a.errors, err)
        }
    }

    // Pass 3: Build dependency graph and check cycles
    if err := a.buildDependencyGraph(program); err != nil {
        a.errors = append(a.errors, err)
    }

    if len(a.errors) > 0 {
        return fmt.Errorf("semantic analysis found %d errors", len(a.errors))
    }

    return nil
}

func (a *Analyzer) collectDeclaration(decl ast.Declaration) error {
    switch d := decl.(type) {
    case *ast.VariableDecl:
        varType, err := InferType(d.Value, a.symbols)
        if err != nil {
            return err
        }
        symbol := &Symbol{
            Name: d.Name,
            Type: varType,
            Kind: VariableSymbol,
            Node: d,
        }
        return a.symbols.Define(d.Name, symbol)

    case *ast.ResourceDecl:
        resType := &ResourceType{Kind: d.Type}
        symbol := &Symbol{
            Name: d.Name,
            Type: resType,
            Kind: ResourceSymbol,
            Node: d,
        }
        return a.symbols.Define(d.Name, symbol)

    // ... more cases
    }
    return nil
}

func (a *Analyzer) checkDeclaration(decl ast.Declaration) error {
    // Check for undefined references, type errors, etc.
    // ...
    return nil
}
```

---

### Dependency Graph

```go
// pkg/semantic/dependencies.go
package semantic

type DependencyGraph struct {
    nodes map[string]*Node
    edges map[string][]string  // from -> [to, to, ...]
}

type Node struct {
    Name     string
    Resource *ast.ResourceDecl
}

func NewDependencyGraph() *DependencyGraph {
    return &DependencyGraph{
        nodes: make(map[string]*Node),
        edges: make(map[string][]string),
    }
}

func (dg *DependencyGraph) AddNode(name string, resource *ast.ResourceDecl) {
    dg.nodes[name] = &Node{Name: name, Resource: resource}
}

func (dg *DependencyGraph) AddEdge(from, to string) {
    dg.edges[from] = append(dg.edges[from], to)
}

func (dg *DependencyGraph) DetectCycles() ([][]string, error) {
    visited := make(map[string]bool)
    recStack := make(map[string]bool)
    cycles := [][]string{}

    var dfs func(node string, path []string) bool
    dfs = func(node string, path []string) bool {
        visited[node] = true
        recStack[node] = true
        path = append(path, node)

        for _, neighbor := range dg.edges[node] {
            if !visited[neighbor] {
                if dfs(neighbor, path) {
                    return true
                }
            } else if recStack[neighbor] {
                // Found cycle
                cycleStart := -1
                for i, n := range path {
                    if n == neighbor {
                        cycleStart = i
                        break
                    }
                }
                if cycleStart != -1 {
                    cycles = append(cycles, path[cycleStart:])
                }
                return true
            }
        }

        recStack[node] = false
        return false
    }

    for node := range dg.nodes {
        if !visited[node] {
            dfs(node, []string{})
        }
    }

    if len(cycles) > 0 {
        return cycles, fmt.Errorf("circular dependencies detected")
    }

    return nil, nil
}
```

---

## AWS SAA Preparation (Parallel Track)

**Week 1-2:** Foundations
- EC2: Instance types, AMIs, user data
- VPC: Subnets, routing, NAT, IGW
- S3: Buckets, versioning, lifecycle

**Week 3:** Services
- RDS: Multi-AZ, read replicas
- Lambda: Serverless basics
- IAM: Policies, roles, users

**Week 4:** Intensive Review
- CloudWatch: Monitoring, logs
- Practice exams (3-4 full exams)
- Review weak areas
- **Take AWS SAA exam**

---

## Success Criteria

By Day 30 of Month 9:

- ✅ Symbol table working with nested scopes
- ✅ Type system catches all type errors
- ✅ Semantic analyzer validates programs
- ✅ Dependency graph detects cycles
- ✅ 80+ tests passing
- ✅ **AWS SAA Certification earned**

**Validation:**
- [ ] `go test ./pkg/semantic` - all passing
- [ ] All Month 7 examples pass semantic analysis
- [ ] Intentionally broken examples are rejected with helpful errors
- [ ] AWS SAA exam passed (720/1000 minimum)

---

## Resources

### Type Systems
- "Types and Programming Languages" (TAPL) - Chapters 1-8
- "Crafting Interpreters" - Chapter 11 (Resolving and Binding)

### AWS SAA
- AWS Official Documentation
- Practice exams: Tutorials Dojo, Whizlabs
- KodeKloud AWS SAA course

---

**Next:** [Month 10: Advanced K8s Code Generation](month-10-advanced-k8s-codegen.md)
