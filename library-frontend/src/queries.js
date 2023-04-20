import { gql } from "@apollo/client"

const ALL_AUTHORS = gql`
    query {
        allAuthors {
            name
            born
            bookCount
        }
    }
`

const ALL_BOOKS = gql`
    query {
        allBooks {
            title
            author {
                name
            }
            published
            genres
        }
    }
`

const GET_BOOKS = gql`
    query allBooks($genre: String) {
        allBooks(genre: $genre) {
            title
            author {
                name
            }
            published
            genres
        }
    }
`

const GET_FAVORITE_GENRE = gql`
    query {
        me {
            favoriteGenre
        }
    }
`

const CREATE_BOOK = gql`
    mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
        addBook(title: $title, author: $author, published: $published, genres: $genres) {
            title
            author {
                name
            }
            published
            genres
        }
    }
`

const EDIT_AUTHOR = gql`
    mutation editAuthor($name: String!, $setBornTo: Int!) {
        editAuthor(name: $name, setBornTo: $setBornTo) {
            name
            born
        }
    }
`

const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
`

export { ALL_AUTHORS, ALL_BOOKS, GET_BOOKS, CREATE_BOOK, EDIT_AUTHOR, LOGIN, GET_FAVORITE_GENRE }
