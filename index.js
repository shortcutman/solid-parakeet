const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')

const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')
const resolvers = require('./resolvers')

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
