# Month 5: Mini-Compiler (DSL → K8s YAML) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working mini-compiler that transforms simple Konfiguru DSL code into Kubernetes YAML manifests. This proves the concept before building the full Konfiguru compiler.

**Architecture:** Hand-written lexer/parser (applying Lox learnings) + client-go for K8s object generation + YAML serialization.

**Tech Stack:** Go 1.21+, client-go, gopkg.in/yaml.v3, Cobra CLI

---

## Prerequisites

Before starting, ensure you have:
- [ ] Completed Month 4 (K8s fundamentals, DSL design)
- [ ] Go proficiency (from Months 1-3)
- [ ] client-go basics understood
- [ ] DSL specification ready

---

## Task 1: Project Structure Setup

**Files:**
- Initialize `konfiguru-mini/` project
- Set up Go module
- Create directory structure

**Step 1: Create project structure**

```bash
cd /home/bhargav/Documents/Side-Projects/konfiguru
mkdir -p konfiguru-mini
cd konfiguru-mini

# Initialize Go module
go mod init github.com/bhargav/konfiguru-mini

# Create directories
mkdir -p cmd/kfg
mkdir -p pkg/lexer
mkdir -p pkg/parser
mkdir -p pkg/ast
mkdir -p pkg/codegen
mkdir -p pkg/cli
mkdir -p examples
mkdir -p test/fixtures
```

**Step 2: Install dependencies**

```bash
# Kubernetes client-go
go get k8s.io/client-go@latest
go get k8s.io/api@latest
go get k8s.io/apimachinery@latest

# YAML library
go get gopkg.in/yaml.v3

# CLI framework
go get github.com/spf13/cobra@latest
```

**Step 3: Create Makefile**

Create file: `Makefile`

```makefile
.PHONY: build test run clean install

build:
	go build -o bin/kfg ./cmd/kfg

test:
	go test -v ./...

test-coverage:
	go test -cover ./...

run:
	go run ./cmd/kfg

install:
	go install ./cmd/kfg

clean:
	rm -rf bin/
	go clean

lint:
	golangci-lint run

# Development helpers
dev-compile:
	./bin/kfg compile examples/web-app.kfg

dev-watch:
	find . -name "*.go" | entr -r make build
```

**Step 4: Create .gitignore**

```gitignore
# Binaries
bin/
*.exe
kfg

# Generated files
*.yaml
*.yml
!examples/*.yaml

# Go
go.work

# IDE
.vscode/
.idea/

# OS
.DS_Store
```

**Step 5: Commit initial structure**

```bash
git add .
git commit -m "feat(mini): initialize konfiguru-mini project structure

- Set up Go module
- Install dependencies (client-go, yaml, cobra)
- Create directory structure
- Add Makefile and .gitignore

Month 5 Day 1"
```

---

## Task 2: Token Types and Lexer

**Files:**
- Create: `pkg/tokens/token.go`
- Create: `pkg/lexer/lexer.go`
- Create: `pkg/lexer/lexer_test.go`

**Step 1: Define token types**

Create file: `pkg/tokens/token.go`

```go
package tokens

type TokenType int

const (
	// Special
	EOF TokenType = iota
	ILLEGAL

	// Literals
	IDENTIFIER  // service_name, my_var
	STRING      // "nginx:1.21"
	NUMBER      // 80, 3

	// Keywords
	SERVICE
	DATABASE
	IMAGE
	PORT
	REPLICAS
	ENV
	VERSION
	STORAGE

	// Delimiters
	LEFT_BRACE   // {
	RIGHT_BRACE  // }
	COLON        // :
	NEWLINE
)

var keywords = map[string]TokenType{
	"service":  SERVICE,
	"database": DATABASE,
	"image":    IMAGE,
	"port":     PORT,
	"replicas": REPLICAS,
	"env":      ENV,
	"version":  VERSION,
	"storage":  STORAGE,
}

func LookupIdent(ident string) TokenType {
	if tok, ok := keywords[ident]; ok {
		return tok
	}
	return IDENTIFIER
}

type Token struct {
	Type    TokenType
	Lexeme  string
	Literal interface{}
	Line    int
}
```

**Step 2: Implement lexer**

Create file: `pkg/lexer/lexer.go`

