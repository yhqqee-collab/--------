export type Note = {
  id: string
  date: string
  time: string
  body: string
}

/** 최신 메모가 위로 오도록 정렬되어 있습니다. 첫 줄이 제목으로 표시됩니다. */
export const NOTES: Note[] = []

export function splitNote(note: Note) {
  const [title, ...rest] = note.body.split('\n')
  return { title, content: rest.join('\n') }
}
