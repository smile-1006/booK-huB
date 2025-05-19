import React, { useState, useMemo } from 'react';

const genres = [
  { name: 'All', color: 'bg-gray-500' },
  { name: 'Fiction', color: 'bg-blue-500' },
  { name: 'Non-Fiction', color: 'bg-green-500' },
  { name: 'Mystery', color: 'bg-purple-500' },
  { name: 'Sci-Fi', color: 'bg-indigo-500' },
  { name: 'Romance', color: 'bg-pink-500' },
];

const booksData = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A novel set in the Roaring Twenties.',
    genre: 'Fiction',
  },
  {
    id: 2,
    title: 'Becoming',
    author: 'Michelle Obama',
    description: 'A memoir by the former First Lady.',
    genre: 'Non-Fiction',
  },
  {
    id: 3,
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    description: 'A mystery thriller novel.',
    genre: 'Mystery',
  },
  {
    id: 4,
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'A science fiction novel.',
    genre: 'Sci-Fi',
  },
  {
    id: 5,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'A classic romance novel.',
    genre: 'Romance',
  },
];

function App() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const filteredBooks = useMemo(() => {
    let filtered = booksData;

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
  }, [selectedGenre, searchTerm, favorites, showFavorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const selectedGenreColor =
    genres.find((g) => g.name === selectedGenre)?.color || 'bg-gray-500';

  return (
    <div className={`min-h-screen p-4 ${selectedGenreColor} bg-opacity-20 transition-colors duration-500`}>
      <header className="max-w-4xl mx-auto mb-6">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Book Hub</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map((genre) => (
            <button
              key={genre.name}
              className={`px-4 py-2 rounded-full font-semibold transition-colors duration-300 ${
                selectedGenre === genre.name
                  ? `${genre.color} text-white`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => {
                setSelectedGenre(genre.name);
                setShowFavorites(false);
              }}
            >
              {genre.name}
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
          onChange={(e) => setSearchTerm(e.target.value)}
          list="autocomplete-options"
        />
        <datalist id="autocomplete-options">
          {booksData
            .filter(
              (book) =>
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((book) => (
              <option key={book.id} value={book.title} />
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
              className="bg-white rounded-lg shadow p-4 flex flex-col justify-between transition-transform transform hover:scale-105"
            >
              <div>
                <h2 className="text-xl font-semibold mb-1">{book.title}</h2>
                <p className="text-gray-600 mb-2">by {book.author}</p>
                <p className="text-gray-700">{book.description}</p>
              </div>
              <button
                onClick={() => toggleFavorite(book.id)}
                className={`mt-4 self-start px-3 py-1 rounded-full font-semibold transition-colors duration-300 ${
                  favorites.includes(book.id)
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label={favorites.includes(book.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.includes(book.id) ? '★ Favorite' : '☆ Add Favorite'}
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default App;
