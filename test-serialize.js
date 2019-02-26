const Butler = require(`noddity-butler`)
const level = require(`level-mem`)
const fsRetrieval = require(`noddity-fs-retrieval`)
const { createIndex, loadIndexObject, serializeIndex, deserializeIndex } = require(`./`)
const fs = require(`fs`)

const { loadArray, saveArray } = require(`./fs-db-thingy.js`)



// invertedIndex, fieldVectors
async function serialize() {
	const butler = new Butler(fsRetrieval(`/Users/joshduff/code/KayserCommentary/Markdown/Web`), level(`teehee`))

	console.time(`Building index from disk`)

	const index = await createIndex(butler, {
		title: 100,
		categories: 5,
	})
	console.timeEnd(`Building index from disk`)

	console.time(`Saving single file`)

	fs.writeFileSync(`./serialized-index-big.json`, JSON.stringify(index, null, `\t`))

	console.timeEnd(`Saving single file`)

	console.time(`Saving`)

	const serializable = index.toJSON()

	await saveArray(`./inverted-index.txt`, serializable.invertedIndex)
	await saveArray(`./field-vectors.txt`, serializable.fieldVectors)
	delete serializable.invertedIndex
	delete serializable.fieldVectors
	fs.writeFileSync(`./serialized-index.json`, JSON.stringify(serializable))
	console.timeEnd(`Saving`)
}

const load = file => new Promise((resolve, reject) => require(`fs`).readFile(
	file,
	{ encoding: `utf8` },
	(err, data) => err ? reject(err) : resolve(data))
)

async function deserialize() {
	// always slower
	// console.time(`Loading with require`)
	// let data = require(`./serialized-index.json`)
	// console.timeEnd(`Loading with require`)

	console.time(`Reading big file from disk`)

	const bigFileContents = fs.readFileSync(`./serialized-index-big.json`, { encoding: `utf8` })

	console.timeEnd(`Reading big file from disk`)

	// ~834ms
	console.time(`JSON.parse`)
	const data1 = JSON.parse(bigFileContents)
	console.timeEnd(`JSON.parse`)

	console.time(`eval`)
	const data2 = Function(`return (` + bigFileContents + `)`)
	console.timeEnd(`eval`)
	console.log(Object.keys(data2))

	console.time(`Loading smarter`)

	const [ base, invertedIndex, fieldVectors ] = await Promise.all([
		load(`./serialized-index.json`).then(string => JSON.parse(string)),
		loadArray(`./inverted-index.txt`),
		loadArray(`./field-vectors.txt`),
	])

	base.invertedIndex = invertedIndex
	base.fieldVectors = fieldVectors

	console.timeEnd(`Loading smarter`)
}

serialize().then(deserialize).catch(err => {
	console.error(`ERROR`, err)
})

