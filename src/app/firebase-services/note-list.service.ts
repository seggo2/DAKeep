import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc, limit, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashnotes: Note[] = [];
  normalnotes: Note[] = [];
  markedNotes: Note[] = [];

  firestore: Firestore = inject(Firestore);


  unsubThrash;
  unsubNotes;
  unsubMarked;


  async deleteNote(colId: "notes" | "Trash", docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => { console.log(err) });
  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColId(note), note.id)
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => { console.log(err); }
      )
    }

  }

  getCleanJson(note: Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    };
  }

  getColId(note: Note) {
    if (note.type == 'note') {
      return 'notes'
    } else {
      return 'Trash'
    }
  }

  constructor() {
    this.unsubThrash = this.subTrashList();
    this.unsubNotes = this.subNoteList();
    this.unsubMarked = this.subMarkedNoteList();
  }

  async addNote(item: Note, colId: "notes" | "Trash") {
    if (colId == "Trash") {
      await addDoc(this.getTrashRef(), item).catch(
        (err) => { console.error(err) }
      ).then(
        (docRef) => { console.log("document written with id :", docRef) }
      )
    } else {
      await addDoc(this.getNoteRef(), item).catch(
        (err) => { console.error(err) }
      ).then(
        (docRef) => { console.log("document written with id :", docRef) }
      )
    }
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashnotes = [];
      list.forEach(element => {
        this.trashnotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNoteList() {
    const q = query(this.getNoteRef(), limit(100));
    return onSnapshot(q, (list) => {
      this.normalnotes = [];
      list.forEach(element => {
        this.normalnotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subMarkedNoteList() {
    const q = query(this.getNoteRef(), where("marked", "==", true), limit(100));
    return onSnapshot(q, (list) => {
      this.markedNotes = [];
      list.forEach(element => {
        this.markedNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  ngonDestroy() {
    this.unsubThrash();
    this.unsubNotes();
    this.subMarkedNoteList();
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }

  getNoteRef() {
    return collection(this.firestore, 'notes')
  }

  getTrashRef() {
    return collection(this.firestore, 'Trash')
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId)
  }

}

