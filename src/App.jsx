import {
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Library from "./pages/Library";
import Category from "./pages/Category";

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
    </Routes>
  );
}

export default App;