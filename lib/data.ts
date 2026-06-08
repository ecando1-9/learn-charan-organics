import type { Course } from "@/lib/types";

export const categories = [
  "Herbal Shampoo",
  "Face Creams",
  "Moisturising Cream",
  "Gel Making",
  "Face Pack",
  "Gold Facial Bath Bombs",
  "Hand Wash",
  "Body Wash",
  "Body Butters",
  "Conditioners",
  "Lotions",
  "Underarm Whitening Lotion/Cream",
  "Hair Serums",
  "Hair Gel",
  "Sleeping Mask",
  "Peel Off Masks",
  "Clay Cleanser",
  "Bath Salts",
  "Lip Mask & Lip Serum",
  "Body Brightening Oil",
  "Goat Milk Body Wash",
  "24K Gold Serum",
  "Foot Butter",
  "Under Eye Healer",
  "Melt & Pour Soaps",
  "Shampoo Bar",
  "Cold Pressed Soaps",
  "Hair Butter",
  "Face Serum",
  "Eye Shadow",
  "Ubtan Bridal Pack",
  "Creamy Eye Shadow",
  "Highlighters",
  "Face & Body Lotion",
  "Herbal Wax Powders",
  "Whipped Cream",
  "Lip Butter",
  "Lip Gloss",
  "Tinted Lip Balms",
  "Lip Scrub",
  "Soap Scrubs",
  "Lotion Bars",
  "Kumkumadhi Thailam",
  "Weight Loss Powder",
  "Lipstick",
  "Facial Glow & Facial Scrub",
  "Face Wash",
  "Toners",
  "Hand Sanitiser",
  "Dark Neck Cream",
  "Baby Care Products",
  "Dry Foaming Powder",
  "Rubber Mask",
  "Tooth Powder",
  "Tooth Paste",
  "Cooling Face Mask",
  "Water Serums",
  "Fragranced Soaps",
  "Foot Soaks",
  "Hair Regrowth Oil",
  "Dandruff & Anti Lice Pack"
];

const baseModules = [
  {
    title: "Foundation",
    lessons: [
      { slug: "welcome", title: "Course orientation and safety", duration: "08:20", preview: true, videoId: "dQw4w9WgXcQ", resources: ["Safety checklist PDF", "Starter equipment list"] },
      { slug: "ingredients", title: "Ingredient sourcing and measurements", duration: "14:10", videoId: "dQw4w9WgXcQ", resources: ["Ingredient sheet", "Batch calculator"] }
    ]
  },
  {
    title: "Manufacturing Lab",
    lessons: [
      { slug: "formulation", title: "Formulation and batch process", duration: "22:40", videoId: "dQw4w9WgXcQ", resources: ["Formula worksheet", "Quality checklist"] },
      { slug: "packaging", title: "Packaging, labeling and storage", duration: "16:25", videoId: "dQw4w9WgXcQ", resources: ["Label template", "Shelf-life notes"] }
    ]
  }
];

const thumbnails = [
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=900&q=85"
];

const courseCatalog = [
  ["Herbal Shampoo", "21 types"],
  ["Face Creams", "8 types"],
  ["Moisturising Cream", "3 types"],
  ["Gel Making", "5 types"],
  ["Face Pack", "8 types"],
  ["Gold Facial Bath Bombs", "8 types"],
  ["Hand Wash", "4 types"],
  ["Body Wash", "6 types"],
  ["Body Butters", "23 types"],
  ["Conditioners", "4 types"],
  ["Lotions", "3 types"],
  ["Underarm Whitening Lotion/Cream", "5 types"],
  ["Hair Serums", "7 types"],
  ["Hair Gel", ""],
  ["Sleeping Mask", ""],
  ["Peel Off Masks", "5 types"],
  ["Clay Cleanser", "5 types"],
  ["Bath Salts", "5 types"],
  ["Lip Mask & Lip Serum", ""],
  ["Body Brightening Oil", ""],
  ["Goat Milk Body Wash", ""],
  ["24K Gold Serum", ""],
  ["Foot Butter", ""],
  ["Under Eye Healer", ""],
  ["Melt & Pour Soaps", "35 types"],
  ["Shampoo Bar", ""],
  ["Cold Pressed Soaps", ""],
  ["Hair Butter", ""],
  ["Face Serum", ""],
  ["Eye Shadow", ""],
  ["Ubtan Bridal Pack", ""],
  ["Creamy Eye Shadow", ""],
  ["Highlighters", "35 types"],
  ["Face & Body Lotion", "42 types"],
  ["Herbal Wax Powders", ""],
  ["Whipped Cream", ""],
  ["Lip Butter", ""],
  ["Lip Gloss", ""],
  ["Tinted Lip Balms", ""],
  ["Lip Scrub", "5 types"],
  ["Soap Scrubs", "5 types"],
  ["Lotion Bars", "4 types"],
  ["Kumkumadhi Thailam", ""],
  ["Weight Loss Powder", ""],
  ["Lipstick", ""],
  ["Facial Glow & Facial Scrub", ""],
  ["Face Wash", "5 types"],
  ["Toners", "10 types"],
  ["Hand Sanitiser", ""],
  ["Dark Neck Cream", ""],
  ["Baby Care Products", "20 products"],
  ["Dry Foaming Powder", "3 types"],
  ["Rubber Mask", ""],
  ["Tooth Powder", ""],
  ["Tooth Paste", ""],
  ["Cooling Face Mask", ""],
  ["Water Serums", "3 types"],
  ["Fragranced Soaps", "20 types"],
  ["Foot Soaks", "3 types"],
  ["Hair Regrowth Oil", ""],
  ["Dandruff & Anti Lice Pack", "10 types"]
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/24k/g, "24k")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function courseDescription(title: string, count: string) {
  const suffix = count ? ` covering ${count}` : "";
  return `Learn practical natural product manufacturing for ${title.toLowerCase()}${suffix}, including ingredient selection, measurements, safety, formulation, packaging and small-batch production workflows.`;
}

