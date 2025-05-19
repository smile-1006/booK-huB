import React, { useState, useEffect, useMemo } from 'react';

const genreColors = {
  'All': 'bg-gradient-to-br from-slate-400 to-slate-600',
  'Fiction': 'bg-gradient-to-br from-sky-400 to-blue-600',
  'Non-Fiction': 'bg-gradient-to-br from-emerald-400 to-green-600',
  'Mystery': 'bg-gradient-to-br from-violet-400 to-purple-600',
  'Sci-Fi': 'bg-gradient-to-br from-cyan-400 to-blue-600',
  'Romance': 'bg-gradient-to-br from-rose-400 to-pink-600',
  'Fantasy': 'bg-gradient-to-br from-indigo-400 to-purple-600',
  'Horror': 'bg-gradient-to-br from-red-400 to-rose-600',
  'Biography': 'bg-gradient-to-br from-amber-400 to-yellow-600',
  'History': 'bg-gradient-to-br from-orange-400 to-red-600',
  'Poetry': 'bg-gradient-to-br from-fuchsia-400 to-pink-600',
  'Other': 'bg-gradient-to-br from-gray-400 to-gray-600',
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

      const genreSet = new Set(['All']);
      docs.forEach((doc) => {
        if (doc.subject) {
          doc.subject.forEach((subj) => {
            if (genreColors[subj]) {
              genreSet.add(subj);
            }
          });
        }
      });
      const genreList = Array.from(genreSet);

      setGenres(genreList);

      const mappedBooks = docs.map((doc) => ({
        id: doc.key,
        title: doc.title,
        author: doc.author_name ? doc.author_name.join(', ') : 'Unknown',
        description: doc.first_sentence ? (typeof doc.first_sentence === 'string' ? doc.first_sentence : doc.first_sentence.join(' ')) : 'No description available.',
        genre: doc.subject ? (doc.subject.find(subj => genreColors[subj]) || 'Other') : 'Other',
        cover_i: doc.cover_i,
        rating: doc.ratings_average || null,
      }));

      setBooks(mappedBooks);
      setAutocompleteOptions(mappedBooks.map((book) => book.title));
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

  const selectedGenreColor = genreColors[selectedGenre] || genreColors['Other'];

  return (
    <div className={`min-h-screen p-4 ${selectedGenreColor} transition-colors duration-500`}>
      <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-[2px] pointer-events-none" />
      <header className="relative max-w-4xl mx-auto mb-6 z-10">
        <h1 className="text-5xl font-bold mb-6 text-white text-center drop-shadow-lg">Book Hub</h1>
        <div className="backdrop-blur-md bg-white bg-opacity-10 p-6 rounded-xl shadow-lg border border-white border-opacity-20">
          <div className="flex flex-wrap gap-2 mb-4">
            {genres.map((genre) => (
              <button
                key={genre}
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                  selectedGenre === genre
                    ? `${genreColors[genre]} text-white shadow-lg scale-105`
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 hover:scale-105'
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
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                showFavorites
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg scale-105'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 hover:scale-105'
              }`}
              onClick={() => setShowFavorites((prev) => !prev)}
            >
              Favorites
            </button>
          </div>
          <input
            type="text"
            placeholder="Search books or authors..."
            className="w-full p-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-white placeholder-white placeholder-opacity-70"
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
        </div>
      </header>
      <main className="relative max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 z-10">
        {filteredBooks.length === 0 ? (
          <p className="text-center col-span-full text-white text-opacity-90 backdrop-blur-md bg-white bg-opacity-10 p-6 rounded-xl">No books found.</p>
        ) : (
          filteredBooks.map((book) => (
            <div key={book.id} className="group perspective">
              <div className="relative w-full h-96 transition-transform duration-700 transform-style-preserve-3d">
                {/* Front Side */}
                <div className={`absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-lg overflow-hidden border border-white border-opacity-30 backdrop-blur-md bg-white bg-opacity-10 flex flex-col items-center justify-center ${genreColors[book.genre] ? genreColors[book.genre].replace('bg-gradient-to-br', 'bg-opacity-30') : 'bg-white bg-opacity-20'}`}>
                  {book.cover_i ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                      alt={`${book.title} cover`}
                      className="w-full h-72 object-contain"
                    />
                  ) : (
                    <div className="w-full h-72 bg-white bg-opacity-10 flex items-center justify-center text-white text-opacity-50">
                      No Image
                    </div>
                  )}
                  <h2 className="text-xl font-bold mt-2 text-white drop-shadow-md text-center px-2">{book.title}</h2>
                  <p className="text-white text-opacity-80 italic drop-shadow-sm text-center">{book.author}</p>
                </div>
                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full backface-hidden card-back rounded-xl shadow-lg overflow-auto border border-white border-opacity-30 backdrop-blur-md bg-white bg-opacity-10 p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">{book.title}</h2>
                  <p className="italic mb-4 text-white text-opacity-90">by {book.author}</p>
                  <p className="mb-4 whitespace-pre-wrap text-white text-opacity-80">{book.description}</p>
                  {book.rating && (
                    <p className="text-yellow-300 font-semibold mb-4">Rating: {book.rating.toFixed(1)} ★</p>
                  )}
                  <button
                    onClick={() => toggleFavorite(book.id)}
                    className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                      favorites.includes(book.id)
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg scale-105'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 hover:scale-105'
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