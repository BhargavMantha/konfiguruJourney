# Month 10: Advanced Kubernetes Code Generation - Implementation Plan

**Created:** 2025-11-15
**Phase:** Core Konfiguru Development (Months 7-12)
**Timeline:** Month 10 of 36
**Weekly Commitment:** 13.5 hours
**Main Deliverable:** Complete K8s Resource Generation for All Types

---

## Overview

Month 10 extends Konfiguru's code generation capabilities beyond simple Deployments and Services. You'll implement generation for all Kubernetes resource types: StatefulSets, Jobs, CronJobs, DaemonSets, HPAs, Ingress, ConfigMaps, Secrets, and PVCs.

**This is the heart of Konfiguru's value proposition:** 10 lines of Konfiguru → 200+ lines of perfectly valid Kubernetes YAML.

---

## Learning Objectives

By the end of Month 10, you will:

- ✅ Implement StatefulSet generation for databases
- ✅ Generate Jobs and CronJobs for batch workloads
- ✅ Create DaemonSets for node-level workloads
- ✅ Implement HorizontalPodAutoscaler generation
- ✅ Generate Ingress resources with TLS support
- ✅ Create ConfigMaps and Secrets from Konfiguru configs
- ✅ Implement PersistentVolumeClaim generation
- ✅ Add volume mounts and health checks to all resources
- ✅ Generate NetworkPolicies for security

---

## Weekly Breakdown

### Week 1: StatefulSets (Days 1-7)
**Deliverable:** Complete StatefulSet generation for databases

**Tasks:**
- Design StatefulSet generation architecture
- Implement `database` → StatefulSet conversion
- Generate PVC templates within StatefulSets
- Create headless Service for StatefulSets
- Add init containers for database initialization
- Test with Postgres, MySQL, MongoDB examples
- Add backup CronJob generation

**Code Output:** ~400 lines

**Example Input/Output:**
```konfiguru
database postgres {
  type: "postgres"
  version: "15"
  storage: 100GB
  replicas: 3

  backup {
    schedule: "0 2 * * *"
    retention: 30
  }
}
```

Generates:
- StatefulSet (postgres-0, postgres-1, postgres-2)
- Headless Service (postgres-headless)
- PersistentVolumeClaim template (100GB each)
- CronJob for daily backups

---

### Week 2: Jobs & CronJobs (Days 8-14)
**Deliverable:** Job and CronJob generation

**Tasks:**
- Implement Job generation from `worker` resources
- Implement CronJob generation with cron schedules
- Add parallelism and completion configuration
- Implement backoff limits and retry logic
- Generate Job history limits (successfulJobsHistoryLimit, failedJobsHistoryLimit)
- Test CronJob scheduling expressions
- Implement suspended and concurrency policies

**Code Output:** ~300 lines

**Example:**
```konfiguru
cronjob daily_report {
  schedule: "0 6 * * *"
  image: "report-gen:v1.0"
  command: ["python", "generate.py"]

  resources {
    cpu: "2000m"
    memory: "4Gi"
  }

  successHistory: 5
  failedHistory: 3
}
```

Generates:
- CronJob with schedule "0 6 * * *"
- Job template with resource limits
- History limits configured

---

### Week 3: DaemonSets, HPA, Ingress (Days 15-21)
**Deliverable:** Advanced resource types

**Tasks:**
- Implement DaemonSet generation for node-level workers
- Add node selectors and tolerations to DaemonSets
- Implement HorizontalPodAutoscaler generation
- Generate HPA with CPU and memory metrics
- Implement Ingress generation with routing rules
- Add TLS configuration to Ingress
- Implement Ingress annotations (cert-manager, nginx)

**Code Output:** ~400 lines

**Example HPA:**
```konfiguru
service api {
  image: "api:v1.0"
  port: 8080
  replicas: 3

  autoscale {
    min: 3
    max: 10
    targetCPU: 70
    targetMemory: 80
  }
}
```

Generates:
- Deployment with initial 3 replicas
- HorizontalPodAutoscaler (scale 3-10 based on CPU/memory)

---

### Week 4: ConfigMaps, Secrets, Polish (Days 22-30)
**Deliverable:** Configuration management and production polish

**Tasks:**
- Generate ConfigMaps from `env` blocks
- Generate Secrets with base64 encoding
- Implement PersistentVolumeClaim generation from `storage` resources
- Add volume mounts to Deployments/StatefulSets
- Implement resource quotas and limits
- Add readiness, liveness, and startup probes
- Generate NetworkPolicies for pod isolation
- End-to-end integration testing
- Optimize YAML generation (clean, valid output)

