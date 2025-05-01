"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  availableTags: string[]
  onCreateTag?: (tag: string) => void
  placeholder?: string
}

export function TagInput({
  value = [],
  onChange,
  availableTags = [],
  onCreateTag,
  placeholder = "Select tags...",
}: TagInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = (tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag])
    } else {
      onChange(value.filter((v) => v !== tag))
    }
    setInputValue("")
  }

  const handleCreateTag = () => {
    if (inputValue && !availableTags.includes(inputValue) && onCreateTag) {
      onCreateTag(inputValue)
      handleSelect(inputValue)
    }
  }

  const handleRemove = (tag: string) => {
    onChange(value.filter((v) => v !== tag))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="px-2 py-1 text-xs">
            {tag}
            <button
              type="button"
              className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
              onClick={() => handleRemove(tag)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
              {placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search tags..." value={inputValue} onValueChange={setInputValue} />
              <CommandList>
                <CommandEmpty>
                  {inputValue && onCreateTag ? (
                    <div
                      className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-muted"
                      onClick={handleCreateTag}
                    >
                      <span>Create "{inputValue}"</span>
                      <Check className="h-4 w-4" />
                    </div>
                  ) : (
                    "No tags found."
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {availableTags.map((tag) => (
                    <CommandItem key={tag} value={tag} onSelect={() => handleSelect(tag)}>
                      <Check className={cn("mr-2 h-4 w-4", value.includes(tag) ? "opacity-100" : "opacity-0")} />
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
