import { useQuery, useMutation } from "@apollo/client"
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries"
import { useState } from "react"
import Select from "react-select"

const Authors = (props) => {
    const result = useQuery(ALL_AUTHORS)
    const [editAuthor] = useMutation(EDIT_AUTHOR)

    const [selectedAuthor, setSelectedAuthor] = useState(null)
    const [born, setBorn] = useState("")

    if (!props.show) {
        return null
    }

    if (result.loading) {
        return <div>Loading...</div>
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (!selectedAuthor || !born) {
            return
        }

        const name = selectedAuthor.value

        editAuthor({
            variables: { name, setBornTo: Number(born) },
            refetchQueries: [{ query: ALL_AUTHORS }],
        })

        setSelectedAuthor(null)
        setBorn("")
    }

    return (
        <div>
            <h2>authors</h2>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>born</th>
                        <th>books</th>
                    </tr>
                    {result.data.allAuthors.map((a) => (
                        <tr key={a.name}>
                            <td>{a.name}</td>
                            <td>{a.born}</td>
                            <td>{a.bookCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {result.data.allAuthors.length > 0 && (
                <>
                    <h2>Set birthyear</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ maxWidth: "250px" }}>
                            <Select
                                defaultValue={selectedAuthor}
                                onChange={setSelectedAuthor}
                                options={result.data.allAuthors.map((author) => ({
                                    value: author.name,
                                    label: author.name,
                                }))}
                            />
                        </div>
                        <div>
                            born
                            <input
                                value={born}
                                onChange={({ target }) => setBorn(target.value)}
                            />
                        </div>
                        <button type="submit">update author</button>
                    </form>
                </>
            )}
        </div>
    )
}

export default Authors
