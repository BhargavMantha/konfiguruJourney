# Month 11: Dependency Resolution & Graph Algorithms - Implementation Plan

**Created:** 2025-11-15
**Phase:** Core Konfiguru Development (Months 7-12)
**Timeline:** Month 11 of 36
**Weekly Commitment:** 13.5 hours
**Main Deliverable:** Automatic Dependency Ordering with Cycle Detection

---

## Overview

Month 11 solves a critical problem: **In what order should resources be deployed?** If service A depends on database B, we must deploy B before A. Konfiguru will automatically determine the correct order, detect circular dependencies, and even parallelize independent deployments.

**This is pure computer science:** Graph algorithms, topological sorting, cycle detection.

---

## Learning Objectives

By the end of Month 11, you will:

- ✅ Build dependency graph from resource declarations
- ✅ Implement topological sort (DFS and Kahn's algorithm)
- ✅ Detect circular dependencies with clear error messages
- ✅ Identify strongly connected components
- ✅ Generate optimal deployment order
- ✅ Implement parallel deployment groups
- ✅ Create dependency visualization (DOT format)
- ✅ Optimize for large graphs (1000+ resources)

---

## Weekly Breakdown

### Week 1: Graph Construction (Days 1-7)
**Deliverable:** Complete dependency graph builder

**Tasks:**
- Design dependency graph data structure
- Implement graph node and edge structures
- Build graph from AST `depends_on` clauses
- Add implicit dependencies (environment variable references)
- Build graph from resource references (service.url, db.host)
- Visualize graph in DOT format (Graphviz)
- Test graph construction with complex examples

**Code Output:** ~300 lines

---

### Week 2: Topological Sort (Days 8-14)
**Deliverable:** Two topological sort implementations

**Tasks:**
- Implement DFS-based topological sort
- Implement Kahn's algorithm (BFS-based)
- Compare DFS vs BFS approaches
- Handle disconnected components
- Optimize sort for large graphs
- Test with linear dependency chains
- Test with complex DAGs (directed acyclic graphs)

**Code Output:** ~250 lines

---

### Week 3: Cycle Detection (Days 15-21)
**Deliverable:** Comprehensive cycle detection

**Tasks:**
- Implement cycle detection using DFS
- Detect and report all circular dependencies
- Identify all nodes involved in cycles
- Generate helpful error messages with cycle paths
- Implement strongly connected components (Tarjan's algorithm)
- Test cycle detection with simple cycles
- Test with complex multi-node cycles

**Code Output:** ~300 lines

---

### Week 4: Apply Order Optimization (Days 22-30)
**Deliverable:** Production-ready dependency resolution

**Tasks:**
- Generate optimal deployment order from topological sort
- Implement parallel deployment groups (resources with no dependencies can deploy simultaneously)
- Generate `kubectl apply` commands in correct order
- Add `--dry-run` mode for validation
- Implement dependency visualization in CLI
- Test with microservices example (10+ services)
- Benchmark performance (1000+ resource graphs)
- Document dependency resolution algorithm
- Final integration testing

**Code Output:** ~250 lines

**Month 11 Total:** ~1,100 lines

---

## Detailed Implementation

### Dependency Graph Structure

```go
// pkg/semantic/graph.go
package semantic

import "konfiguru/pkg/ast"

type DependencyGraph struct {
    nodes    map[string]*GraphNode
    edges    map[string][]string       // from -> [to, to, ...]
    reverse  map[string][]string       // reverse edges (to -> [from, from, ...])
}

type GraphNode struct {
    Name     string
    Resource ast.ResourceDecl
    Type     string  // "service", "database", etc.
}

func NewDependencyGraph() *DependencyGraph {
    return &DependencyGraph{
        nodes:   make(map[string]*GraphNode),
        edges:   make(map[string][]string),
        reverse: make(map[string][]string),
    }
}

func (dg *DependencyGraph) AddNode(name string, resource ast.ResourceDecl) {
    dg.nodes[name] = &GraphNode{
        Name:     name,
        Resource: resource,
        Type:     resource.GetType(),
    }
}

func (dg *DependencyGraph) AddEdge(from, to string) error {
    if _, exists := dg.nodes[from]; !exists {
        return fmt.Errorf("node %q does not exist", from)
    }
    if _, exists := dg.nodes[to]; !exists {
        return fmt.Errorf("node %q does not exist", to)
    }

    dg.edges[from] = append(dg.edges[from], to)
    dg.reverse[to] = append(dg.reverse[to], from)
    return nil
}

func (dg *DependencyGraph) GetDependencies(name string) []string {
    return dg.edges[name]
}

func (dg *DependencyGraph) GetDependents(name string) []string {
    return dg.reverse[name]
}
```

---

### Building Graph from AST

```go
func BuildDependencyGraph(program *ast.Program) (*DependencyGraph, error) {
    dg := NewDependencyGraph()

    // Pass 1: Add all resources as nodes
    for _, decl := range program.Declarations {
        if resDecl, ok := decl.(ast.ResourceDecl); ok {
            dg.AddNode(resDecl.GetName(), resDecl)
        }
    }

    // Pass 2: Add edges from explicit dependencies
    for _, decl := range program.Declarations {
        if resDecl, ok := decl.(ast.ResourceDecl); ok {
            // Explicit depends_on
            for _, dep := range resDecl.GetDependsOn() {
                if err := dg.AddEdge(resDecl.GetName(), dep); err != nil {
                    return nil, err
                }
            }

            // Implicit dependencies from references
            refs := findResourceReferences(resDecl)
            for _, ref := range refs {
                if err := dg.AddEdge(resDecl.GetName(), ref); err != nil {
                    return nil, err
                }
            }
        }
    }

    return dg, nil
}

func findResourceReferences(resource ast.ResourceDecl) []string {
    // Walk the resource AST and find references like:
    // env { DB_HOST: database.host }
    // This is an implicit dependency on "database"

    refs := []string{}

    // Implement visitor pattern to find dotted identifiers
    // ...

    return refs
}
```

---

### Topological Sort (DFS)

```go
func (dg *DependencyGraph) TopologicalSortDFS() ([]string, error) {
    visited := make(map[string]bool)
    recStack := make(map[string]bool)
    result := []string{}

    var dfs func(node string) error
    dfs = func(node string) error {
        visited[node] = true
        recStack[node] = true

        for _, neighbor := range dg.edges[node] {
            if !visited[neighbor] {
                if err := dfs(neighbor); err != nil {
                    return err
                }
            } else if recStack[neighbor] {
                // Cycle detected
                return fmt.Errorf("circular dependency: %s -> %s", node, neighbor)
            }
        }

        recStack[node] = false
        result = append([]string{node}, result...)  // Prepend to result
        return nil
    }

    for node := range dg.nodes {
        if !visited[node] {
            if err := dfs(node); err != nil {
                return nil, err
            }
        }
    }

    return result, nil
}
```

---

### Topological Sort (Kahn's Algorithm - BFS)

```go
func (dg *DependencyGraph) TopologicalSortKahn() ([]string, error) {
    // Calculate in-degree for each node
    inDegree := make(map[string]int)
    for node := range dg.nodes {
        inDegree[node] = 0
    }
    for _, edges := range dg.edges {
        for _, to := range edges {
            inDegree[to]++
        }
    }

    // Queue of nodes with in-degree 0
    queue := []string{}
    for node, degree := range inDegree {
        if degree == 0 {
            queue = append(queue, node)
        }
    }

    result := []string{}

    for len(queue) > 0 {
        // Dequeue
        node := queue[0]
        queue = queue[1:]
        result = append(result, node)

        // Reduce in-degree of neighbors
        for _, neighbor := range dg.edges[node] {
            inDegree[neighbor]--
            if inDegree[neighbor] == 0 {
                queue = append(queue, neighbor)
            }
        }
    }

    // If result doesn't contain all nodes, there's a cycle
    if len(result) != len(dg.nodes) {
        return nil, fmt.Errorf("circular dependency detected")
    }

    return result, nil
}
```

---

### Cycle Detection with Path

```go
func (dg *DependencyGraph) DetectCycles() ([][]string, error) {
    visited := make(map[string]bool)
    recStack := make(map[string]bool)
    cycles := [][]string{}

    var dfs func(node string, path []string) []string
    dfs = func(node string, path []string) []string {
        visited[node] = true
        recStack[node] = true
        path = append(path, node)

        for _, neighbor := range dg.edges[node] {
            if !visited[neighbor] {
                if cycle := dfs(neighbor, path); cycle != nil {
                    return cycle
                }
            } else if recStack[neighbor] {
                // Found cycle - extract the cycle path
                cycleStart := -1
                for i, n := range path {
                    if n == neighbor {
                        cycleStart = i
                        break
                    }
                }
                if cycleStart != -1 {
                    return append(path[cycleStart:], neighbor)
                }
            }
        }

        recStack[node] = false
        return nil
    }

    for node := range dg.nodes {
        if !visited[node] {
            if cycle := dfs(node, []string{}); cycle != nil {
                cycles = append(cycles, cycle)
            }
        }
    }

    if len(cycles) > 0 {
        return cycles, fmt.Errorf("detected %d circular dependencies", len(cycles))
    }

    return nil, nil
}
```

---

### Parallel Deployment Groups

```go
func (dg *DependencyGraph) GetParallelGroups() ([][]string, error) {
    // Topological sort first
    sorted, err := dg.TopologicalSortKahn()
    if err != nil {
        return nil, err
    }

    // Group resources by deployment level
    levels := map[string]int{}

    // Level 0: Resources with no dependencies
    for _, node := range sorted {
        deps := dg.edges[node]
        if len(deps) == 0 {
            levels[node] = 0
        } else {
            // Level = max(dependency levels) + 1
            maxLevel := 0
            for _, dep := range deps {
                if levels[dep] >= maxLevel {
                    maxLevel = levels[dep] + 1
                }
            }
            levels[node] = maxLevel
        }
    }

    // Group by level
    maxLevel := 0
    for _, level := range levels {
        if level > maxLevel {
            maxLevel = level
        }
    }

    groups := make([][]string, maxLevel+1)
    for node, level := range levels {
        groups[level] = append(groups[level], node)
    }

    return groups, nil
}
```

---

### DOT Visualization

```go
func (dg *DependencyGraph) ToDOT() string {
    var sb strings.Builder

    sb.WriteString("digraph dependencies {\n")
    sb.WriteString("  rankdir=LR;\n")
    sb.WriteString("  node [shape=box];\n\n")

    // Nodes
    for name, node := range dg.nodes {
        color := getColorForType(node.Type)
        sb.WriteString(fmt.Sprintf("  %q [fillcolor=%s, style=filled];\n", name, color))
    }

    sb.WriteString("\n")

    // Edges
    for from, tos := range dg.edges {
        for _, to := range tos {
            sb.WriteString(fmt.Sprintf("  %q -> %q;\n", from, to))
        }
    }

    sb.WriteString("}\n")

    return sb.String()
}

func getColorForType(resType string) string {
    colors := map[string]string{
        "service":  "lightblue",
        "database": "lightgreen",
        "cache":    "lightyellow",
        "queue":    "lightpink",
        "storage":  "lightgray",
        "ingress":  "lightcoral",
    }

    if color, exists := colors[resType]; exists {
        return color
    }
    return "white"
}
```

---

## CLI Integration

```go
// cmd/konfiguru/commands/deps.go
package commands

func DepsCommand() *cobra.Command {
    cmd := &cobra.Command{
        Use:   "deps [file]",
        Short: "Show dependency graph",
        RunE: func(cmd *cobra.Command, args []string) error {
            // Parse file
            program := parse(args[0])

            // Build graph
            graph := BuildDependencyGraph(program)

            // Detect cycles
            cycles, err := graph.DetectCycles()
            if err != nil {
                printCycles(cycles)
                return err
            }

            // Show deployment order
            order, _ := graph.TopologicalSortKahn()
            fmt.Println("Deployment order:")
            for i, resource := range order {
                fmt.Printf("  %d. %s\n", i+1, resource)
            }

            // Show parallel groups
            groups, _ := graph.GetParallelGroups()
            fmt.Println("\nParallel deployment groups:")
            for i, group := range groups {
                fmt.Printf("  Level %d: %v\n", i, group)
            }

            // Export DOT
            if dotFile, _ := cmd.Flags().GetString("dot"); dotFile != "" {
                ioutil.WriteFile(dotFile, []byte(graph.ToDOT()), 0644)
                fmt.Printf("\nGraph exported to %s\n", dotFile)
            }

            return nil
        },
    }

    cmd.Flags().String("dot", "", "Export graph to DOT file")
    return cmd
}
```

---

## Success Criteria

By Day 30 of Month 11:

- ✅ Dependency graph builds from any Konfiguru program
- ✅ Topological sort returns correct deployment order
- ✅ Circular dependencies detected with clear error messages
- ✅ Parallel groups identified for optimization
- ✅ Graph visualization working (DOT format)
- ✅ CLI `konfiguru deps` command working
- ✅ Performance: 1000-resource graph in <100ms
- ✅ All tests passing

**Validation:**
- [ ] Microservices example (15 resources) - correct order generated
- [ ] Intentional circular dependency - detected and reported
- [ ] `konfiguru deps examples/microservices.kfg` - shows clear output
- [ ] Benchmark: 1000-node graph processes in <100ms

---

## Resources

- **Graph Algorithms:** "Introduction to Algorithms" (CLRS) - Chapter 22 (Graphs)
- **Topological Sort:** geeksforgeeks.org/topological-sorting/
- **Cycle Detection:** cp-algorithms.com/graph/finding-cycle.html
- **Graphviz:** graphviz.org/documentation/

---

**Next:** [Month 12: v0.5 Release & AWS SAA](month-12-v0.5-release-aws-saa.md)
