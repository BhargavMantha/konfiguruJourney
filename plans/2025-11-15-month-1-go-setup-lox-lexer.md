# Month 1: Go Setup + Lox Lexer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Go development environment and build a complete Lox lexer (tokenizer) in Go, following Crafting Interpreters Chapter 4.

**Architecture:** Hand-written scanner using Go's buffering and rune handling. Token-based output with line tracking for error reporting. Test-driven development with table-driven tests.

**Tech Stack:** Go 1.21+, Go standard library (testing, bufio, strings), Crafting Interpreters book as reference

---

## Prerequisites

Before starting, ensure you have:
- [ ] Go 1.21+ installed (`go version`)
- [ ] VSCode with Go extension installed
- [ ] "Crafting Interpreters" book (physical or craftinginterpreters.com)
- [ ] Git repository at `/home/bhargav/Documents/Side-Projects/konfiguru`

---

## Task 1: Project Structure Setup

**Files:**
- Create: `go.mod`
- Create: `cmd/lox/main.go`
- Create: `pkg/tokens/token.go`
- Create: `pkg/lexer/scanner.go`
- Create: `README.md`
- Create: `.gitignore`
- Create: `Makefile`

**Step 1: Initialize Go module**

```bash
cd /home/bhargav/Documents/Side-Projects/konfiguru
go mod init github.com/bhargav/konfiguru
```

Expected output: `go: creating new go.mod: module github.com/bhargav/konfiguru`

**Step 2: Create directory structure**

```bash
mkdir -p cmd/lox
mkdir -p pkg/{tokens,lexer}
mkdir -p test/fixtures
mkdir -p examples
```

**Step 3: Create .gitignore**

Create file: `.gitignore`

```gitignore
# Binaries
*.exe
*.exe~
*.dll
*.so
*.dylib
lox
konfiguru

# Test binary
*.test

# Output
*.out

# Go workspace file
go.work

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
```

**Step 4: Create basic README**

Create file: `README.md`

```markdown
# Konfiguru (Learning Phase: Lox Interpreter)

**Current Phase:** Month 1 - Building Lox interpreter in Go to learn compiler fundamentals

**Learning Goal:** Master lexing, parsing, and interpretation before building Konfiguru DSL

**Following:** "Crafting Interpreters" by Robert Nystrom

## Progress

- [x] Project setup
- [ ] Lox lexer (Chapter 4)
- [ ] Lox parser (Chapters 5-7)
- [ ] Lox interpreter (Chapters 8-11)
- [ ] Konfiguru DSL design (Month 4+)

## Run Lox REPL

```bash
make run
```

## Run Tests

```bash
make test
```

## Build

```bash
make build
```
```

**Step 5: Create Makefile**

Create file: `Makefile`

```makefile
.PHONY: build test run clean

build:
	go build -o lox ./cmd/lox

test:
	go test -v ./...

run:
	go run ./cmd/lox

clean:
	rm -f lox
	go clean
```

**Step 6: Commit initial structure**

```bash
git add .
git commit -m "feat: initialize Go project structure for Lox interpreter

- Set up Go module
- Create directory structure (cmd, pkg)
- Add Makefile for common operations
- Initialize README with learning goals"
```

---

## Task 2: Token Types Definition

**Files:**
- Create: `pkg/tokens/token.go`
- Create: `pkg/tokens/token_test.go`

**Step 1: Define TokenType enum**

Create file: `pkg/tokens/token.go`

```go
package tokens

import "fmt"

// TokenType represents the type of a token
type TokenType int

const (
	// Single-character tokens
	LEFT_PAREN TokenType = iota
	RIGHT_PAREN
	LEFT_BRACE
	RIGHT_BRACE
	COMMA
	DOT
	MINUS
	PLUS
	SEMICOLON
	SLASH
	STAR

	// One or two character tokens
	BANG
	BANG_EQUAL
	EQUAL
	EQUAL_EQUAL
	GREATER
	GREATER_EQUAL
	LESS
	LESS_EQUAL

	// Literals
	IDENTIFIER
	STRING
	NUMBER

	// Keywords
	AND
	CLASS
	ELSE
	FALSE
	FUN
	FOR
	IF
	NIL
	OR
	PRINT
	RETURN
	SUPER
	THIS
	TRUE
	VAR
	WHILE

	// Special
	EOF
	ILLEGAL
)

// String returns the string representation of a TokenType
func (t TokenType) String() string {
	switch t {
	case LEFT_PAREN:
		return "LEFT_PAREN"
	case RIGHT_PAREN:
		return "RIGHT_PAREN"
	case LEFT_BRACE:
		return "LEFT_BRACE"
	case RIGHT_BRACE:
		return "RIGHT_BRACE"
	case COMMA:
		return "COMMA"
	case DOT:
		return "DOT"
	case MINUS:
		return "MINUS"
	case PLUS:
		return "PLUS"
	case SEMICOLON:
		return "SEMICOLON"
	case SLASH:
		return "SLASH"
	case STAR:
		return "STAR"
	case BANG:
		return "BANG"
	case BANG_EQUAL:
		return "BANG_EQUAL"
	case EQUAL:
		return "EQUAL"
	case EQUAL_EQUAL:
		return "EQUAL_EQUAL"
	case GREATER:
		return "GREATER"
	case GREATER_EQUAL:
		return "GREATER_EQUAL"
	case LESS:
		return "LESS"
	case LESS_EQUAL:
		return "LESS_EQUAL"
	case IDENTIFIER:
		return "IDENTIFIER"
	case STRING:
		return "STRING"
	case NUMBER:
		return "NUMBER"
	case AND:
		return "AND"
	case CLASS:
		return "CLASS"
	case ELSE:
		return "ELSE"
	case FALSE:
		return "FALSE"
	case FUN:
		return "FUN"
	case FOR:
		return "FOR"
	case IF:
		return "IF"
	case NIL:
		return "NIL"
	case OR:
		return "OR"
	case PRINT:
		return "PRINT"
	case RETURN:
		return "RETURN"
	case SUPER:
		return "SUPER"
	case THIS:
		return "THIS"
	case TRUE:
		return "TRUE"
	case VAR:
		return "VAR"
	case WHILE:
		return "WHILE"
	case EOF:
		return "EOF"
	case ILLEGAL:
		return "ILLEGAL"
	default:
		return "UNKNOWN"
	}
}
```

**Step 2: Define Token struct**

Add to `pkg/tokens/token.go`:

