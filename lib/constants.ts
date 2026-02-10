import { type Category, type SignatureTemplate } from "./types"

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "研究関連", color: "#0891b2" },
  { id: "2", name: "事務関連", color: "#059669" },
  { id: "3", name: "その他", color: "#6b7280" },
]

export const DEFAULT_SIGNATURE: SignatureTemplate = {
  content: "",
} 