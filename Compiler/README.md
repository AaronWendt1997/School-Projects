# Compiler
Takes in a language similar to C (called the 'egg' language) and compiles into mips assembly language.

## Step 1
egg.jlex will scan the written code and return a symbol for each token, storing it in the symbol table.

## Step 2
Using an abstract syntax tree, parse the symbols in the symbol table and return a formatted version of the egg language.  
  -this can be seen in the unparse methods of ast.java

## Step 3
Using the abstract syntax tree, perform semantic analysis to check for undeclared variables, multiple declarations in scope, accessing out of scope variables, etc.  
  -this can be seen in the nameanalysis methods of ast.java
  
## Step 4
Using the abstract syntax tree, perform type checking on all variables assignments.
  -this can be seen in the typecheck methods of ast.java
  
## Step 5
Convert the code to mips assembly language
  -this can be seen in the codegen methods of ast.java