export const courses: Course[] = courseCatalog.map(([title, count], index) => ({
  slug: slugify(title),
  title: `${title}${count ? ` - ${count}` : ""}`,
  category: title,
  instructor: index % 4 === 0 ? "Charan Organics Faculty" : index % 4 === 1 ? "Dr. Meera Iyer" : index % 4 === 2 ? "Arun Prakash" : "Nisha Varma",
  rating: Number((4.6 + (index % 4) * 0.1).toFixed(1)),
  students: 840 + index * 57,
  duration: `${3 + (index % 5)}h ${String(10 + (index * 7) % 50).padStart(2, "0")}m`,
  level: index % 7 === 0 ? "Advanced" : index % 3 === 0 ? "Intermediate" : "Beginner",
  language: index % 2 === 0 ? "English + Tamil" : "English + Hindi",
  price: 1499 + (index % 5) * 500,
  thumbnail: thumbnails[index % thumbnails.length],
  description: courseDescription(title, count),
  outcomes: [
    `Prepare ${title.toLowerCase()} formulas with correct measurements`,
    "Understand ingredient purpose, safety and substitutions",
    "Create repeatable small-batch manufacturing records",
    "Package, label and store products for professional selling"
  ],
  materials: ["Digital weighing scale", "Mixing bowls", "Measuring beakers", "Sanitiser", "Product containers", "Formula worksheet"],
  modules: baseModules,
  featured: index < 6,
  trending: index % 8 === 0
}));

