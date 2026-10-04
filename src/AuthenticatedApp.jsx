import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

const Library = lazy(() => import("./pages/Library"));
const Category = lazy(() => import("./pages/Category"));
const BookDetails = lazy(() => import("./pages/BookDetails"));
const StudyRooms = lazy(() => import("./pages/StudyRooms"));
const CreateStudyRoom = lazy(() => import("./pages/CreateStudyRoom"));
const StudyRoomPage = lazy(() => import("./pages/StudyRoomPage"));

function Loading() {
  return (
    <div className="route-loading mono" role="status">
      Opening StudyHub...
    </div>
  );
}

function AuthenticatedApp() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/library" element={<Library />} />
          <Route path="/category/:name" element={<Category />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/study-rooms" element={<StudyRooms />} />
          <Route path="/study-rooms/create" element={<CreateStudyRoom />} />
          <Route path="/study-room/:roomId" element={<StudyRoomPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default AuthenticatedApp;
