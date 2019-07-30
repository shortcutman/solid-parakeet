const { ApolloServer } = require('apollo-server-express')
const { GraphQLScalarType } = require('graphql')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default

const typeDefs = `
	scalar DateTime

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
		created: DateTime!
	}

	input PostPhotoInput {
		name: String!
		category: PhotoCategory=PORTRAIT
		description: String
	}

	type Query {
		totalPhotos: Int!
		allPhotos(after: DateTime): [Photo!]!
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
		"githubUser": "gPlake",
		"created": "3-28-1977"
	},
	{
		"id": "2",
		"name": "Enjoying the sunshine",
		"description": "",
		"category": "SELFIE",
		"githubUser": "sSchmidt",
		"created": "1-2-1985"
	},
	{
		"id": "3",
		"name": "Gunbarrel 25",
		"description": "25 laps today",
		"category": "LANDSCAPE",
		"githubUser": "sSchmidt",
		"created": "2-1-1990"
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

var app = express();

const server = new ApolloServer({
	typeDefs,
	resolvers
});

server.applyMiddleware({ app })

app.get('/', (request, response) => response.end('Welcome to the PhotoShare API'));
app.get('/playground', expressPlayground({ endpoint: '/graphql' }))
app.listen({ port: 4000 }, () =>
	console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
);
