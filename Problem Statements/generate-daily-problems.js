#!/usr/bin/env node

/**
 * Daily Problem Statement Generator for Konfigura
 *
 * Generates 730 daily problem statements (2 years) based on the implementation plan
 */

const fs = require('fs');
const path = require('path');

// Month structure from the implementation plan
const monthStructure = [
  // Phase 1: Foundation (Months 1-6)
  {
    month: 1,
    title: "Lexer + Minimal Parser + First K8s Output",
    weeks: [
      {
        week: 1,
        title: "Project Setup & K8s Basics",
        days: [
          { day: 1, title: "Environment Setup", topic: "Dev tools, terminal, tracking", completed: true },
          { day: 2, title: "Kubernetes Basics - Pods", topic: "Deploy first Pod, understand lifecycle", completed: true },
          { day: 3, title: "DSL Syntax Design Brainstorming", topic: "Design Konfigura syntax, create examples" },
          { day: 4, title: "Understanding Tokenization (Lexer Theory)", topic: "Learn how lexers work, token types" },
          { day: 5, title: "NestJS Project Setup", topic: "Initialize NestJS project, module structure" },
          { day: 6, title: "First Token - Building the Token Class", topic: "Create Token interface and types" },
          { day: 7, title: "Week 1 Review & Integration", topic: "Review progress, integrate learnings" }
        ]
      },
      {
        week: 2,
        title: "Lexer Implementation - Part 1",
        days: [
          { day: 8, title: "Lexer Module Setup", topic: "Create lexer module in NestJS" },
          { day: 9, title: "Tokenizing Keywords", topic: "Implement keyword recognition" },
          { day: 10, title: "Tokenizing Identifiers", topic: "Implement identifier tokenization" },
          { day: 11, title: "Tokenizing Strings", topic: "Handle quoted strings" },
          { day: 12, title: "Tokenizing Numbers", topic: "Parse numeric literals" },
          { day: 13, title: "Single-Character Tokens", topic: "Implement {, }, :, , tokens" },
          { day: 14, title: "Week 2 Review & Testing", topic: "Write comprehensive lexer tests" }
        ]
      },
      {
        week: 3,
        title: "Lexer Implementation - Part 2",
        days: [
          { day: 15, title: "Whitespace Handling", topic: "Skip whitespace, track line numbers" },
          { day: 16, title: "Comment Support", topic: "Implement // and /* */ comments" },
          { day: 17, title: "Error Recovery", topic: "Handle invalid characters gracefully" },
          { day: 18, title: "Location Tracking", topic: "Track line and column numbers" },
          { day: 19, title: "Lexer Testing Suite", topic: "Write 50+ lexer test cases" },
          { day: 20, title: "Lexer Performance", topic: "Profile and optimize lexer" },
          { day: 21, title: "Week 3 Review", topic: "Complete lexer review" }
        ]
      },
      {
        week: 4,
        title: "Basic Parser + First K8s Output",
        days: [
          { day: 22, title: "Parser Theory - AST Basics", topic: "Understand Abstract Syntax Trees" },
          { day: 23, title: "PEG.js Grammar Setup", topic: "Write first PEG.js grammar rules" },
          { day: 24, title: "Parsing Service Declaration", topic: "Parse 'service Name { }'" },
          { day: 25, title: "Parsing Properties", topic: "Parse key: value pairs" },
          { day: 26, title: "K8s Backend Setup", topic: "Create K8s code generator" },
          { day: 27, title: "Generate First Pod YAML", topic: "Output valid Pod manifest" },
          { day: 28, title: "Deploy Generated YAML to minikube", topic: "End-to-end test" },
          { day: 29, title: "Month 1 Integration Testing", topic: "Full pipeline test" },
          { day: 30, title: "Month 1 Review & Celebration", topic: "Reflect, document, celebrate!" }
        ]
      }
    ]
  },
  {
    month: 2,
    title: "Ports, Services & Networking",
    weeks: [
      {
        week: 1,
        title: "Learn K8s Services",
        days: [
          { day: 31, title: "K8s Services Introduction", topic: "Understand Service types" },
          { day: 32, title: "Deploy Service Manually", topic: "Create ClusterIP Service" },
          { day: 33, title: "LoadBalancer Services", topic: "Expose apps externally" },
          { day: 34, title: "Service Discovery", topic: "DNS and selectors" },
          { day: 35, title: "Port Mapping Deep Dive", topic: "Port vs TargetPort vs NodePort" },
          { day: 36, title: "Labels and Selectors", topic: "How Services find Pods" },
          { day: 37, title: "Week 1 Review", topic: "Services practice and testing" }
        ]
      },
      {
        week: 2,
        title: "Add Port Support to DSL",
        days: [
          { day: 38, title: "Update Grammar for Ports", topic: "Add port property to syntax" },
          { day: 39, title: "Parse Port Property", topic: "Update parser for port" },
          { day: 40, title: "Generate Deployment (not Pod)", topic: "Switch from Pod to Deployment" },
          { day: 41, title: "Container Ports in Deployment", topic: "Add containerPort to spec" },
          { day: 42, title: "Generate Service Manifest", topic: "Create Service YAML" },
          { day: 43, title: "Link Service to Deployment", topic: "Proper selector configuration" },
          { day: 44, title: "Week 2 Review & Testing", topic: "Test port mapping end-to-end" }
        ]
      },
      {
        week: 3,
        title: "Type Checking & Validation",
        days: [
          { day: 45, title: "Port Validation Rules", topic: "Validate port range 1-65535" },
          { day: 46, title: "Image Format Validation", topic: "Regex for image:tag format" },
          { day: 47, title: "Required Fields Validation", topic: "Ensure image is specified" },
          { day: 48, title: "Error Messages", topic: "User-friendly error reporting" },
          { day: 49, title: "Fix Suggestions", topic: "AI-like helpful hints" },
          { day: 50, title: "Validation Test Suite", topic: "Test all validation rules" },
          { day: 51, title: "Week 3 Review", topic: "Complete validation system" }
        ]
      },
      {
        week: 4,
        title: "Testing & Deployment",
        days: [
          { day: 52, title: "Integration Test Setup", topic: "Configure test environment" },
          { day: 53, title: "BDD Scenarios with Cucumber", topic: "Write Gherkin features" },
          { day: 54, title: "Deploy to minikube", topic: "Test real deployments" },
          { day: 55, title: "Network Testing", topic: "Verify service connectivity" },
          { day: 56, title: "CLI Improvements", topic: "Better command-line interface" },
          { day: 57, title: "Documentation", topic: "Write user guide for Month 2 features" },
          { day: 58, title: "Month 2 Review", topic: "Reflect and plan Month 3" },
          { day: 59, title: "Portfolio Update", topic: "Update README and demos" },
          { day: 60, title: "Celebrate Month 2!", topic: "Two months down! 🎉" }
        ]
      }
    ]
  },
  // Continue with abbreviated structure for remaining months...
  {
    month: 3,
    title: "Type System & Validation",
    days: 30,
    topics: ["Custom types", "Type inference", "Advanced validation", "Resource limits", "Type error messages"]
  },
  {
    month: 4,
    title: "Intermediate Representation (IR)",
    days: 30,
    topics: ["IR design", "Platform-agnostic representation", "Dependency graphs", "IR optimization", "Backend refactoring"]
  },
  {
    month: 5,
    title: "Multi-Target (Terraform)",
    days: 30,
    topics: ["Terraform basics", "HCL generation", "AWS ECS", "GCP Cloud Run", "Multi-backend architecture"]
  },
  {
    month: 6,
    title: "Advanced K8s (StatefulSets, HPA, Databases)",
    days: 30,
    topics: ["StatefulSets", "HPA", "Persistent volumes", "Database integration", "Production configs"]
  },
  {
    month: 7,
    title: "AI Integration (Vercel AI SDK)",
    days: 30,
    topics: ["Vercel AI SDK", "OpenAI integration", "Prompt engineering", "Suggestion engine", "Streaming responses"]
  },
  {
    month: 8,
    title: "MCP Server + Deep Compiler Integration",
    days: 30,
    topics: ["Model Context Protocol", "Tool calling", "Compiler introspection", "Interactive AI", "MCP tools"]
  },
  {
    month: 9,
    title: "Dataset Collection + Model Fine-Tuning",
    days: 30,
    topics: ["GitHub scraping", "Data preprocessing", "LoRA fine-tuning", "Model evaluation", "Training pipelines"]
  },
  {
    month: 10,
    title: "Natural Language → DSL Translation",
    days: 30,
    topics: ["NL parsing", "DSL generation", "Interactive refinement", "Confidence scoring", "Validation pipeline"]
  },
  {
    month: 11,
    title: "Documentation & Polish",
    days: 30,
    topics: ["VitePress docs", "API reference", "Video tutorials", "Migration guides", "Blog posts"]
  },
  {
    month: 12,
    title: "CI/CD Integrations",
    days: 30,
    topics: ["GitHub Actions", "GitLab CI", "Pre-commit hooks", "VS Code extension", "Docker images"]
  },
  {
    month: 13,
    title: "Open Source Launch",
    days: 30,
    topics: ["Public release", "CHANGELOG", "CONTRIBUTING guide", "npm publish", "Community launch"]
  },
  {
    month: 14,
    title: "Community Growth",
    days: 30,
    topics: ["Issue triage", "PR reviews", "User support", "Case studies", "Conference proposals"]
  },
  {
    month: 15,
    title: "Advanced AI Features",
    days: 30,
    topics: ["Config migration", "Security scanning", "Cost optimization", "Performance prediction", "Advanced suggestions"]
  },
  {
    month: 16,
    title: "Ecosystem & Plugin System",
    days: 30,
    topics: ["Plugin architecture", "Community libraries", "Package registry", "Import system", "Composition"]
  },
  {
    month: 17,
    title: "Enterprise Features",
    days: 30,
    topics: ["Policy as code", "RBAC", "Audit logging", "Team collaboration", "Compliance"]
  },
  {
    month: 18,
    title: "Scale & Performance",
    days: 30,
    topics: ["Incremental compilation", "Parallel processing", "Caching", "Benchmarking", "Optimization"]
  },
  {
    month: 19,
    title: "Content Creation",
    days: 30,
    topics: ["Blog series", "YouTube channel", "Conference talks", "Technical writing", "Academic paper"]
  },
  {
    month: 20,
    title: "Portfolio Positioning",
    days: 30,
    topics: ["Case studies", "Architecture diagrams", "Performance metrics", "Testimonials", "Portfolio polish"]
  },
  {
    month: 21,
    title: "Interview Preparation",
    days: 30,
    topics: ["Resume update", "Interview prep", "System design", "Compiler questions", "Coding practice"]
  },
  {
    month: 22,
    title: "Networking & Applications",
    days: 30,
    topics: ["Conference networking", "Job applications", "Recruiter outreach", "Portfolio reviews", "Cover letters"]
  },
  {
    month: 23,
    title: "Interview Circuit",
    days: 30,
    topics: ["Phone screens", "Technical interviews", "System design rounds", "Behavioral interviews", "Offer negotiation"]
  },
  {
    month: 24,
    title: "Career Transition",
    days: 30,
    topics: ["Final interviews", "Offer selection", "Notice period", "Knowledge transfer", "Celebration! 🎉"]
  }
];