```go
// Token represents a single token in the Lox language
type Token struct {
	Type    TokenType   // The type of the token
	Lexeme  string      // The raw text of the token
	Literal interface{} // The literal value (for numbers, strings)
	Line    int         // Line number where the token appears
}

// NewToken creates a new token
func NewToken(tokenType TokenType, lexeme string, literal interface{}, line int) Token {
	return Token{
		Type:    tokenType,
		Lexeme:  lexeme,
		Literal: literal,
		Line:    line,
	}
}

// String returns a string representation of the token
func (t Token) String() string {
	return fmt.Sprintf("%s %s %v", t.Type, t.Lexeme, t.Literal)
}
```

**Step 3: Add keyword map**

Add to `pkg/tokens/token.go`:

```go
// Keywords maps Lox keywords to their token types
var Keywords = map[string]TokenType{
	"and":    AND,
	"class":  CLASS,
	"else":   ELSE,
	"false":  FALSE,
	"for":    FOR,
	"fun":    FUN,
	"if":     IF,
	"nil":    NIL,
	"or":     OR,
	"print":  PRINT,
	"return": RETURN,
	"super":  SUPER,
	"this":   THIS,
	"true":   TRUE,
	"var":    VAR,
	"while":  WHILE,
}

// LookupIdent checks if an identifier is a keyword
func LookupIdent(ident string) TokenType {
	if tok, ok := Keywords[ident]; ok {
		return tok
	}
	return IDENTIFIER
}
```

**Step 4: Write tests for token types**

Create file: `pkg/tokens/token_test.go`

```go
package tokens

import "testing"

func TestTokenString(t *testing.T) {
	tests := []struct {
		tokenType TokenType
		lexeme    string
		literal   interface{}
		line      int
		want      string
	}{
		{LEFT_PAREN, "(", nil, 1, "LEFT_PAREN ( <nil>"},
		{NUMBER, "123", 123.0, 1, "NUMBER 123 123"},
		{STRING, "\"hello\"", "hello", 1, "STRING \"hello\" hello"},
		{IDENTIFIER, "foo", nil, 1, "IDENTIFIER foo <nil>"},
	}

	for _, tt := range tests {
		token := NewToken(tt.tokenType, tt.lexeme, tt.literal, tt.line)
		got := token.String()
		if got != tt.want {
			t.Errorf("Token.String() = %q, want %q", got, tt.want)
		}
	}
}

func TestLookupIdent(t *testing.T) {
	tests := []struct {
		ident string
		want  TokenType
	}{
		{"and", AND},
		{"class", CLASS},
		{"var", VAR},
		{"while", WHILE},
		{"foo", IDENTIFIER},
		{"bar123", IDENTIFIER},
	}

	for _, tt := range tests {
		got := LookupIdent(tt.ident)
		if got != tt.want {
			t.Errorf("LookupIdent(%q) = %v, want %v", tt.ident, got, tt.want)
		}
	}
}
```

**Step 5: Run tests to verify**

```bash
go test ./pkg/tokens -v
```

Expected: All tests pass

**Step 6: Commit token types**

```bash
git add pkg/tokens/
git commit -m "feat: define Lox token types and keywords

- Add TokenType enum with all Lox tokens
- Define Token struct with lexeme, literal, line tracking
- Add keyword lookup map
- Include comprehensive token tests"
```

---

## Task 3: Scanner Core Structure

**Files:**
- Create: `pkg/lexer/scanner.go`
- Create: `pkg/lexer/scanner_test.go`

**Step 1: Define Scanner struct**

Create file: `pkg/lexer/scanner.go`

```go
package lexer

import (
	"github.com/bhargav/konfiguru/pkg/tokens"
)

// Scanner reads Lox source code and produces tokens
type Scanner struct {
	source  string         // The source code being scanned
	tokens  []tokens.Token // The list of tokens produced
	start   int            // Start position of current token
	current int            // Current position in source
	line    int            // Current line number
	errors  []string       // Scanning errors
}

// NewScanner creates a new scanner for the given source code
func NewScanner(source string) *Scanner {
	return &Scanner{
		source:  source,
		tokens:  make([]tokens.Token, 0),
		start:   0,
		current: 0,
		line:    1,
		errors:  make([]string, 0),
	}
}

// ScanTokens scans all tokens from the source code
func (s *Scanner) ScanTokens() ([]tokens.Token, []string) {
	for !s.isAtEnd() {
		s.start = s.current
		s.scanToken()
	}

	// Add EOF token
	s.tokens = append(s.tokens, tokens.NewToken(
		tokens.EOF,
		"",
		nil,
		s.line,
	))

	return s.tokens, s.errors
}

// isAtEnd checks if we've consumed all characters
func (s *Scanner) isAtEnd() bool {
	return s.current >= len(s.source)
}

// scanToken scans a single token
func (s *Scanner) scanToken() {
	// Will be implemented in next steps
	c := s.advance()
	_ = c // Placeholder to avoid unused variable error
}

// advance consumes the current character and returns it
func (s *Scanner) advance() byte {
	char := s.source[s.current]
	s.current++
	return char
}
```

**Step 2: Write basic scanner test**

Create file: `pkg/lexer/scanner_test.go`

```go
package lexer

import (
	"testing"

	"github.com/bhargav/konfiguru/pkg/tokens"
)

func TestNewScanner(t *testing.T) {
	source := "var x = 5;"
	scanner := NewScanner(source)

	if scanner.source != source {
		t.Errorf("scanner.source = %q, want %q", scanner.source, source)
	}
	if scanner.line != 1 {
		t.Errorf("scanner.line = %d, want 1", scanner.line)
	}
}

func TestScanTokens_Empty(t *testing.T) {
	scanner := NewScanner("")
	toks, errs := scanner.ScanTokens()

	if len(errs) != 0 {
		t.Errorf("got %d errors, want 0: %v", len(errs), errs)
	}

	if len(toks) != 1 {
		t.Fatalf("got %d tokens, want 1 (EOF)", len(toks))
	}

	if toks[0].Type != tokens.EOF {
		t.Errorf("token type = %v, want EOF", toks[0].Type)
	}
}
```

**Step 3: Run tests**

```bash
go test ./pkg/lexer -v
```

Expected: Tests pass

**Step 4: Commit scanner structure**

```bash
git add pkg/lexer/
git commit -m "feat: add scanner core structure

- Define Scanner struct with source tracking
- Implement ScanTokens skeleton
- Add basic helper methods (advance, isAtEnd)
- Include initial tests for scanner creation"
```

---

## Task 4: Single-Character Token Scanning

**Files:**
- Modify: `pkg/lexer/scanner.go`
- Modify: `pkg/lexer/scanner_test.go`

