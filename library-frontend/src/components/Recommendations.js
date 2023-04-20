import { useQuery } from "@apollo/client"
import { GET_BOOKS } from "../queries"
import { GET_FAVORITE_GENRE } from "../queries"
import { useEffect, useState } from "react"

const Recommendations = ({ show, loggedIn }) => {
    const [favoriteGenre, setFavoriteGenre] = useState(null)

    const genreQuery = useQuery(GET_FAVORITE_GENRE, { skip: !loggedIn })

    const recommendationsQuery = useQuery(GET_BOOKS, {
        variables: { genre: favoriteGenre },
        skip: !genreQuery.data,
    })

    useEffect(() => {
        if (genreQuery.data) {
            setFavoriteGenre(genreQuery.data.me.favoriteGenre)
        }
    }, [genreQuery.data])

    if (!show) {
        return null
    }

    if (genreQuery.loading || recommendationsQuery.loading) {
        return <p>loading...</p>
    }

    return (
        <div>
            <h2>Recommended for you in {favoriteGenre}</h2>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {recommendationsQuery.data.allBooks.map((book) => (
                        <tr key={book.title}>
                            <td>{book.title}</td>
                            <td>{book.author.name}</td>
                            <td>{book.published}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Recommendations
