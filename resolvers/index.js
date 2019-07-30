const { GraphQLScalarType } = require('graphql')

const resolvers = {
	// Query: {
	// 	totalPhotos: () => photos.length,
	// 	allPhotos: () => photos
	// },
	Query: {
		totalPhotos: (parent, args, { db }) =>
			db.collection('photos').estimatedDocumentCount(),
		allPhotos: (parent, args, { db }) =>
			db.collection('photos').find().toArray(),
		totalUsers: (parent, args, { db }) =>
			db.collection('users').estimatedDocumentCount(),
		allUsers: (parent, args, { db }) =>
			db.collection('users').find().toArray()
	},
	Mutation: {
		postPhoto(parent, args) {
			var newPhoto = {
				id: _id++,
				created: new Date(),
				...args.input
			}

			photos.push(newPhoto);
			return newPhoto;
		}
	},
	Photo: {
		url: parent => "www.google.com",
		postedBy: photo => {
			return users.find(u => u.githubLogin === photo.githubUser);
		},
		taggedUsers: photo => tags
			//returns an array of tags that contain the current photo
			.filter(tag => tag.photoID === photo.id)
			//converts the array of tags into an array of userIDs
			.map(tag => tag.userID)
			//converts the array of userIDs into an array of user objects
			.map(userID => users.find(u => u.githubLogin === userID))
	},
	User: {
		postedPhotos: parent => {
			return photos.filter(p => p.githubUser === parent.githubLogin);
		},
		inPhotos: parent => tags
			//returns an array of tags containing this user
			.filter(tag => tag.userID === parent.id)
			//converts the array of tags into an array of photoIDs
			.map(tag => tag.photoID)
			//converts the array of photoIDs into an array of photo objects
			.map(tag => photos.find(p => p.id === photoID))
	},
	DateTime: new GraphQLScalarType({
		name: 'DateTime',
		description: 'A valid date time value.',
		parseValue: value => new Date(value),
		serialize: value => new Date(value).toISOString(),
		parseLiteral: ast => ast.value
	})
}

module.exports = resolvers
