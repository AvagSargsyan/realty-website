import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 * Plain paragraphs as a Lexical document: the default text of the rich-text fields in the Pages global,
 * built from the dictionaries. No server-only imports, so the Payload config can use it.
 */
export function paragraphsToLexical(paragraphs: string[]): SerializedEditorState {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
      })),
    },
  } as unknown as SerializedEditorState
}

/** True when a Lexical document has no visible text (the editor saves an empty paragraph when cleared). */
export function isEmptyLexical(state: SerializedEditorState | null | undefined): boolean {
  if (!state?.root?.children?.length) return true
  const hasText = (node: { text?: string; children?: unknown[] }): boolean =>
    Boolean(node.text?.trim()) || (node.children ?? []).some((c) => hasText(c as { text?: string; children?: unknown[] }))
  return !hasText(state.root as unknown as { children?: unknown[] })
}
