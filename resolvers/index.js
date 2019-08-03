const { GraphQLScalarType } = require('graphql')
const fetch = require('node-fetch')

const requestGithubToken = credentials => {
	return fetch(
		'https://github.com/login/oauth/access_token',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify(credentials)
		}
	).then(res => res.json())
	.catch(error => {
		throw new Error(JSON.stringify(error))
	});
}

const requestGithubUserAccount = token =>
	fetch(`https://api.github.com/user?access_token=${token}`)
		.then(res => res.json())
		.catch(error => {
			throw new Error(JSON.stringify(error))
		});

async function authoriseWithGithub(credentials) {
	const token = await requestGithubToken(credentials)
	const { access_token } = token;
	const githubUser = await requestGithubUserAccount(token.access_token)
	return { ...githubUser, access_token}
}

const resolvers = {
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
		},
		async githubAuth(parent, { code }, { db }) {
			let blah
			 = await authoriseWithGithub({
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				code
			})
			let {
				message,
				access_token,
				avatar_url,
				login,
				name
			} = blah;
			console.log("blah");
			console.log(blah);
			console.log(access_token);
			if (message) {
				console.log(access_token)
				throw new Error(message)
			}
			let latestUserInfo = {
				name,
				githubLogin: login,
				githubToken: access_token,
				avatar: avatar_url
			}
			// const { ops:[user] } = await db
			// 	.collection('users')
			// 	.replaceOne({ githubLogin: login }, latestUserInfo, {upsert:true})
			return { user: {
				githubLogin: login,
				latestUserInfo
			}, token: access_token}
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
	}),
	AuthPayload: {
	}
}

module.exports = resolvers
