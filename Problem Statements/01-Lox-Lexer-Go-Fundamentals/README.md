# Month 1: Lox Lexer & Go Fundamentals

Welcome to Month 1 of your 24-month journey to Platform Architect expertise! This month lays the foundation for everything that follows. You'll learn Go fundamentals while building a complete lexical analyzer (lexer) for the Lox programming language.

## Table of Contents

- [Month Overview](#month-overview)
- [What You'll Build](#what-youll-build)
- [Learning Goals](#learning-goals)
- [Weekly Breakdown](#weekly-breakdown)
- [Prerequisites](#prerequisites)
- [Time Commitment](#time-commitment)
- [Primary Resources](#primary-resources)
- [Success Criteria](#success-criteria)
- [Getting Started](#getting-started)
- [Navigation](#navigation)

---

## Month Overview

**Focus Areas:**
- Go programming fundamentals (syntax, types, testing, packages)
- Lexical analysis theory and implementation
- Test-Driven Development (TDD) workflow
- Building production-quality code from day one

**Primary Deliverable:**
A complete, tested Lox lexer written in Go that can tokenize all valid Lox source code.

**Why Start Here:**
Following "Crafting Interpreters" by Robert Nystrom, you'll build a lexer for Lox - a simple but complete programming language. This teaches fundamental compiler concepts you'll apply to Konfiguru later. Starting with a lexer gives immediate, testable results while learning Go.

**Month Timeline:**
- **Weeks 1-2:** Core lexer implementation
- **Week 3:** Integration testing and REPL
- **Week 4:** Polish, documentation, and Month 2 preparation

---

## What You'll Build

By the end of Month 1, you'll have a complete Lox lexer with:

### Code Statistics
- **~300 lines** of production Go code
- **~400 lines** of comprehensive test code
- **50+ test cases** covering all token types
- **15 Lox keywords** recognized
- **30+ token types** supported

### Features Implemented

#### 1. Token Types
The lexer recognizes all Lox token categories:

**Single-character tokens:**
```
( ) { } , . - + ; / *
```

**One or two character tokens:**
```
! != = == > >= < <=
```

**Literals:**
- Strings: `"hello world"`
- Numbers: `123`, `45.67`
- Identifiers: `variable_name`, `count`

**Keywords (15 total):**
```go
and, class, else, false, for, fun, if, nil, or,
print, return, super, this, true, var, while
```

**Special tokens:**
- `EOF` - End of file marker
- `COMMENT` - Single-line comments (`// comment`)

#### 2. Core Components

**Scanner struct:**
```go
type Scanner struct {
    source  string
    tokens  []Token
    start   int     // Start of current lexeme
    current int     // Current character position
    line    int     // Current line number
}
```

**Token struct:**
```go
type Token struct {
    Type    TokenType
    Lexeme  string
    Literal interface{}
    Line    int
}
```

#### 3. Error Handling
- Line-accurate error reporting
- Graceful handling of unterminated strings
- Detection of invalid characters
- Comprehensive error messages

#### 4. Test Infrastructure
- Unit tests for each token type
- Edge case testing (empty input, EOF, etc.)
- Error condition testing
- Integration tests with real Lox code samples

---

## Learning Goals

### Go Programming Skills

**By Week 1:**
- [ ] Understand Go package structure and imports
- [ ] Write and run basic Go programs
- [ ] Use Go's built-in testing framework
- [ ] Work with structs and methods
- [ ] Handle string manipulation

**By Week 2:**
- [ ] Master Go slices and maps
- [ ] Implement rune-based string processing
- [ ] Write effective unit tests
- [ ] Use interfaces for extensibility
- [ ] Handle errors idiomatically

**By Week 3:**
- [ ] Build a simple REPL (Read-Eval-Print Loop)
- [ ] Organize code into packages
- [ ] Write table-driven tests
- [ ] Use Go's documentation conventions
- [ ] Benchmark performance-critical code

**By Week 4:**
- [ ] Refactor for maintainability
- [ ] Write comprehensive documentation
- [ ] Follow Go code review best practices
- [ ] Prepare for parser implementation

### Compiler Theory

**Lexical Analysis:**
- [ ] Understand lexer role in compilation pipeline
- [ ] Implement maximal munch principle
- [ ] Handle lookahead for multi-character tokens
- [ ] Build finite state machines for token recognition
- [ ] Manage source position tracking (line numbers)

**Token Design:**
- [ ] Design token representation
- [ ] Distinguish lexemes from tokens
- [ ] Store literal values efficiently
- [ ] Handle reserved words vs identifiers

**Error Recovery:**
- [ ] Report errors without crashing
- [ ] Continue scanning after errors
- [ ] Provide helpful error messages with line numbers

---

## Weekly Breakdown

### Week 1: Setup & Core Scanner (Days 1-7)

**Theme:** Foundation and Basic Tokenization

| Day | Topic | Key Deliverable |
|-----|-------|-----------------|
| **Day 1** | Go Setup & Project Structure | Go installed, hello world working |
| **Day 2** | Token Types & Data Structures | Token and TokenType definitions |
| **Day 3** | Scanner Skeleton & Single-Char Tokens | Scanner struct, `(){},.;+-*/` tokens |
| **Day 4** | Two-Character Operators | `!=`, `==`, `<=`, `>=` with lookahead |
| **Day 5** | Whitespace & Comments | Skip whitespace, handle `//` comments |
| **Day 6** | Error Handling | Report errors with line numbers |
| **Day 7** | Week 1 Review & Test Coverage | 20+ tests passing |

**Skills Gained:**
- Go basics (syntax, types, functions)
- File I/O and string processing
- Writing table-driven tests
- Implementing lookahead logic

**Code Milestone:** ~150 lines production code, ~150 lines test code

---

### Week 2: Literals & Keywords (Days 8-14)

**Theme:** Complex Token Recognition

| Day | Topic | Key Deliverable |
|-----|-------|-----------------|
| **Day 8** | String Literals Start | Basic string scanning (`"..."`) |
| **Day 9** | String Literal Edge Cases | Multi-line strings, unterminated strings |
| **Day 10** | Number Literals - Integers | Integer scanning (`123`) |
| **Day 11** | Number Literals - Decimals | Decimal scanning (`45.67`) |
| **Day 12** | Identifiers & Reserved Words | Identifier scanning, keyword map |
| **Day 13** | Keyword Implementation | All 15 keywords recognized |
| **Day 14** | Week 2 Review & Refactoring | 40+ tests passing |

**Skills Gained:**
- Rune-based text processing
- Number parsing in Go
- Map usage for keyword lookup
- Handling multi-line constructs
- Edge case testing

**Code Milestone:** ~250 lines production code, ~300 lines test code

---

### Week 3: Integration & REPL (Days 15-21)

**Theme:** Real-World Usage and Testing

| Day | Topic | Key Deliverable |
|-----|-------|-----------------|
| **Day 15** | Complete Scanner Integration | Full token scanning working |
| **Day 16** | Integration Tests - Basic | Test real Lox code snippets |
| **Day 17** | Integration Tests - Advanced | Complex programs, error cases |
| **Day 18** | REPL Foundation | Interactive prompt working |
| **Day 19** | REPL Enhancements | Multi-line input, history |
| **Day 20** | Package Organization | Clean package structure |
| **Day 21** | Week 3 Review & Documentation | 50+ tests passing |

**Skills Gained:**
- Building interactive programs
- Reading from stdin in Go
- Package design and organization
- Integration testing strategies
- Writing godoc comments

**Code Milestone:** ~300 lines production code, ~400 lines test code

---

### Week 4: Polish & Preparation (Days 22-30)

**Theme:** Production Quality and Month 2 Prep

| Day | Topic | Key Deliverable |
|-----|-------|-----------------|
| **Day 22** | Performance Optimization | Benchmark critical paths |
| **Day 23** | Code Coverage Analysis | 90%+ test coverage |
| **Day 24** | Edge Case Hardening | Handle all error conditions |
| **Day 25** | Documentation Polish | Complete godoc, README |
| **Day 26** | Code Review & Refactoring | Clean, idiomatic Go code |
| **Day 27** | Parser Preview & Study | Understand AST concepts |
| **Day 28** | Month 1 Retrospective | Document learnings |
| **Day 29** | Kubernetes Introduction | CKA course kickoff |
| **Day 30** | Month 2 Planning | Ready for parser work |

**Skills Gained:**
- Go performance profiling
- Code coverage tools
- Refactoring techniques
- AST fundamentals
- Kubernetes basics (preview)

**Code Milestone:** Production-ready lexer, comprehensive test suite

---

## Prerequisites

### Required Knowledge
- Basic programming experience (any language)
- Understanding of strings, arrays, loops, conditionals
- Command-line comfort (navigating directories, running commands)
- Git basics (clone, commit, push)

### Required Tools
- **Go 1.21+** - [Install Guide](https://go.dev/doc/install)
- **Git** - Version control
- **Text Editor/IDE** - VS Code with Go extension recommended
- **Terminal** - For running Go commands and tests

### Recommended Background
- Familiarity with basic data structures (arrays, maps)
- Understanding of functions and recursion
- Experience with any compiled language (C, Java, Rust) is helpful but not required

### Pre-Month 1 Reading
1. [A Tour of Go](https://go.dev/tour/) - Complete basics section
2. [Crafting Interpreters - Chapter 1](https://craftinginterpreters.com/introduction.html) - Introduction
3. [Crafting Interpreters - Chapter 4](https://craftinginterpreters.com/scanning.html) - Scanning chapter

---

## Time Commitment

**Weekly Schedule: 13.5 hours total**

| Day | Time | Duration | Focus |
|-----|------|----------|-------|
| **Monday** | 6:00-8:00 AM | 2 hours | Implementation work |
| **Tuesday** | 6:00-9:00 AM | 3 hours | Deep work, complex features |
| **Wednesday** | 6:00-7:00 AM | 1 hour | Testing, quick tasks |
| **Thursday** | 6:00-9:00 AM | 3 hours | Deep work, integration |
| **Friday** | 6:00-6:30 AM | 0.5 hours | Weekly review, planning |
| **Saturday** | 8:00 AM-12:00 PM | 4 hours | Deep work, catch-up |
| **Sunday** | REST | 0 hours | Sacred rest day |

### Daily Workflow

**Morning Coding Sessions (Weekdays):**
1. **Review** (5 min) - Read problem statement, check tests
2. **Implement** (70-80% of time) - Write code, TDD cycle
3. **Test** (10-15% of time) - Run tests, verify functionality
4. **Document** (5-10% of time) - Update notes, commit changes

**Saturday Deep Work:**
1. **Review week** (30 min) - What worked, what didn't
2. **Deep implementation** (2.5 hours) - Complex features
3. **Integration testing** (1 hour) - End-to-end testing
4. **Planning ahead** (30 min) - Prep for next week

**Friday Weekly Review:**
1. **Test all code** (10 min)
2. **Update progress** (10 min)
3. **Plan next week** (10 min)

### Sustainability Tips
- **Never skip Sunday rest** - This is a marathon, not a sprint
- **Front-load difficult work** - Tuesday/Thursday/Saturday for complex tasks
- **Quick wins on Wednesday** - Build momentum with tests
- **Consistency over intensity** - 13.5 hours every week beats 40-hour sprints

---

## Primary Resources

### Essential Reading

**1. Crafting Interpreters - Chapters 1-4**
- [Chapter 1: Introduction](https://craftinginterpreters.com/introduction.html)
- [Chapter 2: A Map of the Territory](https://craftinginterpreters.com/a-map-of-the-territory.html)
- [Chapter 3: The Lox Language](https://craftinginterpreters.com/the-lox-language.html)
- [Chapter 4: Scanning](https://craftinginterpreters.com/scanning.html)

**NOTE:** The book uses Java, you're using Go. Focus on concepts, not direct translation.

**2. Go Documentation**
- [A Tour of Go](https://go.dev/tour/) - Interactive tutorial
- [Go by Example](https://gobyexample.com/) - Practical examples
- [Effective Go](https://go.dev/doc/effective_go) - Idiomatic patterns
- [Go Testing](https://go.dev/doc/tutorial/add-a-test) - Testing guide

### Supplementary Resources

**Go Learning:**
- [Go Playground](https://go.dev/play/) - Test code snippets online
- [Go Standard Library](https://pkg.go.dev/std) - Official package docs
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments) - Style guide

**Compiler Theory:**
- [Stanford CS143 Lectures](https://www.youtube.com/playlist?list=PLoCMsyE1cvdUZRe1udlyjpzTww1U5olL2) - Compiler theory (optional)
- [Lexical Analysis Wikipedia](https://en.wikipedia.org/wiki/Lexical_analysis) - Quick reference

**Community:**
- [r/golang](https://reddit.com/r/golang) - Go community
- [Gopher Slack](https://invite.slack.golangbridge.org/) - Real-time help
- [Go Forum](https://forum.golangbridge.org/) - Q&A

---

## Success Criteria

### Technical Milestones

**Week 1 Success:**
- [ ] Go environment working (run `go version` successfully)
- [ ] Can create, build, and run Go programs
- [ ] Scanner recognizes single-character tokens
- [ ] At least 15 passing tests
- [ ] Comfortable with basic Go syntax

**Week 2 Success:**
- [ ] All literal types implemented (strings, numbers, identifiers)
- [ ] All 15 keywords recognized correctly
- [ ] 40+ tests passing
- [ ] Understand Go's testing framework
- [ ] Can debug Go programs effectively

**Week 3 Success:**
- [ ] Complete lexer working on real Lox code
- [ ] Interactive REPL functional
- [ ] 50+ comprehensive tests passing
- [ ] Code organized in clean packages
- [ ] Documentation written

**Month 1 Complete:**
- [ ] **~300 lines** production code written
- [ ] **~400 lines** test code written
- [ ] **50+ tests** all passing
- [ ] **All 30+ token types** correctly recognized
- [ ] **Error handling** working with line numbers
- [ ] **REPL** running interactively
- [ ] **90%+ test coverage**
- [ ] **Code reviewed** and refactored
- [ ] **Documentation** complete

### Knowledge Checkpoints

**Can you answer YES to these?**

**Go Fundamentals:**
- [ ] I can write idiomatic Go code
- [ ] I understand Go's type system (structs, interfaces, slices, maps)
- [ ] I can write effective tests using Go's testing package
- [ ] I know how to organize Go code into packages
- [ ] I can read and understand Go's standard library

**Lexical Analysis:**
- [ ] I understand what a lexer does in compilation
- [ ] I can explain the difference between lexemes and tokens
- [ ] I know how to implement lookahead for multi-character tokens
- [ ] I understand maximal munch principle
- [ ] I can design token representations for a language

**Software Engineering:**
- [ ] I practice TDD (tests before implementation)
- [ ] I write clear, documented code
- [ ] I can refactor code for readability
- [ ] I make small, incremental commits
- [ ] I understand error handling patterns

### Confidence Level

Rate yourself (1-5, target: 4+):

- **Go basics:** ___ / 5
- **Lexical analysis theory:** ___ / 5
- **TDD workflow:** ___ / 5
- **Reading compiler literature:** ___ / 5
- **Debugging skills:** ___ / 5

**If any score is below 4:** Spend extra time in that area before moving to Month 2.

---

## Getting Started

### Day 1 Quick Start

1. **Clone this repository** (if not already done):
   ```bash
   cd /home/bhargav/Documents/Side-Projects/konfiguru
   ```

2. **Navigate to Month 1:**
   ```bash
   cd "docs/Problem Statements/01-Lox-Lexer-Go-Fundamentals"
   ```

3. **Read Day 1 problem statement:**
   ```bash
   cat Day-001.md
   ```

4. **Create workspace** (if not exists):
   ```bash
   mkdir -p /home/bhargav/go/src/konfiguru
   ```

5. **Start coding!**
   - Follow Day 1 instructions
   - Run tests frequently: `go test ./...`
   - Commit often: `git add . && git commit -m "feat: implement token types"`

### Daily Routine

**Each morning:**
1. Read today's problem statement
2. Review yesterday's code
3. Write tests first (TDD)
4. Implement feature
5. Verify all tests pass
6. Commit changes
7. Update Obsidian notes

**Each Friday:**
1. Review week's progress
2. Run full test suite
3. Check test coverage: `go test -cover ./...`
4. Plan next week
5. Commit all changes

---

## Navigation

### Problem Statements

**Daily Problem Statements:**
- [Day 1: Go Setup and Project Structure](./Day-001.md)
- [Day 2: Token Types and Data Structures](./Day-002.md)
- [Day 3: Scanner Skeleton and Single-Character Tokens](./Day-003.md)
- [Day 4: Two-Character Operators and Lookahead](./Day-004.md)
- [Day 5: Whitespace and Comments](./Day-005.md)
- [Day 6: Error Handling and Reporting](./Day-006.md)
- [Day 7: Week 1 Review and Test Coverage](./Day-007.md)
- [Day 8: String Literals - Basic Implementation](./Day-008.md)
- [Day 9: String Literals - Edge Cases and Multi-line](./Day-009.md)
- [Day 10: Number Literals - Integers](./Day-010.md)
- [Day 11: Number Literals - Decimals and Validation](./Day-011.md)
- [Day 12: Identifiers and Reserved Words](./Day-012.md)
- [Day 13: Keyword Implementation and Recognition](./Day-013.md)
- [Day 14: Week 2 Review and Refactoring](./Day-014.md)
- [Day 15: Complete Scanner Integration](./Day-015.md)
- [Day 16: Integration Tests - Basic Lox Programs](./Day-016.md)
- [Day 17: Integration Tests - Advanced Cases](./Day-017.md)
- [Day 18: REPL Foundation](./Day-018.md)
- [Day 19: REPL Enhancements](./Day-019.md)
- [Day 20: Package Organization and Structure](./Day-020.md)
- [Day 21: Week 3 Review and Documentation](./Day-021.md)
- [Day 22: Performance Optimization](./Day-022.md)
- [Day 23: Code Coverage and Quality Metrics](./Day-023.md)
- [Day 24: Edge Case Hardening](./Day-024.md)
- [Day 25: Documentation and Code Comments](./Day-025.md)
- [Day 26: Code Review and Refactoring](./Day-026.md)
- [Day 27: Parser Preview and AST Study](./Day-027.md)
- [Day 28: Month 1 Retrospective](./Day-028.md)
- [Day 29: Kubernetes Introduction](./Day-029.md)
- [Day 30: Month 2 Planning and Preparation](./Day-030.md)

### Quick Navigation

- **Previous:** [Problem Statements Home](../)
- **Next:** [Month 2: Lox Parser & AST](../02-Lox-Parser-AST/README.md)
- **Project Root:** [Konfiguru Repository](../../../)
- **Learning Plans:** [Implementation Plans](../../plans/)

### Related Documentation

- [START-HERE.md](../../../START-HERE.md) - Overall project introduction
- [Month 1 Implementation Plan](../../plans/2025-11-15-month-1-go-setup-lox-lexer.md) - Detailed plan
- [36-Month Roadmap](../../plans/2025-11-15-konfiguru-go-roadmap-integration.md) - Master roadmap
- [CLAUDE.md](../../../CLAUDE.md) - Development commands and patterns

---

## Final Thoughts

**This month is about building momentum.** You're learning two things simultaneously:
1. **Go programming language** - A new tool in your arsenal
2. **Compiler fundamentals** - Lexical analysis theory and practice

Don't worry about perfection. Your first lexer won't be flawless, and that's expected. What matters is:
- **Consistency** - Show up every weekday morning
- **Testing** - Write tests before code
- **Small steps** - Commit working increments
- **Learning** - Document what you discover

By Day 30, you'll have:
- A working lexer that tokenizes Lox source code
- Solid Go fundamentals
- A TDD workflow you can replicate
- Confidence to tackle the parser in Month 2

**Remember:** This is a 24-month journey. Month 1 is the foundation. Take your time, enjoy the process, and trust the system.

**Sunday is sacred rest.** No coding. No problem statements. Just rest.

---

**Ready to begin?** Head to [Day 1: Go Setup and Project Structure](./Day-001.md) and start your journey!

**Questions or stuck?** Review the resources, check Go documentation, and remember: every expert was once a beginner.

Happy coding!

---

*Last Updated: 2025-11-15*
*Part of the Konfiguru 24-Month Learning Journey*
