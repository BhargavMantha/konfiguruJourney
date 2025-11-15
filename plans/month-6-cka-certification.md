# Month 6: CKA Certification & Mini-Compiler Polish

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Achieve Certified Kubernetes Administrator (CKA) certification while polishing the mini-compiler to v0.1.0 release quality.

**Architecture:** Intensive CKA exam preparation + mini-compiler refinement + practical troubleshooting scenarios.

**Tech Stack:** Kubernetes, kubectl, KodeKloud CKA course, killer.sh exam simulator

---

## Prerequisites

Before starting, ensure you have:
- [ ] Completed Month 5 (mini-compiler working)
- [ ] Deep K8s fundamentals from Month 4
- [ ] KodeKloud CKA course 40% complete
- [ ] kubectl muscle memory established

---

## CKA Exam Overview

**Exam Details:**
- **Format:** Performance-based (not multiple choice)
- **Duration:** 2 hours
- **Pass Score:** 66%
- **Environment:** Remote proctored via PSI
- **Resources Allowed:** kubernetes.io docs only

**Exam Domains & Weights:**

| Domain | Weight | Focus Areas |
|--------|--------|-------------|
| **Cluster Architecture, Installation & Configuration** | 25% | Control plane, RBAC, cluster upgrades |
| **Workloads & Scheduling** | 15% | Deployments, DaemonSets, resource limits |
| **Services & Networking** | 20% | Services, Ingress, NetworkPolicies |
| **Storage** | 10% | PV, PVC, StorageClasses |
| **Troubleshooting** | 30% | Debug failing Pods, network issues, logs |

---

## Task 1: Cluster Architecture (25% of Exam)

**Week 1 Focus:** Control plane, etcd, cluster upgrades

**Study Topics:**

1. **Control Plane Components**
   - API Server configuration
   - etcd backup and restore
   - Scheduler configuration
   - Controller Manager

2. **RBAC (Role-Based Access Control)**
   - Roles and RoleBindings
   - ClusterRoles and ClusterRoleBindings
   - ServiceAccounts
   - Authorization modes

3. **Cluster Upgrade**
   - kubeadm upgrade process
   - Drain/uncordon nodes
   - Version compatibility

**Practice Scenarios:**

**Scenario 1: etcd Backup and Restore**

```bash
# Backup etcd
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /backup/etcd-snapshot.db

# Restore etcd
ETCDCTL_API=3 etcdctl snapshot restore /backup/etcd-snapshot.db \
  --data-dir=/var/lib/etcd-restored
```

**Scenario 2: Create RBAC for Developer**

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: developer
  namespace: development
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: developer-role
  namespace: development