```go
package lexer

import (
	"unicode"

	"github.com/bhargav/konfiguru-mini/pkg/tokens"
)

type Lexer struct {
	input   string
	pos     int
	readPos int
	ch      byte
	line    int
}

func New(input string) *Lexer {
	l := &Lexer{input: input, line: 1}
	l.readChar()
	return l
}

func (l *Lexer) NextToken() tokens.Token {
	var tok tokens.Token

	l.skipWhitespace()

	switch l.ch {
	case '{':
		tok = l.newToken(tokens.LEFT_BRACE, string(l.ch))
	case '}':
		tok = l.newToken(tokens.RIGHT_BRACE, string(l.ch))
	case ':':
		tok = l.newToken(tokens.COLON, string(l.ch))
	case '"':
		tok.Type = tokens.STRING
		tok.Literal = l.readString()
		tok.Lexeme = tok.Literal.(string)
		tok.Line = l.line
		return tok
	case 0:
		tok = l.newToken(tokens.EOF, "")
	default:
		if isLetter(l.ch) {
			tok.Lexeme = l.readIdentifier()
			tok.Type = tokens.LookupIdent(tok.Lexeme)
			tok.Line = l.line
			return tok
		} else if isDigit(l.ch) {
			tok.Type = tokens.NUMBER
			tok.Literal = l.readNumber()
			tok.Lexeme = tok.Literal.(string)
			tok.Line = l.line
			return tok
		} else {
			tok = l.newToken(tokens.ILLEGAL, string(l.ch))
		}
	}

	l.readChar()
	return tok
}

func (l *Lexer) newToken(tokenType tokens.TokenType, lexeme string) tokens.Token {
	return tokens.Token{
		Type:   tokenType,
		Lexeme: lexeme,
		Line:   l.line,
	}
}

func (l *Lexer) readChar() {
	if l.readPos >= len(l.input) {
		l.ch = 0
	} else {
		l.ch = l.input[l.readPos]
	}
	l.pos = l.readPos
	l.readPos++

	if l.ch == '\n' {
		l.line++
	}
}

func (l *Lexer) skipWhitespace() {
	for l.ch == ' ' || l.ch == '\t' || l.ch == '\n' || l.ch == '\r' {
		l.readChar()
	}
}

func (l *Lexer) readIdentifier() string {
	position := l.pos
	for isLetter(l.ch) || isDigit(l.ch) || l.ch == '_' || l.ch == '-' {
		l.readChar()
	}
	return l.input[position:l.pos]
}

func (l *Lexer) readNumber() string {
	position := l.pos
	for isDigit(l.ch) {
		l.readChar()
	}
	return l.input[position:l.pos]
}

func (l *Lexer) readString() string {
	l.readChar() // skip opening "
	position := l.pos
	for l.ch != '"' && l.ch != 0 {
		l.readChar()
	}
	str := l.input[position:l.pos]
	l.readChar() // skip closing "
	return str
}

func isLetter(ch byte) bool {
	return unicode.IsLetter(rune(ch))
}

func isDigit(ch byte) bool {
	return unicode.IsDigit(rune(ch))
}
```

**Step 3: Write lexer tests**

Create file: `pkg/lexer/lexer_test.go`

```go
package lexer

import (
	"testing"

	"github.com/bhargav/konfiguru-mini/pkg/tokens"
)

func TestLexer_BasicTokens(t *testing.T) {
	input := `service web {
		image: "nginx:1.21"
		port: 80
		replicas: 3
	}`

	tests := []struct {
		expectedType   tokens.TokenType
		expectedLexeme string
	}{
		{tokens.SERVICE, "service"},
		{tokens.IDENTIFIER, "web"},
		{tokens.LEFT_BRACE, "{"},
		{tokens.IMAGE, "image"},
		{tokens.COLON, ":"},
		{tokens.STRING, "nginx:1.21"},
		{tokens.PORT, "port"},
		{tokens.COLON, ":"},
		{tokens.NUMBER, "80"},
		{tokens.REPLICAS, "replicas"},
		{tokens.COLON, ":"},
		{tokens.NUMBER, "3"},
		{tokens.RIGHT_BRACE, "}"},
		{tokens.EOF, ""},
	}

	l := New(input)

	for i, tt := range tests {
		tok := l.NextToken()

		if tok.Type != tt.expectedType {
			t.Fatalf("tests[%d] - tokentype wrong. expected=%q, got=%q",
				i, tt.expectedType, tok.Type)
		}

		if tok.Lexeme != tt.expectedLexeme {
			t.Fatalf("tests[%d] - literal wrong. expected=%q, got=%q",
				i, tt.expectedLexeme, tok.Lexeme)
		}
	}
}
```

**Step 4: Test lexer**

```bash
go test ./pkg/lexer -v
```

Expected: All tests pass

**Step 5: Commit lexer**

