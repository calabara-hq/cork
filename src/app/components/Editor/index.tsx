"use client";;
import { forwardRef } from 'react';
import {
    type MDXEditorMethods,
    type MDXEditorProps
} from '@mdxeditor/editor'
import { Label } from "../Label";
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./InitializedMDXEditor'), {
    // Make sure we turn SSR off
    loading: () => (
        <div className="h-[90px] w-full shimmer bg-base-100 rounded-lg" />
    ),
    ssr: false
})


interface MarkdownEditorProps extends MDXEditorProps {
    label: string;
    error: string[];
}

export const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
    ({ label, error, ...editorProps }, ref) => {
        return (
            <div className="flex flex-col gap-2">
                <Label>{label}</Label>
                <Editor {...editorProps} editorRef={ref} placeholder="Start typing here ..." />
                {error && (
                    <Label>
                        <p className="text-error max-w-sm break-words">{error.join(",")}</p>
                    </Label>
                )}
            </div>
        );
    }
);

MarkdownEditor.displayName = "MarkdownEditor";