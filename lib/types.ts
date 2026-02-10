export type Category = {
  id: string
  name: string
  color: string
}

export type Template = {
  id: string
  title: string
  content: string
  category: Category
  isFavorite: boolean
  createdAt: number
  updatedAt: number
}

export type Professor = {
  id: string
  name: string
  email: string
}

export type SignatureTemplate = {
  content: string
}

