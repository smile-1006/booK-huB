import React, { useState, useEffect, useMemo } from 'react';

const genreColors = {
  'All': 'bg-gray-500',
  'Fiction': 'bg-blue-500',
  'Non-Fiction': 'bg-green-500',
  'Mystery': 'bg-purple-500',
  'Sci-Fi': 'bg-indigo-500',
  'Romance': 'bg-pink-500',
  'Other': 'bg-gray-400',
};

function App() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);

  useEffect(() => {
    fetchBooks('');
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchBooks = async (query) => {
    try {
      const endpoint = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      const docs = data.docs || [];

      // Extract unique genres from subjects
      const genreSet = new Set();
      docs.forEach((doc) => {
        if (doc.subject) {
          doc.subject.forEach((subj) => genreSet.add(subj));
        }
      });
      const genreList = ['All', ...Array.from(genreSet).slice(0, 10)]; // limit to 10 genres for UI

      setGenres(genreList);

      // Map docs to book objects
      const mappedBooks = docs.map((doc) => ({
        id: doc.key,
        title: doc.title,
        author: doc.author_name ? doc.author_name.join(', ') : 'Unknown',
        description: doc.first_sentence ? (typeof doc.first_sentence === 'string' ? doc.first_sentence : doc.first_sentence.join(' ')) : 'No description available.',
        genre: doc.subject ? doc.subject[0] : 'Other',
        cover_i: doc.cover_i,
        rating: doc.ratings_average || null,
      }));

      setBooks(mappedBooks);

      // Set autocomplete options
      setAutocompleteOptions(
        mappedBooks.map((book) => book.title)
      );
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const filteredBooks = useMemo(() => {
    let filtered = books;

    if (selectedGenre !== 'All') {
      filtered = filtered.filter((book) => book.genre === selectedGenre);
    }

    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(lowerSearch) ||
          book.author.toLowerCase().includes(lowerSearch)
      );
    }

    if (showFavorites) {
      filtered = filtered.filter((book) => favorites.includes(book.id));
    }

    return filtered;
  }, [books, selectedGenre, searchTerm, favorites, showFavorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const selectedGenreColor = genreColors[selectedGenre] || 'bg-gray-500';

  return (
    <div className={`min-h-screen p-4 ${selectedGenreColor} bg-opacity-20 transition-colors duration-500`}>
      <header className="max-w-4xl mx-auto mb-6">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Book Hub</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map((genre) => (
            <button
              key={genre}
              className={`px-4 py-2 rounded-full font-semibold transition-colors duration-300 ${
                selectedGenre === genre
                  ? `${genreColors[genre] || 'bg-gray-400'} text-white`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => {
                setSelectedGenre(genre);
                setShowFavorites(false);
              }}
            >
              {genre}
            </button>
          ))}
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-300 ${
              showFavorites
                ? 'bg-yellow-400 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setShowFavorites((prev) => !prev)}
          >
            Favorites
          </button>
        </div>
        <input
          type="text"
          placeholder="Search books or authors..."
          className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchBooks(e.target.value);
          }}
          list="autocomplete-options"
        />
        <datalist id="autocomplete-options">
          {autocompleteOptions.map((option, index) => (
            <option key={index} value={option} />
          ))}
        </datalist>
      </header>
      <main className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredBooks.length === 0 ? (
          <p className="text-center col-span-full text-gray-700">No books found.</p>
        ) : (
          filteredBooks.map((book) => (
            <div
              key={book.id}
              className="group perspective"
              style={{ perspective: '1000px' }}
            >
              <div className={`relative w-full h-96 duration-700 transform-style-preserve-3d group-hover:rotate-y-180`}>
                {/* Front Side */}
                <div className={`absolute w-full h-full backface-hidden rounded-lg shadow-lg overflow-hidden border border-white border-opacity-30 backdrop-blur-md bg-white bg-opacity-20 flex flex-col items-center justify-center ${genreColors[book.genre] ? genreColors[book.genre].replace('bg-', 'bg-opacity-30 ') : 'bg-gray-200 bg-opacity-30'}`} style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}>
                  {book.cover_i ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                      alt={`${book.title} cover`}
                      className="w-full h-72 object-contain"
                    />
                  ) : (
                    <div className="w-full h-72 bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <h2 className="text-xl font-bold mt-2 text-white drop-shadow-md text-center px-2">{book.title}</h2>
                  <p className="text-indigo-200 italic drop-shadow-sm text-center">{book.author}</p>
                </div>
                {/* Back Side */}
                <div className="absolute w-full h-full backface-hidden rounded-lg shadow-lg overflow-auto border border-white border-opacity-30 backdrop-blur-md bg-white bg-opacity-20 rotate-y-180 p-4 text-white text-opacity-90" style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}>
                  <h2 className="text-lg font-bold mb-2">{book.title}</h2>
                  <p className="italic mb-2">by {book.author}</p>
                  <p className="mb-4 whitespace-pre-wrap">{book.description}</p>
                  {book.rating && (
                    <p className="text-yellow-400 font-semibold">Rating: {book.rating}</p>
                  )}
                  <button
                    onClick={() => toggleFavorite(book.id)}
                    className={`mt-4 px-4 py-2 rounded-full font-semibold transition-colors duration-300 shadow-md ${
                      favorites.includes(book.id)
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    aria-label={favorites.includes(book.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favorites.includes(book.id) ? '★ Favorite' : '☆ Add Favorite'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default App;
