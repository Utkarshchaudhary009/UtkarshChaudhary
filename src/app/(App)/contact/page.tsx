import { ContactForm } from "@/components/contact-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Me",
  description: "Get in touch with me for any queries or collaboration opportunities.",
};

export default function ContactPage() {
  return (
    <div className="container max-w-xl py-10">
      <h1 className="text-3xl font-bold mb-8">Get in Touch</h1>
      <ContactForm />
    </div>
  );
}
