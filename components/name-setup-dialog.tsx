"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface NameSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNameSet: (name: string) => void
}

export default function NameSetupDialog({ open, onOpenChange, onNameSet }: NameSetupDialogProps) {
  const [name, setName] = useState("")

  useEffect(() => {
    const savedName = localStorage.getItem("myName")
    if (savedName) {
      setName(savedName)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("エラー", {
        description: "名前を入力してください",
      })
      return
    }
    localStorage.setItem("myName", name.trim())
    onNameSet(name.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>自分の名前を設定</DialogTitle>
          <DialogDescription>
            メールテンプレートで使用する自分の名前を設定してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="あなたの名前を入力してください"
            autoFocus
          />
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            設定する
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 