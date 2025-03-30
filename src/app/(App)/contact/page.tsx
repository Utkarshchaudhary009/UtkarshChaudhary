import { ContactForm } from "@/components/contact-form";
import { Metadata } from "next";


export const metadata: Metadata = {
  title:"Contact Me",
  description: "Get in touch with me for any queries or collaboration opportunities.",
  openGraph: {
    images: [
      {
        url: "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};
export default function ContactPage() {
  return (
    <div className="container max-w-xl py-10 lg:mx-auto">
      <h1 className="text-3xl font-bold mb-8">Get in Touch</h1>
      <ContactForm />
    </div>
  );
}
