# Month 8: Konfiguru Lexer & Parser Implementation - Implementation Plan

**Created:** 2025-11-15
**Phase:** Core Konfiguru Development (Months 7-12)
**Timeline:** Month 8 of 36
**Weekly Commitment:** 13.5 hours
**Main Deliverable:** Konfiguru Lexer + Parser with comprehensive AST

---

## Overview

Month 8 transitions from design (Month 7) to **implementation**. You'll build the Konfiguru lexer and parser in Go, transforming `.kfg` source files into Abstract Syntax Trees (ASTs). This is where the compiler comes to life.

**This is a coding-heavy month:** You'll write ~1,500-2,000 lines of production Go code.

**Foundation:** Everything built this month uses the grammar and tokens defined in Month 7.

---

## Learning Objectives

By the end of Month 8, you will:

- ✅ Implement a production-quality lexer (scanner) in Go
- ✅ Build recursive descent parser for Konfiguru syntax
- ✅ Create comprehensive AST node types for all constructs
- ✅ Handle error recovery and detailed error messages
- ✅ Write 100+ tests (lexer + parser combined)
- ✅ Achieve >85% code coverage
- ✅ Optimize lexer/parser performance

---

## Month Context

### What You've Built (Month 7)
- ✅ Complete Konfiguru grammar specification (EBNF)
- ✅ All 60+ token types defined
- ✅ 20+ example programs
- ✅ Language specification v1.0

### What You're Building (Month 8)
- **Konfiguru Lexer** - Converts source code → tokens
- **Konfiguru Parser** - Converts tokens → AST
- **AST Definitions** - Go structs for all language constructs
- **Error Handling** - Helpful error messages with positions

### What Comes Next (Month 9+)
- Month 9: Semantic analysis (use the AST)
- Month 10-11: Code generation (traverse AST → YAML)
- Month 12: v0.5.0 release

---

## Weekly Breakdown

### Week 1 (Days 1-7): Lexer Implementation
**Focus:** Build complete tokenizer

**Deliverables:**
- Scanner structure in `pkg/lexer/scanner.go`
- All token types implemented
- String scanning with interpolation support
- Number scanning with size units (GB, Mi, etc.)
- Error reporting with line/column positions
- 50+ lexer tests

**Code Output:** ~500 lines

---

### Week 2 (Days 8-14): Parser Foundation & Expressions
**Focus:** Parse expressions (literals, operators, function calls)

**Deliverables:**
- Parser structure in `pkg/parser/parser.go`
- Expression AST nodes in `pkg/ast/expr.go`
- Recursive descent expression parser
- Operator precedence handling
- Collection literals (lists, maps)
- 30+ expression parser tests

**Code Output:** ~400 lines

---

### Week 3 (Days 15-21): Statement & Resource Parsing
**Focus:** Parse declarations and resource definitions

**Deliverables:**
- Statement AST nodes in `pkg/ast/stmt.go`
- Variable, import, type declaration parsing
- Resource declaration parsing (service, database, etc.)
- Block and nested structure parsing
- 30+ statement parser tests

**Code Output:** ~500 lines

---

### Week 4 (Days 22-30): Testing, Error Handling, Polish
**Focus:** Comprehensive testing and production quality

**Deliverables:**
- Integration tests with all example programs
- Detailed error messages
- Position tracking for all AST nodes
- Parser recovery from errors
- AST pretty-printer (debugging tool)
- Performance benchmarks

**Code Output:** ~300 lines (tests, tooling)

**Month 8 Total:** ~1,700 lines of production Go code

---

## Detailed Task List

### Task 1: Lexer Structure Setup (Days 1-2)
**Time:** 5 hours

Set up the foundation for the lexer:

**File:** `pkg/lexer/scanner.go`

