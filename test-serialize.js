const Butler = require(`noddity-butler`)
const level = require(`level-mem`)
const fsRetrieval = require(`noddity-fs-retrieval`)
const { createIndex, loadIndexObject, serializeIndex, deserializeIndex } = require(`./`)
const fs = require(`fs`)
const parseJson = require(`fast-json-parse`)

async function serialize() {
	const butler = new Butler(fsRetrieval(`/Users/josh/code/KayserCommentary/Markdown/Web`), level(`teehee`))

	console.time(`Building index from disk`)

	const index = await createIndex(butler, {
		title: 100,
		categories: 5,
	})
	console.timeEnd(`Building index from disk`)

	fs.writeFileSync(`./serialized-index.json`, serializeIndex(index))
}

async function deserialize() {
	console.time(`Loading with require`)
	let data = require(`./serialized-index.json`)
	console.timeEnd(`Loading with require`)

	console.time(`Loading with JSON.parse`)
	data = JSON.parse(fs.readFileSync(`./serialized-index.json`, { encoding: `utf8` }))
	console.timeEnd(`Loading with JSON.parse`)

	// console.time(`Loading with fast-json-parse`)
	// data = parseJson(fs.readFileSync(`./serialized-index.json`, { encoding: `utf8` }))
	// console.timeEnd(`Loading with fast-json-parse`)

	console.time(`Creating index from data`)
	const index1 = loadIndexObject(data)
	console.timeEnd(`Creating index from data`)
}

serialize().then(deserialize)
