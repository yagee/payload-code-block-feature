import { $createCodeNode, CodeHighlightNode, CodeNode } from "@lexical/code";
import { $setBlocksType } from "@lexical/selection";
import {
    SlashMenuOption,
    type FeatureProvider,
} from "@payloadcms/richtext-lexical";
import {
    $getSelection,
    $isRangeSelection,
    DEPRECATED_$isGridSelection,
} from "lexical";

import type { CodeBlockFeatureConfig } from "./types";

export const CodeBlockFeature = (
    config: CodeBlockFeatureConfig = {}
): FeatureProvider => {
    const { languages } = config;
    return {
        feature: (): any => {
            return {
                slashMenu: {
                    options: [
                        {
                            displayName: "Code Block",
                            key: "code-block",
                            options: [
                                new SlashMenuOption("code-block", {
                                    Icon: () =>
                                        import("./Icon").then(
                                            (m) => m.CodeBlockIcon
                                        ),
                                    displayName: "Code Block",
                                    keywords: ["code"],
                                    onSelect: ({ editor }) => {
                                        editor.update(() => {
                                            let selection = $getSelection();

                                            if (
                                                $isRangeSelection(selection) ||
                                                DEPRECATED_$isGridSelection(
                                                    selection
                                                )
                                            ) {
                                                if (selection.isCollapsed()) {
                                                    $setBlocksType(
                                                        selection,
                                                        () => $createCodeNode()
                                                    );
                                                } else {
                                                    const textContent =
                                                        selection.getTextContent();
                                                    const codeNode =
                                                        $createCodeNode();
                                                    selection.insertNodes([
                                                        codeNode,
                                                    ]);
                                                    selection = $getSelection();
                                                    if (
                                                        $isRangeSelection(
                                                            selection
                                                        )
                                                    )
                                                        selection.insertRawText(
                                                            textContent
                                                        );
                                                }
                                            }
                                        });
                                    },
                                }),
                            ],
                        },
                    ],
                },
                nodes: [
                    {
                        converters: {
                            html: async ({ node }) => {
                                const codeText = node.children
                                    .map((child) => {
                                        if (child.type === "linebreak") {
                                            return "\n";
                                        }
                                        return child.text;
                                    })
                                    .join("");

                                return `<code lang="${node.language}">${codeText}</code>`;
                            }, // <= This is where you define your HTML Converter
                        },
                        node: CodeNode,
                        type: CodeNode.getType(),
                    },
                    {
                        converters: {
                            html: async ({ node }) => {
                                const codeText = node.children
                                    .map((child) => {
                                        if (child.type === "linebreak") {
                                            return "\n";
                                        }
                                        return child.text;
                                    })
                                    .join("");

                                return `<code lang="${node.language}">${codeText}</code>`;
                            }, // <= This is where you define your HTML Converter
                        },
                        node: CodeHighlightNode,
                        type: CodeHighlightNode.getType(),
                    },
                ],
                plugins: [
                    {
                        Component: () =>
                            import("./plugins/Toolbar").then((m) => {
                                const toolbar = m.Toolbar;
                                return import("payload/utilities").then(
                                    (module) =>
                                        module.withMergedProps({
                                            Component: toolbar,
                                            toMergeIntoProps: {
                                                languages,
                                            },
                                        })
                                );
                            }),
                        position: "floatingAnchorElem",
                    },
                    {
                        Component: () =>
                            import("./Plugin").then((m) => m.default),
                        position: "normal",
                    },
                ],
                props: null,
            };
        },
        key: "code-block",
    };
};
