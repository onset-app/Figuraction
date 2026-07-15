"use client"

import type { ChangeEvent, ReactNode } from "react"
import { cn } from "@/lib/utils"

const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

type FileUploadProps = {
  /** Rendered as the clickable trigger — e.g. an avatar or a dropzone card. */
  children: ReactNode
  onFileSelect: (file: File) => void
  onError: (message: string) => void
  accept?: string[]
  maxSizeBytes?: number
  disabled?: boolean
  className?: string
}

/**
 * Generic file-picker: a label wrapping a visually hidden file input, so any
 * markup can be used as the trigger while keeping the input accessible and
 * keyboard-operable. Validates type and size client-side before handing the
 * file to the caller — servers must still re-validate, this is UX only.
 */
export function FileUpload({
  children,
  onFileSelect,
  onError,
  accept = DEFAULT_ACCEPTED_TYPES,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  disabled,
  className,
}: FileUploadProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so selecting the same file again still fires onChange.
    event.target.value = ""
    if (!file) return

    if (!accept.includes(file.type)) {
      onError("Format non supporté. Utilisez JPEG, PNG ou WebP.")
      return
    }
    if (file.size > maxSizeBytes) {
      onError(`L'image ne doit pas dépasser ${Math.round(maxSizeBytes / (1024 * 1024))} Mo.`)
      return
    }
    onFileSelect(file)
  }

  return (
    <label
      className={cn("cursor-pointer", disabled && "pointer-events-none opacity-60", className)}
    >
      {children}
      <input
        type="file"
        accept={accept.join(",")}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
    </label>
  )
}
