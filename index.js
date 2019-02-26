const FlexSearch = require(`flexsearch`)
const pify = require(`pify`)

const defaultFields = {
	title: 20,
	content: 1,
}



module.exports = {
	async createIndex(basicButler, fields) {
		const butler = pify(basicButler)

		const { toId, toFile } = makeIdJuggler()


		const posts = await butler.getPosts()
		const indexableDocuments = posts.map(transformPostForIndexing)

		const index = new FlexSearch({
			encode: `advanced`,
			tokenize: `strict`,
			depth: 5,
		})

		return lunr(function() {
			const lunrIndex = this

			setUpIndex(lunrIndex, Object.assign({}, defaultFields, fields))

			lunrIndex.ref(`filename`)

			indexableDocuments.forEach(document => lunrIndex.add(document))
		})
	},
	searchIndex(basicButler, index, term) {
		const getPost = pify(basicButler.getPost)
		return Promise.all(index.search(term).map(result => getPost(result.ref)))
	},
	// serializeIndex(index) {
	// 	return JSON.stringify(index, null, `\t`)
	// },
	// loadIndexObject,
	// deserializeIndex(string) {
	// 	return loadIndexObject(JSON.parse(string))
	// },
}

const setUpIndex = (lunrIndex, fields) => {
	Object.keys(fields).map(key => ({
		name: key,
		boost: fields[key],
	})).forEach(field => {
		lunrIndex.field(field.name, { boost: field.boost })
	})
}

const transformPostForIndexing = post => {
	const indexableObject = Object.assign({}, post.metadata, post)
	delete indexableObject.metadata

	return post
}

const makeIdJuggler = () => {
	let nextId = 0
	const idToFile = new Map()
	const fileToId = new Map()

	return {
		toId(filename) {
			if (fileToId.has(filename)) {
				return fileToId.get(filename)
			} else {
				const id = nextId
				nextId += 1
				idToFile.set(id, filename)
				fileToId.set(filename, id)
			}
		},
		toFile(id) {
			if (!idToFile.has(id)) {
				throw new Error(`No file found for id ${ id }`)
			}

			return idToFile.get(id)
		},
	}
}
