import { getApartment } from "@/lib/data";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  const apartment = getApartment();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">
          Reach out to the society management office
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Society Office</h2>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  {apartment.address}, {apartment.city} — {apartment.pincode}
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{apartment.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{apartment.email}</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  Mon – Sat: 9:00 AM – 6:00 PM
                  <br />
                  Sunday: 10:00 AM – 1:00 PM
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-primary/5 p-6">
            <h3 className="font-semibold">Emergency Contacts</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Security Desk: +91 80 4567 8901</li>
              <li>Maintenance: +91 80 4567 8902</li>
              <li>Committee President: +91 98450 11111</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-3">
          <h2 className="font-semibold">Send a Message</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo form — submissions are not processed
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
