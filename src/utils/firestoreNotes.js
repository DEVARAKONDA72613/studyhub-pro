import { db } from "../firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

const NOTES_DOC_ID = "shared";

export function subscribeToNotes(roomId, callback) {
  return onSnapshot(doc(db, "studyRooms", roomId, "notes", NOTES_DOC_ID), (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : { content: "", updatedAt: null, updatedByName: null });
  });
}

export async function saveNotes(roomId, user, content) {
  await setDoc(doc(db, "studyRooms", roomId, "notes", NOTES_DOC_ID), {
    content,
    updatedAt: serverTimestamp(),
    updatedByName: user.displayName || "Student",
  });
}
