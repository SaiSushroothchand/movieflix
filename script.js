const API_KEY = 'api_key=1cf50e6248dc270629e802686245c2c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?' + API_KEY;

let currentPage = 1;
let currentURL = API_URL;

document.getElementById('signin-link').addEventListener('click', () => {
    document.getElementById('signin-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
});

document.getElementById('signup-link').addEventListener('click', () => {
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('signin-form').style.display = 'none';
});

document.getElementById('signin-btn').addEventListener('click', () => {
    // Handle sign in (add authentication logic here)
    showHomeScreen();
});

document.getElementById('signup-btn').addEventListener('click', () => {
    // Handle sign up (add registration logic here)
    showHomeScreen();
});

document.getElementById('start').addEventListener('click', () => {
    // Handle email submission (add logic here)
    showSignUpForm();
});

document.getElementById('search').addEventListener('input', (e) => {
    const query = e.target.value;
    currentPage = 1;
    if (query) {
        currentURL = searchURL + '&query=' + query;
    } else {
        currentURL = API_URL;
    }
    loadMovies(currentURL);
});

document.getElementById('load-more').addEventListener('click', () => {
    currentPage++;
    loadMovies(currentURL, currentPage);
});

document.getElementById('playlist-link').addEventListener('click', () => {
    showPlaylists();
});

document.getElementById('logout-link').addEventListener('click', () => {
    // Handle logout (add logout logic here)
    document.getElementById('user-links').style.display = 'none';
    document.getElementById('auth-links').style.display = 'block';
    document.getElementById('home-screen').style.display = 'none';
    document.querySelector('.hero').style.display = 'block';
});

document.getElementById('back-to-movies').addEventListener('click', () => {
    document.getElementById('playlist-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'block';
});

document.getElementById('back-to-playlists').addEventListener('click', () => {
    document.getElementById('playlist-detail-screen').style.display = 'none';
    document.getElementById('playlist-screen').style.display = 'block';
});

document.getElementById('create-playlist').addEventListener('click', () => {
    const playlistName = prompt('Enter Playlist Name:');
    if (playlistName) {
        const isPublic = confirm('Make this playlist public?');
        createPlaylist(playlistName, isPublic);
    }
});

document.getElementById('delete-playlist').addEventListener('click', () => {
    const playlistName = document.getElementById('playlist-name').innerText;
    deletePlaylist(playlistName);
});

document.getElementById('playlist-public-private').addEventListener('change', (e) => {
    const playlistName = document.getElementById('playlist-name').innerText;
    updatePlaylistPrivacy(playlistName, e.target.checked);
});

let playlists = [];
let currentPlaylist = [];
let playlistMap = new Map();

function showHomeScreen() {
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.auth-form').style.display = 'none';
    document.getElementById('home-screen').style.display = 'block';
    document.getElementById('auth-links').style.display = 'none';
    document.getElementById('user-links').style.display = 'block';
    loadMovies(API_URL);
}

function showSignUpForm() {
    document.querySelector('.hero').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function loadMovies(url, page = 1) {
    fetch(`${url}&page=${page}`).then(res => res.json()).then(data => {
        displayMovies(data.results);
        if (data.page < data.total_pages) {
            document.getElementById('load-more').style.display = 'block';
        } else {
            document.getElementById('load-more').style.display = 'none';
        }
    });
}

function displayMovies(movies) {
    const movieContainer = document.getElementById('movie-container');
    if (currentPage === 1) {
        movieContainer.innerHTML = '';
    }
    movies.forEach(movie => {
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
            <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <button onclick="promptAddToPlaylist('${movie.id}', '${movie.title}', '${movie.poster_path}')">+</button>
        `;
        movieContainer.appendChild(movieEl);
    });
}

function promptAddToPlaylist(id, title, poster_path) {
    if (playlists.length === 0) {
        alert('No playlists created. Please create a playlist first.');
        return;
    }
    const playlistName = prompt('Enter the playlist name:');
    if (playlistName && playlistMap.has(playlistName)) {
        addToPlaylist(playlistName, { id, title, poster_path });
    } else {
        alert('Playlist not found. Please try again.');
    }
}

function addToPlaylist(playlistName, movie) {
    const playlist = playlistMap.get(playlistName);
    playlist.movies.push(movie);
    alert(`${movie.title} added to your playlist ${playlistName}`);
}

function showPlaylists() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('playlist-screen').style.display = 'block';
    const playlistsContainer = document.getElementById('playlists-container');
    playlistsContainer.innerHTML = '';
    playlists.forEach(playlist => {
        const playlistEl = document.createElement('div');
        playlistEl.classList.add('playlist-item');
        playlistEl.innerHTML = `
            <h3>${playlist.name}</h3>
            <button onclick="viewPlaylist('${playlist.name}')">View</button>
        `;
        playlistsContainer.appendChild(playlistEl);
    });
}

function viewPlaylist(name) {
    const playlist = playlistMap.get(name);
    document.getElementById('playlist-name').innerText = playlist.name;
    document.getElementById('playlist-public-private').checked = playlist.isPublic;
    document.getElementById('playlist-detail-screen').style.display = 'block';
    document.getElementById('playlist-screen').style.display = 'none';
    const playlistDetailContainer = document.getElementById('playlist-detail-container');
    playlistDetailContainer.innerHTML = '';
    playlist.movies.forEach((movie, index) => {
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
            <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <button onclick="removeFromPlaylist('${name}', ${index})">Remove</button>
        `;
        playlistDetailContainer.appendChild(movieEl);
    });
}

function removeFromPlaylist(playlistName, index) {
    const playlist = playlistMap.get(playlistName);
    playlist.movies.splice(index, 1);
    viewPlaylist(playlistName);
}

function createPlaylist(name, isPublic) {
    if (playlistMap.has(name)) {
        alert('Playlist with this name already exists.');
        return;
    }
    const newPlaylist = { name, isPublic, movies: [] };
    playlists.push(newPlaylist);
    playlistMap.set(name, newPlaylist);
    alert(`Playlist ${name} created!`);
}

function deletePlaylist(name) {
    playlists = playlists.filter(playlist => playlist.name !== name);
    playlistMap.delete(name);
    alert(`Playlist ${name} deleted!`);
    document.getElementById('playlist-detail-screen').style.display = 'none';
    document.getElementById('playlist-screen').style.display = 'block';
    showPlaylists();
}

function updatePlaylistPrivacy(name, isPublic) {
    const playlist = playlistMap.get(name);
    playlist.isPublic = isPublic;
    alert(`Playlist ${name} is now ${isPublic ? 'public' : 'private'}.`);
}
