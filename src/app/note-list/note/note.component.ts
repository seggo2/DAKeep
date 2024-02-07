import { Component, Input } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { NoteListService } from '../../firebase-services/note-list.service'

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent {
  @Input() note!: Note;
  edit = false;
  hovered = false;

  constructor(private noteService: NoteListService) { }

  changeMarkedStatus() {
    this.note.marked = !this.note.marked;
    this.noteService.updateNote(this.note)
  }

  deleteHovered() {
    if (!this.edit) {
      this.hovered = false;
    }
  }

  openEdit() {
    this.edit = true;
  }

  closeEdit() {
    this.edit = false;
    this.saveNote();
  }

  moveToTrash() {
    if (this.note.id) {
      this.note.type = 'Trash';
      let docId = this.note.id;
      delete this.note.id;
      this.noteService.addNote(this.note, "Trash");
      this.noteService.deleteNote("notes", docId)
    }
  }
  moveToNotes() {
    if (this.note.id) {
      this.note.type = 'note';
      let docId = this.note.id;
      delete this.note.id;
      this.noteService.addNote(this.note, "notes");
      this.noteService.deleteNote("Trash", docId)
    }
  }

  deleteNote() {
    if (this.note.id) {
      this.noteService.deleteNote("Trash", this.note.id);
    }
  }
  saveNote() {
    this.noteService.updateNote(this.note)
  }

}
