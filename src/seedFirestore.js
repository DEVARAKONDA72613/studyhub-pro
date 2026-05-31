import { db } from "./firebase";
import { books } from "./data/books";
import { doc, setDoc } from "firebase/firestore";

export async function seedFirestore() {
  try {
    for (const book of books) {
      console.log(book);

      await setDoc(
        doc(db, "books", String(book.id)),
        {
          title: book.title || "",
          views: book.views ?? 0,
          downloads: book.downloads ?? 0,
          rating: book.rating ?? 0,
          ratingCount: 0,
        }
      );
    }

    console.log("Firestore seeded!");
  } catch (error) {
    console.error(error);
  }
}