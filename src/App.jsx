import {useEffect, useState} from 'react';
import Search from "./components/Search.jsx";
import heroImg from "./assets/hero-img.png";
import logo from "./assets/logo.png";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";


const API_BASE_URL = 'https://api.themoviedb.org/3/';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: new Headers({
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
    })
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMovies = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endPoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endPoint, API_OPTIONS)
            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }
            const data = await response.json();

            if (data.Response === 'False') {
                setErrorMessage(data.error || 'No movies found.');
                setMovieList([]);
                return;
            }

            setMovieList(data.results);
        }catch (error) {
            console.log(`error in fetchMovies ${error}`);
            setErrorMessage(`Error fetching movies. please try again later.\n${error} `);
        }finally {
            setIsLoading(false);
        }
    }

    useEffect(()=>{
        fetchMovies();
    }, []);

    return (
        <main>
            <div className="pattern">
                <div className="wrapper items-center justify-center">
                    <img src = { logo } alt="hero banner" width="70px" height="40px"/>
                    <img src = { heroImg } alt="hero banner" width="344px" height="100px"/>
                    <header>
                        <h1>
                            Find <span className="text-gradient">Movies</span> You'll Enjoy
                            Without the Hassle
                        </h1>
                    </header>

                    <Search
                        searchTerm = {searchTerm}
                        setSearchTerm = {setSearchTerm}
                    />

                    <section className="all-movies">
                        <h2 className="mt-8">All Movies</h2>
                        { isLoading ?
                            (
                                <Spinner/>
                            ) : errorMessage ? (
                                <p className="text-red-500">{errorMessage}</p>
                            ) : (
                                <ul>
                                    {movieList.map((movie) => (
                                        <MovieCard key ={movie.id} movie={movie}/>
                                    ))}
                                </ul>
                            )
                        }
                    </section>
                </div>
            </div>
        </main>
    );
};

export default App;