**Step 1: Add helper methods**

Add to `pkg/lexer/scanner.go`:

```go
// addToken adds a token with no literal value
func (s *Scanner) addToken(tokenType tokens.TokenType) {
	s.addTokenLiteral(tokenType, nil)
}

// addTokenLiteral adds a token with a literal value
func (s *Scanner) addTokenLiteral(tokenType tokens.TokenType, literal interface{}) {
	text := s.source[s.start:s.current]
	s.tokens = append(s.tokens, tokens.NewToken(
		tokenType,
		text,
		literal,
		s.line,
	))
}
```

**Step 2: Implement single-character scanning**

Modify `scanToken()` method in `pkg/lexer/scanner.go`:

```go
// scanToken scans a single token
func (s *Scanner) scanToken() {
	c := s.advance()

	switch c {
	case '(':
		s.addToken(tokens.LEFT_PAREN)
	case ')':
		s.addToken(tokens.RIGHT_PAREN)
	case '{':
		s.addToken(tokens.LEFT_BRACE)
	case '}':
		s.addToken(tokens.RIGHT_BRACE)
	case ',':
		s.addToken(tokens.COMMA)
	case '.':
		s.addToken(tokens.DOT)
	case '-':
		s.addToken(tokens.MINUS)
	case '+':
		s.addToken(tokens.PLUS)
	case ';':
		s.addToken(tokens.SEMICOLON)
	case '*':
		s.addToken(tokens.STAR)
	case ' ', '\r', '\t':
		// Ignore whitespace
	case '\n':
		s.line++
	default:
		s.addError("Unexpected character.")
	}
}

// addError records a scanning error
func (s *Scanner) addError(message string) {
	s.errors = append(s.errors,
		fmt.Sprintf("[line %d] Error: %s", s.line, message))
}
```

**Step 3: Add import for fmt**

At top of `pkg/lexer/scanner.go`, add:

```go
import (
	"fmt"

	"github.com/bhargav/konfiguru/pkg/tokens"
)
```

**Step 4: Write tests for single-character tokens**

Add to `pkg/lexer/scanner_test.go`:

```go
func TestScanTokens_SingleCharacters(t *testing.T) {
	source := "(){},.-+;*"
	scanner := NewScanner(source)
	toks, errs := scanner.ScanTokens()

	if len(errs) != 0 {
		t.Errorf("got errors: %v", errs)
	}

	expected := []tokens.TokenType{
		tokens.LEFT_PAREN,
		tokens.RIGHT_PAREN,
		tokens.LEFT_BRACE,
		tokens.RIGHT_BRACE,
		tokens.COMMA,
		tokens.DOT,
		tokens.MINUS,
		tokens.PLUS,
		tokens.SEMICOLON,
		tokens.STAR,
		tokens.EOF,
	}

	if len(toks) != len(expected) {
		t.Fatalf("got %d tokens, want %d", len(toks), len(expected))
	}

	for i, expectedType := range expected {
		if toks[i].Type != expectedType {
			t.Errorf("token[%d] type = %v, want %v", i, toks[i].Type, expectedType)
		}
	}
}

func TestScanTokens_Whitespace(t *testing.T) {
	source := "  (  )  \n  {  }  "
	scanner := NewScanner(source)
	toks, errs := scanner.ScanTokens()

	if len(errs) != 0 {
		t.Errorf("got errors: %v", errs)
	}

	// Should have 4 tokens + EOF (whitespace ignored)
	expected := []tokens.TokenType{
		tokens.LEFT_PAREN,
		tokens.RIGHT_PAREN,
		tokens.LEFT_BRACE,
		tokens.RIGHT_BRACE,
		tokens.EOF,
	}

	if len(toks) != len(expected) {
		t.Fatalf("got %d tokens, want %d", len(toks), len(expected))
	}
}
```

**Step 5: Run tests**

```bash
go test ./pkg/lexer -v
```

Expected: All tests pass

**Step 6: Commit single-character scanning**

```bash
git add pkg/lexer/
git commit -m "feat: implement single-character token scanning

- Add addToken and addTokenLiteral helpers
- Scan single-character tokens: (){},.+-;*
- Handle whitespace and newlines
- Add error reporting for unexpected characters
- Include tests for single-char tokens and whitespace"
```

---

## Task 5: Two-Character Token Scanning

**Files:**
- Modify: `pkg/lexer/scanner.go`
- Modify: `pkg/lexer/scanner_test.go`

**Step 1: Add match helper**

Add to `pkg/lexer/scanner.go`:

```go
// match checks if the current character matches expected
// If it does, consumes it and returns true
func (s *Scanner) match(expected byte) bool {
	if s.isAtEnd() {
		return false
	}
	if s.source[s.current] != expected {
		return false
	}
	s.current++
	return true
}
```

**Step 2: Update scanToken for two-character tokens**

Modify the switch statement in `scanToken()` to add these cases BEFORE the default case:

```go
	case '!':
		if s.match('=') {
			s.addToken(tokens.BANG_EQUAL)
		} else {
			s.addToken(tokens.BANG)
		}
	case '=':
		if s.match('=') {
			s.addToken(tokens.EQUAL_EQUAL)
		} else {
			s.addToken(tokens.EQUAL)
		}
	case '<':
		if s.match('=') {
			s.addToken(tokens.LESS_EQUAL)
		} else {
			s.addToken(tokens.LESS)
		}
	case '>':
		if s.match('=') {
			s.addToken(tokens.GREATER_EQUAL)
		} else {
			s.addToken(tokens.GREATER)
		}
```

**Step 3: Write tests for two-character tokens**

Add to `pkg/lexer/scanner_test.go`:

```go
func TestScanTokens_TwoCharacterOperators(t *testing.T) {
	tests := []struct {
		source   string
		expected []tokens.TokenType
	}{
		{"!=", []tokens.TokenType{tokens.BANG_EQUAL, tokens.EOF}},
		{"!", []tokens.TokenType{tokens.BANG, tokens.EOF}},
		{"==", []tokens.TokenType{tokens.EQUAL_EQUAL, tokens.EOF}},
		{"=", []tokens.TokenType{tokens.EQUAL, tokens.EOF}},
		{"<=", []tokens.TokenType{tokens.LESS_EQUAL, tokens.EOF}},
		{"<", []tokens.TokenType{tokens.LESS, tokens.EOF}},
		{">=", []tokens.TokenType{tokens.GREATER_EQUAL, tokens.EOF}},
		{">", []tokens.TokenType{tokens.GREATER, tokens.EOF}},
		{"! = == !=", []tokens.TokenType{
			tokens.BANG, tokens.EQUAL, tokens.EQUAL_EQUAL, tokens.BANG_EQUAL, tokens.EOF,
		}},
	}

	for _, tt := range tests {
		scanner := NewScanner(tt.source)
		toks, errs := scanner.ScanTokens()

		if len(errs) != 0 {
			t.Errorf("source %q: got errors %v", tt.source, errs)
			continue
		}

		if len(toks) != len(tt.expected) {
			t.Errorf("source %q: got %d tokens, want %d",
				tt.source, len(toks), len(tt.expected))
			continue
		}

		for i, expectedType := range tt.expected {
			if toks[i].Type != expectedType {
				t.Errorf("source %q: token[%d] = %v, want %v",
					tt.source, i, toks[i].Type, expectedType)
			}
		}
	}
}
```

