#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { createContext, runInContext } from "node:vm";
import { parse } from "@astrojs/compiler";
import { is, walk } from "@astrojs/compiler/utils";
import type { Messages } from "@nanostores/i18n";
import { glob } from "fast-glob";
import * as ts from "typescript";

const components = await glob("./src/**/*.astro", { absolute: true });
const allMessages: Record<string, Messages> = {};
const context = createContext({
  exports: {},
  Object,
  i18n: (namespace: string, messages: Messages) => {
    allMessages[namespace] = { ...allMessages[namespace], ...messages };
    return messages;
  },
  params: (template: string) => template,
});

function extractMessagesFromAST(code: string) {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
  );

  let messagesExport: string | undefined;

  function visit(node: ts.Node) {
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const declaration = node.declarationList.declarations[0];
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === "messages" &&
        declaration.initializer
      ) {
        messagesExport = node.getText();
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return messagesExport;
}

await Promise.all(
  components.map(async (file) => {
    const content = await readFile(file, "utf-8");
    const { ast } = await parse(content, { position: false });

    walk(ast, (node) => {
      if (is.frontmatter(node)) {
        const { value: code } = node;

        try {
          const extractedMessages = extractMessagesFromAST(code);
          if (extractedMessages) {
            const code = ts.transpile(extractedMessages);
            runInContext(code, context);
          }
        } catch (error: unknown) {
          console.error(`Error processing file ${file}:`, error);
        }
      }
    });
  }),
);

if (Object.keys(allMessages).length > 0) {
  const messagesJSON = Object.fromEntries(
    Object.entries(allMessages).map(([namespace, messages]) => [
      namespace,
      messages,
    ]),
  );

  await writeFile("./src/messages.json", JSON.stringify(messagesJSON, null, 2));
  process.exit(0);
} else {
  console.warn("No messages found in the provided components.");
}