**Code Output:** ~300 lines

**Example:**
```konfiguru
service api {
  image: "api:v1.0"
  port: 8080

  env {
    LOG_LEVEL: "info"
    MAX_CONNECTIONS: "100"
  }

  secrets {
    DB_PASSWORD: "/secrets/db-pass"
    API_KEY: "/secrets/api-key"
  }

  health {
    readiness: "/health"
    liveness: "/alive"
    startup: "/startup"
  }
}
```

Generates:
- Deployment with:
  - ConfigMap for env vars
  - Secret references
  - Readiness, liveness, startup probes
  - Resource limits

---

## Detailed Implementation

### StatefulSet Generator

```go
// pkg/backends/kubernetes/statefulset.go
package kubernetes

import (
    appsv1 "k8s.io/api/apps/v1"
    corev1 "k8s.io/api/core/v1"
    metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
    "k8s.io/apimachinery/pkg/api/resource"
)

func GenerateStatefulSet(db *ast.DatabaseDecl) (*appsv1.StatefulSet, error) {
    replicas := int32(db.Replicas)
    if replicas == 0 {
        replicas = 1
    }

    // Parse storage size
    storageQty, err := resource.ParseQuantity(db.Storage)
    if err != nil {
        return nil, fmt.Errorf("invalid storage size %q: %v", db.Storage, err)
    }

    statefulSet := &appsv1.StatefulSet{
        TypeMeta: metav1.TypeMeta{
            APIVersion: "apps/v1",
            Kind:       "StatefulSet",
        },
        ObjectMeta: metav1.ObjectMeta{
            Name:      db.Name,
            Namespace: "default",
            Labels: map[string]string{
                "app":  db.Name,
                "type": "database",
            },
        },
        Spec: appsv1.StatefulSetSpec{
            Replicas: &replicas,
            Selector: &metav1.LabelSelector{
                MatchLabels: map[string]string{
                    "app": db.Name,
                },
            },
            ServiceName: db.Name + "-headless",
            Template: corev1.PodTemplateSpec{
                ObjectMeta: metav1.ObjectMeta{
                    Labels: map[string]string{
                        "app": db.Name,
                    },
                },
                Spec: corev1.PodSpec{
                    Containers: []corev1.Container{
                        {
                            Name:  db.Name,
                            Image: fmt.Sprintf("%s:%s", db.Type, db.Version),
                            Ports: []corev1.ContainerPort{
                                {
                                    Name:          "db",
                                    ContainerPort: getDefaultDatabasePort(db.Type),
                                },
                            },
                            VolumeMounts: []corev1.VolumeMount{
                                {
                                    Name:      "data",
                                    MountPath: "/var/lib/postgresql/data",
                                },
                            },
                        },
                    },
                },
            },
            VolumeClaimTemplates: []corev1.PersistentVolumeClaim{
                {
                    ObjectMeta: metav1.ObjectMeta{
                        Name: "data",
                    },
                    Spec: corev1.PersistentVolumeClaimSpec{
                        AccessModes: []corev1.PersistentVolumeAccessMode{
                            corev1.ReadWriteOnce,
                        },
                        Resources: corev1.ResourceRequirements{
                            Requests: corev1.ResourceList{
                                corev1.ResourceStorage: storageQty,
                            },
                        },
                    },
                },
            },
        },
    }

    return statefulSet, nil
}

func getDefaultDatabasePort(dbType string) int32 {
    switch dbType {
    case "postgres":
        return 5432
    case "mysql":
        return 3306
    case "mongo", "mongodb":
        return 27017
    case "redis":
        return 6379
    default:
        return 5432
    }
}
```

---

### HPA Generator

