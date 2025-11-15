# Month 17: Multi-Target CLI & Testing

**Created:** 2025-11-15
**Phase:** Multi-Target Backend Development (Months 13-18)
**Timeline:** Month 17 of 24
**Prerequisites:** K8s, Terraform, CloudFormation backends complete

---

## Executive Summary

**Goal:** Unify all backends under a consistent CLI interface with target selection, and prepare for Terraform Associate certification.

**Key Outcomes:**
- Unified CLI: `konfiguru compile --target=k8s|terraform|cloudformation`
- Backend registry and selection
- Cross-backend testing (same DSL → all targets)
- Terraform certification preparation

---

## Weekly Breakdown

### Week 1: Multi-Backend CLI (Days 1-7)
- Target selection with --target flag
- Backend registry pattern
- CLI refactoring for multi-target
- Help documentation and examples

### Week 2: Unified Commands (Days 8-14)
- `konfiguru compile --target=...`
- `konfiguru validate --target=...`
- `konfiguru diff` (show changes)
- `konfiguru apply` (deploy to target)

### Week 3: Cross-Backend Testing (Days 15-21)
- Same DSL compiles to all targets
- Output validation across backends
- E2E testing framework
- Regression testing

### Week 4: Terraform Certification Prep (Days 22-30)
- Terraform Associate study plan
- Practice exams
- Review weak areas
- Month 17 complete, ready for cert (Month 18)

---

## CLI Design

### Target Selection

```bash
# Compile to Kubernetes
konfiguru compile --target=k8s app.kfg
# Output: deployment.yaml, service.yaml

# Compile to Terraform
konfiguru compile --target=terraform app.kfg
# Output: main.tf, variables.tf, outputs.tf

# Compile to CloudFormation
konfiguru compile --target=cloudformation app.kfg
# Output: template.json

# Multi-target (all at once)
konfiguru compile --target=all app.kfg
# Output: k8s/, terraform/, cloudformation/
```

### Backend Registry

```go
type Backend interface {
    Name() string
    Compile(ir *ir.Graph) ([]File, error)
    Validate(files []File) error
}

type Registry struct {
    backends map[string]Backend
}

func (r *Registry) Register(b Backend) {
    r.backends[b.Name()] = b
}

func (r *Registry) Get(name string) (Backend, error) {
    b, ok := r.backends[name]
    if !ok {
        return nil, fmt.Errorf("unknown backend: %s", name)
    }
    return b, nil
}
```

---

## Deliverables

**Code:**
- CLI enhancements (~500 lines)
- Backend registry (~200 lines)
- Unified commands (~300 lines)
- Cross-backend tests (~500 lines)

**Total:** ~1500 lines

---

## Success Criteria

- [ ] `--target` flag working for all backends
- [ ] Same DSL compiles to K8s, Terraform, CloudFormation
- [ ] Cross-backend validation passing
- [ ] 70+ tests covering multi-target scenarios
- [ ] Ready for Terraform certification

---

## Resources

- [Cobra CLI Framework](https://github.com/spf13/cobra)
- [Terraform Associate Exam Guide](https://www.hashicorp.com/certification/terraform-associate)
- [HashiCorp Learn - Terraform](https://learn.hashicorp.com/terraform)

---

*This is Month 17 of your 24-month journey to Platform Architect expertise.*
