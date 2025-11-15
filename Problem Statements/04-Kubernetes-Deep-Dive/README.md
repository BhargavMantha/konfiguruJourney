# Month 4: Kubernetes Deep Dive

Welcome to Month 4 of your 24-month journey! After mastering compiler fundamentals with the Lox interpreter in Months 1-3, you now transition to deep Kubernetes knowledge. This month bridges your Go skills with infrastructure expertise, setting the foundation for building the mini-compiler in Month 5.

**Phase:** Integration
**Main Deliverable:** Deep understanding of Kubernetes fundamentals + Mini-DSL specification ready for implementation

---

## Table of Contents

- [Month Overview](#month-overview)
- [What You'll Build](#what-youll-build)
- [Learning Goals](#learning-goals)
- [Weekly Breakdown](#weekly-breakdown)
- [Time Commitment](#time-commitment)
- [Success Criteria](#success-criteria)
- [Getting Started](#getting-started)
- [Navigation](#navigation)

---

## Month Overview

**Focus Areas:**
- Kubernetes architecture and core concepts
- Pod management, Services, and networking
- ConfigMaps, Secrets, and configuration management
- client-go library for programmatic K8s access
- Mini-Konfiguru DSL design

**Why This Month Matters:**
To build an infrastructure compiler, you must deeply understand the target platform. This month gives you the K8s expertise needed to generate correct, production-quality manifests. The CKA prep track also begins here, running parallel to development work.

**Month Timeline:**
- **Week 1:** K8s setup, architecture study, Pod fundamentals
- **Week 2:** Services, networking, ConfigMaps, Secrets
- **Week 3:** Advanced controllers, client-go basics
- **Week 4:** Mini-DSL design, Month 5 preparation

---

## What You'll Build

By the end of Month 4, you'll have:

### Practical Artifacts

**1. Local Kubernetes Environment**
- Kind cluster running
- kubectl configured
- Namespaces for experiments

**2. Learning Repository**
```
k8s-learning/
├── architecture-notes.md
├── manifests/
│   ├── pods/              # 10+ Pod examples
│   ├── services/          # 5+ Service examples
│   ├── config/            # ConfigMap/Secret examples
│   └── controllers/       # Deployment, StatefulSet
├── client-go/
│   ├── list-pods.go
│   ├── create-pod.go
│   └── generate-yaml.go
└── experiments/
```

**3. Mini-Konfiguru DSL Specification**
```
konfiguru-mini/
├── DSL-SPEC.md
├── GRAMMAR.md
├── examples/
│   ├── web-app.kfg
│   ├── database.kfg
│   └── full-stack.kfg
└── token-design.md
```

**4. KodeKloud Progress**
- ✅ Core Concepts complete
- ✅ Scheduling complete
- 🔄 Networking begun

---

## Learning Goals

### By Week 1:
- [ ] Understand K8s architecture (control plane + nodes)
- [ ] Create and manage Pods
- [ ] Debug Pod failures
- [ ] Set up local K8s cluster

### By Week 2:
- [ ] Create all Service types
- [ ] Understand Service discovery
- [ ] Use ConfigMaps and Secrets
- [ ] Mount config as volumes

### By Week 3:
- [ ] Work with Deployments
- [ ] Use StatefulSets
- [ ] Program with client-go
- [ ] Generate YAML from Go

### By Week 4:
- [ ] Design mini-Konfiguru DSL
- [ ] Define complete grammar
- [ ] Create example programs
- [ ] Plan lexer structure

---

## Weekly Breakdown

### Week 1: Foundation & Architecture (Days 1-7)

| Day | Topic | Deliverable |
|-----|-------|-------------|
| 1 | K8s Environment Setup | Kind cluster running |
| 2 | Architecture Study | Architecture notes |
| 3 | Control Plane Deep Dive | etcd, API server understanding |
| 4 | Pods - Basics | Single-container manifests |
| 5 | Pods - Multi-Container | Sidecar patterns |
| 6 | Pod Troubleshooting | Debug failing Pods |
| 7 | Week 1 Review | KodeKloud Core Concepts done |

### Week 2: Services & Configuration (Days 8-14)

| Day | Topic | Deliverable |
|-----|-------|-------------|
| 8 | Services - ClusterIP | Internal communication |
| 9 | Services - NodePort & LB | External access |
| 10 | Service Discovery | DNS-based discovery |
| 11 | ConfigMaps | Config from files |
| 12 | Secrets | Secure data management |
| 13 | Config Injection | Env vars + volumes |
| 14 | Week 2 Review | Complete app with config |

### Week 3: Controllers & client-go (Days 15-21)

| Day | Topic | Deliverable |
|-----|-------|-------------|
| 15 | Deployments | Declarative deployments |
| 16 | Rolling Updates | Update strategies |
| 17 | StatefulSets | Stateful patterns |
| 18 | client-go Setup | List/Get in Go |
| 19 | client-go - Create | Programmatic creation |
| 20 | YAML Generation | Go structs to YAML |
| 21 | Week 3 Review | client-go examples done |

### Week 4: DSL Design (Days 22-30)

| Day | Topic | Deliverable |
|-----|-------|-------------|
| 22 | DSL Research | Survey existing DSLs |
| 23 | Syntax Design | Draft DSL syntax |
| 24 | Grammar (EBNF) | Complete grammar |
| 25 | Example Programs | 5+ .kfg files |
| 26 | Token Types | Token enum design |
| 27 | DSL Specification | Complete DSL-SPEC.md |
| 28 | Month 4 Retrospective | Learning review |
| 29 | K8s Best Practices | Production patterns |
| 30 | Month 5 Planning | Ready for compiler |

---

## Time Commitment

**Weekly: 13.5 hours total**

| Day | Time | Duration | Focus |
|-----|------|----------|-------|
| Mon | 6:00-8:00 AM | 2h | KodeKloud + practice |
| Tue | 6:00-9:00 AM | 3h | Manifests, experiments |
| Wed | 6:00-7:00 AM | 1h | kubectl drills |
| Thu | 6:00-9:00 AM | 3h | client-go, DSL design |
| Fri | 6:00-6:30 AM | 0.5h | Weekly review |
| Sat | 8:00 AM-12:00 PM | 4h | Deep work |
| Sun | REST | 0h | Sacred rest |

---

## Success Criteria

**Month 4 Complete:**
- [ ] 20+ K8s manifests created
- [ ] client-go programs working
- [ ] DSL specification complete
- [ ] 5+ example DSL programs
- [ ] KodeKloud 30-40% done
- [ ] Ready for Month 5

**Knowledge Checkpoints:**
- [ ] Can explain K8s architecture
- [ ] Can write manifests from memory
- [ ] Can use client-go library
- [ ] Designed complete DSL grammar

---

## Getting Started

**Day 1 Quick Start:**
1. Verify Go: `go version`
2. Install Docker if needed
3. Navigate to project directory
4. Read [Day 1](./Day-001.md)
5. Install Kind and kubectl

**Daily Routine:**
1. Read problem statement
2. Watch KodeKloud lecture
3. Hands-on practice
4. Create manifests
5. Document and commit

---

## Navigation

### Daily Problem Statements

**Week 1:** [Day 1](Day-001.md) | [Day 2](Day-002.md) | [Day 3](Day-003.md) | [Day 4](Day-004.md) | [Day 5](Day-005.md) | [Day 6](Day-006.md) | [Day 7](Day-007.md)

**Week 2:** [Day 8](Day-008.md) | [Day 9](Day-009.md) | [Day 10](Day-010.md) | [Day 11](Day-011.md) | [Day 12](Day-012.md) | [Day 13](Day-013.md) | [Day 14](Day-014.md)

**Week 3:** [Day 15](Day-015.md) | [Day 16](Day-016.md) | [Day 17](Day-017.md) | [Day 18](Day-018.md) | [Day 19](Day-019.md) | [Day 20](Day-020.md) | [Day 21](Day-021.md)

**Week 4:** [Day 22](Day-022.md) | [Day 23](Day-023.md) | [Day 24](Day-024.md) | [Day 25](Day-025.md) | [Day 26](Day-026.md) | [Day 27](Day-027.md) | [Day 28](Day-028.md) | [Day 29](Day-029.md) | [Day 30](Day-030.md)

### Quick Links

- **Previous:** [Month 3: Lox Interpreter Complete](../03-Lox-Interpreter-Complete/README.md)
- **Next:** [Month 5: Mini-Compiler](../05-Mini-Compiler/README.md)
- **Implementation Plan:** [Month 4 Detailed Plan](../../plans/month-4-kubernetes-deep-dive.md)
- **Master Roadmap:** [36-Month Plan](../../plans/2025-11-15-konfiguru-go-roadmap-integration.md)

---

## Final Thoughts

**This month transitions you from compiler theory to infrastructure knowledge.** You've built a complete Lox interpreter. Now apply that knowledge to Kubernetes.

**What makes Month 4 unique:**
- Practical first - use K8s before building tools for it
- Two tracks - K8s learning + DSL design in parallel
- CKA foundation - certification journey begins
- Real-world skills - production-applicable knowledge

**By Day 30:**
- Deep K8s understanding
- Hands-on with all core resources
- client-go proficiency
- Designed first DSL
- Ready for mini-compiler

**Sunday remains sacred rest.** No kubectl. No manifests. Just rest.

---

**Ready?** Start with [Day 1: Kubernetes Environment Setup](./Day-001.md)!

---

*Part of the Konfiguru 24-Month Learning Journey*
*Phase 2: Integration*
