/**
 * Generates demo JSON data for Sylvan Shelter Apartment, Hyderabad.
 * Run: node scripts/generate-sylvan-data.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const APT_ID = "apt-sylvan-shelter";
const BLOCK_ID = "block-a";
const MAINTENANCE_RATE = 2;
const AREA_SQFT = 650;
const MONTHLY_MAINTENANCE = 1300;

const FIRST_NAMES_M = [
  "Srinivas", "Venkata", "Ramesh", "Suresh", "Karthik", "Prasad", "Rajesh",
  "Naveen", "Harish", "Gopal", "Anil", "Vijay", "Sandeep", "Ravi", "Mahesh",
  "Chandra", "Sekhar", "Nagesh", "Arun", "Mohan", "Krishna", "Sai", "Raghav",
  "Venkat", "Ashok", "Durga", "Shiva", "Ramana", "Praveen", "Ganesh",
];
const FIRST_NAMES_F = [
  "Lakshmi", "Padma", "Anitha", "Swathi", "Sravani", "Divya", "Keerthi",
  "Sujatha", "Vijaya", "Radha", "Saroja", "Kamala", "Sunitha", "Revathi",
  "Madhavi", "Shailaja", "Uma", "Lalitha", "Geetha", "Priya", "Asha", "Deepa",
];
const LAST_NAMES = [
  "Malyala", "Reddy", "Rao", "Naidu", "Kumar", "Sharma", "Prasad", "Goud",
  "Chowdary", "Murthy", "Iyer", "Varma", "Kiran", "Yadav", "Pillai", "Nair",
  "Acharya", "Bhaskar", "Sastry", "Kota", "Maddela", "Bandaru", "Kandukuri",
];

const TENANT_FIRST = [
  "Rahul", "Amit", "Neha", "Pooja", "Sanjay", "Kavitha", "Manoj", "Deepika",
  "Varun", "Anjali", "Rohit", "Meena", "Aditya", "Shreya", "Vikram",
];
const TENANT_LAST = ["Gupta", "Singh", "Joshi", "Agarwal", "Malhotra", "Kapoor", "Verma", "Das"];

function pick(arr, i) {
  return arr[i % arr.length];
}

function phone(seed) {
  const base = 9000000000 + (seed * 7919) % 999999999;
  return `+91 ${String(base).slice(0, 5)} ${String(base).slice(5)}`;
}

function email(first, last, flatNum) {
  const f = first.toLowerCase().replace(/\s/g, "");
  const l = last.toLowerCase();
  return `${f}.${l}${flatNum}@gmail.com`;
}

function flatId(num) {
  return `flat-${num}`;
}

function generateFlats() {
  const flats = [];
  const numbers = [];
  for (let floor = 1; floor <= 5; floor++) {
    for (let unit = 1; unit <= 11; unit++) {
      numbers.push(floor * 100 + unit);
    }
  }

  const vacantSet = new Set([305, 508]);
  const tenantFlats = new Set([
    104, 108, 203, 207, 210, 302, 306, 310, 404, 408, 411, 503, 507, 511,
  ]);

  numbers.forEach((num, idx) => {
    const floor = Math.floor(num / 100);
    let occupancy = "owner_occupied";
    if (vacantSet.has(num)) occupancy = "vacant";
    else if (tenantFlats.has(num)) occupancy = "tenant_occupied";

    flats.push({
      id: flatId(num),
      apartmentId: APT_ID,
      blockId: BLOCK_ID,
      flatNumber: String(num),
      floor,
      areaSqft: AREA_SQFT,
      bedrooms: 2,
      flatType: "2 BHK",
      parkingSlots: 1,
      occupancyStatus: occupancy,
    });
  });
  return flats;
}

function generateOwnersAndFamily(flats) {
  const owners = [];
  const family = [];
  let ownerIdx = 0;
  let famIdx = 0;

  for (const flat of flats) {
    if (flat.occupancyStatus === "vacant") continue;

    const isSrinivas = flat.flatNumber === "110";
    const firstM = isSrinivas ? "Srinivas" : pick(FIRST_NAMES_M, ownerIdx);
    const lastM = isSrinivas ? "Malyala" : pick(LAST_NAMES, ownerIdx + 3);
    const firstF = pick(FIRST_NAMES_F, ownerIdx + 1);
    const num = flat.flatNumber;

    owners.push({
      id: `owner-${num}`,
      apartmentId: APT_ID,
      flatId: flat.id,
      fullName: `${firstM} ${lastM}`,
      email: isSrinivas ? "srinivas.malyala@gmail.com" : email(firstM, lastM, num),
      phone: isSrinivas ? "+91 96396 33716" : phone(ownerIdx),
      alternatePhone: phone(ownerIdx + 100),
      isPrimary: true,
      ownershipStartDate: `20${14 + (ownerIdx % 8)}-${String((ownerIdx % 12) + 1).padStart(2, "0")}-15`,
    });

    if (flat.occupancyStatus === "owner_occupied") {
      family.push({
        id: `family-${num}-1`,
        apartmentId: APT_ID,
        flatId: flat.id,
        fullName: `${firstF} ${lastM}`,
        relationship: "Spouse",
        phone: phone(ownerIdx + 200),
        dateOfBirth: `198${ownerIdx % 10}-0${(ownerIdx % 9) + 1}-12`,
        marriageAnniversary: `20${10 + (ownerIdx % 10)}-0${(ownerIdx % 9) + 1}-18`,
      });

      if (ownerIdx % 3 === 0) {
        family.push({
          id: `family-${num}-2`,
          apartmentId: APT_ID,
          flatId: flat.id,
          fullName: `${pick(["Aditya", "Ananya", "Rohith", "Sneha", "Karthik"], ownerIdx)} ${lastM}`,
          relationship: ownerIdx % 2 === 0 ? "Son" : "Daughter",
          dateOfBirth: `20${10 + (ownerIdx % 14)}-0${(ownerIdx % 8) + 1}-22`,
        });
      }
      if (ownerIdx % 5 === 0) {
        family.push({
          id: `family-${num}-3`,
          apartmentId: APT_ID,
          flatId: flat.id,
          fullName: `${pick(["Venkataramana", "Lakshmamma", "Subbarao"], ownerIdx)} ${lastM}`,
          relationship: ownerIdx % 2 === 0 ? "Father" : "Mother",
          phone: phone(ownerIdx + 300),
          dateOfBirth: "1958-04-10",
        });
      }
    }
    ownerIdx++;
    famIdx++;
  }
  return { owners, family };
}

function generateTenants(flats) {
  const tenants = [];
  let tIdx = 0;
  for (const flat of flats) {
    if (flat.occupancyStatus !== "tenant_occupied") continue;
    const first = pick(TENANT_FIRST, tIdx);
    const last = pick(TENANT_LAST, tIdx);
    const num = flat.flatNumber;
    tenants.push({
      id: `tenant-${num}`,
      apartmentId: APT_ID,
      flatId: flat.id,
      fullName: `${first} ${last}`,
      email: email(first, last, `t${num}`),
      phone: phone(500 + tIdx),
      leaseStartDate: "2024-06-01",
      leaseEndDate: "2026-05-31",
      isActive: true,
    });
    tIdx++;
  }
  return tenants;
}

function generatePayments(flats) {
  const payments = [];
  const months = [
    { period: "July 2025", due: "2025-07-05" },
    { period: "June 2025", due: "2025-06-05" },
    { period: "May 2025", due: "2025-05-05" },
    { period: "April 2025", due: "2025-04-05" },
    { period: "March 2025", due: "2025-03-05" },
  ];

  let pIdx = 0;
  for (const flat of flats) {
    if (flat.occupancyStatus === "vacant") continue;
    const num = flat.flatNumber;

    months.forEach((m, mi) => {
      let status = "paid";
      if (mi === 0) {
        if (pIdx % 7 === 0) status = "overdue";
        else if (pIdx % 4 === 0) status = "pending";
      } else if (mi === 1 && pIdx % 11 === 0) {
        status = "overdue";
      }

      const pay = {
        id: `pay-${num}-${mi}`,
        apartmentId: APT_ID,
        flatId: flat.id,
        amount: MONTHLY_MAINTENANCE,
        type: "maintenance",
        status,
        dueDate: m.due,
        period: m.period,
      };
      if (status === "paid") {
        pay.paidDate = m.due.replace("-05", "-0" + (2 + (pIdx % 3)));
        pay.receiptNumber = `SSA/2025/${String(mi + 1).padStart(2, "0")}/${num}`;
      }
      payments.push(pay);
    });
    pIdx++;
  }
  return payments;
}

function generateMaintenanceSummary(payments) {
  const june = payments.filter((p) => p.period === "June 2025");
  const collected = june.filter((p) => p.status === "paid").length * MONTHLY_MAINTENANCE;
  const outstanding = payments.filter(
    (p) => p.status === "pending" || p.status === "overdue"
  );
  const totalOutstanding = outstanding.reduce((s, p) => s + p.amount, 0);
  const totalPossible = june.length * MONTHLY_MAINTENANCE;
  const rate = totalPossible ? Math.round((collected / totalPossible) * 1000) / 10 : 0;

  return {
    totalCollected: collected,
    totalOutstanding,
    collectionRate: rate,
    month: "June 2025",
    maintenanceRatePerSqft: MAINTENANCE_RATE,
    flatAreaSqft: AREA_SQFT,
    monthlyMaintenancePerFlat: MONTHLY_MAINTENANCE,
  };
}

const apartment = {
  id: APT_ID,
  name: "Sylvan Shelter Apartment",
  slug: "sylvan-shelter-apartment",
  tagline: "A peaceful community in Dilsukhnagar",
  address: "Maitri Nagar, Dilsukhnagar",
  city: "Hyderabad",
  state: "Telangana",
  pincode: "500060",
  phone: "+91 96396 33716",
  email: "abhinaymalyala15@gmail.com",
  registrationNumber: "TS/APT/2016/8842",
  totalBlocks: 1,
  totalFlats: 55,
  totalFloors: 5,
  yearEstablished: 2016,
  description:
    "Sylvan Shelter Apartment is a well-maintained residential community in Maitri Nagar, Dilsukhnagar, Hyderabad. The society comprises a single block with 5 floors and 55 spacious 2 BHK flats of 650 sq.ft each, with dedicated parking for every unit. The Residents Welfare Association actively manages maintenance, security, and community events for all families.",
};

const blocks = [
  {
    id: BLOCK_ID,
    apartmentId: APT_ID,
    name: "Block A",
    code: "A",
    floorCount: 5,
    totalFlats: 55,
    description: "Main residential block — 11 flats per floor across 5 floors.",
  },
];

const flats = generateFlats();
const { owners, family } = generateOwnersAndFamily(flats);
const tenants = generateTenants(flats);
const payments = generatePayments(flats);
const maintenanceSummary = generateMaintenanceSummary(payments);

const residents = [
  {
    id: "resident-srinivas",
    apartmentId: APT_ID,
    flatId: flatId(110),
    fullName: "Srinivas Malyala",
    email: "srinivas.malyala@gmail.com",
    phone: "+91 96396 33716",
    role: "resident",
  },
];

const demoUsers = {
  resident: {
    id: "resident-srinivas",
    fullName: "Srinivas Malyala",
    email: "srinivas.malyala@gmail.com",
    phone: "+91 96396 33716",
    role: "resident",
    flatId: flatId(110),
    flatNumber: "110",
  },
  inspector: {
    id: "user-inspector",
    fullName: "Apartment Inspector",
    email: "inspector@sylvanshelter.in",
    phone: "+91 96396 33717",
    role: "inspector",
  },
  admin: {
    id: "user-admin",
    fullName: "Apartment Administrator",
    email: "abhinaymalyala15@gmail.com",
    phone: "+91 96396 33716",
    role: "admin",
  },
  platform: {
    id: "user-super-admin",
    fullName: "Platform Super Admin",
    email: "admin@apartmenterp.in",
    phone: "+91 98765 43210",
    role: "super_admin",
  },
};

const notices = [
  {
    id: "notice-001",
    apartmentId: APT_ID,
    title: "Water Tank Cleaning — 12th July 2025",
    content:
      "Overhead and underground water tanks will be cleaned on Saturday, 12th July 2025 from 9:00 AM to 3:00 PM. Water supply will be interrupted during this period. Residents are requested to store sufficient water in advance.",
    category: "maintenance",
    publishedAt: "2025-07-01",
    priority: "high",
  },
  {
    id: "notice-002",
    apartmentId: APT_ID,
    title: "Lift Preventive Maintenance — Block A",
    content:
      "Otis service engineers will carry out quarterly lift maintenance on 15th July 2025. Lifts may be temporarily unavailable between 10:00 AM and 2:00 PM. Please use stairs if required.",
    category: "maintenance",
    publishedAt: "2025-06-28",
    priority: "medium",
  },
  {
    id: "notice-003",
    apartmentId: APT_ID,
    title: "Monthly Association Meeting — 20th July",
    content:
      "The monthly RWA meeting will be held on Sunday, 20th July 2025 at 10:00 AM in the Community Hall. Agenda includes maintenance budget review, parking rules, and festival planning. All owners are requested to attend.",
    category: "general",
    publishedAt: "2025-06-25",
    priority: "high",
  },
  {
    id: "notice-004",
    apartmentId: APT_ID,
    title: "Independence Day Flag Hoisting",
    content:
      "Join us for flag hoisting and cultural programs on 15th August 2025 at 8:00 AM near the main entrance. Children are encouraged to participate in the fancy dress competition.",
    category: "event",
    publishedAt: "2025-06-20",
    priority: "low",
  },
  {
    id: "notice-005",
    apartmentId: APT_ID,
    title: "Scheduled Power Shutdown — 8th July",
    content:
      "TSSPDCL has informed a planned power shutdown on 8th July 2025 from 10:00 AM to 4:00 PM for feeder maintenance in Dilsukhnagar. DG backup will be available for lifts and common areas.",
    category: "emergency",
    publishedAt: "2025-07-02",
    priority: "high",
  },
  {
    id: "notice-006",
    apartmentId: APT_ID,
    title: "Fire Safety Inspection",
    content:
      "Annual fire safety inspection by the Fire Department is scheduled for 18th July 2025. Please ensure fire exits are clear and extinguishers are accessible. Cooperation of all residents is essential.",
    category: "maintenance",
    publishedAt: "2025-06-22",
    priority: "medium",
  },
  {
    id: "notice-007",
    apartmentId: APT_ID,
    title: "Parking Rules — Reminder",
    content:
      "Residents are reminded that each flat is allotted one covered parking slot. Visitor vehicles must park in designated visitor bays only. Two-wheelers should be parked in the marked zones. Violators may be fined as per RWA bylaws.",
    category: "general",
    publishedAt: "2025-06-15",
    priority: "medium",
  },
  {
    id: "notice-008",
    apartmentId: APT_ID,
    title: "Waste Segregation Awareness",
    content:
      "Please segregate wet and dry waste before handing over to the collection staff. Dry waste collection: Tuesday & Friday. Wet waste: daily 7:00–9:00 AM. Let us keep Sylvan Shelter clean and environmentally responsible.",
    category: "general",
    publishedAt: "2025-06-10",
    priority: "low",
  },
];

const services = [
  {
    id: "svc-001",
    apartmentId: APT_ID,
    title: "Lift Maintenance",
    description: "Quarterly preventive maintenance for both lifts in Block A",
    serviceType: "Lift Maintenance",
    scheduledDate: "2025-07-15",
    scheduledTime: "10:00 AM - 2:00 PM",
    vendor: "Otis Elevator Company",
    status: "scheduled",
    lastServiceDate: "2025-04-12",
    nextDueDate: "2025-07-15",
    frequency: "Quarterly",
  },
  {
    id: "svc-002",
    apartmentId: APT_ID,
    title: "Water Tank Cleaning",
    description: "Cleaning and chlorination of overhead tanks",
    serviceType: "Plumbing",
    scheduledDate: "2025-07-12",
    scheduledTime: "9:00 AM - 3:00 PM",
    vendor: "AquaPure Services",
    status: "scheduled",
    lastServiceDate: "2025-04-10",
    nextDueDate: "2025-07-12",
    frequency: "Quarterly",
  },
  {
    id: "svc-003",
    apartmentId: APT_ID,
    title: "DG Set Service",
    description: "Monthly generator load test and oil check",
    serviceType: "Electrical",
    scheduledDate: "2025-07-08",
    scheduledTime: "11:00 AM - 12:30 PM",
    vendor: "PowerGen Hyderabad",
    status: "scheduled",
    lastServiceDate: "2025-06-08",
    nextDueDate: "2025-07-08",
    frequency: "Monthly",
  },
  {
    id: "svc-004",
    apartmentId: APT_ID,
    title: "Fire Safety Inspection",
    description: "Annual fire equipment audit and hydrant check",
    serviceType: "Fire Safety",
    scheduledDate: "2025-07-18",
    scheduledTime: "9:00 AM - 1:00 PM",
    vendor: "SafeFire Solutions",
    status: "scheduled",
    lastServiceDate: "2024-07-20",
    nextDueDate: "2025-07-18",
    frequency: "Annual",
  },
  {
    id: "svc-005",
    apartmentId: APT_ID,
    title: "Pest Control",
    description: "Society-wide pest control for common areas and ducts",
    serviceType: "Pest Control",
    scheduledDate: "2025-07-22",
    scheduledTime: "10:00 AM - 4:00 PM",
    vendor: "Hyderabad Pest Care",
    status: "scheduled",
    lastServiceDate: "2025-04-22",
    nextDueDate: "2025-07-22",
    frequency: "Quarterly",
  },
  {
    id: "svc-006",
    apartmentId: APT_ID,
    title: "Garden Maintenance",
    description: "Landscaping, pruning, and fertilization of garden areas",
    serviceType: "Landscaping",
    scheduledDate: "2025-07-05",
    scheduledTime: "6:00 AM - 10:00 AM",
    vendor: "GreenScape Hyderabad",
    status: "scheduled",
    lastServiceDate: "2025-06-05",
    nextDueDate: "2025-07-05",
    frequency: "Monthly",
  },
  {
    id: "svc-007",
    apartmentId: APT_ID,
    title: "Electrical Inspection",
    description: "Common area electrical panel and wiring safety audit",
    serviceType: "Electrical",
    scheduledDate: "2025-08-02",
    scheduledTime: "9:00 AM - 12:00 PM",
    vendor: "VoltCheck Engineers",
    status: "scheduled",
    lastServiceDate: "2025-02-02",
    nextDueDate: "2025-08-02",
    frequency: "Bi-annual",
  },
  {
    id: "svc-008",
    apartmentId: APT_ID,
    flatId: flatId(110),
    title: "Flat Pest Control",
    description: "Quarterly pest control for Flat 110",
    serviceType: "Pest Control",
    scheduledDate: "2025-07-10",
    scheduledTime: "10:00 AM - 12:00 PM",
    vendor: "Hyderabad Pest Care",
    status: "scheduled",
    lastServiceDate: "2025-04-10",
    nextDueDate: "2025-07-10",
    frequency: "Quarterly",
  },
];

const gallery = [
  { id: "gal-001", apartmentId: APT_ID, title: "Block A — Front Elevation", category: "Apartment Building", imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80", caption: "Sylvan Shelter Apartment main block, Maitri Nagar" },
  { id: "gal-002", apartmentId: APT_ID, title: "Main Entrance & Security", category: "Entrance", imageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80", caption: "Gated entrance with 24/7 security desk" },
  { id: "gal-003", apartmentId: APT_ID, title: "Covered Parking", category: "Parking", imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854f66?w=800&q=80", caption: "Dedicated parking slot for every flat" },
  { id: "gal-004", apartmentId: APT_ID, title: "Central Garden", category: "Garden", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", caption: "Well-maintained landscaped garden" },
  { id: "gal-005", apartmentId: APT_ID, title: "Children's Play Area", category: "Children's Play Area", imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", caption: "Safe play zone for children" },
  { id: "gal-006", apartmentId: APT_ID, title: "Community Hall", category: "Community Hall", imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", caption: "Community hall for meetings and events" },
  { id: "gal-007", apartmentId: APT_ID, title: "Ugadi Celebration 2025", category: "Festival Celebrations", imageUrl: "https://images.unsplash.com/photo-1605276374101-dee6cdf5dca5?w=800&q=80", caption: "Ugadi festival celebration in the community hall" },
  { id: "gal-008", apartmentId: APT_ID, title: "Diwali Lighting 2024", category: "Festival Celebrations", imageUrl: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc36?w=800&q=80", caption: "Festival lighting at the apartment entrance" },
];

function write(name, data) {
  const path = join(DATA_DIR, name);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`Wrote ${name} (${Array.isArray(data) ? data.length + " records" : "ok"})`);
}

write("apartment.json", apartment);
write("blocks.json", blocks);
write("flats.json", flats);
write("owners.json", owners);
write("tenants.json", tenants);
write("family-members.json", family);
write("residents.json", residents);
write("demo-users.json", demoUsers);
write("payments.json", payments);
write("maintenance-summary.json", maintenanceSummary);
write("notices.json", notices);
write("services.json", services);
write("gallery.json", gallery);

const occ = flats.reduce(
  (a, f) => {
    a[f.occupancyStatus]++;
    return a;
  },
  { owner_occupied: 0, tenant_occupied: 0, vacant: 0 }
);
console.log("\nOccupancy:", occ);
console.log("Owners:", owners.length, "Tenants:", tenants.length, "Family:", family.length);
console.log("Payments:", payments.length);
