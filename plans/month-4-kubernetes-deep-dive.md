# Month 4: Kubernetes Deep Dive Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Master Kubernetes architecture fundamentals and begin designing the mini-Konfiguru DSL, preparing for both CKA certification and building a simple DSL-to-K8s-YAML compiler.

**Architecture:** Deep dive into Kubernetes control plane, Pod lifecycle, scheduling, and controllers while designing a minimal but functional DSL syntax.

**Tech Stack:** Kubernetes (via Kind/Minikube), kubectl, KodeKloud CKA Course, client-go library basics

---

## Prerequisites

Before starting, ensure you have:
- [ ] Completed Month 3 (Lox interpreter working)
- [ ] Go proficiency at intermediate level
- [ ] Docker installed for Kubernetes clusters
- [ ] KodeKloud CKA course access

---

## Task 1: Kubernetes Environment Setup

**Files:**
- Setup: Local Kubernetes cluster (Kind or Minikube)
- Install: kubectl, helm (optional)

**Step 1: Install Kind (Kubernetes in Docker)**

```bash
# Install Kind
go install sigs.k8s.io/kind@latest

# Verify installation
kind version
```

Expected output: `kind v0.20.0 go1.21.x linux/amd64` (or higher)

**Step 2: Create local Kubernetes cluster**

```bash
# Create cluster
kind create cluster --name konfiguru-dev

# Verify cluster
kubectl cluster-info --context kind-konfiguru-dev
```

Expected: Kubernetes control plane running message

**Step 3: Install kubectl**

```bash
# Download kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Install
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify
kubectl version --client
```

**Step 4: Test cluster access**

```bash
# Get nodes
kubectl get nodes

# Get all resources
kubectl get all --all-namespaces
```

Expected: At least one node in Ready state

**Step 5: Create project directory**

```bash
cd /home/bhargav/Documents/Side-Projects/konfiguru
mkdir -p k8s-learning
mkdir -p k8s-learning/manifests
mkdir -p k8s-learning/experiments
```

**Step 6: Commit setup**

```bash
git add .
git commit -m "feat: set up Kubernetes learning environment

- Install Kind and kubectl
- Create konfiguru-dev cluster
- Set up k8s-learning directory structure

Month 4: Kubernetes Deep Dive begins"
```

---

## Task 2: Kubernetes Architecture Study

**Files:**
- Create: `k8s-learning/architecture-notes.md`
- Study: KodeKloud CKA - Core Concepts section

**Step 1: Study control plane components**

**Focus areas:**
- API Server: Central management entity
- etcd: Cluster data store
- Scheduler: Pod placement decisions
- Controller Manager: Maintain cluster state
- kubelet: Node agent
- kube-proxy: Network proxy

**Step 2: Create architecture notes**

Create file: `k8s-learning/architecture-notes.md`

```markdown
# Kubernetes Architecture Notes

## Control Plane Components

### API Server (kube-apiserver)
- Front-end for the Kubernetes control plane
- All operations go through API server
- RESTful API over HTTPS
- Authenticates and validates requests
- Updates etcd

### etcd
- Distributed key-value store
- Stores all cluster data
- Source of truth for cluster state
- Highly available and consistent

### Scheduler (kube-scheduler)
- Watches for newly created Pods with no assigned node
- Selects node based on:
  - Resource requirements
  - Hardware/software constraints
  - Affinity/anti-affinity
  - Data locality
  - Inter-workload interference

### Controller Manager (kube-controller-manager)
- Runs controller processes
- Node Controller: Monitors node health
- Replication Controller: Maintains correct number of pods
- Endpoints Controller: Populates Endpoints objects
- Service Account & Token Controllers: Create default accounts/tokens

### Cloud Controller Manager
- Links cluster to cloud provider API
- Only runs cloud-specific controllers
- Separates cloud-specific logic from core

## Node Components

### kubelet
- Agent running on each node
- Ensures containers are running in Pods
- Takes PodSpecs from API server
- Reports node and pod status back
- Performs health checks (liveness/readiness probes)

### kube-proxy
- Network proxy on each node
- Maintains network rules
- Enables Pod-to-Pod communication
- Implements Services abstraction
- Uses iptables or IPVS

### Container Runtime
- Software responsible for running containers
- Examples: containerd, CRI-O, Docker
- Implements CRI (Container Runtime Interface)

## Add-ons

### DNS (CoreDNS)
- Provides DNS-based service discovery
- Every Service gets DNS entry
- Pods get DNS entries if enabled

### Dashboard
- Web-based UI for Kubernetes
- Deploy/troubleshoot applications
- Manage cluster resources

### Cluster-level Logging
- Centralized log collection
- Examples: Elasticsearch, Fluentd, Kibana (EFK stack)
```

