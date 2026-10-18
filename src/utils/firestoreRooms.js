import { db } from "../firebase";
import {
  collection,
  deleteField,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  deleteDoc,
  getDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

import {
  ROOM_CODE_PATTERN,
  normalizeRoomCode,
  validateRoomForm,
  cleanLine,
} from "./validation";

function generateRoomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const suffix = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `SH-${suffix.toUpperCase()}`;
}

async function hashRoomCode(code) {
  const encoded = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
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

export function subscribeToParticipants(roomId, callback, onError) {
  return onSnapshot(
    collection(db, "studyRooms", roomId, "participants"),
    (snapshot) => {
      callback(snapshot.docs.map((participantDoc) => ({ id: participantDoc.id, ...participantDoc.data() })));
    },
    onError
  );
}

export function subscribeToJoinRequests(roomId, callback, onError) {
  const requestsQuery = query(
    collection(db, "studyRooms", roomId, "joinRequests"),
    where("status", "==", "pending")
  );

  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      callback(snapshot.docs.map((requestDoc) => ({
        id: requestDoc.id,
        ...requestDoc.data(),
      })));
    },
    onError
  );
}

export function subscribeToMyJoinRequest(roomId, userId, callback, onError) {
  return onSnapshot(
    doc(db, "studyRooms", roomId, "joinRequests", userId),
    (snapshot) => callback(snapshot.exists() ? snapshot.data() : null),
    onError
  );
}

export async function getRoomByCode(code) {
  const normalized = normalizeRoomCode(code);

  if (!ROOM_CODE_PATTERN.test(normalized)) {
    throw new Error("Enter a valid room code in the format SH- followed by 32 hexadecimal characters.");
  }

  const inviteHash = await hashRoomCode(normalized);
  const inviteSnapshot = await getDoc(doc(db, "roomInvites", inviteHash));
  if (!inviteSnapshot.exists()) return null;

  const invite = inviteSnapshot.data();
  if (invite.visibility !== "private" || typeof invite.roomId !== "string") return null;

  return {
    id: invite.roomId,
    name: invite.name,
    subject: invite.subject,
    topic: invite.topic,
    description: invite.description,
    visibility: invite.visibility,
    maxParticipants: invite.maxParticipants,
    participantCount: invite.participantCount,
    creatorId: invite.creatorId,
    creatorName: invite.creatorName,
    inviteHash,
  };
}

export async function createRoomAndJoin(details, user) {
  const { values, errors } = validateRoomForm(details);
  const firstError = Object.values(errors)[0];

  if (firstError) throw new Error(firstError);
  if (!user?.uid) throw new Error("Sign in before creating a study room.");

  const roomRef = doc(collection(db, "studyRooms"));
  const participantRef = doc(db, "studyRooms", roomRef.id, "participants", user.uid);
  const isPrivate = values.visibility === "private";
  const roomCode = isPrivate ? generateRoomCode() : null;
  const inviteHash = roomCode ? await hashRoomCode(roomCode) : null;

  const roomData = {
    name: values.name,
    subject: values.subject,
    topic: values.topic,
    description: values.description,
    visibility: values.visibility,
    maxParticipants: values.maxParticipants,
    creatorId: user.uid,
    creatorName: cleanLine(user.displayName || "Student", 80),
    createdAt: serverTimestamp(),
    participantCount: 1,
    lastRemovedUid: null,
    lastApprovedUid: null,
  };

  const participantData = {
    name: cleanLine(user.displayName || "Student", 80),
    studying: false,
    timerState: null,
    joinedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  };

  await runTransaction(db, async (transaction) => {
    transaction.set(roomRef, roomData);
    transaction.set(participantRef, participantData);

    if (roomCode && inviteHash) {
      transaction.set(doc(db, "roomInvites", inviteHash), {
        roomId: roomRef.id,
        creatorId: user.uid,
        creatorName: roomData.creatorName,
        name: roomData.name,
        subject: roomData.subject,
        topic: roomData.topic,
        description: roomData.description,
        visibility: "private",
        maxParticipants: roomData.maxParticipants,
        participantCount: 1,
        createdAt: serverTimestamp(),
      });
      transaction.set(doc(db, "roomSecrets", roomRef.id), {
        creatorId: user.uid,
        roomCode,
        inviteHash,
      });
    }
  });

  return { id: roomRef.id, ...roomData, roomCode };
}

/**
 * Public rooms remain self-joinable. Private rooms are deliberately excluded:
 * submitting a private code creates a join request, not a membership.
 */