**Step 4: Run tests**

```bash
go test ./pkg/lexer -v
```

Expected: All tests pass

**Step 5: Commit two-character operators**

```bash
git add pkg/lexer/
git commit -m "feat: implement two-character operators

- Add match() helper for lookahead
- Scan operators: != == <= >=
- Handle both single and double forms: ! vs !=
- Include comprehensive tests for all combinations"
```

---

## Task 6: Comment Handling

**Files:**
- Modify: `pkg/lexer/scanner.go`
- Modify: `pkg/lexer/scanner_test.go`

**Step 1: Add peek helper**

Add to `pkg/lexer/scanner.go`:

```go
// peek returns the current character without consuming it
func (s *Scanner) peek() byte {
	if s.isAtEnd() {
		return 0
	}
	return s.source[s.current]
}
```

**Step 2: Handle slash and comments**

Modify scanToken() to replace the default case with this BEFORE the default:

```go
	case '/':
		if s.match('/') {
			// A comment goes until the end of the line
			for s.peek() != '\n' && !s.isAtEnd() {
				s.advance()
			}
		} else {
			s.addToken(tokens.SLASH)
		}
```

**Step 3: Write tests for comments**

Add to `pkg/lexer/scanner_test.go`:

```go
func TestScanTokens_Comments(t *testing.T) {
	tests := []struct {
		source   string
		expected []tokens.TokenType
	}{
		{"// this is a comment", []tokens.TokenType{tokens.EOF}},
		{"( // comment\n)", []tokens.TokenType{
			tokens.LEFT_PAREN, tokens.RIGHT_PAREN, tokens.EOF,
		}},
		{"var x = 5; // comment", []tokens.TokenType{
			tokens.VAR, tokens.IDENTIFIER, tokens.EQUAL, tokens.NUMBER,
			tokens.SEMICOLON, tokens.EOF,
		}},
		{"/", []tokens.TokenType{tokens.SLASH, tokens.EOF}},
		{"/ /", []tokens.TokenType{tokens.SLASH, tokens.SLASH, tokens.EOF}},
	}

	for _, tt := range tests {
		scanner := NewScanner(tt.source)
		toks, errs := scanner.ScanTokens()

		if len(errs) != 0 {
			t.Errorf("source %q: got errors %v", tt.source, errs)
			continue
		}

		if len(toks) != len(tt.expected) {
			t.Errorf("source %q: got %d tokens, want %d",
				tt.source, len(toks), len(tt.expected))
			continue
		}

		for i, expectedType := range tt.expected {
			if toks[i].Type != expectedType {
				t.Errorf("source %q: token[%d] = %v, want %v",
					tt.source, i, toks[i].Type, expectedType)
			}
		}
	}
}
```

**Step 4: Run tests**

```bash
go test ./pkg/lexer -v
```

Expected: All tests pass

**Step 5: Commit comment handling**

```bash
git add pkg/lexer/
git commit -m "feat: add comment support

- Add peek() helper for lookahead without consuming
- Handle // comments (skip until newline)
- Distinguish between / (division) and // (comment)
- Include tests for various comment scenarios"
```

---

## Task 7: String Literal Scanning

**Files:**
- Modify: `pkg/lexer/scanner.go`
- Modify: `pkg/lexer/scanner_test.go`

**Step 1: Implement string scanning**

Add to `pkg/lexer/scanner.go`:

```go
// scanString scans a string literal
func (s *Scanner) scanString() {
	for s.peek() != '"' && !s.isAtEnd() {
		if s.peek() == '\n' {
			s.line++
		}
		s.advance()
	}

	if s.isAtEnd() {
		s.addError("Unterminated string.")
		return
	}

	// Consume the closing "
	s.advance()

	// Trim the surrounding quotes
	value := s.source[s.start+1 : s.current-1]
	s.addTokenLiteral(tokens.STRING, value)
}
```

**Step 2: Add string case to scanToken**

In `scanToken()`, add this case BEFORE the default:

```go
	case '"':
		s.scanString()
```

**Step 3: Write tests for strings**

Add to `pkg/lexer/scanner_test.go`:

```go
func TestScanTokens_Strings(t *testing.T) {
	tests := []struct {
		source      string
		wantLiteral string
		wantError   bool
	}{
		{`"hello"`, "hello", false},
		{`""`, "", false},
		{`"hello world"`, "hello world", false},
		{`"multi\nline"`, `multi\nline`, false},
		{`"unterminated`, "", true},
	}

	for _, tt := range tests {
		scanner := NewScanner(tt.source)
		toks, errs := scanner.ScanTokens()

		if tt.wantError {
			if len(errs) == 0 {
				t.Errorf("source %q: expected error, got none", tt.source)
			}
			continue
		}

		if len(errs) != 0 {
			t.Errorf("source %q: unexpected errors %v", tt.source, errs)
			continue
		}

		if len(toks) != 2 { // STRING + EOF
			t.Fatalf("source %q: got %d tokens, want 2", tt.source, len(toks))
		}

		if toks[0].Type != tokens.STRING {
			t.Errorf("source %q: token type = %v, want STRING",
				tt.source, toks[0].Type)
		}

		if toks[0].Literal != tt.wantLiteral {
			t.Errorf("source %q: literal = %q, want %q",
				tt.source, toks[0].Literal, tt.wantLiteral)
		}
	}
}