```go
// pkg/backends/kubernetes/hpa.go
package kubernetes

import (
    autoscalingv2 "k8s.io/api/autoscaling/v2"
    corev1 "k8s.io/api/core/v1"
    metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func GenerateHPA(service *ast.ServiceDecl) (*autoscalingv2.HorizontalPodAutoscaler, error) {
    if service.Autoscale == nil {
        return nil, nil  // No autoscaling configured
    }

    as := service.Autoscale
    minReplicas := int32(as.Min)
    maxReplicas := int32(as.Max)
    targetCPU := int32(as.TargetCPU)
    targetMemory := int32(as.TargetMemory)

    hpa := &autoscalingv2.HorizontalPodAutoscaler{
        TypeMeta: metav1.TypeMeta{
            APIVersion: "autoscaling/v2",
            Kind:       "HorizontalPodAutoscaler",
        },
        ObjectMeta: metav1.ObjectMeta{
            Name:      service.Name + "-hpa",
            Namespace: "default",
        },
        Spec: autoscalingv2.HorizontalPodAutoscalerSpec{
            ScaleTargetRef: autoscalingv2.CrossVersionObjectReference{
                APIVersion: "apps/v1",
                Kind:       "Deployment",
                Name:       service.Name,
            },
            MinReplicas: &minReplicas,
            MaxReplicas: maxReplicas,
            Metrics: []autoscalingv2.MetricSpec{
                {
                    Type: autoscalingv2.ResourceMetricSourceType,
                    Resource: &autoscalingv2.ResourceMetricSource{
                        Name: corev1.ResourceCPU,
                        Target: autoscalingv2.MetricTarget{
                            Type:               autoscalingv2.UtilizationMetricType,
                            AverageUtilization: &targetCPU,
                        },
                    },
                },
                {
                    Type: autoscalingv2.ResourceMetricSourceType,
                    Resource: &autoscalingv2.ResourceMetricSource{
                        Name: corev1.ResourceMemory,
                        Target: autoscalingv2.MetricTarget{
                            Type:               autoscalingv2.UtilizationMetricType,
                            AverageUtilization: &targetMemory,
                        },
                    },
                },
            },
        },
    }

    return hpa, nil
}
```

---

### Ingress Generator

```go
// pkg/backends/kubernetes/ingress.go
package kubernetes

import (
    networkingv1 "k8s.io/api/networking/v1"
    metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func GenerateIngress(ingress *ast.IngressDecl) (*networkingv1.Ingress, error) {
    ingressClass := "nginx"  // Default
    pathType := networkingv1.PathTypePrefix

    rules := []networkingv1.IngressRule{}

    for path, serviceName := range ingress.Routes {
        rule := networkingv1.IngressRule{
            Host: ingress.Host,
            IngressRuleValue: networkingv1.IngressRuleValue{
                HTTP: &networkingv1.HTTPIngressRuleValue{
                    Paths: []networkingv1.HTTPIngressPath{
                        {
                            Path:     path,
                            PathType: &pathType,
                            Backend: networkingv1.IngressBackend{
                                Service: &networkingv1.IngressServiceBackend{
                                    Name: serviceName,
                                    Port: networkingv1.ServiceBackendPort{
                                        Number: 80,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
        rules = append(rules, rule)
    }

    ingressObj := &networkingv1.Ingress{
        TypeMeta: metav1.TypeMeta{
            APIVersion: "networking.k8s.io/v1",
            Kind:       "Ingress",
        },
        ObjectMeta: metav1.ObjectMeta{
            Name:      ingress.Name,
            Namespace: "default",
            Annotations: map[string]string{
                "kubernetes.io/ingress.class": "nginx",
            },
        },
        Spec: networkingv1.IngressSpec{
            IngressClassName: &ingressClass,
            Rules:            rules,
        },
    }

    // Add TLS if enabled
    if ingress.TLS {
        ingressObj.Spec.TLS = []networkingv1.IngressTLS{
            {
                Hosts:      []string{ingress.Host},
                SecretName: ingress.Name + "-tls",
            },
        }
        ingressObj.ObjectMeta.Annotations["cert-manager.io/cluster-issuer"] = "letsencrypt-prod"
    }

    // Add custom annotations
    for key, value := range ingress.Annotations {
        ingressObj.ObjectMeta.Annotations[key] = value
    }

    return ingressObj, nil
}
```

---

## Success Criteria

By Day 30 of Month 10:

- ✅ StatefulSet generation working (tested with 3 databases)
- ✅ Job/CronJob generation working
- ✅ DaemonSet generation implemented
- ✅ HPA generation working with metrics
- ✅ Ingress generation with TLS support
- ✅ ConfigMap/Secret generation from configs
- ✅ PVC generation for storage resources
- ✅ Health probes on all applicable resources
- ✅ All Month 7 examples generate valid YAML
- ✅ Integration tests passing

**Validation:**
- [ ] `konfiguru compile examples/microservices.kfg` - generates 30+ valid YAML resources
- [ ] `kubectl apply --dry-run=client` - all generated YAML is valid
- [ ] Deploy to test cluster - all resources work correctly

---

## Resources

- **Kubernetes API Reference:** kubernetes.io/docs/reference/kubernetes-api/
- **client-go Documentation:** pkg.go.dev/k8s.io/client-go
- **StatefulSet Tutorial:** kubernetes.io/docs/tutorials/stateful-application/
- **HPA Walkthrough:** kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/

---

**Next:** [Month 11: Dependency Resolution](month-11-dependency-resolution.md)
