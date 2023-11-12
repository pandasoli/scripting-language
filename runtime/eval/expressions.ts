import { AssignmentExpr, BinaryExpr, CallExpr, Identifier, ObjectLiteral } from '../../frontend/ast.ts'
import Environment from '../environment.ts'
import { evaluate } from '../interpreter.ts'
import { FunctionValue, MK_NULL, NativeFnValue, NumberVal, ObjectVal, RuntimeVal } from '../values.ts'


function eval_numeric_binary_expr(lhs: NumberVal, rhs: NumberVal, operator: string): NumberVal {
	let result: number

	if      (operator == '+') result = lhs.value + rhs.value
	else if (operator == '-') result = lhs.value - rhs.value
	else if (operator == '*') result = lhs.value * rhs.value
		// TODO: Division by zero checks
	else if (operator == '/') result = lhs.value / rhs.value
	else result = lhs.value % rhs.value

	return { value: result, type: 'number' }
}

export function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {
	const lhs = evaluate(binop.left, env);
	const rhs = evaluate(binop.right, env);

	if (lhs.type == 'number' && rhs.type == 'number')
		return eval_numeric_binary_expr(
			lhs as NumberVal,
			rhs as NumberVal,
			binop.operator
		)

	return MK_NULL()
}

export function eval_identifier(ident: Identifier, env: Environment): RuntimeVal {
	return env.lookupVar(ident.symbol)
}

export function eval_assignment(node: AssignmentExpr, env: Environment): RuntimeVal {
	if (node.assigne.kind !== 'Identifier')
		throw `Invalid LHS inaide assignment expr ${JSON.stringify(node.assigne)}`

	const varname = (node.assigne as Identifier).symbol
	return env.assignVar(varname, evaluate(node.value, env))
}

export function eval_object_expr(obj: ObjectLiteral, env: Environment): RuntimeVal {
	const object = { type: 'object', properties: new Map } as ObjectVal

	for (const { key, value } of obj.properties) {
		const runtimeVal = value == undefined
			? env.lookupVar(key)
			: evaluate(value, env)

		object.properties.set(key, runtimeVal)
	}

	return object
}

export function eval_call_expr(expr: CallExpr, env: Environment): RuntimeVal {
	const args = expr.args.map(arg => evaluate(arg, env))
	const fn = evaluate(expr.caller, env)

	if (fn.type === 'native-fn') {
		const result = (fn as NativeFnValue).call(args, env)
		return result
	}
	else if (fn.type === 'function') {
		const func = fn as FunctionValue
		const scope = new Environment(func.declarationEnvironment)

		// create the variables for the parameters
		for (let i = 0; i < func.params.length; i++) {
			// TODO: Check the bounds here (missing args - more than expected)
			const varname = func.params[i]
			scope.declareVar(varname, args[i], false)
		}

		// evaluate function body one by one, making the result be the last expression
		let result: RuntimeVal = MK_NULL()

		for (const stmt of func.body)
			result = evaluate(stmt, scope)

		return result
	}

	throw `Cannot call value that is not a function: ${JSON.stringify(fn)}`
}