func TestScanTokens_MultilineString(t *testing.T) {
	source := `"hello
world"`
	scanner := NewScanner(source)
	toks, errs := scanner.ScanTokens()

	if len(errs) != 0 {
		t.Errorf("got errors: %v", errs)
	}

	if len(toks) != 2 {
		t.Fatalf("got %d tokens, want 2", len(toks))
	}

	if toks[0].Line != 1 {
		t.Errorf("token line = %d, want 1", toks[0].Line)
	}

	// Scanner should be on line 2 after multiline string
	if scanner.line != 2 {
		t.Errorf("scanner.line = %d, want 2", scanner.line)
	}
}
```

**Step 4: Run tests**

```bash
go test ./pkg/lexer -v
```

Expected: All tests pass

**Step 5: Commit string scanning**

```bash
git add pkg/lexer/
git commit -m "feat: implement string literal scanning

- Add scanString() method with proper quote handling
- Support multiline strings
- Track line numbers within strings
- Report unterminated strings as errors
- Include tests for various string scenarios"
```

---

## Task 8: Number Literal Scanning

**Files:**
- Modify: `pkg/lexer/scanner.go`
- Modify: `pkg/lexer/scanner_test.go`

**Step 1: Add digit checking helper**

Add to `pkg/lexer/scanner.go`:

```go
// isDigit checks if a character is a digit
func isDigit(c byte) bool {
	return c >= '0' && c <= '9'
}

// peekNext returns the character after current without consuming
func (s *Scanner) peekNext() byte {
	if s.current+1 >= len(s.source) {
		return 0
	}
	return s.source[s.current+1]
}
```

**Step 2: Implement number scanning**

Add to `pkg/lexer/scanner.go`:

```go
import (
	"fmt"
	"strconv"

	"github.com/bhargav/konfiguru/pkg/tokens"
)
```

Then add the method:

```go
// scanNumber scans a number literal
func (s *Scanner) scanNumber() {
	// Consume all digits
	for isDigit(s.peek()) {
		s.advance()
	}

	// Look for a fractional part
	if s.peek() == '.' && isDigit(s.peekNext()) {
		// Consume the "."
		s.advance()

		// Consume fractional digits
		for isDigit(s.peek()) {
			s.advance()
		}
	}

	text := s.source[s.start:s.current]
	value, err := strconv.ParseFloat(text, 64)
	if err != nil {
		s.addError(fmt.Sprintf("Invalid number: %s", text))
		return
	}
	s.addTokenLiteral(tokens.NUMBER, value)
}
```

**Step 3: Add number case to scanToken**

In `scanToken()`, modify the default case to check for digits:

```go
	default:
		if isDigit(c) {
			s.scanNumber()
		} else {
			s.addError("Unexpected character.")
		}
```

**Step 4: Write tests for numbers**

Add to `pkg/lexer/scanner_test.go`:

```go
func TestScanTokens_Numbers(t *testing.T) {
	tests := []struct {
		source      string
		wantLiteral float64
	}{
		{"123", 123.0},
		{"123.456", 123.456},
		{"0", 0.0},
		{"0.123", 0.123},
		{"999.999", 999.999},
	}

	for _, tt := range tests {
		scanner := NewScanner(tt.source)
		toks, errs := scanner.ScanTokens()

		if len(errs) != 0 {
			t.Errorf("source %q: got errors %v", tt.source, errs)
			continue
		}

		if len(toks) != 2 { // NUMBER + EOF
			t.Fatalf("source %q: got %d tokens, want 2", tt.source, len(toks))
		}

		if toks[0].Type != tokens.NUMBER {
			t.Errorf("source %q: token type = %v, want NUMBER",
				tt.source, toks[0].Type)
		}

		if toks[0].Literal != tt.wantLiteral {
			t.Errorf("source %q: literal = %v, want %v",
				tt.source, toks[0].Literal, tt.wantLiteral)
		}
	}
}

func TestScanTokens_NumbersInExpression(t *testing.T) {
	source := "1 + 2.5 - 3.14"
	scanner := NewScanner(source)
	toks, errs := scanner.ScanTokens()

	if len(errs) != 0 {
		t.Errorf("got errors: %v", errs)
	}

	expected := []struct {
		tokenType tokens.TokenType
		literal   interface{}
	}{
		{tokens.NUMBER, 1.0},
		{tokens.PLUS, nil},
		{tokens.NUMBER, 2.5},
		{tokens.MINUS, nil},
		{tokens.NUMBER, 3.14},
		{tokens.EOF, nil},
	}

	if len(toks) != len(expected) {
		t.Fatalf("got %d tokens, want %d", len(toks), len(expected))
	}

	for i, exp := range expected {
		if toks[i].Type != exp.tokenType {
			t.Errorf("token[%d] type = %v, want %v",
				i, toks[i].Type, exp.tokenType)
		}
		if exp.literal != nil && toks[i].Literal != exp.literal {
			t.Errorf("token[%d] literal = %v, want %v",
				i, toks[i].Literal, exp.literal)
		}
	}
}
```

**Step 5: Run tests**

```bash
go test ./pkg/lexer -v
```

Expected: All tests pass

**Step 6: Commit number scanning**

```bash
git add pkg/lexer/
git commit -m "feat: implement number literal scanning

- Add isDigit() and peekNext() helpers
- Scan integer and floating-point numbers
- Handle decimal points correctly
- Parse numbers using strconv.ParseFloat
- Include tests for various number formats"
```

---

## Task 9: Identifier and Keyword Scanning

**Files:**
- Modify: `pkg/lexer/scanner.go`
- Modify: `pkg/lexer/scanner_test.go`

**Step 1: Add identifier helpers**

Add to `pkg/lexer/scanner.go`:

```go
// isAlpha checks if a character is a letter or underscore
func isAlpha(c byte) bool {
	return (c >= 'a' && c <= 'z') ||
		(c >= 'A' && c <= 'Z') ||
		c == '_'
}

// isAlphaNumeric checks if a character is alphanumeric
func isAlphaNumeric(c byte) bool {
	return isAlpha(c) || isDigit(c)
}
```

**Step 2: Implement identifier scanning**

Add to `pkg/lexer/scanner.go`:

```go
// scanIdentifier scans an identifier or keyword
func (s *Scanner) scanIdentifier() {
	for isAlphaNumeric(s.peek()) {
		s.advance()
	}

	text := s.source[s.start:s.current]
	tokenType := tokens.LookupIdent(text)
	s.addToken(tokenType)
}
```

**Step 3: Update scanToken default case**

Modify the default case in `scanToken()`:

```go
	default:
		if isDigit(c) {
			s.scanNumber()
		} else if isAlpha(c) {
			s.scanIdentifier()
		} else {
			s.addError("Unexpected character.")
		}
