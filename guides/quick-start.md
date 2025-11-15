# Quick Start Guide

Welcome to Konfiguru! This guide will get you started in just 30 minutes.

---

## 🎯 What You'll Do Today

1. Set up your development environment (10 min)
2. Understand the learning path structure (10 min)
3. Complete your first daily challenge (10 min)

---

## Step 1: Environment Setup

### Install Go

```bash
# Check if Go is installed
go version

# If not installed, download from https://go.dev/dl/
# Required: Go 1.21 or later
```

### Clone the Repository

```bash
git clone https://github.com/yourusername/konfiguru.git
cd konfiguru
```

### Install Development Tools

```bash
# Install Go language server
go install golang.org/x/tools/gopls@latest

# Install testing tools
go install github.com/stretchr/testify@latest

# Verify installation
gopls version
```

### Set Up Your Editor

**VS Code (Recommended)**
```bash
# Install Go extension
code --install-extension golang.go
```

**IntelliJ/GoLand**
- Install the Go plugin from the marketplace
- Configure GOPATH and GOROOT in settings

---

## Step 2: Understand the Structure

### The Four Learning Levels

Your journey is organized into four progressive levels:

```
🟢 Foundation (Months 1-6)     → Staff Engineer
🟡 Intermediate (Months 7-12)  → Senior Staff Engineer
🟠 Advanced (Months 13-18)     → Staff Architect
🔴 Expert (Months 19-24)       → Principal Engineer
```

### Daily Challenge Format

Each day follows this structure:

```markdown
# Day XXX: [Topic Name]

## Learning Goal
What you'll learn today (1-2 sentences)

## Tasks
1. Task 1 (30-60 min)
2. Task 2 (30-60 min)
3. Task 3 (30-60 min)

## Verification
How to verify your work

## Resources
Links to documentation and tutorials

## Navigation
Links to previous/next days
```

### Time Commitment

**Weekly Schedule:**
- Monday: 2 hours (planning + Task 1)
- Tuesday: 3 hours (complete tasks + tests)
- Wednesday: 1 hour (light review)
- Thursday: 3 hours (deep work)
- Friday: 0.5 hours (weekly review)
- Saturday: 4 hours (catch-up + exploration)
- **Sunday: 0 hours (REST!)**

**Total: 13.5 hours/week** (sustainable!)

---

## Step 3: Start Your First Challenge

### Find Month 1, Day 1

```bash
cd "Problem Statements/01-Lox-Lexer-Go-Fundamentals"
cat Day-001.md
```

Or open directly in GitBook: [Month 1, Day 1](../Problem Statements/01-Lox-Lexer-Go-Fundamentals/Day-001.md)

### Read the Problem Statement

Take 5 minutes to:
- Read the learning goal
- Scan the tasks
- Check the time estimates
- Skim the resources

### Complete Task 1

Follow the instructions in Day-001.md to complete your first task.

**Tips:**
- Don't rush - focus on understanding
- Write tests as you go
- Commit your code frequently
- Ask questions in the community

### Verify Your Work

Each day includes verification steps. Make sure to:
1. Run all tests (`go test ./...`)
2. Check code formatting (`go fmt ./...`)
3. Verify the expected output

---

## Step 4: Join the Community

### Get Support

- **GitHub Discussions**: Ask questions, share progress
- **Discord**: Real-time help (link in README)
- **Office Hours**: Weekly video calls (Saturdays 10am IST)

### Track Your Progress

Create a learning journal:
```bash
mkdir -p journal
echo "# Day 1: $(date)" > journal/day-001.md
```

Document:
- What you learned
- What was challenging
- Questions for later
- Time spent

---

## Daily Workflow

Once you're set up, follow this daily workflow:

### Morning Routine (15 min)
1. Read today's problem statement
2. Review yesterday's code
3. Plan your approach

### Work Session (1-3 hours)
1. Complete tasks sequentially
2. Write tests for each task
3. Run verification steps
4. Commit your work

### Evening Review (10 min)
1. Update your learning journal
2. Note any questions
3. Preview tomorrow's topic

---

## Common Pitfalls to Avoid

### ❌ Don't Skip Days
- Consistency is more important than speed
- 13.5 hours/week is sustainable
- Cramming doesn't work for deep learning

### ❌ Don't Skip Tests
- Tests are not optional
- TDD is a core skill you're learning
- Tests catch errors early

### ❌ Don't Work on Sundays
- Rest is crucial for retention
- Burnout ruins the journey
- Trust the process