// Template generator
function generateDayTemplate(dayNum, date, title, topic, month, monthTitle) {
  const tomorrow = dayNum + 1;
  const tomorrowDay = tomorrow <= 730 ? `Day-${String(tomorrow).padStart(3, '0')}.md` : "Completion!";

  return `# Day ${String(dayNum).padStart(3, '0')}: ${title}

## 📅 Date: ${date}

## 🎯 Daily Goal

${topic}

## 📚 Learning Objectives

By the end of today, you will:
- [Learning objective 1]
- [Learning objective 2]
- [Learning objective 3]

## 🔗 Prerequisites

- Completed Day ${dayNum - 1} (if applicable)
- [Other prerequisites]

## ❓ Problem Statement

[Describe the problem this day solves. Why is this important for building Konfigura?]

## 📋 Step-by-Step Tasks

### Task 1: [Task Name] (XX min)

**Step 1.1: [Substep]**

\`\`\`bash
# Commands or code here
\`\`\`

**Step 1.2: [Substep]**

[Instructions]

---

### Task 2: [Task Name] (XX min)

**Step 2.1: [Substep]**

[Instructions]

---

### Task 3: [Task Name] (XX min)

**Step 3.1: [Substep]**

[Instructions]

---

## ✅ Verification

Run these checks:

\`\`\`bash
# Verification commands
\`\`\`

## 🎉 Success Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]
- [ ] Committed work to git
- [ ] Updated Linear/devActivity
- [ ] Documented learning in Obsidian

## 🔮 Tomorrow's Preview

**${tomorrow <= 730 ? `Day ${tomorrow}: [Next Topic]` : 'Project Complete!'}**

Tomorrow, you'll:
- [Preview 1]
- [Preview 2]
- [Preview 3]

## 📝 Reflection Prompts

1. **What was the biggest challenge today?**

2. **What did you learn that surprised you?**

3. **How does this connect to the bigger picture of Konfigura?**

4. **What would you do differently if you could redo today?**

5. **On a scale of 1-10, how confident are you with today's topic?**

---

## 🎯 Daily Stats

**Time Investment:** ~X hours
**Commits:** X
**Lines of Code:** X
**Tests Written:** X
**Kubernetes Knowledge:** X% → X%
**Compiler Knowledge:** X% → X%
**AI/ML Knowledge:** X% → X%

---

## 📚 Resources

- [Resource 1](link)
- [Resource 2](link)
- [Resource 3](link)

---

**Month ${month}/24: ${monthTitle}**

**Progress:** Day ${dayNum}/730 (${Math.round((dayNum/730)*100)}% complete)

Keep building! 🚀
`;
}

