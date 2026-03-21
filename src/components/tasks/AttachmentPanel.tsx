"use client";

import { useState, useEffect } from "react";
import { Paperclip, Upload, Trash2, FileText, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string | null;
  size: number;
  createdAt: string;
}

function formatsize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(type: string | null) {
  if (type?.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
  if (type?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  return <File className="h-4 w-4 text-gray-500" />;
}

export function AttachmentPanel({ taskId }: { taskId: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (taskId) fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data);
      }
    } catch (err) {
      console.error('Failed to fetch attachments', err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // For now, create a placeholder attachment record
      // In production, upload to S3/Cloudinary first
      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          url: URL.createObjectURL(file),
          mimeType: file.type,
          size: file.size,
        }),
      });
      if (res.ok) fetchAttachments();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId }),
      });
      fetchAttachments();
    } catch (err) {
      console.error('Failed to remove attachment', err);
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
        <Paperclip className="h-3 w-3" />
        Attachments ({attachments.length})
      </label>
      <div className="space-y-1 mt-1">
        {attachments.map((a) => (
          <div key={a.id} className="flex items-center gap-2 p-1.5 rounded-md bg-muted/50 group">
            {getFileIcon(a.mimeType)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{a.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {formatsize(a.size)} - {format(new Date(a.createdAt), 'MMM d')}
              </p>
            </div>
            <button
              onClick={() => removeAttachment(a.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <label className="mt-2 flex items-center gap-1 cursor-pointer">
        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
          <span>
            <Upload className="h-3 w-3 mr-1" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </span>
        </Button>
      </label>
    </div>
  );
}
