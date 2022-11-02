const express= require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;

const app = express();

const {GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLNonNull, GraphQLString} = require("graphql");

const authors = [
    {id: 1, name: 'J.K.Rowling'},
    {id: 2, name: 'J.R.R.Tolkien'},
    {id: 3, name: 'Brent Weeks'}
]

const books = [
    {id: 1, name: 'Harry Potter and the chamber of secrets', authorId: 1},
    {id: 2, name: 'Harry Potter and the prizoner of Azkaban', authorId: 1},
    {id: 3, name: 'Harry Potter and the goblet of fire', authorId: 1},
    {id: 4, name: 'Harry Potter and the half blood prince', authorId: 1},
    {id: 5, name: 'The Fellowship of the ring', authorId: 2},
    {id: 6, name: 'The two towers', authorId: 2},
    {id: 7, name: 'The return of the king', authorId: 2},
    {id: 8, name: 'The way of shadows', authorId: 3},
    {id: 9, name: 'Beyond the shadows', authorId: 3}
]

const BookType = new GraphQLObjectType({
    name: 'books',
    description: 'This represents a book',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Author of the book',
    fields: {
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    }
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book : {
            type: BookType,
            description: 'Book details',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'Author of the book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id) 

        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book= {id: books.length + 1, name: args.name, authorId: args.authorId}
                books.push(book)
                return book
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})
app.use('/graphql', expressGraphQL({
    schema,
    graphiql: true
}))
app.listen(5000, () => console.log("Server is running"));