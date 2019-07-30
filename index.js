const { ApolloServer } = require('apollo-server')

const typeDefs = `
	enum PhotoCategory {
		SELFIE
		PORTRAIT
		LANDSCAPE
	}

	type User {
		githubLogin: ID!
		name: String
		avatar: String
		postedPhotos: [Photo!]!
		inPhotos: [Photo!]!
	}

	type Photo {
		id: ID!
		url: String!
		name: String!
		description: String
		category: PhotoCategory!
		postedBy: User!
		taggedUsers: [User!]!
	}

	input PostPhotoInput {
		name: String!
		category: PhotoCategory=PORTRAIT
		description: String
	}

	type Query {
		totalPhotos: Int!
		allPhotos: [Photo!]!
	}

	type Mutation {
		postPhoto(input: PostPhotoInput!): Photo!
	}
`

var users = [
	{ "githubLogin": "mHattrup", "name": "Mike Hattrup"},
	{ "githubLogin": "gPlake", "name": "Glen Plake"},
	{ "githubLogin": "sSchmidt", "name": "Scot Schmidt"}
];

var _id = 0;
var photos = [
	{
		"id": "1",
		"name": "Dropping hte Heart Chute",
		"description": "The heart chute is one of my favourite chutes",
		"category": "PORTRAIT",
		"githubUser": "gPlake"
	},
	{
		"id": "2",
		"name": "Enjoying the sunshine",
		"description": "",
		"category": "SELFIE",
		"githubUser": "sSchmidt"
	},
	{
		"id": "3",
		"name": "Gunbarrel 25",
		"description": "25 laps today",
		"category": "LANDSCAPE",
		"githubUser": "sSchmidt"
	}
];

var tags = [
	{ "photoID": "1", "userID": "gPlake" },
	{ "photoID": "2", "userID": "gPlake" },
	{ "photoID": "2", "userID": "sSchmidt" },
	{ "photoID": "2", "userID": "mHattrup" }
]

const resolvers = {
	Query: {
		totalPhotos: () => photos.length,
		allPhotos: () => photos
	},
	Mutation: {
		postPhoto(parent, args) {
			var newPhoto = {
				id: _id++,
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
	}
}

const server = new ApolloServer({
	typeDefs,
	resolvers
})

server
	.listen()
	.then(({url}) => console.log(`GraphQL Server running on ${url}`))