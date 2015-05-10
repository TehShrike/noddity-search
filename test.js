var Butler = require('noddity-butler')
var level = require('level-mem')
var searcher = require('./')

var butler = new Butler('http://joshduff.com/content/', level('teehee'))

var search = searcher(butler, {
	title: 100,
	categories: 5
})

butler.getPosts(function(err, posts) {
	search('query mysql', function(err, posts) {
		posts.forEach(function(post) {
			console.log(post.filename)
		})
	})
})