```go
package lexer

import (
    "konfiguru/pkg/tokens"
    "unicode"
)

// Scanner reads Konfiguru source code and produces tokens
type Scanner struct {
    source  string  // Source code
    tokens  []tokens.Token  // Tokens produced
    start   int     // Start of current lexeme
    current int     // Current position in source
    line    int     // Current line number
    column  int     // Current column number
    errors  []error // Lexical errors
}

// NewScanner creates a new scanner for the given source
func NewScanner(source string) *Scanner {
    return &Scanner{
        source: source,
        tokens: make([]tokens.Token, 0),
        start:  0,
        current: 0,
        line:   1,
        column: 1,
        errors: make([]error, 0),
    }
}

// ScanTokens scans the entire source and returns tokens
func (s *Scanner) ScanTokens() ([]tokens.Token, []error) {
    for !s.isAtEnd() {
        s.start = s.current
        s.scanToken()
    }

    s.addToken(tokens.EOF, "")
    return s.tokens, s.errors
}

// scanToken scans a single token
func (s *Scanner) scanToken() {
    c := s.advance()

    switch c {
    case '(':
        s.addToken(tokens.LPAREN, "(")
    case ')':
        s.addToken(tokens.RPAREN, ")")
    case '{':
        s.addToken(tokens.LBRACE, "{")
    case '}':
        s.addToken(tokens.RBRACE, "}")
    case '[':
        s.addToken(tokens.LBRACKET, "[")
    case ']':
        s.addToken(tokens.RBRACKET, "]")
    case ',':
        s.addToken(tokens.COMMA, ",")
    case '.':
        s.addToken(tokens.DOT, ".")
    case ':':
        s.addToken(tokens.COLON, ":")
    case '+':
        s.addToken(tokens.PLUS, "+")
    case '-':
        s.addToken(tokens.MINUS, "-")
    case '*':
        s.addToken(tokens.STAR, "*")
    case '%':
        s.addToken(tokens.PERCENT, "%")
    case '!':
        if s.match('=') {
            s.addToken(tokens.NOT_EQ, "!=")
        } else {
            s.addToken(tokens.BANG, "!")
        }
    case '=':
        if s.match('=') {
            s.addToken(tokens.EQ, "==")
        } else {
            s.addToken(tokens.ASSIGN, "=")
        }
    case '<':
        if s.match('=') {
            s.addToken(tokens.LT_EQ, "<=")
        } else {
            s.addToken(tokens.LT, "<")
        }
    case '>':
        if s.match('=') {
            s.addToken(tokens.GT_EQ, ">=")
        } else {
            s.addToken(tokens.GT, ">")
        }
    case '&':
        if s.match('&') {
            s.addToken(tokens.AND, "&&")
        } else {
            s.addError("Unexpected character '&'")
        }
    case '|':
        if s.match('|') {
            s.addToken(tokens.OR, "||")
        } else {
            s.addError("Unexpected character '|'")
        }
    case '/':
        if s.match('/') {
            // Single-line comment
            s.skipLineComment()
        } else if s.match('*') {
            // Multi-line comment
            s.skipBlockComment()
        } else {
            s.addToken(tokens.SLASH, "/")
        }
    case ' ', '\r', '\t':
        // Ignore whitespace
    case '\n':
        s.line++
        s.column = 1
    case '"':
        s.scanString()
    default:
        if isDigit(c) {
            s.scanNumber()
        } else if isAlpha(c) {
            s.scanIdentifier()
        } else {
            s.addError("Unexpected character: " + string(c))
        }
    }
}

// Helper functions

func (s *Scanner) isAtEnd() bool {
    return s.current >= len(s.source)
}

func (s *Scanner) advance() rune {
    r := rune(s.source[s.current])
    s.current++
    s.column++
    return r
}

func (s *Scanner) match(expected rune) bool {
    if s.isAtEnd() return false
    if rune(s.source[s.current]) != expected return false

    s.current++
    s.column++
    return true
}

func (s *Scanner) peek() rune {
    if s.isAtEnd() return '\0'
    return rune(s.source[s.current])
}

func (s *Scanner) peekNext() rune {
    if s.current + 1 >= len(s.source) return '\0'
    return rune(s.source[s.current+1])
}

func (s *Scanner) addToken(tokenType tokens.TokenType, lexeme string) {
    token := tokens.Token{
        Type:   tokenType,
        Lexeme: lexeme,
        Line:   s.line,
        Column: s.column - len(lexeme),
    }
    s.tokens = append(s.tokens, token)
}

func (s *Scanner) addError(message string) {
    err := fmt.Errorf("line %d, col %d: %s", s.line, s.column, message)
    s.errors = append(s.errors, err)
}

func isDigit(c rune) bool {
    return c >= '0' && c <= '9'
}

func isAlpha(c rune) bool {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
           c == '_'
}

func isAlphaNumeric(c rune) bool {
    return isAlpha(c) || isDigit(c)
}
```