### ❌ Don't Jump Ahead
- Each day builds on previous days
- Skipping creates knowledge gaps
- You'll get to advanced topics soon enough

---

## Success Metrics

### Daily
- ✅ Completed all tasks for the day
- ✅ All tests passing
- ✅ Code committed with clear message
- ✅ Learning journal updated

### Weekly
- ✅ 6/7 days completed (rest on Sunday!)
- ✅ Weekly review written
- ✅ Next week's topics previewed
- ✅ Questions posted to community

### Monthly
- ✅ All 30 daily challenges completed
- ✅ Month README checklist finished
- ✅ Monthly reflection written
- ✅ Code pushed to GitHub
- ✅ Portfolio updated

---

## Troubleshooting

### "I'm stuck on a task"
1. Re-read the task description carefully
2. Check the resources section
3. Search GitHub Discussions
4. Ask in Discord
5. Attend office hours

### "This is taking too long"
- That's normal! Estimates are guidelines
- It's okay to take 2-3 days for a daily challenge
- Focus on learning, not speed
- You'll get faster with practice

### "I don't understand the concept"
1. Read the background resources
2. Watch related YouTube videos
3. Try explaining it to someone else
4. Break it into smaller pieces
5. Ask for help

### "I want to go faster"
- Complete the daily challenge first
- Then explore the "Deep Dive" sections
- Contribute additional test cases
- Help others in the community
- Build related side projects

---

## Next Steps

### Today
- [x] Set up development environment
- [x] Understand the structure
- [ ] Complete Month 1, Day 1
- [ ] Join the Discord community

### This Week
- [ ] Complete Days 1-5 of Month 1
- [ ] Write your first learning journal entry
- [ ] Introduce yourself in Discord
- [ ] Set up weekly review schedule

### This Month
- [ ] Complete all 30 days of Month 1
- [ ] Build complete Lox lexer
- [ ] Write Month 1 reflection
- [ ] Preview Month 2 topics

---

## Frequently Asked Questions

### Do I need prior compiler experience?
**No!** This journey starts from scratch. If you know basic programming, you're ready.

### What if I'm not familiar with Go?
**Perfect!** Month 1 teaches Go fundamentals while building the lexer. You'll learn by doing.

### Can I skip to Month 7 (Konfiguru DSL)?
**Not recommended.** Months 1-6 build essential foundations. But if you've built compilers before, you could start at Month 7 with caution.

### How do I know if I'm on track?
Check the [Learning Path Overview](learning-path-overview.md) for milestones and expected progress.

### What if I fall behind?
- Don't panic! Life happens.
- Catch up on weekends
- Skip the "Deep Dive" sections temporarily
- The 24-month timeline has buffer built in

### Can I do this full-time?
**Not recommended.** The schedule is designed for sustainable learning alongside work. Going faster often leads to burnout.

---

## Resources for Today

### Go Language
- [Official Go Tour](https://go.dev/tour/)
- [Go by Example](https://gobyexample.com/)
- [Effective Go](https://go.dev/doc/effective_go)

### Compiler Basics
- [Crafting Interpreters (Free Online)](https://craftinginterpreters.com/)
- [Compiler Design Course (Stanford CS143)](https://www.youtube.com/playlist?list=PLoCMsyE1cvdUZRe5q7rFpUr5R_H8AWWCu)

### Community
- [Discord Server](https://discord.gg/konfiguru)
- [GitHub Discussions](https://github.com/yourusername/konfiguru/discussions)
- [Twitter Community](https://twitter.com/konfiguru)

---

## Motivation

**Remember why you started:**
- 🎯 Build a unique portfolio project
- 📈 Level up to Principal Engineer
- 💰 Increase salary by ₹30-45 LPA
- 🧠 Master computer science fundamentals
- 🚀 Create something people will use

**24 months from now, you'll be:**
- A compiler expert
- A Kubernetes/Terraform/CloudFormation specialist
- An AI/ML integration practitioner
- A Principal Engineer candidate
- An open source leader

**But today, just focus on Day 1.**

One day at a time. You've got this! 🚀

---

## Ready to Start?

### Your First Challenge Awaits

👉 **[Go to Month 1, Day 1](../Problem Statements/01-Lox-Lexer-Go-Fundamentals/Day-001.md)**

---

*Last Updated: 2024-11-15*
*Questions? Post in [GitHub Discussions](https://github.com/yourusername/konfiguru/discussions)*
