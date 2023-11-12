// deno-lint-ignore-file no-empty-interface
export type NodeType =
	// statements
	| 'Program'
	| 'VarDeclaration'
	| 'FunctionDeclaration'

	// expressions
	| 'AssignmentExpr'
	| 'MemberExpr'
	| 'CallExpr'

	// literals
	| 'Property'
	| 'ObjectLiteral'
	| 'NumericLiteral'
	| 'Identifier'
	| 'BinaryExpr'

export interface Stmt {
	kind: NodeType
}

export interface Program extends Stmt {
	kind: 'Program'
	body: Stmt[]
}

export interface VarDeclaration extends Stmt {
	kind: 'VarDeclaration'
	constant: boolean,
	identifier: string
	value?: Expr
}

export interface FunctionDeclaration extends Stmt {
	kind: 'FunctionDeclaration'
	params: string[]
	name: string
	body: Stmt[]
}

export interface Expr extends Stmt {}

/**
 * `assigne` holds the variable.
 * It is an expression because we wanna support objects in the future,
 * and `x.foo` is not an identifier.
 */
export interface AssignmentExpr extends Expr {
	kind: 'AssignmentExpr'
	assigne: Expr
	value: Expr
}

export interface BinaryExpr extends Expr {
	kind: 'BinaryExpr'
	left: Expr
	right: Expr
	operator: string
}

export interface Identifier extends Expr {
	kind: 'Identifier'
	symbol: string
}

export interface NumericLiteral extends Expr {
	kind: 'NumericLiteral'
	value: number
}

/**
 * It uses `value?` to support "{ key }", instead of "{ key: key }".
 */
export interface Property extends Expr {
	kind: 'Property'
	key: string
	value?: Expr
}

export interface ObjectLiteral extends Expr {
	kind: 'ObjectLiteral'
	properties: Property[]
}

export interface CallExpr extends Expr {
	kind: 'CallExpr'
	args: Expr[]
	caller: Expr // e.g.: foo.bar()
}

export interface MemberExpr extends Expr {
	kind: 'MemberExpr'
	object: Expr
	property: Expr
	computed: boolean
}