**Step 3: Watch KodeKloud videos**

Complete these sections:
1. Core Concepts - Introduction
2. Cluster Architecture
3. ETCD For Beginners
4. ETCD in Kubernetes
5. Kube-API Server
6. Kube Controller Manager
7. Kube Scheduler
8. Kubelet
9. Kube Proxy

**Time:** ~3 hours

**Step 4: Hands-on verification**

```bash
# Inspect control plane pods
kubectl get pods -n kube-system

# Describe API server
kubectl describe pod kube-apiserver-<node> -n kube-system

# Check etcd
kubectl exec -n kube-system etcd-<node> -- etcdctl version

# View kubelet status
systemctl status kubelet  # On real node (not available in Kind)
```

**Step 5: Commit notes**

```bash
git add k8s-learning/
git commit -m "docs: add Kubernetes architecture notes

- Document control plane components
- Document node components
- Complete KodeKloud Core Concepts section

Month 4 Day 2-3"
```

---

## Task 3: Pods Deep Dive

**Files:**
- Create: `k8s-learning/manifests/pods/`
- Practice: Pod creation, lifecycle, troubleshooting

**Step 1: Understand Pod concepts**

Study:
- Pod is smallest deployable unit in K8s
- Group of one or more containers
- Shared network namespace (containers share IP)
- Shared storage volumes
- Pod phases: Pending, Running, Succeeded, Failed, Unknown

**Step 2: Create basic Pod manifests**

Create file: `k8s-learning/manifests/pods/nginx-pod.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
    tier: frontend
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
      name: http
```

**Step 3: Multi-container Pod**

Create file: `k8s-learning/manifests/pods/multi-container-pod.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80

  - name: sidecar
    image: busybox
    command: ['sh', '-c', 'while true; do echo "Sidecar logging"; sleep 10; done']
```

**Step 4: Pod with resources**

Create file: `k8s-learning/manifests/pods/pod-with-resources.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-constrained-pod
spec:
  containers:
  - name: app
    image: nginx:1.21
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

**Step 5: Practice Pod operations**

```bash
# Create Pod
kubectl apply -f k8s-learning/manifests/pods/nginx-pod.yaml

# Get Pods
kubectl get pods

# Describe Pod
kubectl describe pod nginx-pod

# Get Pod YAML
kubectl get pod nginx-pod -o yaml

# Get Pod logs
kubectl logs nginx-pod

# Exec into Pod
kubectl exec -it nginx-pod -- /bin/bash

# Delete Pod
kubectl delete pod nginx-pod

# Create from command line
kubectl run nginx --image=nginx:1.21 --port=80
```

**Step 6: Pod troubleshooting practice**

```bash
# Get Pod events
kubectl describe pod <pod-name> | grep -A 10 Events

# Get previous container logs (if crashed)
kubectl logs <pod-name> --previous

# Get all container logs in multi-container pod
kubectl logs <pod-name> --all-containers

# Check Pod resource usage
kubectl top pod <pod-name>  # Requires metrics-server
```

**Step 7: Commit Pod manifests**

```bash
git add k8s-learning/manifests/pods/
git commit -m "feat: add Pod manifest examples and practice

- Create single-container Pod
- Create multi-container Pod
- Add resource constraints
- Practice Pod lifecycle commands