export async function joinRoom(roomId, user) {
  if (!user?.uid) throw new Error("Sign in to join a study room.");

  const roomRef = doc(db, "studyRooms", roomId);
  const participantRef = doc(db, "studyRooms", roomId, "participants", user.uid);

  return runTransaction(db, async (transaction) => {
    const participantSnapshot = await transaction.get(participantRef);
    const roomSnapshot = await transaction.get(roomRef);

    if (!roomSnapshot.exists()) throw new Error("Room not found.");

    const room = { id: roomSnapshot.id, ...roomSnapshot.data() };

    if (participantSnapshot.exists()) return room;

    let approvedRequest = null;
    if (room.visibility === "private" && room.creatorId !== user.uid) {
      // Stage 2 of private-room admission: the creator first approves the
      // request in a separate write. The requester then joins atomically.
      const requestSnapshot = await transaction.get(
        doc(db, "studyRooms", roomId, "joinRequests", user.uid)
      );
      if (!requestSnapshot.exists()) {
        throw new Error("Private rooms require creator approval. Enter the room code on the Study Rooms page to request access.");
      }
      approvedRequest = requestSnapshot.data();
      if (approvedRequest.status !== "approved" ||
          approvedRequest.requesterId !== user.uid ||
          approvedRequest.reviewedBy !== room.creatorId) {
        throw new Error("Your private-room request is still waiting for creator approval.");
      }
    } else if (room.visibility !== "public" && room.creatorId !== user.uid) {
      throw new Error("Private rooms require creator approval. Enter the room code on the Study Rooms page to request access.");
    }

    if ((room.participantCount || 0) >= room.maxParticipants) {
      throw new Error("This room is full.");
    }

    transaction.set(participantRef, {
      name: cleanLine(user.displayName || approvedRequest?.requesterName || "Student", 80),
      studying: false,
      timerState: null,
      joinedAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    });

    transaction.update(roomRef, room.visibility === "private" && room.creatorId !== user.uid
      ? {
          participantCount: room.participantCount + 1,
          lastApprovedUid: user.uid,
        }
      : { participantCount: room.participantCount + 1 });

    return room;
  });
}

export async function requestPrivateRoomAccess(roomId, user, inviteHash) {
  if (!user?.uid) throw new Error("Sign in to request access.");
  if (typeof inviteHash !== "string" || !/^[a-f0-9]{64}$/.test(inviteHash)) {
    throw new Error("Invalid private-room invitation.");
  }

  const participantRef = doc(db, "studyRooms", roomId, "participants", user.uid);
  const requestRef = doc(db, "studyRooms", roomId, "joinRequests", user.uid);
  const inviteRef = doc(db, "roomInvites", inviteHash);

  return runTransaction(db, async (transaction) => {
    // Complete every read before writing, as required by Firestore transactions.
    const participantSnapshot = await transaction.get(participantRef);
    const requestSnapshot = await transaction.get(requestRef);
    const inviteSnapshot = await transaction.get(inviteRef);

    if (participantSnapshot.exists()) return { status: "member" };

    if (!inviteSnapshot.exists() || inviteSnapshot.data().roomId !== roomId ||
        inviteSnapshot.data().visibility !== "private") {
      throw new Error("No private room found with that code.");
    }

    const requestData = {
      requesterId: user.uid,
      requesterName: cleanLine(user.displayName || "Student", 80),
      inviteHash,
      status: "pending",
      createdAt: serverTimestamp(),
      reviewedBy: null,
      reviewedAt: null,
    };

    if (requestSnapshot.exists()) {
      const previous = requestSnapshot.data();

      if (previous.status === "pending") return { status: "pending" };
      if (!["rejected", "approved"].includes(previous.status)) {
        throw new Error("This join request cannot be resubmitted.");
      }

      transaction.update(requestRef, requestData);
    } else {
      transaction.set(requestRef, requestData);
    }

    return { status: "pending" };
  });
}

export async function approveJoinRequest(roomId, requesterId, creator) {
  if (!creator?.uid) throw new Error("Sign in as the room creator to approve requests.");

  const roomRef = doc(db, "studyRooms", roomId);
  const requestRef = doc(db, "studyRooms", roomId, "joinRequests", requesterId);

  // Stage 1: record the creator's decision only. Membership and capacity are
  // updated later by the requester in a separate two-document transaction.
  await runTransaction(db, async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);
    const requestSnapshot = await transaction.get(requestRef);

    if (!roomSnapshot.exists() || roomSnapshot.data().creatorId !== creator.uid) {
      throw new Error("Only the room creator can approve requests.");
    }
    const room = roomSnapshot.data();
    if (room.visibility !== "private") {
      throw new Error("Creator approval is only used for private rooms.");
    }
    if ((room.participantCount || 0) >= room.maxParticipants) {
      throw new Error("This room is full.");
    }
    if (!requestSnapshot.exists() || requestSnapshot.data().status !== "pending") {
      throw new Error("This join request is no longer pending.");
    }
    if (requestSnapshot.data().requesterId !== requesterId ||
        typeof requestSnapshot.data().inviteHash !== "string") {
      throw new Error("The join request is invalid.");
    }

    transaction.update(requestRef, {
      status: "approved",
      reviewedBy: creator.uid,
      reviewedAt: serverTimestamp(),
    });
  });
}

