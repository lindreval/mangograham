"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

interface Tag {
  id: number;
  name: string;
  color: string;
  author: {
    name: string | null;
    username: string | null;
  };
  _count: {
    phrases: number;
  };
}

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  disabled?: boolean;
}

export default function TagSelector({ selectedTags, onTagsChange, disabled }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor] = useState("#205C2B");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch available tags
  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch('/api/tags');
        const data = await response.json();
        setAvailableTags(data.tags || []);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTags();
  }, []);

  const handleTagToggle = (tag: Tag) => {
    if (disabled) return;
    
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTag = data.tag;
        
        // Add to available tags
        setAvailableTags(prev => [...prev, newTag]);
        
        // Auto-select the new tag
        onTagsChange([...selectedTags, newTag]);
        
        // Reset form
        setNewTagName("");
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('An error occurred while creating the tag');
    } finally {
      setIsCreating(false);
    }
  };

  // const tagColors = [
  //   "#3B82F6", // blue
  //   "#EF4444", // red
  //   "#10B981", // green
  //   "#F59E0B", // yellow
  //   "#8B5CF6", // purple
  //   "#F97316", // orange
  //   "#06B6D4", // cyan
  //   "#84CC16", // lime
  //   "#EC4899", // pink
  //   "#6B7280", // gray
  // ];

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading tags...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {!disabled && (
        <>
          {/* Available Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Available Tags (optional)</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.some(t => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'text-white'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={isSelected ? { backgroundColor: tag.color } : {}}
                  >
                    {tag.name}
                    <span className="text-xs opacity-75">({tag._count.phrases})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create New Tag */}
          <div className="space-y-2">
            {!showCreateForm ? (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded font-medium transition-colors"
              >
                <Plus className="h-3 w-3" />
                Create new tag
              </button>
            ) : (
              <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name"
                    className="flex-1 px-2 py-1 text-sm border rounded"
                    maxLength={20}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || isCreating}
                    className="px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded font-medium transition-colors disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTagName("");
                    }}
                    className="px-3 py-1.5 text-xs bg-muted text-muted-foreground hover:bg-muted/80 rounded font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}