Month 4 Day 4-5"
```

---

## Task 4: Services and Networking

**Files:**
- Create: `k8s-learning/manifests/services/`
- Study: Service types, Endpoints, DNS

**Step 1: Understand Service types**

- **ClusterIP** (default): Internal cluster IP, only accessible within cluster
- **NodePort**: Exposes service on each Node's IP at static port
- **LoadBalancer**: Cloud provider load balancer
- **ExternalName**: Maps service to DNS name

**Step 2: Create ClusterIP Service**

Create file: `k8s-learning/manifests/services/clusterip-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: ClusterIP
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

**Step 3: Create NodePort Service**

Create file: `k8s-learning/manifests/services/nodeport-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30080  # Optional: K8s will assign if not specified
```

**Step 4: Complete application with Service**

Create file: `k8s-learning/manifests/services/web-app.yaml`

```yaml
---
apiVersion: v1
kind: Pod
metadata:
  name: web-app
  labels:
    app: web
    tier: frontend
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

**Step 5: Practice Service operations**

```bash
# Apply app with service
kubectl apply -f k8s-learning/manifests/services/web-app.yaml

# Get services
kubectl get services

# Describe service
kubectl describe service web-service

# Get endpoints
kubectl get endpoints web-service

# Test service DNS
kubectl run test-pod --image=busybox --rm -it --restart=Never -- wget -O- web-service

# Access NodePort service (if using Kind)
kubectl port-forward service/nginx-nodeport 8080:80
# Then access http://localhost:8080 in browser
```

**Step 6: Commit Service manifests**

```bash
git add k8s-learning/manifests/services/
git commit -m "feat: add Service examples and networking practice

- Create ClusterIP service
- Create NodePort service
- Test Service discovery and DNS
- Practice port-forwarding

Month 4 Day 6-7"
```

---

## Task 5: ConfigMaps and Secrets

**Files:**
- Create: `k8s-learning/manifests/config/`

**Step 1: Create ConfigMap from literal**

```bash
# Create from kubectl
kubectl create configmap app-config \
  --from-literal=APP_ENV=production \
  --from-literal=LOG_LEVEL=info
```

**Step 2: Create ConfigMap from file**

Create file: `k8s-learning/manifests/config/app.properties`

```properties
database.host=postgres-service
database.port=5432
app.name=konfiguru
app.version=0.1.0
```

Create file: `k8s-learning/manifests/config/configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-file
data:
  app.properties: |
    database.host=postgres-service
    database.port=5432
    app.name=konfiguru
    app.version=0.1.0

  log-config.json: |
    {
      "level": "info",
      "format": "json",
      "outputs": ["stdout", "file"]
    }
```

**Step 3: Create Secret**

Create file: `k8s-learning/manifests/config/secret.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  # Base64 encoded values
  # username: admin (YWRtaW4=)
  # password: secretpass (c2VjcmV0cGFzcw==)
  username: YWRtaW4=
  password: c2VjcmV0cGFzcw==
```

**Step 4: Use ConfigMap and Secret in Pod**

Create file: `k8s-learning/manifests/config/pod-with-config.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-config
spec:
  containers:
  - name: app
    image: nginx:1.21

    # Environment variables from ConfigMap
    env:
    - name: APP_ENV
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: APP_ENV

    # Environment variables from Secret
    - name: DB_USER
      valueFrom:
        secretKeyRef:
          name: db-credentials
          key: username

    - name: DB_PASS
      valueFrom:
        secretKeyRef:
          name: db-credentials
          key: password

    # Mount ConfigMap as volume
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config

  volumes:
  - name: config-volume
    configMap:
      name: app-config-file
```

**Step 5: Practice operations**

```bash
# Create ConfigMap
kubectl apply -f k8s-learning/manifests/config/configmap.yaml

# Create Secret
kubectl apply -f k8s-learning/manifests/config/secret.yaml

# Create Pod
kubectl apply -f k8s-learning/manifests/config/pod-with-config.yaml

# Verify environment variables
kubectl exec app-with-config -- env | grep -E "APP_ENV|DB_USER"

# Verify mounted config
kubectl exec app-with-config -- cat /etc/config/app.properties

