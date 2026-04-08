"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FrameCard } from "./FrameCard";
import { FrameWithImages } from "@/types";

interface SortableFrameCardProps {
  frame: FrameWithImages;
  onEdit: () => void;
  onDelete: () => void;
  onAddImage: (childId: string) => void;
  onDeleteImage: (imageId: string) => void;
  childProfiles: { id: string; name: string }[];
}

export function SortableFrameCard(props: SortableFrameCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.frame.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <FrameCard {...props} dragListeners={listeners} />
    </div>
  );
}
