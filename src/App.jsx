import {useEffect, useState} from 'react';
import Search from "./components/Search.jsx";
import heroImg from "./assets/hero-img.png";
import logo from "./assets/logo.png";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.jsx";

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
    const [trendingMovie, setTrendingMovie] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    //Debounce the search term to prevent making too many API request
    //by waiting for the user to top typing for 1000ms
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endPoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
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
            if(query && data.results.length > 0) {
                updateSearchCount({searchTerm: query, movie: data.results[0]});
            }
        }catch (error) {
            console.log(`error in fetchMovies ${error}`);
            setErrorMessage(`Error fetching movies. please try again later.\n${error} `);
        }finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovie(movies);
        }catch (error) {
            console.log(`error in fetchTrendingMovies ${error}`);
        }
    }

    useEffect(()=>{
        fetchMovies(searchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies()
    }, [])

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

                    {trendingMovie.length > 0 && (
                        <section className="trending">
                            <h2>Treading Movie</h2>
                            <ul>
                                { trendingMovie.map((movie, index) => (
                                    <li key={movie.$id}>
                                        <p>{index + 1}</p>
                                        <img src={movie.poster_url} alt="poster" />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}


                    <section className="all-movies">
                        <h2>All Movies</h2>
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