// Generate all days
function generateAllDays() {
  let dayCounter = 1;
  const startDate = new Date('2025-11-02');

  for (const monthData of monthStructure) {
    const monthNum = monthData.month;
    const monthDir = path.join(__dirname, `Month-${String(monthNum).padStart(2, '0')}`);

    // Create month directory
    if (!fs.existsSync(monthDir)) {
      fs.mkdirSync(monthDir, { recursive: true });
    }

    if (monthData.weeks) {
      // Detailed month structure (Months 1-2)
      for (const week of monthData.weeks) {
        for (const dayData of week.days) {
          // Skip if already completed
          if (dayData.completed) {
            dayCounter++;
            continue;
          }

          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + dayCounter - 1);
          const dateStr = currentDate.toISOString().split('T')[0];

          const filename = `Day-${String(dayCounter).padStart(3, '0')}.md`;
          const filepath = path.join(monthDir, filename);

          const content = generateDayTemplate(
            dayCounter,
            dateStr,
            dayData.title,
            dayData.topic,
            monthNum,
            monthData.title
          );

          fs.writeFileSync(filepath, content);
          console.log(`Generated: ${filename}`);

          dayCounter++;
        }
      }
    } else {
      // Abbreviated month structure (Months 3+)
      const daysInMonth = monthData.days || 30;
      const topics = monthData.topics || [];

      for (let i = 0; i < daysInMonth; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayCounter - 1);
        const dateStr = currentDate.toISOString().split('T')[0];

        const dayInMonth = i + 1;
        const weekNum = Math.floor(i / 7) + 1;
        const topicIndex = Math.floor((i / daysInMonth) * topics.length);
        const topic = topics[topicIndex] || `${monthData.title} - Day ${dayInMonth}`;

        const filename = `Day-${String(dayCounter).padStart(3, '0')}.md`;
        const filepath = path.join(monthDir, filename);

        const title = `${monthData.title} - Week ${weekNum}, Day ${dayInMonth}`;

        const content = generateDayTemplate(
          dayCounter,
          dateStr,
          title,
          topic,
          monthNum,
          monthData.title
        );

        fs.writeFileSync(filepath, content);
        console.log(`Generated: ${filename}`);

        dayCounter++;
      }
    }
  }

  console.log(`\n✅ Generated ${dayCounter - 1} daily problem statements!`);
}

// Main execution
console.log('🚀 Generating Daily Problem Statements for Konfigura...\n');
generateAllDays();
console.log('\n🎉 All daily problem statements generated successfully!');
console.log('\nNext steps:');
console.log('1. Review generated files');
console.log('2. Customize templates as needed');
console.log('3. Start with Day-001.md');
console.log('4. Build Konfigura day by day!');