# Get secret (decode)
kubectl get secret db-credentials -o jsonpath='{.data.username}' | base64 -d
```

**Step 6: Commit**

```bash
git add k8s-learning/manifests/config/
git commit -m "feat: add ConfigMap and Secret examples

- Create ConfigMaps from literals and files
- Create Secrets with base64 encoding
- Use ConfigMaps and Secrets in Pods
- Practice env vars and volume mounts

Month 4 Day 8-9"
```

---

## Task 6: Mini-Konfiguru DSL Design

**Files:**
- Create: `konfiguru-mini/DSL-SPEC.md`
- Create: `konfiguru-mini/examples/`

**Step 1: Design DSL syntax**

Create file: `konfiguru-mini/DSL-SPEC.md`

```markdown
# Konfiguru Mini DSL Specification v0.1

## Goals

- Simple, readable syntax for defining Kubernetes resources
- Reduce YAML verbosity by 70-80%
- Focus on Pods, Deployments, Services initially
- Extensible for future resource types

## Syntax Overview

### Service Declaration

```konfiguru
service <name> {
  image: <docker-image>
  port: <port-number>
  replicas: <count>
  env {
    <KEY>: <value>
    ...
  }
}
```

### Example: Web Application

```konfiguru
service web {
  image: "nginx:1.21"
  port: 80
  replicas: 3

  env {
    APP_ENV: "production"
    LOG_LEVEL: "info"
  }
}
```

**Generated Output:**
- Deployment with 3 replicas
- Service (ClusterIP)
- ConfigMap for environment variables

### Database Declaration

```konfiguru
database postgres {
  version: "15"
  storage: "10Gi"

  env {
    POSTGRES_DB: "appdb"
  }
}
```

**Generated Output:**
- StatefulSet with 1 replica
- Service (headless)
- PersistentVolumeClaim
- Secret for credentials (auto-generated)

## Grammar (EBNF)

```ebnf
program        = declaration* ;
declaration    = service_decl | database_decl ;

service_decl   = "service" IDENTIFIER "{" service_body "}" ;
service_body   = service_field* ;
service_field  = "image:" STRING
               | "port:" NUMBER
               | "replicas:" NUMBER
               | "env" "{" env_vars "}" ;

database_decl  = "database" IDENTIFIER "{" db_body "}" ;
db_body        = db_field* ;
db_field       = "version:" STRING
               | "storage:" STRING
               | "env" "{" env_vars "}" ;

env_vars       = (IDENTIFIER ":" STRING)* ;

IDENTIFIER     = [a-zA-Z_][a-zA-Z0-9_-]* ;
STRING         = '"' [^"]* '"' ;
NUMBER         = [0-9]+ ;
```

## Token Types

```go
// Single-character
LEFT_BRACE, RIGHT_BRACE    // { }
COLON                       // :

// Literals
IDENTIFIER                  // service_name, MY_VAR
STRING                      // "nginx:1.21"
NUMBER                      // 80, 3

// Keywords
SERVICE, DATABASE, IMAGE, PORT, REPLICAS, ENV, VERSION, STORAGE

// Special
EOF
```

## Type System (Simple)

- `string`: Text values
- `number`: Integer values (ports, replicas)
- `size`: Storage sizes (10Gi, 500Mi)
- `version`: Semantic version strings

## Future Extensions

- ConfigMap references
- Secret management
- Volume mounts
- Health checks
- Resource limits
- Ingress rules
```

**Step 2: Create example programs**

Create file: `konfiguru-mini/examples/web-app.kfg`

```konfiguru
service web {
  image: "nginx:1.21"
  port: 80
  replicas: 3

  env {
    APP_ENV: "production"
    LOG_LEVEL: "info"
  }
}
```

Create file: `konfiguru-mini/examples/database.kfg`

```konfiguru
database postgres {
  version: "15"
  storage: "10Gi"

  env {
    POSTGRES_DB: "appdb"
  }
}
```

Create file: `konfiguru-mini/examples/full-stack.kfg`

```konfiguru
service api {
  image: "node:18-alpine"
  port: 3000
  replicas: 2

  env {
    NODE_ENV: "production"
    DB_HOST: "postgres"
  }
}