```bash
git add pkg/tokens pkg/lexer
git commit -m "feat(mini): implement lexer for mini-Konfiguru DSL

- Define token types (keywords, literals, delimiters)
- Implement lexer with string/number support
- Add comprehensive lexer tests
- Reuse patterns from Lox lexer (Month 1)

Month 5 Day 2-4"
```

---

## Task 3: AST and Parser

**Files:**
- Create: `pkg/ast/ast.go`
- Create: `pkg/parser/parser.go`
- Create: `pkg/parser/parser_test.go`

**Step 1: Define AST nodes**

Create file: `pkg/ast/ast.go`

```go
package ast

type Node interface {
	String() string
}

// Program is the root node
type Program struct {
	Declarations []Declaration
}

type Declaration interface {
	Node
	declNode()
}

// ServiceDeclaration represents a service { } block
type ServiceDeclaration struct {
	Name     string
	Image    string
	Port     int
	Replicas int
	Env      map[string]string
}

func (s *ServiceDeclaration) declNode() {}
func (s *ServiceDeclaration) String() string {
	return "Service: " + s.Name
}

// DatabaseDeclaration represents a database { } block
type DatabaseDeclaration struct {
	Name    string
	Version string
	Storage string
	Env     map[string]string
}

func (d *DatabaseDeclaration) declNode() {}
func (d *DatabaseDeclaration) String() string {
	return "Database: " + d.Name
}
```

**Step 2: Implement parser**

Create file: `pkg/parser/parser.go`

```go
package parser

import (
	"fmt"
	"strconv"

	"github.com/bhargav/konfiguru-mini/pkg/ast"
	"github.com/bhargav/konfiguru-mini/pkg/lexer"
	"github.com/bhargav/konfiguru-mini/pkg/tokens"
)

type Parser struct {
	lexer     *lexer.Lexer
	curToken  tokens.Token
	peekToken tokens.Token
	errors    []string
}

func New(l *lexer.Lexer) *Parser {
	p := &Parser{lexer: l, errors: []string{}}
	p.nextToken()
	p.nextToken()
	return p
}

func (p *Parser) nextToken() {
	p.curToken = p.peekToken
	p.peekToken = p.lexer.NextToken()
}

func (p *Parser) ParseProgram() *ast.Program {
	program := &ast.Program{Declarations: []ast.Declaration{}}

	for p.curToken.Type != tokens.EOF {
		decl := p.parseDeclaration()
		if decl != nil {
			program.Declarations = append(program.Declarations, decl)
		}
		p.nextToken()
	}

	return program
}

func (p *Parser) parseDeclaration() ast.Declaration {
	switch p.curToken.Type {
	case tokens.SERVICE:
		return p.parseServiceDeclaration()
	case tokens.DATABASE:
		return p.parseDatabaseDeclaration()
	default:
		p.addError(fmt.Sprintf("unexpected token: %s", p.curToken.Lexeme))
		return nil
	}
}

func (p *Parser) parseServiceDeclaration() *ast.ServiceDeclaration {
	service := &ast.ServiceDeclaration{Env: make(map[string]string)}

	p.nextToken() // move to name
	service.Name = p.curToken.Lexeme

	p.expectPeek(tokens.LEFT_BRACE)
	p.nextToken()

	for p.curToken.Type != tokens.RIGHT_BRACE && p.curToken.Type != tokens.EOF {
		switch p.curToken.Type {
		case tokens.IMAGE:
			p.expectPeek(tokens.COLON)
			p.nextToken()
			service.Image = p.curToken.Literal.(string)
		case tokens.PORT:
			p.expectPeek(tokens.COLON)
			p.nextToken()
			port, _ := strconv.Atoi(p.curToken.Literal.(string))
			service.Port = port
		case tokens.REPLICAS:
			p.expectPeek(tokens.COLON)
			p.nextToken()
			replicas, _ := strconv.Atoi(p.curToken.Literal.(string))
			service.Replicas = replicas
		case tokens.ENV:
			p.expectPeek(tokens.LEFT_BRACE)
			p.nextToken()
			service.Env = p.parseEnvBlock()
		}
		p.nextToken()
	}

	return service
}

func (p *Parser) parseDatabaseDeclaration() *ast.DatabaseDeclaration {
	db := &ast.DatabaseDeclaration{Env: make(map[string]string)}

	p.nextToken()
	db.Name = p.curToken.Lexeme

	p.expectPeek(tokens.LEFT_BRACE)
	p.nextToken()

	for p.curToken.Type != tokens.RIGHT_BRACE && p.curToken.Type != tokens.EOF {
		switch p.curToken.Type {
		case tokens.VERSION:
			p.expectPeek(tokens.COLON)
			p.nextToken()
			db.Version = p.curToken.Literal.(string)
		case tokens.STORAGE:
			p.expectPeek(tokens.COLON)
			p.nextToken()
			db.Storage = p.curToken.Literal.(string)
		case tokens.ENV:
			p.expectPeek(tokens.LEFT_BRACE)
			p.nextToken()
			db.Env = p.parseEnvBlock()
		}
		p.nextToken()
	}

	return db
}

func (p *Parser) parseEnvBlock() map[string]string {
	env := make(map[string]string)

	for p.curToken.Type != tokens.RIGHT_BRACE && p.curToken.Type != tokens.EOF {
		if p.curToken.Type == tokens.IDENTIFIER {
			key := p.curToken.Lexeme
			p.expectPeek(tokens.COLON)
			p.nextToken()
			value := p.curToken.Literal.(string)
			env[key] = value
		}
		p.nextToken()
	}

	return env
}

func (p *Parser) expectPeek(t tokens.TokenType) bool {
	if p.peekToken.Type == t {
		p.nextToken()
		return true
	}
	p.addError(fmt.Sprintf("expected %v, got %v", t, p.peekToken.Type))
	return false
}

func (p *Parser) addError(msg string) {
	p.errors = append(p.errors, msg)
}

func (p *Parser) Errors() []string {
	return p.errors
}
```

