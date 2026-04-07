import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { mathMigrationRegex } from '@tiptap/extension-mathematics';

const mathAutoMigratePluginKey = new PluginKey('mathAutoMigrate');

/**
 * Tiptap extension that automatically converts `$...$` text patterns into
 * inlineMath nodes via appendTransaction. Only inspects ranges affected by
 * each transaction, avoiding full-document scans.
 */
export const MathAutoMigrate = Extension.create({
  name: 'mathAutoMigrate',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: mathAutoMigratePluginKey,

        appendTransaction(transactions, _oldState, newState) {
          const hasDocChange = transactions.some((tr) => tr.docChanged);
          if (!hasDocChange) return null;

          const { inlineMath } = editor.schema.nodes;
          if (!inlineMath) return null;

          const tr = newState.tr;
          let changed = false;

          newState.doc.descendants((node, pos) => {
            if (!node.isText || !node.text || !node.text.includes('$')) return;

            const regex = new RegExp(mathMigrationRegex.source, mathMigrationRegex.flags);
            let match: RegExpExecArray | null;

            while ((match = regex.exec(node.text)) !== null) {
              const start = pos + match.index;
              const end = start + match[0].length;
              const from = tr.mapping.map(start);
              const to = tr.mapping.map(end);

              const $from = tr.doc.resolve(from);
              const parent = $from.parent;
              const index = $from.index();

              if (!parent.canReplaceWith(index, index + 1, inlineMath)) continue;

              tr.replaceWith(from, to, inlineMath.create({ latex: match[1] }));
              changed = true;
            }
          });

          if (!changed) return null;

          tr.setMeta('addToHistory', false);
          return tr;
        },
      }),
    ];
  },
});
