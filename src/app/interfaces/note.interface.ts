export interface Note {
    id?: string;
    type: "note" | "Trash";
    title:string;
    content:string;
    marked: boolean;
}
