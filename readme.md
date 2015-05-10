# noddity-search

Making it easy for you to add search functionality to your [Noddity](http://noddity.com/) blag or server.

Part of the Noddity ecosystem, lulz

## Usage

```js

var fields = {
	customParameterInMyMetadata: 10
}

var searcher = require('noddity-search')
var search = searcher(noddityButler, fields)

search('butts', function(err, posts) {
	posts.forEach(function(post) {
		console.log('found post', post.title)
	})
})
```

## Construction

`searcher(butler, [fields])`

`butler` is a [noddity-butler](https://github.com/TehShrike/noddity-butler)

`fields` is an optional key:boost mapping.  Add any custom metadata properties you want to use, and tweak their score accordingly.

Currently, `metadata.title` and `content` are indexed with scores of 10 and 1 respectively.  If you want to pass in custom indexing/boosting directions, they might look something like this:

```js
{
	title: 20,
	tags: 50
}
```

The construction method returns a function to be used for searching.  Explained here:

## Searching

```js
search('this text was typed into an autocomplete bae', function(err, posts) {
	console.log(posts)
})
```

Whatever text your funky users typed, pass it to the search function and it will be thrown at the side of the [lunr](http://lunrjs.com) index, with the resulting posts returned to you in an error-first callback.

# License

[WTFPL](http://wtfpl2.com/)
