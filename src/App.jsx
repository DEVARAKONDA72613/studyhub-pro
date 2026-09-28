import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Library = lazy(() => import("./pages/Library"));
const Category = lazy(() => import("./pages/Category"));
const BookDetails = lazy(() => import("./pages/BookDetails"));
const StudyRooms = lazy(() => import("./pages/StudyRooms"));
const CreateStudyRoom = lazy(() => import("./pages/CreateStudyRoom"));
const StudyRoomPage = lazy(() => import("./pages/StudyRoomPage"));

function RouteLoading() {
  return (
    <div className="route-loading mono" role="status">
      Setting the type...
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/category/:name" element={<Category />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/study-rooms" element={<StudyRooms />} />
        <Route path="/study-rooms/create" element={<CreateStudyRoom />} />
        <Route path="/study-room/:roomId" element={<StudyRoomPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
