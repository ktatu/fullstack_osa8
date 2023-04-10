const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
const { v1: uuid } = require("uuid")
const Book = require("./models/book")
const Author = require("./models/author")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const mongoose = require("mongoose")
const { GraphQLError } = require("graphql")
const User = require("./models/User")
mongoose.set("strictQuery", false)

const MONGODB_URI = process.env.MONGODB_URI

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB:", error.message)
    })

const typeDefs = `
    type Book {
        title: String!
        published: Int!
        author: Author!
        id: ID!
        genres: [String!]!
    }

    type Author {
        name: String!
        born: Int
        bookCount: Int!
        id: ID!
    }

    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }
    
    type Token {
        value: String!
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
        me: User
    }

    type Mutation {
        addBook(
            title: String!
            author: String!
            published: Int!
            genres: [String!]!
        ): Book
        editAuthor(
            name: String!
            setBornTo: Int!
        ): Author
        createUser(
            username: String!
            favoriteGenre: String!
          ): User
        login(
            username: String!
            password: String!
        ): Token
    }
`

const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            const authorFilter = { name: args.author }
            const genreFilter = { genres: { $all: [args.genre] } }

            if (args.author && args.genre) {
                const foundAuthor = await Author.findOne(authorFilter)

                return Book.find({ author: foundAuthor._id, ...genreFilter }).populate("author")
            } else if (args.author) {
                const foundAuthor = await Author.findOne(authorFilter)

                return Book.find({ author: foundAuthor._id }).populate("author")
            } else if (args.genre) {
                return Book.find(genreFilter).populate("author")
            }

            return Book.find({}).populate("author")
        },
        allAuthors: async () => await Author.find({}),
        me: (root, args, context) => {
            return context.currentUser
        },
    },
    Author: {
        bookCount: (root) => Book.collection.countDocuments({ author: root._id }),
    },
    Mutation: {
        addBook: async (root, args, context) => {
            if (!context.currentUser) {
                throw new GraphQLError("Invalid credentials", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.name,
                        error,
                    },
                })
            }

            const book = new Book({ ...args })
            let author = await Author.findOne({ name: args.author })

            if (!author) {
                author = new Author({ name: args.author })
            }

            book.author = author

            try {
                await author.save()
            } catch (error) {
                console.log("error on author save")
                console.log("error ", error)
                throw new GraphQLError("Saving a new author failed.", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.name,
                        error,
                    },
                })
            }

            try {
                await book.save()
            } catch (error) {
                console.log("book save error")
                throw new GraphQLError("Saving a new book failed", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.name,
                        error,
                    },
                })
            }

            return book
        },
        editAuthor: async (root, args, context) => {
            if (!context.currentUser) {
                throw new GraphQLError("Invalid credentials", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.name,
                        error,
                    },
                })
            }

            const author = await Author.findOne({ name: args.name })

            if (!author) {
                return null
            }

            author.born = args.setBornTo
            await author.save()

            return author
        },
        createUser: async (root, args) => {
            const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

            return user.save().catch((error) => {
                throw new GraphQLError("Creating a new user failed", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.name,
                        error,
                    },
                })
            })
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })

            if (!user || args.password !== "password") {
                throw new GraphQLError("Invalid credentials", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                })
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
        },
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith("Bearer ")) {
            const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)

            const currentUser = await User.findById(decodedToken.id)
            return { currentUser }
        }
    },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`)
})
