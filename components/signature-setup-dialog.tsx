"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { type SignatureTemplate } from "@/lib/types"
import { toast } from "sonner"

export default function SignatureSetupDialog() {
  const [signature, setSignature] = useState<SignatureTemplate>({
    content: "",
  })

  useEffect(() => {
    const savedSignature = localStorage.getItem("signature")
    if (savedSignature) {
      setSignature(JSON.parse(savedSignature))
    }
  }, [])

  const handleSave = () => {
    if (!signature.content.trim()) {
      toast.error("エラー", {
        description: "署名テンプレートを入力してください",
      })
      return
    }
    localStorage.setItem("signature", JSON.stringify(signature))
    toast.success("保存しました", {
      description: "署名テンプレートが正常に保存されました",
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-green-700">
          署名テンプレート設定
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>署名テンプレート設定</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="signature">署名テンプレート</Label>
            <Textarea
              id="signature"
              value={signature.content}
              onChange={(e) => setSignature({ content: e.target.value })}
              placeholder="例：
山田 太郎

〇〇大学 理工学部 3年

電話番号：090-1234-5678

メール　：example@university.ac.jp"
              className="min-h-[200px]"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 