import { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import Recommendations from "./components/Recommendations"
import { LOGIN } from "./queries"
import { useMutation } from "@apollo/client"

const App = () => {
    const [page, setPage] = useState("authors")
    const [token, setToken] = useState(null)

    const handleLogout = () => {
        setToken(null)
    }

    return (
        <div>
            <div>
                <button onClick={() => setPage("authors")}>authors</button>
                <button onClick={() => setPage("books")}>books</button>
                {token ? <button onClick={() => setPage("add")}>add book</button> : null}
                {token ? <button onClick={() => setPage("recommend")}>recommend</button> : null}
                {token ? <button onClick={handleLogout}>Logout</button> : null}
            </div>

            <div style={{ paddingTop: "50px" }}>
                {token ? null : <LoginForm setToken={setToken} />}
            </div>

            <Authors
                show={page === "authors"}
                token={token}
            />

            <Books show={page === "books"} />

            <Recommendations
                show={page === "recommend"}
                loggedIn={token}
            />

            <NewBook show={page === "add"} />
        </div>
    )
}

const LoginForm = ({ setToken }) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [login] = useMutation(LOGIN)

    const handleSubmit = async (event) => {
        event.preventDefault()

        login({
            variables: { username, password },
            onError: () => console.log("error"),
            onCompleted: (data) => {
                const token = data.login.value
                setToken(token)
                localStorage.setItem("login-token", token)
            },
        })

        setUsername("")
        setPassword("")
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                username:
                <input
                    type="text"
                    onChange={(event) => setUsername(event.target.value)}
                />
            </div>
            <div>
                password:
                <input
                    type="password"
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>
            <button type="submit">Login</button>
        </form>
    )
}

export default App
