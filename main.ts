import Parser from './frontend/parser.ts'
import Environment, { createGlobalEnv } from './runtime/environment.ts'
import { evaluate } from './runtime/interpreter.ts'
import { MK_NULL, MK_BOOL } from './runtime/values.ts'

// repl()
run('./test.txt')

async function run(filename: string) {
	const parser = new Parser
	const env = createGlobalEnv()

	const input = await Deno.readTextFile(filename)
	const program = parser.produceAST(input)
	evaluate(program, env)
}

function repl() {
	const parser = new Parser
	const env = createGlobalEnv()

	console.log('\nRepl v0.1')

	while (true) {
		const input = prompt('>')

		if (!input || input.includes('exit')) {
			Deno.exit(1)
		}

		const program = parser.produceAST(input)

		evaluate(program, env)
	}
}
