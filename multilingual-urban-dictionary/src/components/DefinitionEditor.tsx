"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, TrashIcon, PlusIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface Example {
  id?: number;
  text: string;
  translation?: string;
  status: string;
}

interface DefinitionForEditor {
  id?: number;
  body: string;
  status: string;
  examples: Example[];
}

interface DefinitionEditorProps {
  definitions: DefinitionForEditor[];
  onDefinitionsChange: (definitions: DefinitionForEditor[]) => void;
  disabled?: boolean;
}

export default function DefinitionEditor({
  definitions,
  onDefinitionsChange,
  disabled = false,
}: DefinitionEditorProps) {
  const [openDefinitions, setOpenDefinitions] = useState<Set<number>>(new Set());

  const toggleDefinition = (index: number) => {
    const newOpen = new Set(openDefinitions);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenDefinitions(newOpen);
  };

  const updateDefinition = (index: number, field: keyof DefinitionForEditor, value: string) => {
    const newDefinitions = [...definitions];
    newDefinitions[index] = { ...newDefinitions[index], [field]: value };
    onDefinitionsChange(newDefinitions);
  };

  const addDefinition = () => {
    const newDefinition: DefinitionForEditor = {
      body: "",
      status: "pending",
      examples: [],
    };
    onDefinitionsChange([...definitions, newDefinition]);
  };

  const removeDefinition = (index: number) => {
    const newDefinitions = definitions.filter((_, i) => i !== index);
    onDefinitionsChange(newDefinitions);
  };

  const addExample = (definitionIndex: number) => {
    const newDefinitions = [...definitions];
    const newExample: Example = {
      text: "",
      translation: "",
      status: "pending",
    };
    newDefinitions[definitionIndex].examples.push(newExample);
    onDefinitionsChange(newDefinitions);
  };

  const updateExample = (
    definitionIndex: number,
    exampleIndex: number,
    field: keyof Example,
    value: string
  ) => {
    const newDefinitions = [...definitions];
    newDefinitions[definitionIndex].examples[exampleIndex] = {
      ...newDefinitions[definitionIndex].examples[exampleIndex],
      [field]: value,
    };
    onDefinitionsChange(newDefinitions);
  };

  const removeExample = (definitionIndex: number, exampleIndex: number) => {
    const newDefinitions = [...definitions];
    newDefinitions[definitionIndex].examples = newDefinitions[
      definitionIndex
    ].examples.filter((_, i) => i !== exampleIndex);
    onDefinitionsChange(newDefinitions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Definitions</h3>
        <button
          type="button"
          onClick={addDefinition}
          disabled={disabled}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          Add Definition
        </button>
      </div>

      {definitions.length === 0 ? (
        <div className="text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
          No definitions yet. Click &quot;Add Definition&quot; to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {definitions.map((definition, definitionIndex) => (
            <Collapsible
              key={definitionIndex}
              open={openDefinitions.has(definitionIndex)}
              onOpenChange={() => toggleDefinition(definitionIndex)}
            >
              <div className="border rounded-lg">
                <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    {openDefinitions.has(definitionIndex) ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      Definition {definitionIndex + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      definition.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : definition.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {definition.status}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDefinition(definitionIndex);
                      }}
                      disabled={disabled}
                      className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 border-t space-y-4">
                    {/* Definition Body */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Definition *
                      </label>
                      <textarea
                        value={definition.body}
                        onChange={(e) =>
                          updateDefinition(definitionIndex, "body", e.target.value)
                        }
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
                        rows={3}
                        placeholder="Enter the definition..."
                        required
                      />
                    </div>

                    {/* Definition Status */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Status *
                      </label>
                      <select
                        value={definition.status}
                        onChange={(e) =>
                          updateDefinition(definitionIndex, "status", e.target.value)
                        }
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Examples Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium">
                          Examples
                        </label>
                        <button
                          type="button"
                          onClick={() => addExample(definitionIndex)}
                          disabled={disabled}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded transition-colors disabled:opacity-50"
                        >
                          <PlusIcon className="h-3 w-3" />
                          Add Example
                        </button>
                      </div>

                      {definition.examples.length === 0 ? (
                        <div className="text-muted-foreground text-center py-4 border border-dashed rounded text-sm">
                          No examples yet. Click &quot;Add Example&quot; to create one.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {definition.examples.map((example, exampleIndex) => (
                            <div
                              key={exampleIndex}
                              className="border rounded-md p-3 bg-muted/20"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  Example {exampleIndex + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    example.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : example.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {example.status}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeExample(definitionIndex, exampleIndex)
                                    }
                                    disabled={disabled}
                                    className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    Example Text *
                                  </label>
                                  <textarea
                                    value={example.text}
                                    onChange={(e) =>
                                      updateExample(
                                        definitionIndex,
                                        exampleIndex,
                                        "text",
                                        e.target.value
                                      )
                                    }
                                    disabled={disabled}
                                    className="w-full px-2 py-1 text-sm border border-input bg-background rounded focus:outline-none focus:ring-1 focus:ring-ring resize-none disabled:opacity-50"
                                    rows={2}
                                    placeholder="Enter example usage..."
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    Translation
                                  </label>
                                  <textarea
                                    value={example.translation || ""}
                                    onChange={(e) =>
                                      updateExample(
                                        definitionIndex,
                                        exampleIndex,
                                        "translation",
                                        e.target.value
                                      )
                                    }
                                    disabled={disabled}
                                    className="w-full px-2 py-1 text-sm border border-input bg-background rounded focus:outline-none focus:ring-1 focus:ring-ring resize-none disabled:opacity-50"
                                    rows={2}
                                    placeholder="Enter translation..."
                                  />
                                </div>
                              </div>

                              <div className="mt-2">
                                <label className="block text-xs font-medium mb-1">
                                  Status *
                                </label>
                                <select
                                  value={example.status}
                                  onChange={(e) =>
                                    updateExample(
                                      definitionIndex,
                                      exampleIndex,
                                      "status",
                                      e.target.value
                                    )
                                  }
                                  disabled={disabled}
                                  className="w-full px-2 py-1 text-sm border border-input bg-background rounded focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                                  required
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}