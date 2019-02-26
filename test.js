const Butler = require(`noddity-butler`)
const level = require(`level-mem`)
const fsRetrieval = require(`noddity-fs-retrieval`)
const { createIndex, searchIndex } = require(`./`)

async function main() {
	const butler = new Butler(fsRetrieval(`/Users/joshduff/code/KayserCommentary/Markdown/Web`), level(`teehee`))

	console.time(`Building index from disk`)

	const index = await createIndex(butler, {
		title: 100,
		categories: 5,
	})

	console.timeEnd(`Building index from disk`)

	console.time(`Searching`)

	const results = await searchIndex(butler, index, `festivals`)

	console.timeEnd(`Searching`)
	results.forEach(post => console.log(post.metadata.title, `---`, post.filename))
}

main()
