"use client";

import { useState } from "react";
import { IContact } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useReplyContact,
  useUpdateContactStatus,
} from "@/lib/api/services/contactService";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface ReplyModalProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  contact: IContact;
}

export function ReplyModal({ open, onOpenChange, contact }: ReplyModalProps) {
  const [reply, setReply] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { mutateAsync: sendReply, isPending } = useReplyContact(contact._id);
  const { mutate: updateStatus } = useUpdateContactStatus(contact._id);

  // Update status to read when opened if status is unread
  if (open && contact.status === "unread") {
    updateStatus({ status: "read" });
  }

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false);
      // Reset the form state when closing
      setTimeout(() => setReply(""), 300);
    }
  };

  const generateAIReply = async () => {
    try {
      setIsGenerating(true);

      // Use the window.navigator.clipboard API to read from clipboard
      // and AI models like GPT-4 to generate a reply
      // For the sake of this example, we'll just generate a simple reply

      const prompt = `
        Generate a professional and friendly email reply to the following message:
        
        Name: ${contact.name}
        Email: ${contact.email}
        Subject: ${contact.subject}
        Message: ${contact.message}
        
        The reply should be courteous, address their concerns, and provide relevant information.
      `;

      // In a real implementation, you would call your AI service here
      // For now, we'll just simulate a delay and provide a template
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const generatedReply = `Dear ${contact.name},

Thank you for reaching out to me regarding "${contact.subject}". I appreciate you taking the time to share your thoughts.

I've reviewed your message and I'd be happy to discuss this further. 

[Add specific response to their inquiry here]

Please feel free to contact me if you have any other questions or need further clarification.

Best regards,
Utkarsh Chaudhary`;

      setReply(generatedReply);
    } catch (error) {
      toast.error("Failed to generate AI reply. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!reply.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    try {
      await sendReply({ message: reply });
      toast.success("Reply sent successfully!");
      handleClose();
    } catch (error) {
      toast.error("Failed to send reply. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='sm:max-w-[512px]'>
        <DialogHeader>
          <DialogTitle>
            {contact.status === "replied" ? "View Reply" : "Reply to Contact"}
          </DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <div className='grid grid-cols-4 items-center gap-2'>
              <Label
                htmlFor='name'
                className='text-right'
              >
                Name
              </Label>
              <div className='col-span-3'>
                <p
                  id='name'
                  className='text-sm'
                >
                  {contact.name}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-2'>
              <Label
                htmlFor='email'
                className='text-right'
              >
                Email
              </Label>
              <div className='col-span-3'>
                <p
                  id='email'
                  className='text-sm'
                >
                  {contact.email}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-2'>
              <Label
                htmlFor='subject'
                className='text-right'
              >
                Subject
              </Label>
              <div className='col-span-3'>
                <p
                  id='subject'
                  className='text-sm'
                >
                  {contact.subject}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-4 items-start gap-2'>
              <Label
                htmlFor='message'
                className='text-right pt-2'
              >
                Message
              </Label>
              <div className='col-span-3'>
                <p
                  id='message'
                  className='text-sm whitespace-pre-wrap border rounded-md p-2 bg-muted/50'
                >
                  {contact.message}
                </p>
              </div>
            </div>
          </div>

          <div className='grid gap-2'>
            <div className='flex items-center justify-between'>
              <Label
                htmlFor='reply'
                className='text-left'
              >
                Your Reply
              </Label>
              {contact.status !== "replied" && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={generateAIReply}
                  disabled={isGenerating}
                  className='flex items-center gap-1'
                >
                  <Sparkles className='h-3 w-3' />
                  {isGenerating ? "Generating..." : "Generate Reply"}
                </Button>
              )}
            </div>
            <Textarea
              id='reply'
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={8}
              className='resize-none'
              readOnly={contact.status === "replied"}
              placeholder={
                contact.status === "replied"
                  ? "Loading reply..."
                  : "Type your reply here..."
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='secondary'
            onClick={handleClose}
          >
            {contact.status === "replied" ? "Close" : "Cancel"}
          </Button>
          {contact.status !== "replied" && (
            <Button
              type='button'
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "Sending..." : "Send Reply"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
