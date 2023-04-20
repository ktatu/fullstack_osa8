import { useQuery } from "@apollo/client"
import { GET_BOOKS } from "../queries"
import { useEffect, useState } from "react"

const Books = (props) => {
    const [selectedGenre, setSelectedGenre] = useState("")
    const [genres, setGenres] = useState(null)

    const queryBooks = useQuery(GET_BOOKS, {
        variables: { genre: selectedGenre },
        fetchPolicy: "network-only",
    })

    useEffect(() => {
        if (queryBooks.data && selectedGenre === "") {
            const bookGenres = queryBooks.data.allBooks
                .map((book) => book.genres)
                .flat()
                .filter((genre, index, array) => array.indexOf(genre) === index)

            setGenres(bookGenres)
        }
    }, [queryBooks.data])

    const handleGenreChange = (newGenre) => {
        setSelectedGenre(newGenre)
    }

    if (!props.show) {
        return null
    }

    if (queryBooks.loading) {
        return <div>Loading...</div>
    }

    if (queryBooks.error) {
        console.log("error ", queryBooks.error)
    }

    return (
        <div>
            <h2>books</h2>

            {selectedGenre ? (
                <p>
                    in genre <strong>{selectedGenre}</strong>
                </p>
            ) : (
                <p>all genres</p>
            )}

            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {queryBooks.data.allBooks.map((book) => (
                        <tr key={book.title}>
                            <td>{book.title}</td>
                            <td>{book.author.name}</td>
                            <td>{book.published}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {genres ? (
                <div style={{ paddingTop: "50px" }}>
                    {genres.map((genre) => (
                        <button
                            key={genre}
                            onClick={() => handleGenreChange(genre)}
                        >
                            {genre}
                        </button>
                    ))}
                    <button onClick={() => handleGenreChange("")}>all genres</button>
                </div>
            ) : null}
        </div>
    )
}

export default Books