export const diplomaCurriculum = {
  title: "Diploma in Herbal Cosmetic Product Making",
  price: "₹10,000",
  totalFormulations: "269+",
  modules: [
    {
      title: "Hair Care Products",
      groups: [
        { title: "Herbal Shampoos", items: ["Neem Shampoo", "Aloe Vera Shampoo", "Cucumber Shampoo", "Fenugreek Shampoo", "Jatamansi Shampoo", "Tulasi Shampoo", "Rosemary Shampoo", "Tea Tree Shampoo", "Onion Shampoo", "Amla Shampoo", "Bhringaraj Shampoo", "Hibiscus Shampoo", "Nagarmotha Shampoo", "Moringa Shampoo", "Soapnut Shampoo", "Shikakai Shampoo", "Lemon Shampoo", "Vetiver Shampoo", "Flaxseed Shampoo", "Herbal Shampoo Variants"] },
        { title: "Conditioners", items: ["Aloe Vera Conditioner", "Tulasi Conditioner", "Neem Conditioner", "Cucumber Conditioner"] },
        { title: "Hair Serums", items: ["Hair Regrowth Serum", "Shiny Hair Serum", "Dry Hair Serum", "Hair Repair Serum", "Hair Loss Control Serum", "Damaged Hair Serum", "Split Ends Serum"] },
        { title: "Hair Oils & Treatments", items: ["Hair Regrowth Oil", "Dandruff Pack", "Anti-Lice Pack", "Hair Butter", "Hair Gel", "Shampoo Bars"] }
      ]
    },
    {
      title: "Face Care Products",
      groups: [
        { title: "Face Creams", items: ["Red Wine", "Sandal", "Saffron", "Manjistha", "Green Tea", "Aloe Vera", "Licorice", "Avocado"] },
        { title: "Face Washes", items: ["Saffron Face Wash", "Aloe Vera Face Wash", "Lemon Face Wash", "Acne Face Wash", "Red Wine Face Wash"] },
        { title: "Face Packs", items: ["Aavarampoo", "Multani Mitti", "Besan", "Kasturi", "Neem", "Tulasi", "Hibiscus", "Rose Petal"] },
        { title: "Face Serums", items: ["Gold Serum", "Face Serum Variants"] },
        { title: "Toners", items: ["Basic Toner", "Anti Acne Toner", "Rose Water Toner", "Vetiver Toner", "Anti-Tan Toner", "Herbal Toner", "Lavender Toner", "Kesar Chandan Toner", "Astringent Toner", "Hydrating Toner"] },
        { title: "Special Face Care", items: ["Sleeping Masks", "Peel Off Masks", "Clay Cleansers", "Cooling Face Mask", "Rubber Mask", "Under Eye Healer", "Dark Neck Cream"] }
      ]
    },
    {
      title: "Soap Making",
      groups: [
        { title: "Melt & Pour Soaps", items: ["Charcoal Soap", "Neem Soap", "Tulasi Soap", "Coconut Milk Soap", "Rose Soap", "Strawberry Soap", "Lemon Soap", "Orange Soap", "Beetroot Soap", "Red Sandal Soap", "Carrot Soap", "Kids Soap", "Saffron Soap", "Aloe Vera Soap", "Pomegranate Soap", "Mint Soap", "Watermelon Soap", "Anti Aging Soap", "Anti Allergy Soap", "Pigmentation Soap", "And More"] },
        { title: "Cold Process Soaps", items: ["Professional Cold Process Soap Making"] },
        { title: "Fragranced Soaps", items: ["20 Premium Soap Variants"] },
        { title: "Soap Scrubs", items: ["5 Premium Soap Scrubs"] }
      ]
    },
    {
      title: "Body Care Products",
      groups: [
        { title: "Body Washes", items: ["Aloe Vera", "Green Tea", "Rose Water", "Goat Milk", "Herbal Variants"] },
        { title: "Body Butters", items: ["Apricot", "Coconut Milk", "Argan", "Onion", "Additional Variants"] },
        { title: "Body Lotions", items: ["Face & Body Lotion", "Whitening Lotion", "Moisturizing Lotion"] },
        { title: "Body Care Products", items: ["Foot Butter", "Bath Salts", "Foot Soaks", "Body Brightening Oil", "Hand Wash", "Hand Sanitizer"] }
      ]
    },
    { title: "Lip Care Products", groups: [{ title: "Lip Formulations", items: ["Lip Balm", "Tinted Lip Balm", "Lip Butter", "Lip Gloss", "Lip Scrub", "Lip Serum", "Pink Lip Sleeping Mask", "Lipstick"] }] },
    { title: "Baby Care Products", groups: [{ title: "Baby Product Range", items: ["Baby Massage Oil", "Baby Luxury Massage Oil", "Baby Lotion", "Baby Soap", "Baby Bath Powder", "Baby Cream", "Baby Shampoo", "Diaper Cream", "Baby Talc", "Baby Wash", "Baby Wipes", "Cleansing Water", "Nipple Cream", "Head To Toe Wash", "Baby Ubtan"] }] },
    { title: "Advanced Beauty Products", groups: [{ title: "Premium Beauty Range", items: ["Kumkumadhi Thailam", "24K Gold Serum", "Bridal Ubtan Pack", "Highlighters", "Eye Shadows", "Creamy Eye Shadows", "Facial Glow Products", "Facial Scrubs", "Underarm Whitening Cream"] }] },
    { title: "Wellness Products", groups: [{ title: "Wellness & Hygiene", items: ["Weight Loss Powder", "Tooth Powder", "Tooth Paste", "Herbal Wax Powder"] }] }
  ],
  benefits: ["269+ Product Formulations", "Beginner Friendly", "Online & Offline Training", "Business Guidance", "Certificate Provided", "Lifetime Support", "Product Manufacturing Knowledge", "Branding & Selling Guidance"]
};

export const testimonials = [
  { name: "Priya S.", role: "Home brand founder", quote: "The soap course gave me formulas, safety confidence and packaging ideas I could use immediately.", avatar: "PS" },
  { name: "Ramesh K.", role: "Retail manufacturer", quote: "The lessons are practical and the PDFs saved many trial batches. My shampoo line is now stable.", avatar: "RK" },
  { name: "Aisha M.", role: "Beauty entrepreneur", quote: "Premium teaching, clear modules and excellent support from the instructor replies.", avatar: "AM" }
];

export const analytics = [
  { month: "Jan", revenue: 0, students: 0, enrollments: 0 },
  { month: "Feb", revenue: 0, students: 0, enrollments: 0 },
  { month: "Mar", revenue: 0, students: 0, enrollments: 0 },
  { month: "Apr", revenue: 0, students: 0, enrollments: 0 },
  { month: "May", revenue: 0, students: 0, enrollments: 0 },
  { month: "Jun", revenue: 0, students: 0, enrollments: 0 }
];