**Tests:** `pkg/lexer/scanner_test.go`

```go
package lexer

import (
    "konfiguru/pkg/tokens"
    "testing"
)

func TestSingleCharacterTokens(t *testing.T) {
    source := "(){}[],.:"
    scanner := NewScanner(source)
    toks, errs := scanner.ScanTokens()

    if len(errs) > 0 {
        t.Fatalf("Expected no errors, got %d", len(errs))
    }

    expected := []tokens.TokenType{
        tokens.LPAREN,
        tokens.RPAREN,
        tokens.LBRACE,
        tokens.RBRACE,
        tokens.LBRACKET,
        tokens.RBRACKET,
        tokens.COMMA,
        tokens.DOT,
        tokens.COLON,
        tokens.EOF,
    }

    if len(toks) != len(expected) {
        t.Fatalf("Expected %d tokens, got %d", len(expected), len(toks))
    }

    for i, tok := range toks {
        if tok.Type != expected[i] {
            t.Errorf("Token %d: expected %v, got %v", i, expected[i], tok.Type)
        }
    }
}

func TestOperators(t *testing.T) {
    source := "+ - * / % ! != = == < <= > >= && ||"
    scanner := NewScanner(source)
    toks, errs := scanner.ScanTokens()

    if len(errs) > 0 {
        t.Fatalf("Expected no errors, got %d", len(errs))
    }

    expected := []tokens.TokenType{
        tokens.PLUS,
        tokens.MINUS,
        tokens.STAR,
        tokens.SLASH,
        tokens.PERCENT,
        tokens.BANG,
        tokens.NOT_EQ,
        tokens.ASSIGN,
        tokens.EQ,
        tokens.LT,
        tokens.LT_EQ,
        tokens.GT,
        tokens.GT_EQ,
        tokens.AND,
        tokens.OR,
        tokens.EOF,
    }

    if len(toks) != len(expected) {
        t.Fatalf("Expected %d tokens, got %d", len(expected), len(toks))
    }

    for i, tok := range toks {
        if tok.Type != expected[i] {
            t.Errorf("Token %d: expected %v, got %v", i, expected[i], tok.Type)
        }
    }
}
```

---

### Task 2: String Scanning (Days 3-4)
**Time:** 6 hours

Implement string literal scanning with interpolation:

```go
func (s *Scanner) scanString() {
    startLine := s.line
    startCol := s.column
    value := ""

    for s.peek() != '"' && !s.isAtEnd() {
        if s.peek() == '\n' {
            s.line++
            s.column = 0
        }

        // Handle string interpolation: ${expression}
        if s.peek() == '$' && s.peekNext() == '{' {
            // For now, just collect the interpolation as-is
            // Full parsing happens in parser stage
            value += string(s.advance())
        } else if s.peek() == '\\' {
            // Handle escape sequences
            s.advance() // consume backslash
            switch s.peek() {
            case 'n':
                value += "\n"
            case 't':
                value += "\t"
            case 'r':
                value += "\r"
            case '"':
                value += "\""
            case '\\':
                value += "\\"
            case '$':
                value += "$"
            default:
                s.addError("Invalid escape sequence: \\" + string(s.peek()))
            }
            s.advance()
        } else {
            value += string(s.advance())
        }
    }

    if s.isAtEnd() {
        s.addError(fmt.Sprintf("Unterminated string starting at line %d, col %d",
            startLine, startCol))
        return
    }

    s.advance() // Closing quote

    s.addToken(tokens.STRING, value)
}
```

**Tests:**

```go
func TestStringLiterals(t *testing.T) {
    tests := []struct {
        source   string
        expected string
    }{
        {`"hello"`, "hello"},
        {`"hello world"`, "hello world"},
        {`"line1\nline2"`, "line1\nline2"},
        {`"tab\there"`, "tab\there"},
        {`"quote\"inside"`, "quote\"inside"},
        {`"backslash\\here"`, "backslash\\here"},
        {`"interpolate ${var}"`, "interpolate ${var}"},
    }

    for _, tt := range tests {
        scanner := NewScanner(tt.source)
        toks, errs := scanner.ScanTokens()

        if len(errs) > 0 {
            t.Errorf("Source %q: unexpected errors: %v", tt.source, errs)
            continue
        }

        if len(toks) != 2 { // STRING + EOF
            t.Errorf("Source %q: expected 2 tokens, got %d", tt.source, len(toks))
            continue
        }

        if toks[0].Type != tokens.STRING {
            t.Errorf("Source %q: expected STRING token, got %v", tt.source, toks[0].Type)
        }

        if toks[0].Lexeme != tt.expected {
            t.Errorf("Source %q: expected %q, got %q", tt.source, tt.expected, toks[0].Lexeme)
        }
    }
}
```

