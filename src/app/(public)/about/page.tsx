import { getApartment } from "@/lib/data";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
} from "lucide-react";

export default function AboutPage() {
  const apartment = getApartment();

  const highlights = [
    {
      icon: Building2,
      label: "Total Towers",
      value: `${apartment.totalBlocks} Blocks`,
    },
    {
      icon: Users,
      label: "Total Flats",
      value: `${apartment.totalFlats} Units`,
    },
    {
      icon: Calendar,
      label: "Established",
      value: `${apartment.yearEstablished}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: `${apartment.city}, ${apartment.state}`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">About Us</h1>
        <p className="mt-2 text-muted-foreground">
          {apartment.name} — {apartment.tagline}
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <item.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Our Community</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {apartment.description}
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Registered under {apartment.registrationNumber}, our society is
            managed by a dedicated committee of resident volunteers committed to
            maintaining the highest standards of community living.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Contact Information</h2>
          <ul className="mt-6 space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  {apartment.address}
                  <br />
                  {apartment.city}, {apartment.state} — {apartment.pincode}
                </p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {apartment.phone}
                </p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {apartment.email}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 rounded-xl border bg-muted/30 p-8">
        <h2 className="text-xl font-semibold">Amenities</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[
            "Clubhouse & Banquet Hall",
            "Swimming Pool",
            "Gymnasium",
            "Children's Play Area",
            "Landscaped Gardens",
            "24/7 Security",
            "Covered Parking",
            "Power Backup (DG)",
            "Rainwater Harvesting",
          ].map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {amenity}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
