import { db } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "firebase/firestore";

export function subscribeToMessages(roomId, callback) {
  const messagesQuery = query(
    collection(db, "studyRooms", roomId, "messages"),
    orderBy("createdAt", "asc"),
    limit(200)
  );
  return onSnapshot(messagesQuery, (snapshot) => {
    callback(snapshot.docs.map((messageDoc) => ({ id: messageDoc.id, ...messageDoc.data() })));
  });
}

export async function sendMessage(roomId, user, text) {
  const trimmed = text.trim().slice(0, 1000);
  if (!trimmed) return;

  await addDoc(collection(db, "studyRooms", roomId, "messages"), {
    userId: user.uid,
    userName: user.displayName || "Student",
    message: trimmed,
    createdAt: serverTimestamp(),
  });
}
