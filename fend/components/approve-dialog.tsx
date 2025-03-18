"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define the props interface for the ApproveDialog component
interface ApproveDialogProps {
  title: string; // The title of the dialog
  description: string; // The description shown in the dialog
  content?: string; // The main content text of the dialog
  onCancel?: () => void;
  onApprove?: () => void;
}

// ApproveDialog component to display a confirmation dialog
export function ApproveDialog({
  title,
  description,
  content,
  onCancel,
  onApprove,
}: ApproveDialogProps) {
  const [isOpen, setIsOpen] = useState(false); // State to control dialog visibility

  // Effect to automatically open the dialog when the component mounts
  useEffect(() => {
    setIsOpen(true); // Show the dialog on mount
  }, []);

  const handleApprove = () => {
    setIsOpen(false);
    if (onApprove) {
      onApprove();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    // Dialog component with controlled open state
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Display the dynamic title */}
          <DialogTitle>{title}</DialogTitle>
          {/* Display the dynamic description */}
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content && (
          <div className="flex flex-col space-y-2">
            {/* Display the dynamic content in the dialog body */}
            <p className="text-sm text-muted-foreground">{content}</p>
          </div>
        )}
        <DialogFooter className="flex space-x-2 sm:justify-end">
          {/* Cancel button */}
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          {/* Approve button */}
          <Button type="button" onClick={handleApprove}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
