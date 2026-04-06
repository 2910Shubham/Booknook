export type Book = {
  id: string
  user_id: string
  title: string
  file_name: string
  file_path: string | null
  file_size: number | null
  total_pages: number
  file_type: string
  cover_color: string
  uploaded_at: string
  last_opened: string | null
}

export type BookInsert = Omit<Book, 'id' | 'uploaded_at'>

export type ReadingProgress = {
  id: string
  user_id: string
  book_id: string
  current_page: number
  total_pages: number
  last_read_at: string
  total_time_read: number
}

export type Annotation = {
  id: string
  user_id: string
  book_id: string
  page_number: number
  tool: 'highlight' | 'pen' | 'underline' | 'note' | 'shape'
  color: string | null
  data: any
  created_at: string
  updated_at: string
}

export type Bookmark = {
  id: string
  user_id: string
  book_id: string
  page_number: number
  label: string
  created_at: string
}

export type ReadingSession = {
  id: string
  user_id: string
  book_id: string
  date: string
  duration: number
  pages_read: number
}