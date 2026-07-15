"use client"

import { Camera, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { uploadPhoto } from "@/actions/profiles"
import { FileUpload } from "@/components/shared/file-upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type PhotoUploadProps = {
  photoUrl: string | null
  firstName: string
  lastName: string
  onUploaded?: (url: string) => void
}

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Avatar with an overlay trigger to replace the photo. Shows an optimistic
 * local preview (object URL) while the upload is in flight, and reverts to
 * the previous photo if the upload fails.
 */
export function PhotoUpload({ photoUrl, firstName, lastName, onUploaded }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  async function handleFileSelect(file: File) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const objectUrl = URL.createObjectURL(file)
    previewUrlRef.current = objectUrl
    setPreview(objectUrl)
    setIsUploading(true)

    const result = await uploadPhoto(file)

    setIsUploading(false)
    if (result.success) {
      toast.success("Photo mise à jour.")
      onUploaded?.(result.url)
    } else {
      toast.error(result.error)
      setPreview(null)
    }
  }

  const displayUrl = preview ?? photoUrl ?? undefined

  return (
    <FileUpload
      onFileSelect={handleFileSelect}
      onError={(message) => toast.error(message)}
      disabled={isUploading}
      className="group relative inline-block rounded-full"
    >
      <Avatar size="lg" className="size-24">
        {displayUrl && <AvatarImage src={displayUrl} alt="" />}
        <AvatarFallback className="text-lg">{initials(firstName, lastName)}</AvatarFallback>
      </Avatar>
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        {isUploading ? (
          <Loader2 className="size-5 animate-spin text-white" />
        ) : (
          <Camera className="size-5 text-white" />
        )}
      </span>
    </FileUpload>
  )
}