**Step 3: Write parser tests**

Create file: `pkg/parser/parser_test.go`

```go
package parser

import (
	"testing"

	"github.com/bhargav/konfiguru-mini/pkg/lexer"
)

func TestParser_ServiceDeclaration(t *testing.T) {
	input := `service web {
		image: "nginx:1.21"
		port: 80
		replicas: 3
	}`

	l := lexer.New(input)
	p := New(l)

	program := p.ParseProgram()

	if len(p.Errors()) > 0 {
		t.Fatalf("parser has errors: %v", p.Errors())
	}

	if len(program.Declarations) != 1 {
		t.Fatalf("expected 1 declaration, got %d", len(program.Declarations))
	}

	// Additional assertions...
}
```

**Step 4: Test parser**

```bash
go test ./pkg/parser -v
```

**Step 5: Commit parser**

```bash
git add pkg/ast pkg/parser
git commit -m "feat(mini): implement parser for mini-Konfiguru DSL

- Define AST nodes (ServiceDeclaration, DatabaseDeclaration)
- Implement recursive descent parser
- Add parser tests
- Support service and database blocks

Month 5 Day 5-7"
```

---

## Task 4: Code Generation (K8s YAML)

**Files:**
- Create: `pkg/codegen/kubernetes.go`
- Create: `pkg/codegen/kubernetes_test.go`

**Step 1: Implement K8s code generator**

Create file: `pkg/codegen/kubernetes.go`

```go
package codegen

import (
	"github.com/bhargav/konfiguru-mini/pkg/ast"
	appsv1 "k8s.io/api/core/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	appsv1types "k8s.io/api/apps/v1"
)

type Generator struct{}

func NewGenerator() *Generator {
	return &Generator{}
}

func (g *Generator) GenerateDeployment(service *ast.ServiceDeclaration) *appsv1types.Deployment {
	replicas := int32(service.Replicas)

	return &appsv1types.Deployment{
		TypeMeta: metav1.TypeMeta{
			APIVersion: "apps/v1",
			Kind:       "Deployment",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name: service.Name,
			Labels: map[string]string{
				"app": service.Name,
			},
		},
		Spec: appsv1types.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": service.Name,
				},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": service.Name,
					},
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{
							Name:  service.Name,
							Image: service.Image,
							Ports: []corev1.ContainerPort{
								{
									ContainerPort: int32(service.Port),
								},
							},
							Env: g.envVarsFromMap(service.Env),
						},
					},
				},
			},
		},
	}
}

func (g *Generator) GenerateService(service *ast.ServiceDeclaration) *corev1.Service {
	return &corev1.Service{
		TypeMeta: metav1.TypeMeta{
			APIVersion: "v1",
			Kind:       "Service",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name: service.Name,
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{
				"app": service.Name,
			},
			Ports: []corev1.ServicePort{
				{
					Protocol:   corev1.ProtocolTCP,
					Port:       int32(service.Port),
					TargetPort: intstr.FromInt(service.Port),
				},
			},
		},
	}
}

func (g *Generator) envVarsFromMap(envMap map[string]string) []corev1.EnvVar {
	vars := []corev1.EnvVar{}
	for key, value := range envMap {
		vars = append(vars, corev1.EnvVar{
			Name:  key,
			Value: value,
		})
	}
	return vars
}
```