export async function rejectJoinRequest(roomId, requesterId, creator) {
  if (!creator?.uid) throw new Error("Sign in as the room creator to reject requests.");

  const roomRef = doc(db, "studyRooms", roomId);
  const requestRef = doc(db, "studyRooms", roomId, "joinRequests", requesterId);

  await runTransaction(db, async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);
    const requestSnapshot = await transaction.get(requestRef);

    if (!roomSnapshot.exists() || roomSnapshot.data().creatorId !== creator.uid) {
      throw new Error("Only the room creator can reject requests.");
    }
    if (!requestSnapshot.exists() || requestSnapshot.data().status !== "pending") {
      throw new Error("This join request is no longer pending.");
    }

    transaction.update(requestRef, {
      status: "rejected",
      reviewedBy: creator.uid,
      reviewedAt: serverTimestamp(),
    });
  });
}

/**
 * Owner-only, narrow migration for records created before invite hashes were
 * removed from participant documents. The candidate rules permit only removal
 * of that one field by the room creator.
 */
export async function removeLegacyParticipantInviteHash(roomId, userId) {
  const participantRef = doc(db, "studyRooms", roomId, "participants", userId);
  const participantSnapshot = await getDoc(participantRef);

  if (!participantSnapshot.exists() ||
      !Object.prototype.hasOwnProperty.call(participantSnapshot.data(), "inviteHash")) {
    return;
  }

  await updateDoc(participantRef, { inviteHash: deleteField() });
}

export async function leaveRoom(roomId, userId) {
  const roomRef = doc(db, "studyRooms", roomId);
  const participantRef = doc(db, "studyRooms", roomId, "participants", userId);

  await runTransaction(db, async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);
    const participantSnapshot = await transaction.get(participantRef);
    if (!roomSnapshot.exists() || !participantSnapshot.exists()) return;

    const room = roomSnapshot.data();

    transaction.delete(participantRef);
    transaction.update(roomRef, {
      participantCount: Math.max(0, (room.participantCount || 1) - 1),
      lastRemovedUid: userId,
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
  const roomRef = doc(db, "studyRooms", roomId);
  const roomSnapshot = await getDoc(roomRef);
  if (!roomSnapshot.exists()) return;

  const roomData = roomSnapshot.data();
  const privateRoomCode = roomData.visibility === "private"
    ? await getPrivateRoomCode(roomId)
    : null;
  const inviteHash = privateRoomCode
    ? await hashRoomCode(normalizeRoomCode(privateRoomCode))
    : null;

  const participantsSnap = await getDocs(collection(db, "studyRooms", roomId, "participants"));
  for (const participantDoc of participantsSnap.docs) {
    await leaveRoom(roomId, participantDoc.id);
  }

  const messagesSnap = await getDocs(collection(db, "studyRooms", roomId, "messages"));
  const requestsSnap = await getDocs(collection(db, "studyRooms", roomId, "joinRequests"));

  await Promise.all([
    ...messagesSnap.docs.map((messageDoc) => deleteDoc(messageDoc.ref)),
    ...requestsSnap.docs.map((requestDoc) => deleteDoc(requestDoc.ref)),
    ...(inviteHash ? [deleteDoc(doc(db, "roomInvites", inviteHash))] : []),
    deleteDoc(doc(db, "roomSecrets", roomId)),
    deleteDoc(doc(db, "studyRooms", roomId, "notes", "shared")),
  ]);

  await deleteDoc(roomRef);
}

export async function getPrivateRoomCode(roomId) {
  const snapshot = await getDoc(doc(db, "roomSecrets", roomId));
  return snapshot.exists() ? snapshot.data().roomCode : null;
}

const HEARTBEAT_STALE_MS = 50 * 1000;

export async function sendHeartbeat(roomId, userId) {
  await updateDoc(doc(db, "studyRooms", roomId, "participants", userId), {
    lastSeen: serverTimestamp(),
  });
}

export async function cleanupStaleParticipants(
  roomId,
  participants,
  currentUserId,
  isRoomOwner
) {
  const now = Date.now();

  const stale = participants.filter((participant) => {
    const lastSeenMs = participant.lastSeen?.toMillis ? participant.lastSeen.toMillis() : null;
    if (!lastSeenMs) return false;
    return now - lastSeenMs > HEARTBEAT_STALE_MS;
  });

  const removable = stale.filter(
    (participant) => isRoomOwner || participant.id === currentUserId
  );
  await Promise.all(
    removable.map((participant) => leaveRoom(roomId, participant.id))
  );
}
