"use client"; // Required for TipTap hooks

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Bold, Italic, List } from "lucide-react";
import { Toggle } from "~/components/ui/toggle"; // Assuming you have a Toggle component
import React from "react";

// Define your extension array
const extensions = [Document, Paragraph, Text, BulletList, ListItem]

interface RichTextEditorProps {
  content: string | undefined | null; // Accept initial content
  onChange: (htmlContent: string) => void; // Callback for changes
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Enter description...",
}) => {
  const editor = useEditor({
    extensions,
    content: content || "", // Use provided content or empty string
    editorProps: {
      attributes: {
        // Add styling similar to Textarea
class:
  "min-h-[80px] w-full rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ProseMirror",
},
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML()); // Pass HTML content back on update
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="border border-input rounded-md p-1 flex gap-1">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="h-4 w-4" />
        </Toggle>
        {/* Add more controls as needed (e.g., headings, links) */}
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
};
