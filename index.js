var lunr = require('lunr')
var extend = require('extend')
var each = require('async-each')

var defaultFields = {
	title: 20,
	content: 1
}

function setUpIndex(lunrIndex, fields) {
	Object.keys(fields).map(function(key) {
		return {
			name: key,
			boost: fields[key]
		}
	}).forEach(function(field) {
		lunrIndex.field(field.name, { boost: field.boost })
	})
}

module.exports = function(butler, fields) {
	var index = lunr(function() {
		var lunrIndex = this

		setUpIndex(lunrIndex, extend({}, defaultFields, fields))

		this.ref('filename')
	})

	function indexPost(post) {
		var indexableObject = extend({}, post.metadata, post)
		delete indexableObject.metadata

		index.update(indexableObject)
	}

	butler.getPosts()

	butler.on('post changed', function(filename, post) {
		indexPost(post)
	})

	function getPost(searchResult, cb) {
		butler.getPost(searchResult.ref, cb)
	}

	return function search(term, cb) {
		each(index.search(term), getPost, cb)
	}
}