---

### Task 3: Number & Size Unit Scanning (Days 5-6)
**Time:** 6 hours

Implement number scanning with Kubernetes-style size units:

```go
func (s *Scanner) scanNumber() {
    // Scan integer part
    for isDigit(s.peek()) {
        s.advance()
    }

    // Check for decimal point
    hasDecimal := false
    if s.peek() == '.' && isDigit(s.peekNext()) {
        hasDecimal = true
        s.advance() // consume '.'

        for isDigit(s.peek()) {
            s.advance()
        }
    }

    // Check for size unit (GB, Mi, m, etc.)
    unit := s.scanSizeUnit()

    lexeme := s.source[s.start:s.current]

    if unit != "" {
        // This is a size literal (e.g., 100GB, 512Mi, 200m)
        s.addToken(tokens.SIZE, lexeme)
    } else if hasDecimal {
        s.addToken(tokens.FLOAT, lexeme)
    } else {
        s.addToken(tokens.INT, lexeme)
    }
}

func (s *Scanner) scanSizeUnit() string {
    // CPU units: m (millicores)
    // Memory units: KB, MB, GB, TB, Ki, Mi, Gi, Ti

    start := s.current

    // Check for single-letter units
    if s.peek() == 'm' && !isAlphaNumeric(s.peekNext()) {
        s.advance()
        return "m"
    }

    // Check for two-letter units
    if isAlpha(s.peek()) && isAlpha(s.peekNext()) {
        first := s.advance()
        second := s.advance()
        unit := string([]rune{first, second})

        validUnits := []string{"KB", "MB", "GB", "TB", "Ki", "Mi", "Gi", "Ti"}
        for _, valid := range validUnits {
            if unit == valid {
                return unit
            }
        }

        // Not a valid unit, rewind
        s.current = start
        s.column -= 2
    }

    return ""
}
```

**Tests:**

```go
func TestNumberLiterals(t *testing.T) {
    tests := []struct {
        source       string
        expectedType tokens.TokenType
        expectedLex  string
    }{
        {"123", tokens.INT, "123"},
        {"456.789", tokens.FLOAT, "456.789"},
        {"100GB", tokens.SIZE, "100GB"},
        {"512Mi", tokens.SIZE, "512Mi"},
        {"200m", tokens.SIZE, "200m"},
        {"1.5Gi", tokens.SIZE, "1.5Gi"},
    }

    for _, tt := range tests {
        scanner := NewScanner(tt.source)
        toks, errs := scanner.ScanTokens()

        if len(errs) > 0 {
            t.Errorf("Source %q: unexpected errors: %v", tt.source, errs)
            continue
        }

        if len(toks) != 2 {
            t.Errorf("Source %q: expected 2 tokens, got %d", tt.source, len(toks))
            continue
        }

        if toks[0].Type != tt.expectedType {
            t.Errorf("Source %q: expected %v, got %v", tt.source, tt.expectedType, toks[0].Type)
        }

        if toks[0].Lexeme != tt.expectedLex {
            t.Errorf("Source %q: expected %q, got %q", tt.source, tt.expectedLex, toks[0].Lexeme)
        }
    }
}
```

---

### Task 4: Identifier & Keyword Scanning (Day 7)
**Time:** 3 hours

Implement identifier and keyword recognition:

```go
func (s *Scanner) scanIdentifier() {
    for isAlphaNumeric(s.peek()) {
        s.advance()
    }

    lexeme := s.source[s.start:s.current]

    // Check if it's a keyword
    if tokenType, isKeyword := tokens.Keywords[lexeme]; isKeyword {
        s.addToken(tokenType, lexeme)
    } else {
        s.addToken(tokens.IDENT, lexeme)
    }
}
```

**Complete tests for Week 1:**

