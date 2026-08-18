import React from 'react';
import searchIcon from "../assets/search.svg"


const Search = (props) => {
    return (
        <div className="search">
            <div>
                <img src = {searchIcon} alt = "Search Icon"/>

                <input type = "text"
                       placeholder = "Search for movie..."
                       value = {props.searchTerm}
                       onChange = {(e) => props.setSearchTerm(e.target.value)}
                />
            </div>
        </div>

    );
};

export default Search;