```

**Step 4: Write tests for identifiers and keywords**

Add to `pkg/lexer/scanner_test.go`:

```go
func TestScanTokens_Identifiers(t *testing.T) {
	tests := []struct {
		source   string
		expected tokens.TokenType
	}{
		{"foo", tokens.IDENTIFIER},
		{"bar123", tokens.IDENTIFIER},
		{"_test", tokens.IDENTIFIER},
		{"camelCase", tokens.IDENTIFIER},
		{"snake_case", tokens.IDENTIFIER},
	}

	for _, tt := range tests {
		scanner := NewScanner(tt.source)
		toks, errs := scanner.ScanTokens()

		if len(errs) != 0 {
			t.Errorf("source %q: got errors %v", tt.source, errs)
			continue
		}

		if len(toks) != 2 { // IDENTIFIER + EOF
			t.Fatalf("source %q: got %d tokens, want 2", tt.source, len(toks))
		}

		if toks[0].Type != tt.expected {
			t.Errorf("source %q: token type = %v, want %v",
				tt.source, toks[0].Type, tt.expected)
		}

		if toks[0].Lexeme != tt.source {
			t.Errorf("source %q: lexeme = %q, want %q",
				tt.source, toks[0].Lexeme, tt.source)
		}
	}
}

func TestScanTokens_Keywords(t *testing.T) {
	tests := []struct {
		source   string
		expected tokens.TokenType
	}{
		{"and", tokens.AND},
		{"class", tokens.CLASS},
		{"else", tokens.ELSE},
		{"false", tokens.FALSE},
		{"for", tokens.FOR},
		{"fun", tokens.FUN},
		{"if", tokens.IF},
		{"nil", tokens.NIL},
		{"or", tokens.OR},
		{"print", tokens.PRINT},
		{"return", tokens.RETURN},
		{"super", tokens.SUPER},
		{"this", tokens.THIS},
		{"true", tokens.TRUE},
		{"var", tokens.VAR},
		{"while", tokens.WHILE},
	}

	for _, tt := range tests {
		scanner := NewScanner(tt.source)
		toks, errs := scanner.ScanTokens()

		if len(errs) != 0 {
			t.Errorf("source %q: got errors %v", tt.source, errs)
			continue
		}

		if len(toks) != 2 {
			t.Fatalf("source %q: got %d tokens, want 2", tt.source, len(toks))
		}

		if toks[0].Type != tt.expected {
			t.Errorf("source %q: token type = %v, want %v",
				tt.source, toks[0].Type, tt.expected)
		}
	}
}

func TestScanTokens_KeywordsVsIdentifiers(t *testing.T) {
	source := "var variable = 5;"
	scanner := NewScanner(source)
	toks, errs := scanner.ScanTokens()

	if len(errs) != 0 {
		t.Errorf("got errors: %v", errs)
	}

	expected := []tokens.TokenType{
		tokens.VAR,        // keyword
		tokens.IDENTIFIER, // variable
		tokens.EQUAL,
		tokens.NUMBER,
		tokens.SEMICOLON,
		tokens.EOF,
	}

	if len(toks) != len(expected) {
		t.Fatalf("got %d tokens, want %d", len(toks), len(expected))
	}

	for i, exp := range expected {
		if toks[i].Type != exp {
			t.Errorf("token[%d] = %v, want %v", i, toks[i].Type, exp)
		}
	}
}
```

**Step 5: Run tests**

```bash
go test ./pkg/lexer -v
```

Expected: All tests pass

**Step 6: Commit identifier and keyword scanning**

```bash
git add pkg/lexer/
git commit -m "feat: implement identifier and keyword scanning

- Add isAlpha() and isAlphaNumeric() helpers
- Scan identifiers (letters, digits, underscores)
- Distinguish keywords from identifiers using LookupIdent
- Include comprehensive tests for identifiers vs keywords"
```

---

## Task 10: Integration Test Suite

**Files:**
- Create: `pkg/lexer/integration_test.go`

**Step 1: Write comprehensive integration tests**

Create file: `pkg/lexer/integration_test.go`

```go
package lexer

import (
	"testing"

	"github.com/bhargav/konfiguru/pkg/tokens"
)

func TestScanTokens_CompleteProgram(t *testing.T) {
	source := `
var x = 10;
var y = 20;
var result = x + y;
print result;
`

	scanner := NewScanner(source)
	toks, errs := scanner.ScanTokens()

	if len(errs) != 0 {
		t.Fatalf("got errors: %v", errs)
	}

	expected := []tokens.TokenType{
		tokens.VAR, tokens.IDENTIFIER, tokens.EQUAL, tokens.NUMBER, tokens.SEMICOLON,
		tokens.VAR, tokens.IDENTIFIER, tokens.EQUAL, tokens.NUMBER, tokens.SEMICOLON,
		tokens.VAR, tokens.IDENTIFIER, tokens.EQUAL, tokens.IDENTIFIER, tokens.PLUS,
		tokens.IDENTIFIER, tokens.SEMICOLON,
		tokens.PRINT, tokens.IDENTIFIER, tokens.SEMICOLON,
		tokens.EOF,
	}

	if len(toks) != len(expected) {
		t.Fatalf("got %d tokens, want %d", len(toks), len(expected))
	}

	for i, exp := range expected {
		if toks[i].Type != exp {
			t.Errorf("token[%d] = %v, want %v", i, toks[i].Type, exp)
		}
	}
}

func TestScanTokens_IfStatement(t *testing.T) {
	source := `if (x > 5) {
    print "large";
} else {
    print "small";
}`

	scanner := NewScanner(source)
	toks, errs := scanner.ScanTokens()

	if len(errs) != 0 {
		t.Fatalf("got errors: %v", errs)
	}

	expected := []tokens.TokenType{
		tokens.IF, tokens.LEFT_PAREN, tokens.IDENTIFIER, tokens.GREATER, tokens.NUMBER,
		tokens.RIGHT_PAREN, tokens.LEFT_BRACE,
		tokens.PRINT, tokens.STRING, tokens.SEMICOLON,
		tokens.RIGHT_BRACE, tokens.ELSE, tokens.LEFT_BRACE,
		tokens.PRINT, tokens.STRING, tokens.SEMICOLON,
		tokens.RIGHT_BRACE,
		tokens.EOF,
	}

	if len(toks) != len(expected) {
		t.Fatalf("got %d tokens, want %d", len(toks), len(expected))
	}

	for i, exp := range expected {
		if toks[i].Type != exp {
			t.Errorf("token[%d] = %v, want %v", i, toks[i].Type, exp)
		}
	}
}