service frontend {
  image: "nginx:1.21"
  port: 80
  replicas: 3
}

database postgres {
  version: "15"
  storage: "10Gi"
}
```

**Step 3: Commit DSL design**

```bash
git add konfiguru-mini/
git commit -m "feat: design mini-Konfiguru DSL specification

- Define syntax for service and database declarations
- Create EBNF grammar
- Add example programs
- Plan token types and lexer structure

Month 4 Day 10-12"
```

---

## Task 7: client-go Basics

**Files:**
- Create: `k8s-learning/client-go/`
- Practice: Reading K8s resources programmatically

**Step 1: Install client-go**

```bash
cd /home/bhargav/Documents/Side-Projects/konfiguru
go get k8s.io/client-go@latest
go get k8s.io/apimachinery/pkg/apis/meta/v1@latest
go get k8s.io/api/core/v1@latest
```

**Step 2: Create basic client-go program**

Create file: `k8s-learning/client-go/list-pods.go`

```go
package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

func main() {
	// Build kubeconfig path
	home, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}
	kubeconfig := filepath.Join(home, ".kube", "config")

	// Build config from kubeconfig file
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		panic(err)
	}

	// Create clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	// List Pods in default namespace
	pods, err := clientset.CoreV1().Pods("default").List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		panic(err)
	}

	fmt.Printf("There are %d pods in the default namespace\n", len(pods.Items))
	for _, pod := range pods.Items {
		fmt.Printf("- %s (Status: %s)\n", pod.Name, pod.Status.Phase)
	}
}
```

**Step 3: Run the program**

```bash
cd k8s-learning/client-go
go run list-pods.go
```

Expected output: List of pods in default namespace

**Step 4: Create Pod programmatically**

Create file: `k8s-learning/client-go/create-pod.go`

```go
package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

func main() {
	home, _ := os.UserHomeDir()
	kubeconfig := filepath.Join(home, ".kube", "config")

	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		panic(err)
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	// Define Pod spec
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: "nginx-from-go",
			Labels: map[string]string{
				"app": "nginx",
			},
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{
					Name:  "nginx",
					Image: "nginx:1.21",
					Ports: []corev1.ContainerPort{
						{
							ContainerPort: 80,
						},
					},
				},
			},
		},
	}

	// Create Pod
	result, err := clientset.CoreV1().Pods("default").Create(
		context.TODO(),
		pod,
		metav1.CreateOptions{},
	)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Created pod %s\n", result.Name)
}
```

**Step 5: Run and verify**

```bash
go run create-pod.go
kubectl get pods | grep nginx-from-go
```

**Step 6: Commit client-go examples**

```bash
git add k8s-learning/client-go/
git commit -m "feat: add client-go examples

- List Pods programmatically
- Create Pod using client-go
- Practice Kubernetes Go API
- Foundation for mini-compiler

Month 4 Day 13-14"
```

---

## Completion Checklist

**Month 4 Complete:**
- [ ] Kubernetes cluster running (Kind/Minikube)
- [ ] kubectl installed and configured
- [ ] KodeKloud Core Concepts section complete
- [ ] Architecture notes documented
- [ ] Pod manifests created and tested
- [ ] Service manifests created and tested
- [ ] ConfigMap/Secret practice complete
- [ ] Mini-Konfiguru DSL designed
- [ ] Example DSL programs written
- [ ] client-go basics understood
- [ ] Can create K8s resources programmatically

**Knowledge Gained:**
- ✅ Kubernetes architecture (control plane + nodes)
- ✅ Pod lifecycle and multi-container patterns
- ✅ Service types and networking
- ✅ ConfigMaps and Secrets
- ✅ client-go library basics
- ✅ DSL design principles

**Ready for Month 5:**
- [ ] Understand K8s resource model
- [ ] Can write K8s manifests fluently
- [ ] DSL syntax designed
- [ ] Go code can interact with K8s API

---

**Plan Status:** Ready for execution
**Estimated Time:** 54 hours over 4 weeks (13.5 hrs/week)
**Next Document:** Month 5 Mini-Compiler Implementation Plan
