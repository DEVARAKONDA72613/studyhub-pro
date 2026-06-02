import {
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Library from "./pages/Library";
import Category from "./pages/Category";
import BookDetails from "./pages/BookDetails";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/library"
        element={<Library />}
      />

      <Route
        path="/category/:name"
        element={<Category />}
      />

      <Route
        path="/book/:id"
        element={<BookDetails />}
      />
    </Routes>
  );
}

export default App;