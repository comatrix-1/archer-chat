"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List } from "lucide-react";
import type React from "react";
import { Toggle } from "@project/remix/app/components/ui/toggle";

interface RichTextEditorProps {
  content?: JSONContent | null;
  onChange: (jsonContent: JSONContent) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Enter description...",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: content || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
        },
      ],
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[80px] w-full rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ProseMirror",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
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
        {}
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
};
