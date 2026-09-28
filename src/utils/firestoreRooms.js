import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  deleteDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SH-";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function subscribeToPublicRooms(callback) {
  const q = query(collection(db, "studyRooms"), where("visibility", "==", "public"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((roomDoc) => ({ id: roomDoc.id, ...roomDoc.data() })));
  });
}

export function subscribeToRoom(roomId, callback) {
  return onSnapshot(doc(db, "studyRooms", roomId), (snapshot) => {
    callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
  });
}

export function subscribeToParticipants(roomId, callback) {
  return onSnapshot(collection(db, "studyRooms", roomId, "participants"), (snapshot) => {
    callback(snapshot.docs.map((participantDoc) => ({ id: participantDoc.id, ...participantDoc.data() })));
  });
}

export async function getRoomByCode(code) {
  const normalized = code.trim().toUpperCase();
  const q = query(collection(db, "studyRooms"), where("roomCode", "==", normalized));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const roomDoc = snapshot.docs[0];
  return { id: roomDoc.id, ...roomDoc.data() };
}

export async function createRoomAndJoin(details, user) {
  const roomRef = doc(collection(db, "studyRooms"));
  const participantRef = doc(db, "studyRooms", roomRef.id, "participants", user.uid);

  const roomData = {
    name: details.name.trim(),
    subject: details.subject.trim(),
    topic: details.topic.trim(),
    description: details.description.trim(),
    visibility: details.visibility,
    roomCode: details.visibility === "private" ? generateRoomCode() : null,
    maxParticipants: details.maxParticipants,
    creatorId: user.uid,
    creatorName: user.displayName || "Student",
    createdAt: serverTimestamp(),
    participantCount: 1,
  };

  await setDoc(roomRef, roomData);
  await setDoc(participantRef, {
    name: user.displayName || "Student",
    studying: false,
    timerState: null,
    joinedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  });

  return { id: roomRef.id, ...roomData };
}

export async function joinRoom(roomId, user) {
  const roomRef = doc(db, "studyRooms", roomId);
  const participantRef = doc(db, "studyRooms", roomId, "participants", user.uid);

  return runTransaction(db, async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);
    if (!roomSnapshot.exists()) {
      throw new Error("Room not found.");
    }

    const room = roomSnapshot.data();
    const participantSnapshot = await transaction.get(participantRef);

    if (!participantSnapshot.exists()) {
      if ((room.participantCount || 0) >= room.maxParticipants) {
        throw new Error("This room is full.");
      }

      transaction.set(participantRef, {
        name: user.displayName || "Student",
        studying: false,
        timerState: null,
        joinedAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      });
      transaction.update(roomRef, { participantCount: (room.participantCount || 0) + 1 });
    }

    return { id: roomSnapshot.id, ...room };
  });
}

export async function leaveRoom(roomId, userId) {
  const roomRef = doc(db, "studyRooms", roomId);
  const participantRef = doc(db, "studyRooms", roomId, "participants", userId);

  await runTransaction(db, async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);
    const participantSnapshot = await transaction.get(participantRef);
    if (!roomSnapshot.exists() || !participantSnapshot.exists()) return;

    transaction.delete(participantRef);
    transaction.update(roomRef, {
      participantCount: Math.max(0, (roomSnapshot.data().participantCount || 1) - 1),
    });
  });
}

export async function setStudyingStatus(roomId, userId, studying) {
  await updateDoc(doc(db, "studyRooms", roomId, "participants", userId), { studying });
}

export async function setTimerState(roomId, userId, timerState) {
  await updateDoc(doc(db, "studyRooms", roomId, "participants", userId), { timerState });
}

export async function deleteRoom(roomId) {
  const [participantsSnap, messagesSnap] = await Promise.all([
    getDocs(collection(db, "studyRooms", roomId, "participants")),
    getDocs(collection(db, "studyRooms", roomId, "messages")),
  ]);

  await Promise.all([
    ...participantsSnap.docs.map((participantDoc) => deleteDoc(participantDoc.ref)),
    ...messagesSnap.docs.map((messageDoc) => deleteDoc(messageDoc.ref)),
    deleteDoc(doc(db, "studyRooms", roomId, "notes", "shared")).catch(() => {}),
  ]);

  await deleteDoc(doc(db, "studyRooms", roomId));
}

const HEARTBEAT_STALE_MS = 50 * 1000;

export async function sendHeartbeat(roomId, userId) {
  await updateDoc(doc(db, "studyRooms", roomId, "participants", userId), {
    lastSeen: serverTimestamp(),
  });
}

export async function cleanupStaleParticipants(roomId, participants) {
  const now = Date.now();

  const stale = participants.filter((participant) => {
    const lastSeenMs = participant.lastSeen?.toMillis ? participant.lastSeen.toMillis() : null;
    if (!lastSeenMs) return false;
    return now - lastSeenMs > HEARTBEAT_STALE_MS;
  });

  await Promise.all(stale.map((participant) => leaveRoom(roomId, participant.id).catch(() => {})));
}