func TestScanTokens_FunctionDeclaration(t *testing.T) {
	source := `fun add(a, b) {
    return a + b;
}`

	scanner := NewScanner(source)
	toks, errs := scanner.ScanTokens()

	if len(errs) != 0 {
		t.Fatalf("got errors: %v", errs)
	}

	expected := []tokens.TokenType{
		tokens.FUN, tokens.IDENTIFIER, tokens.LEFT_PAREN, tokens.IDENTIFIER,
		tokens.COMMA, tokens.IDENTIFIER, tokens.RIGHT_PAREN, tokens.LEFT_BRACE,
		tokens.RETURN, tokens.IDENTIFIER, tokens.PLUS, tokens.IDENTIFIER,
		tokens.SEMICOLON, tokens.RIGHT_BRACE,
		tokens.EOF,
	}

	if len(toks) != len(expected) {
		t.Fatalf("got %d tokens, want %d", len(toks), len(expected))
	}

	for i, exp := range expected {
		if toks[i].Type != exp {
			t.Errorf("token[%d] = %v, want %v", i, toks[i].Type, exp)
		}
	}
}

func TestScanTokens_ComplexExpression(t *testing.T) {
	source := `(5 + 3) * 2 - 7 / 2.5 >= 10 and true or false`

	scanner := NewScanner(source)
	toks, errs := scanner.ScanTokens()

	if len(errs) != 0 {
		t.Fatalf("got errors: %v", errs)
	}

	// Just verify we got all tokens without errors
	// and that we have the right count
	if len(toks) < 15 {
		t.Errorf("got %d tokens, expected at least 15", len(toks))
	}

	// Verify last token is EOF
	if toks[len(toks)-1].Type != tokens.EOF {
		t.Errorf("last token = %v, want EOF", toks[len(toks)-1].Type)
	}
}

func TestScanTokens_WithErrors(t *testing.T) {
	source := `var x = "unterminated string
var y @ 5;`

	scanner := NewScanner(source)
	_, errs := scanner.ScanTokens()

	// Should have at least 2 errors: unterminated string and @ character
	if len(errs) < 2 {
		t.Errorf("got %d errors, want at least 2", len(errs))
	}
}
```

**Step 2: Run integration tests**

```bash
go test ./pkg/lexer -v -run Integration
```

Expected: All tests pass

**Step 3: Run all lexer tests**

```bash
go test ./pkg/lexer -v
```

Expected: All tests pass

**Step 4: Commit integration tests**

```bash
git add pkg/lexer/integration_test.go
git commit -m "test: add comprehensive integration tests for lexer

- Test complete Lox programs
- Test if statements, functions, expressions
- Test error handling with invalid input
- Verify lexer handles complex real-world code"
```

---

## Task 11: CLI REPL

**Files:**
- Create: `cmd/lox/main.go`

**Step 1: Create basic REPL**

Create file: `cmd/lox/main.go`

```go
package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/bhargav/konfiguru/pkg/lexer"
)

func main() {
	if len(os.Args) > 2 {
		fmt.Println("Usage: lox [script]")
		os.Exit(64)
	} else if len(os.Args) == 2 {
		runFile(os.Args[1])
	} else {
		runPrompt()
	}
}

func runFile(path string) {
	bytes, err := os.ReadFile(path)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading file: %v\n", err)
		os.Exit(74)
	}
	run(string(bytes))
}

func runPrompt() {
	reader := bufio.NewReader(os.Stdin)

	fmt.Println("Lox REPL (Lexer only - Month 1)")
	fmt.Println("Type 'exit' to quit")
	fmt.Println()

	for {
		fmt.Print("> ")
		line, err := reader.ReadString('\n')
		if err != nil {
			break
		}

		line = strings.TrimSpace(line)
		if line == "exit" {
			break
		}

		if line == "" {
			continue
		}

		run(line)
	}
}

func run(source string) {
	scanner := lexer.NewScanner(source)
	tokens, errors := scanner.ScanTokens()

	if len(errors) > 0 {
		for _, err := range errors {
			fmt.Println(err)
		}
		return
	}

	for _, token := range tokens {
		fmt.Println(token)
	}
}
```

**Step 2: Build and test the REPL**

```bash
go build -o lox ./cmd/lox
./lox
```

Expected: REPL starts and you can type expressions

Test in REPL:
```
> var x = 5;
> print "hello";
> exit
```

**Step 3: Create test Lox file**

Create file: `examples/test.lox`

```lox
// Test Lox file
var x = 10;
var y = 20;
var result = x + y;

if (result > 25) {
    print "Large result";
} else {
    print "Small result";
}

fun add(a, b) {
    return a + b;
}

print add(5, 3);
```

**Step 4: Test file scanning**

```bash
./lox examples/test.lox
```

Expected: All tokens printed without errors

**Step 5: Commit REPL**

```bash
git add cmd/lox/main.go examples/test.lox
git commit -m "feat: add Lox REPL and file scanning

- Implement REPL for interactive testing
- Support file-based scanning: lox script.lox
- Add example Lox file for testing
- Print all tokens with line numbers"
```

---

## Task 12: Documentation and Final Testing

**Files:**
- Modify: `README.md`
- Create: `docs/month-1-completion.md`

**Step 1: Update README with Month 1 status**

Modify `README.md`:

```markdown
# Konfiguru (Learning Phase: Lox Interpreter)

**Current Phase:** Month 1 - ✅ Lox Lexer Complete

**Learning Goal:** Master lexing, parsing, and interpretation before building Konfiguru DSL

**Following:** "Crafting Interpreters" by Robert Nystrom

## Progress

- [x] Project setup
- [x] Lox lexer (Chapter 4) - **COMPLETE**
- [ ] Lox parser (Chapters 5-7) - Month 2
- [ ] Lox interpreter (Chapters 8-11) - Month 3
- [ ] Konfiguru DSL design (Month 4+)

## What We Built (Month 1)

A complete lexical analyzer (scanner/tokenizer) for the Lox language that:

- ✅ Tokenizes all Lox syntax (operators, keywords, literals)
- ✅ Handles single and two-character tokens
- ✅ Scans strings, numbers, identifiers, and keywords
- ✅ Supports comments (// style)
- ✅ Tracks line numbers for error reporting
- ✅ Comprehensive test coverage (50+ tests)

## Run Lox REPL

```bash
make build
./lox
```

## Scan a Lox File

```bash
./lox examples/test.lox
```

## Run Tests

```bash
make test
```

## Learning Resources

- **Crafting Interpreters:** https://craftinginterpreters.com/
- **Go Tour:** https://go.dev/tour/
- **Go by Example:** https://gobyexample.com/

## Next Month

Month 2: Build Lox parser to convert tokens → Abstract Syntax Tree (AST)
```

**Step 2: Create completion document**

Create file: `docs/month-1-completion.md`

```markdown
# Month 1 Completion Report

**Date:** 2025-11-15
**Phase:** Foundation - Go Fundamentals + Lox Lexer
**Status:** ✅ COMPLETE

---

## What We Built

### Complete Lox Lexer in Go

A production-quality lexical analyzer for the Lox programming language:

**Features:**
- Single-character tokens: `( ) { } , . - + ; * /`
- Two-character operators: `!= == <= >=`
- String literals with multiline support
- Number literals (integers and floats)
- Identifiers and keywords (15 Lox keywords)
- Comment support (`// ...`)
- Line number tracking
- Comprehensive error reporting

**Code Statistics:**
- ~300 lines of production code
- ~400 lines of test code
- 50+ test cases
- 100% functionality coverage

---

## Skills Learned

### Go Programming
- ✅ Package structure and imports
- ✅ Structs and methods
- ✅ Slices and maps
- ✅ Interfaces (TokenType, error handling)
- ✅ Table-driven tests
- ✅ File I/O
- ✅ String manipulation
- ✅ Error handling patterns

### Compiler Design
- ✅ Lexical analysis fundamentals
- ✅ Token recognition algorithms
- ✅ Lookahead techniques (peek, peekNext, match)
- ✅ State tracking (line numbers, positions)
- ✅ Error recovery in lexers

---

## Testing Approach

**Test Categories:**
1. **Unit Tests:** Individual token types
2. **Integration Tests:** Complete programs
3. **Error Tests:** Invalid input handling
4. **Edge Cases:** Empty input, unterminated strings, etc.

**Coverage:**
- All token types tested
- Error conditions verified
- Real Lox code samples scanned successfully

---

## What's Next (Month 2)

### Lox Parser Implementation

Following Crafting Interpreters Chapters 5-7:

1. **Expression Grammar**
   - Binary expressions (+, -, *, /)
   - Unary expressions (-, !)
   - Grouping with parentheses
   - Literals (numbers, strings, booleans)

2. **Abstract Syntax Tree (AST)**
   - Visitor pattern in Go
   - Expression nodes
   - Pretty printing

3. **Recursive Descent Parser**
   - Operator precedence
   - Error synchronization
   - Parse error reporting

**Estimated Time:** 4 weeks (13.5 hrs/week = 54 total hours)

---

## Reflections

### What Went Well
- Go's simplicity made lexer implementation straightforward
- Table-driven tests caught edge cases early
- REPL provides instant feedback for testing
- Following CI book closely prevented design mistakes

### Challenges
- Understanding Go's byte vs rune distinction
- Proper error handling patterns (Go idioms)
- Test organization (balancing unit vs integration)

### Lessons Learned
- TDD saved time (caught bugs before manual testing)
- Small commits made debugging easier
- Go's standard library is excellent for parsing

---

## Time Tracking

**Planned:** 54 hours (13.5 hrs/week × 4 weeks)
**Actual:** [Fill in your actual hours]

**Breakdown:**
- Go course: ~20 hours
- Coding: ~25 hours
- Testing: ~5 hours
- Documentation: ~4 hours

---

## Resources Used

1. **Crafting Interpreters** - Chapter 4 (Scanning)
2. **Go Course** - Sections 1-10
3. **Go Standard Library** - strings, bufio, strconv packages
4. **Stack Overflow** - Byte vs rune handling

---

## Next Steps

1. Read Crafting Interpreters Chapters 5-6
2. Design AST nodes for Lox expressions
3. Implement visitor pattern in Go
4. Build recursive descent parser
5. Start Month 2 with expression parsing

---

**Achievement Unlocked:** First working compiler component! 🎉

**Portfolio Status:**
- GitHub: First substantial Go project
- Skills: Go basics → intermediate
- Compiler knowledge: Lexing ✅

**Momentum:** Keep the weekly schedule (13.5 hrs). You're on track!
```

**Step 3: Run final test suite**

```bash
# Run all tests with coverage
go test ./... -v -cover

# Build release binary
make build
```

**Step 4: Final commit**

```bash
git add .
git commit -m "docs: complete Month 1 - Lox lexer implementation

- Update README with completion status
- Add Month 1 completion report
- Document skills learned and next steps
- Ready for Month 2: Parser implementation"
```

---

## Completion Checklist

Before considering Month 1 complete, verify:

- [ ] All files created in correct locations
- [ ] All tests passing: `go test ./... -v`
- [ ] REPL works: `./lox` runs and accepts input
- [ ] File scanning works: `./lox examples/test.lox` succeeds
- [ ] No errors: `go build ./...` succeeds
- [ ] Documentation updated (README, completion doc)
- [ ] All commits pushed to GitHub
- [ ] Linear issue "Month 1: Lox Lexer" marked complete
- [ ] Obsidian daily notes updated

---

## Success Metrics

**By end of Month 1, you should have:**

✅ **Technical:**
- Complete Lox lexer (~300 lines Go code)
- 50+ passing tests
- Working REPL
- Understanding of lexical analysis

✅ **Learning:**
- Go proficiency: Basic → Intermediate
- Can write structs, methods, tests
- Comfortable with Go project structure
- Understand compiler frontend basics

✅ **Portfolio:**
- First compiler component on GitHub
- Proof of consistent learning (4 weeks of commits)
- Foundation for Month 2 parser work

---

## Troubleshooting

### Issue: Tests failing with import errors

**Solution:**
```bash
go mod tidy
go test ./...
```

### Issue: REPL not accepting input

**Check:** bufio.Reader setup in main.go
**Verify:** `strings.TrimSpace(line)` is called

### Issue: Number parsing errors

**Check:** Import `strconv` package
**Verify:** Using `strconv.ParseFloat(text, 64)`

---

## What You've Accomplished

You've built a **production-quality lexer** in Go for a complete programming language. This is the foundation of all compilers!

**Before Month 1:** Zero Go code, zero compiler knowledge
**After Month 1:** Working lexer, solid Go skills, understanding of tokenization

**This is real compiler engineering.** You're not following a tutorial blindly - you're building a system that transforms text into tokens, the first step in running code.

**Next month, those tokens become a tree. Keep going!** 🚀

---

**Plan Status:** Ready for execution
**Estimated Time:** 54 hours over 4 weeks
**Prerequisites:** Go 1.21+, Crafting Interpreters book
**Next Document:** Month 2 Parser Implementation Plan