```go
func TestKeywords(t *testing.T) {
    keywords := []string{
        "let", "import", "as", "type",
        "service", "database", "storage", "ingress",
        "cache", "queue", "cronjob", "worker",
        "true", "false", "nil",
    }

    for _, kw := range keywords {
        scanner := NewScanner(kw)
        toks, errs := scanner.ScanTokens()

        if len(errs) > 0 {
            t.Errorf("Keyword %q: unexpected errors: %v", kw, errs)
            continue
        }

        if len(toks) != 2 {
            t.Errorf("Keyword %q: expected 2 tokens, got %d", kw, len(toks))
            continue
        }

        expectedType := tokens.Keywords[kw]
        if toks[0].Type != expectedType {
            t.Errorf("Keyword %q: expected %v, got %v", kw, expectedType, toks[0].Type)
        }
    }
}

func TestIdentifiers(t *testing.T) {
    ids := []string{
        "myVar", "my_var", "myVar123", "_private",
        "serviceA", "database_prod",
    }

    for _, id := range ids {
        scanner := NewScanner(id)
        toks, errs := scanner.ScanTokens()

        if len(errs) > 0 {
            t.Errorf("Identifier %q: unexpected errors: %v", id, errs)
            continue
        }

        if toks[0].Type != tokens.IDENT {
            t.Errorf("Identifier %q: expected IDENT, got %v", id, toks[0].Type)
        }

        if toks[0].Lexeme != id {
            t.Errorf("Identifier %q: expected %q, got %q", id, id, toks[0].Lexeme)
        }
    }
}

func TestCompleteProgram(t *testing.T) {
    source := `
let port = 8080

service web {
  image: "nginx:latest"
  port: port
  replicas: 3
}
`

    scanner := NewScanner(source)
    toks, errs := scanner.ScanTokens()

    if len(errs) > 0 {
        t.Fatalf("Unexpected errors: %v", errs)
    }

    // Should have: LET IDENT ASSIGN INT SERVICE IDENT LBRACE (properties) RBRACE EOF
    // Verify key tokens are present
    tokenTypes := make([]tokens.TokenType, len(toks))
    for i, tok := range toks {
        tokenTypes[i] = tok.Type
    }

    expectedContains := []tokens.TokenType{
        tokens.LET,
        tokens.IDENT,
        tokens.ASSIGN,
        tokens.INT,
        tokens.SERVICE,
        tokens.IDENT,
        tokens.LBRACE,
        tokens.RBRACE,
        tokens.EOF,
    }

    for _, expected := range expectedContains {
        found := false
        for _, actual := range tokenTypes {
            if actual == expected {
                found = true
                break
            }
        }
        if !found {
            t.Errorf("Expected token type %v not found in output", expected)
        }
    }
}
```

---

## Summary of Month 8 Tasks (Abbreviated)

Due to space constraints, I've shown the first week in detail. The remaining weeks follow a similar pattern:

**Week 2 (Days 8-14): Parser & Expressions**
- Set up parser structure
- Implement expression parsing (precedence climbing)
- Handle collections (lists, maps)
- Write 30+ tests

**Week 3 (Days 15-21): Statements & Resources**
- Parse variable/import/type declarations
- Parse all resource types (service, database, etc.)
- Implement block parsing
- Write 30+ tests

**Week 4 (Days 22-30): Testing & Polish**
- Integration tests with all examples from Month 7
- Error recovery and helpful messages
- AST pretty-printer
- Performance optimization
- Documentation

---

## Success Criteria

By Day 30 of Month 8, you will have:

- ✅ Complete lexer (~500 lines)
- ✅ Complete parser (~800 lines)
- ✅ AST definitions (~400 lines)
- ✅ 100+ tests passing
- ✅ >85% code coverage
- ✅ All Month 7 examples parse successfully
- ✅ Detailed error messages

**Validation:**
- [ ] `go test ./pkg/lexer` - all passing
- [ ] `go test ./pkg/parser` - all passing
- [ ] `go test -cover ./...` - >85% coverage
- [ ] All 20+ example programs from Month 7 parse without errors

---

## Resources for Month 8

### Books
- **"Crafting Interpreters"** Chapters 4-6 (scanning, parsing)
- **"Writing An Interpreter In Go"** (optional, same concepts)

### Online
- Go's own parser: golang.org/src/go/parser
- Pratt parsing: https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html

### Communities
- r/golang
- r/ProgrammingLanguages

---

**Next:** [Month 9: Semantic Analysis & Type System](month-9-semantic-analysis-type-system.md)
