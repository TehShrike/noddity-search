const lunr = require(`lunr`)
const pify = require(`pify`)

const defaultFields = {
	title: 20,
	content: 1,
}

const loadIndexObject = indexData => lunr.Index.load(indexData)

module.exports = {
	async createIndex(basicButler, fields) {
		const butler = pify(basicButler)


		const posts = await butler.getPosts()
		const indexableDocuments = posts.map(transformPostForIndexing)

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
	serializeIndex(index) {
		return JSON.stringify(index)
	},
	loadIndexObject,
	deserializeIndex(string) {
		return loadIndexObject(JSON.parse(string))
	},
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