**Step 2: Add YAML serialization**

```go
// Add to codegen/kubernetes.go

import (
	"gopkg.in/yaml.v3"
)

func (g *Generator) ToYAML(obj interface{}) ([]byte, error) {
	return yaml.Marshal(obj)
}
```

**Step 3: Test code generation**

```bash
go test ./pkg/codegen -v
```

**Step 4: Commit codegen**

```bash
git add pkg/codegen
git commit -m "feat(mini): implement Kubernetes code generation

- Generate Deployment from ServiceDeclaration
- Generate Service from ServiceDeclaration
- Support environment variables
- Serialize to YAML using gopkg.in/yaml.v3

Month 5 Day 8-10"
```

---

## Task 5: CLI with Cobra

**Files:**
- Create: `cmd/kfg/main.go`
- Create: `pkg/cli/compile.go`

**Step 1: Create CLI entry point**

Create file: `cmd/kfg/main.go`

```go
package main

import (
	"fmt"
	"os"

	"github.com/bhargav/konfiguru-mini/pkg/cli"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "kfg",
	Short: "Konfiguru Mini - DSL to Kubernetes YAML compiler",
	Long:  `A simple DSL compiler that generates Kubernetes manifests`,
}

func main() {
	rootCmd.AddCommand(cli.CompileCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
```

**Step 2: Create compile command**

Create file: `pkg/cli/compile.go`

```go
package cli

import (
	"fmt"
	"os"

	"github.com/bhargav/konfiguru-mini/pkg/codegen"
	"github.com/bhargav/konfiguru-mini/pkg/lexer"
	"github.com/bhargav/konfiguru-mini/pkg/parser"
	"github.com/spf13/cobra"
)

var CompileCmd = &cobra.Command{
	Use:   "compile [file]",
	Short: "Compile .kfg file to Kubernetes YAML",
	Args:  cobra.ExactArgs(1),
	Run:   compile,
}

func compile(cmd *cobra.Command, args []string) {
	filename := args[0]

	// Read input file
	input, err := os.ReadFile(filename)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading file: %v\n", err)
		os.Exit(1)
	}

	// Lex
	l := lexer.New(string(input))

	// Parse
	p := parser.New(l)
	program := p.ParseProgram()

	if len(p.Errors()) > 0 {
		fmt.Fprintln(os.Stderr, "Parser errors:")
		for _, err := range p.Errors() {
			fmt.Fprintln(os.Stderr, "  ", err)
		}
		os.Exit(1)
	}

	// Generate
	gen := codegen.NewGenerator()

	for _, decl := range program.Declarations {
		switch d := decl.(type) {
		case *ast.ServiceDeclaration:
			deployment := gen.GenerateDeployment(d)
			service := gen.GenerateService(d)

			deploymentYAML, _ := gen.ToYAML(deployment)
			serviceYAML, _ := gen.ToYAML(service)

			fmt.Println("---")
			fmt.Println(string(deploymentYAML))
			fmt.Println("---")
			fmt.Println(string(serviceYAML))
		}
	}
}
```

**Step 3: Build and test CLI**

```bash
make build

# Test
./bin/kfg compile examples/web-app.kfg
```

Expected: Kubernetes YAML output

**Step 4: Commit CLI**

```bash
git add cmd/kfg pkg/cli
git commit -m "feat(mini): add CLI with compile command

- Create Cobra-based CLI
- Implement compile command
- Output generated YAML to stdout
- Support .kfg file input

Month 5 Day 11-12"
```

---

## Completion Checklist

**Month 5 Complete:**
- [ ] Mini-compiler lexer working
- [ ] Parser generates AST
- [ ] Code generator produces K8s YAML
- [ ] CLI compiles .kfg → YAML
- [ ] 10+ tests passing
- [ ] 5+ example .kfg files
- [ ] Can generate Deployment + Service
- [ ] Documentation complete

**What You Built:**
- ✅ Working DSL compiler (400+ lines Go)
- ✅ Lexer/parser (reused Lox patterns)
- ✅ Kubernetes code generation
- ✅ CLI tool
- ✅ Example programs

**Ready for Month 6:**
- CKA certification preparation intensifies
- Mini-compiler serves as proof-of-concept
- Foundation laid for full Konfiguru (Month 7+)

---

**Plan Status:** Ready for execution
**Estimated Time:** 54 hours over 4 weeks
**Next:** Month 6 CKA Certification