rules:
- apiGroups: ["", "apps"]
  resources: ["pods", "deployments", "services"]
  verbs: ["get", "list", "create", "update", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: developer-binding
  namespace: development
subjects:
- kind: ServiceAccount
  name: developer
  namespace: development
roleRef:
  kind: Role
  name: developer-role
  apiGroup: rbac.authorization.k8s.io
```

**Scenario 3: Cluster Upgrade**

```bash
# On control plane node
# 1. Drain node
kubectl drain controlplane --ignore-daemonsets

# 2. Upgrade kubeadm
apt-get update && apt-get install -y kubeadm=1.28.0-00

# 3. Plan upgrade
kubeadm upgrade plan

# 4. Apply upgrade
kubeadm upgrade apply v1.28.0

# 5. Upgrade kubelet and kubectl
apt-get update && apt-get install -y kubelet=1.28.0-00 kubectl=1.28.0-00

# 6. Restart kubelet
systemctl daemon-reload
systemctl restart kubelet

# 7. Uncordon node
kubectl uncordon controlplane
```

**Practice Lab:**
- KodeKloud: Cluster Maintenance section
- killer.sh: Cluster architecture scenarios

---

## Task 2: Workloads & Scheduling (15% of Exam)

**Week 1-2 Focus:** Deployments, resource management, scheduling

**Study Topics:**

1. **Workload Resources**
   - Deployments and rolling updates
   - StatefulSets for stateful apps
   - DaemonSets for node agents
   - Jobs and CronJobs

2. **Resource Management**
   - Resource requests and limits
   - LimitRanges
   - ResourceQuotas

3. **Scheduling**
   - Node selectors
   - Node affinity and anti-affinity
   - Taints and tolerations
   - Static Pods
   - Manual scheduling

**Practice Scenarios:**

**Scenario 1: Deployment with Resource Limits**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```

**Scenario 2: DaemonSet for Monitoring**

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: monitoring-agent
spec:
  selector:
    matchLabels:
      app: monitor
  template:
    metadata:
      labels:
        app: monitor
    spec:
      containers:
      - name: agent
        image: monitoring-agent:latest
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule
```

**Scenario 3: Node Affinity**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: database-pod
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
  containers:
  - name: postgres
    image: postgres:15
```

**Practice Lab:**
- KodeKloud: Application Lifecycle Management
- Practice ResourceQuotas and LimitRanges

---

## Task 3: Services & Networking (20% of Exam)

**Week 2 Focus:** Services, Ingress, NetworkPolicies

**Study Topics:**

1. **Services**
   - ClusterIP, NodePort, LoadBalancer
   - Headless Services
   - Service DNS

2. **Ingress**
   - Ingress Controllers
   - Ingress rules and paths
   - TLS termination

3. **NetworkPolicies**
   - Ingress and egress rules
   - Pod selectors
   - Namespace selectors

**Practice Scenarios:**

**Scenario 1: Ingress with TLS**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  tls:
  - hosts:
    - myapp.example.com
    secretName: tls-secret
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

**Scenario 2: NetworkPolicy (Allow specific Pods)**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 5432
```

**Practice Lab:**
- KodeKloud: Services & Networking
- Create Ingress with path-based routing

---

## Task 4: Storage (10% of Exam)

**Week 2-3 Focus:** Persistent Volumes, StorageClasses

**Study Topics:**

1. **Persistent Volumes (PV)**
   - PV creation and lifecycle
   - Access modes (ReadWriteOnce, ReadOnlyMany, ReadWriteMany)

2. **Persistent Volume Claims (PVC)**
   - PVC binding to PV
   - Storage classes

3. **Dynamic Provisioning**
   - StorageClass
   - Volume binding modes

**Practice Scenarios:**

**Scenario 1: Create PV and PVC**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data
spec:
  capacity:
    storage: 10Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /data/pv
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-data
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

**Scenario 2: Use PVC in Pod**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-storage
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: pvc-data
```

**Practice Lab:**
- KodeKloud: Storage section
- Practice dynamic provisioning

---

## Task 5: Troubleshooting (30% of Exam)

**Week 3-4 Focus:** Debug clusters, applications, networking

**Common Troubleshooting Scenarios:**

**Scenario 1: Pod Not Starting**

```bash
# Check Pod status
kubectl get pods

# Describe Pod for events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check previous logs if crashed
kubectl logs <pod-name> --previous

# Common issues:
# - Image pull errors
# - Resource limits exceeded
# - ConfigMap/Secret not found
# - Liveness/readiness probe failures
```

**Scenario 2: Service Not Accessible**

```bash
# Check service
kubectl get svc

# Check endpoints
kubectl get endpoints <service-name>

# Verify selector matches Pod labels
kubectl get pods --show-labels

# Test from within cluster
kubectl run test --image=busybox -it --rm -- wget -O- <service-name>
```

**Scenario 3: Node Not Ready**

```bash
# Check node status
kubectl get nodes

# Describe node
kubectl describe node <node-name>

# SSH to node and check kubelet
systemctl status kubelet

# Check kubelet logs
journalctl -u kubelet -f

# Common issues:
# - Kubelet not running
# - Network plugin issues
# - Disk pressure
# - Memory pressure
```

**Practice Lab:**
- KodeKloud: Troubleshooting section
- killer.sh: Full exam simulations

---

## Task 6: CKA Exam Preparation

**Week 4 Focus:** Exam simulation, speed practice, documentation navigation

**Preparation Steps:**

**Step 1: Purchase CKA Exam**
- Cost: $395 USD (includes 1 retake)
- Register at: https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/

**Step 2: Set Up Exam Environment**

```bash
# Practice with kubectl aliases
alias k=kubectl
alias kgp='kubectl get pods'
alias kgs='kubectl get svc'
alias kd='kubectl describe'
alias kdel='kubectl delete'

# Add to ~/.bashrc
echo "alias k=kubectl" >> ~/.bashrc
echo "complete -F __start_kubectl k" >> ~/.bashrc
```

**Step 3: killer.sh Practice**
- 2 free sessions with CKA purchase
- Exam-like environment
- Time yourself: complete in 2 hours

**Step 4: Documentation Speed Practice**
- Bookmark useful pages on kubernetes.io
- Practice finding answers quickly
- Know where common examples are

**Exam Day Checklist:**
- [ ] Government ID ready
- [ ] Webcam working
- [ ] Microphone working
- [ ] Quiet room prepared
- [ ] Desk clear (only water allowed)
- [ ] kubectl aliases configured
- [ ] Practice exam completed
- [ ] Well-rested

---

## Task 7: Mini-Compiler Polish (Parallel Track)

**Throughout Month 6:** Refine mini-compiler to v0.1.0

**Improvements:**

1. **Error Messages**
   - Better parser error messages
   - Line number reporting
   - Syntax suggestions

2. **Additional Features**
   - Support ConfigMaps
   - Support Secrets
   - Resource limits in DSL

3. **Testing**
   - Integration tests
   - End-to-end tests with Kind
   - Test coverage >80%

4. **Documentation**
   - README with examples
   - Installation guide
   - Usage documentation

5. **Release v0.1.0**
   - Tag release in Git
   - Create GitHub release
   - Write release notes

---

## Completion Checklist

**Month 6 Complete:**
- [ ] CKA exam passed (66%+ score)
- [ ] All exam domains practiced
- [ ] killer.sh sessions completed
- [ ] Mini-compiler v0.1.0 released
- [ ] Mini-compiler documentation complete
- [ ] Ready for Month 7 (production Konfiguru)

**CKA Preparation:**
- [ ] KodeKloud CKA course 100% complete
- [ ] Practiced all 5 exam domains
- [ ] Can perform tasks within time limits
- [ ] Comfortable with kubernetes.io docs
- [ ] killer.sh scored >66%

**Mini-Compiler v0.1.0:**
- [ ] Supports services and databases
- [ ] Generates Deployment + Service
- [ ] CLI working (compile command)
- [ ] Tests passing (>80% coverage)
- [ ] Documentation complete
- [ ] GitHub release published

---

**Success Metrics:**

**CKA Exam:**
- **Target Score:** 75%+ (above pass threshold)
- **Attempt:** 1st attempt (utilize retake if needed)
- **Preparation Time:** 4 weeks intensive

**Career Impact:**
- ✅ CKA certification adds credibility
- ✅ K8s expertise proven
- ✅ Mini-compiler demonstrates practical skills
- ✅ Ready for production Konfiguru (Months 7-12)

---

**Plan Status:** Ready for execution
**Estimated Time:** 54 hours (40 hrs CKA prep, 14 hrs mini-compiler)
**Exam Window:** Week 4 (Day 24-28)
**Next:** Month 7 - Konfiguru Production DSL Design
