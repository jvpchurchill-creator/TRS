// Mock data for The Rival Syndicate

export const mockUser = {
  id: "user_123",
  discordId: "123456789012345678",
  username: "ElitePlayer",
  discriminator: "1234",
  avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
  role: "client", // "admin", "booster", "client"
  createdAt: new Date().toISOString()
};

// Discord Server Info
export const discordServer = {
  id: "1389850246439370802",
  name: "The Rival Syndicate",
  icon: "https://customer-assets.emergentagent.com/job_rival-syndicate/artifacts/9k8acf1z_image.png",
  inviteUrl: "https://discord.gg/J23sv388bT",
  ticketCategoryId: "1424027970162528288",
  vouchesChannelId: "1451590556051312650"
};

// Site Logo
export const siteLogo = "https://customer-assets.emergentagent.com/job_rival-syndicate/artifacts/9k8acf1z_image.png";

// Base URL for character icons
const ICON_BASE = "https://rivalskins.com/wp-content/uploads/marvel-assets/assets/lord-icons/";

// Service Types
export const serviceTypes = [
  { id: "priority-farm", name: "Priority Farm", description: "We host the farm, you do the work", priceModifier: 0 },
  { id: "lord-boosting", name: "Lord Boosting", description: "We do the farm for you", priceModifier: 10 }
];

// Character Classes
export const characterClasses = [
  { id: "duelist", name: "Duelist", icon: "Sword", color: "#FF6B6B" },
  { id: "vanguard", name: "Vanguard", icon: "Shield", color: "#4ECDC4" },
  { id: "strategist", name: "Strategist", icon: "Brain", color: "#A78BFA" }
];

// All Characters with base prices and icons
export const characters = {
  duelist: [
    { id: "hela", name: "Hela", basePrice: 25, icon: `${ICON_BASE}Hela%20Deluxe%20Avatar.png` },
    { id: "hawkeye", name: "Hawkeye", basePrice: 25, icon: `${ICON_BASE}Hawkeye%20Deluxe%20Avatar.png` },
    { id: "iron-fist", name: "Iron Fist", basePrice: 30, icon: `${ICON_BASE}Iron%20Fist%20Deluxe%20Avatar.png` },
    { id: "magik", name: "Magik", basePrice: 25, icon: `${ICON_BASE}Magik%20Deluxe%20Avatar.png` },
    { id: "mr-fantastic", name: "Mr. Fantastic", basePrice: 40, icon: `${ICON_BASE}Mister%20Fantastic%20Deluxe%20Avatar.png` },
    { id: "black-panther", name: "Black Panther", basePrice: 20, icon: `${ICON_BASE}Black%20Panther%20Deluxe%20Avatar.png` },
    { id: "blade", name: "Blade", basePrice: 25, icon: `${ICON_BASE}Blade%20Deluxe%20Avatar.png` },
    { id: "black-widow", name: "Black Widow", basePrice: 20, icon: `${ICON_BASE}Black%20Widow%20Deluxe%20Avatar.png` },
    { id: "daredevil", name: "Daredevil", basePrice: 30, icon: `${ICON_BASE}Daredevil%20Deluxe%20Avatar.png` },
    { id: "human-torch", name: "Human Torch", basePrice: 20, icon: `${ICON_BASE}Human%20Torch%20Deluxe%20Avatar.png` },
    { id: "iron-man", name: "Iron Man", basePrice: 20, icon: `${ICON_BASE}Iron%20Man%20Deluxe%20Avatar.png` },
    { id: "moon-knight", name: "Moon Knight", basePrice: 20, icon: `${ICON_BASE}Moon%20Knight%20Deluxe%20Avatar.png` },
    { id: "namor", name: "Namor", basePrice: 20, icon: `${ICON_BASE}Namor%20Deluxe%20Avatar.png` },
    { id: "phoenix", name: "Phoenix", basePrice: 20, icon: `${ICON_BASE}Phoenix%20Deluxe%20Avatar.png` },
    { id: "spider-man", name: "Spider-Man", basePrice: 25, icon: `${ICON_BASE}Spider-Man%20Deluxe%20Avatar.png` },
    { id: "psylocke", name: "Psylocke", basePrice: 25, icon: `${ICON_BASE}Psylocke%20Deluxe%20Avatar.png` },
    { id: "scarlet-witch", name: "Scarlet Witch", basePrice: 20, icon: `${ICON_BASE}Scarlet%20Witch%20Deluxe%20Avatar.png` },
    { id: "squirrel-girl", name: "Squirrel Girl", basePrice: 20, icon: `${ICON_BASE}Squirrel%20Girl%20Deluxe%20Avatar.png` },
    { id: "star-lord", name: "Star-Lord", basePrice: 30, icon: `${ICON_BASE}Star-Lord%20Deluxe%20Avatar.png` },
    { id: "storm", name: "Storm", basePrice: 25, icon: `${ICON_BASE}Storm%20Deluxe%20Avatar.png` },
    { id: "punisher", name: "Punisher", basePrice: 20, icon: `${ICON_BASE}The%20Punisher%20Deluxe%20Avatar.png` },
    { id: "winter-soldier", name: "Winter Soldier", basePrice: 20, icon: `${ICON_BASE}Winter%20Soldier%20Deluxe%20Avatar.png` },
    { id: "wolverine", name: "Wolverine", basePrice: 20, icon: `${ICON_BASE}Wolverine%20Deluxe%20Avatar.png` }
  ],
  vanguard: [
    { id: "thor", name: "Thor", basePrice: 40, icon: `${ICON_BASE}Thor%20Deluxe%20Avatar.png` },
    { id: "venom", name: "Venom", basePrice: 40, icon: `${ICON_BASE}Venom%20Deluxe%20Avatar.png` },
    { id: "dr-strange", name: "Dr. Strange", basePrice: 40, icon: `${ICON_BASE}Doctor%20Strange%20Deluxe%20Avatar.png` },
    { id: "angela", name: "Angela", basePrice: 25, icon: `${ICON_BASE}Angela%20Deluxe%20Avatar.png` },
    { id: "thing", name: "Thing", basePrice: 25, icon: `${ICON_BASE}The%20Thing%20Deluxe%20Avatar.png` },
    { id: "hulk", name: "Hulk", basePrice: 25, icon: `${ICON_BASE}Hero%20Hulk%20Deluxe%20Avatar.png` },
    { id: "groot", name: "Groot", basePrice: 40, icon: `${ICON_BASE}Groot%20Deluxe%20Avatar.png` },
    { id: "emma-frost", name: "Emma Frost", basePrice: 25, icon: `${ICON_BASE}Emma%20Frost%20Deluxe%20Avatar.png` },
    { id: "peni-parker", name: "Peni Parker", basePrice: 25, icon: `${ICON_BASE}Peni%20Parker%20Deluxe%20Avatar.png` },
    { id: "captain-america", name: "Captain America", basePrice: 30, icon: `${ICON_BASE}Captain%20America%20Deluxe%20Avatar.png` },
    { id: "magneto", name: "Magneto", basePrice: 40, icon: `${ICON_BASE}Magneto%20Deluxe%20Avatar.png` },
    { id: "rogue", name: "Rogue", basePrice: 25, icon: null }
  ],
  strategist: [
    { id: "adam-warlock", name: "Adam Warlock", basePrice: 40, icon: `${ICON_BASE}Adam%20Warlock%20Deluxe%20Avatar.png` },
    { id: "cloak-dagger", name: "Cloak & Dagger", basePrice: 25, icon: `${ICON_BASE}Cloak%20&%20Dagger%20Deluxe%20Avatar.png` },
    { id: "invisible-woman", name: "Invisible Woman", basePrice: 25, icon: `${ICON_BASE}Invisible%20Woman%20Deluxe%20Avatar.png` },
    { id: "jeff", name: "Jeff", basePrice: 25, icon: `${ICON_BASE}Jeff%20the%20Land%20Shark%20Deluxe%20Avatar.png` },
    { id: "loki", name: "Loki", basePrice: 30, icon: `${ICON_BASE}Loki%20Deluxe%20Avatar.png` },
    { id: "luna-snow", name: "Luna Snow", basePrice: 25, icon: `${ICON_BASE}Luna%20Snow%20Deluxe%20Avatar.png` },
    { id: "mantis", name: "Mantis", basePrice: 40, icon: `${ICON_BASE}Mantis%20Deluxe%20Avatar.png` },
    { id: "rocket", name: "Rocket", basePrice: 20, icon: `${ICON_BASE}Rocket%20Raccoon%20Deluxe%20Avatar.png` },
    { id: "ultron", name: "Ultron", basePrice: 40, icon: `${ICON_BASE}Ultron%20Deluxe%20Avatar.png` },
    { id: "gambit", name: "Gambit", basePrice: 40, icon: `${ICON_BASE}Gambit%20Deluxe%20Avatar.png` }
  ]
};

// Payment methods
export const paymentMethods = [
  { id: "paypal", name: "PayPal", url: "https://paypal.me/mariosharpe", icon: "CreditCard" },
  { id: "cashapp", name: "Cash App", url: "https://cash.app/$mariosharpe711", icon: "DollarSign" },
  { id: "venmo", name: "Venmo", url: "https://venmo.com/u/msharpe711", icon: "Wallet" }
];

// Legacy mock services for backward compatibility
export const mockServices = [
  {
    id: "priority-farm",
    name: "Priority Farm",
    description: "We host a farm for you where you do the work. Choose your character and get started!",
    icon: "Crown",
    packages: [
      { id: "pf-basic", name: "Single Character", price: 20, eta: "Access granted within 1 hour", features: ["1 Character Farm Slot", "Full Farm Access", "Discord Support"] },
      { id: "pf-pro", name: "Three Characters", price: 55, eta: "Access granted within 1 hour", features: ["3 Character Farm Slots", "Priority Access", "Discord Support", "15% Discount"] },
      { id: "pf-elite", name: "Five Characters", price: 85, eta: "Access granted within 1 hour", features: ["5 Character Farm Slots", "VIP Access", "24/7 Support", "25% Discount"] }
    ]
  },
  {
    id: "lord-boosting",
    name: "Lord Boosting",
    description: "We do the farm for you! Sit back and relax while our expert boosters handle everything.",
    icon: "Zap",
    packages: [
      { id: "lb-basic", name: "Single Character", price: 30, eta: "24-48 hours", features: ["1 Character Boosted", "Progress Updates", "100% Safe"] },
      { id: "lb-pro", name: "Three Characters", price: 80, eta: "2-4 days", features: ["3 Characters Boosted", "Daily Updates", "Priority Queue", "10% Discount"] },
      { id: "lb-elite", name: "Five Characters", price: 125, eta: "4-7 days", features: ["5 Characters Boosted", "Live Updates", "Top Booster", "20% Discount"] }
    ]
  }
];

export const mockOrders = [
  {
    id: "order_001",
    userId: "user_123",
    serviceType: "lord-boosting",
    character: "Spider-Man",
    characterClass: "duelist",
    characterIcon: `${ICON_BASE}Spider-Man%20Deluxe%20Avatar.png`,
    status: "in_progress",
    booster: { username: "ProBooster#9999", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" },
    progress: 65,
    price: 35,
    eta: "2025-08-20",
    notes: "Currently at 65% completion. Great progress!",
    createdAt: "2025-08-15T10:30:00Z"
  },
  {
    id: "order_002",
    userId: "user_123",
    serviceType: "priority-farm",
    character: "Thor",
    characterClass: "vanguard",
    characterIcon: `${ICON_BASE}Thor%20Deluxe%20Avatar.png`,
    status: "completed",
    booster: null,
    progress: 100,
    price: 40,
    eta: "2025-08-12",
    notes: "Farm access granted - completed!",
    createdAt: "2025-08-10T14:00:00Z"
  },
  {
    id: "order_003",
    userId: "user_123",
    serviceType: "lord-boosting",
    character: "Loki",
    characterClass: "strategist",
    characterIcon: `${ICON_BASE}Loki%20Deluxe%20Avatar.png`,
    status: "pending",
    booster: null,
    progress: 0,
    price: 40,
    eta: "TBD",
    notes: "Awaiting booster assignment",
    createdAt: "2025-08-18T09:00:00Z"
  }
];

export const mockAdminOrders = [
  ...mockOrders,
  {
    id: "order_004",
    userId: "user_456",
    username: "GamerX#5678",
    serviceType: "lord-boosting",
    character: "Magneto",
    characterClass: "vanguard",
    characterIcon: `${ICON_BASE}Magneto%20Deluxe%20Avatar.png`,
    status: "in_progress",
    booster: { username: "ProBooster#9999", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" },
    progress: 30,
    price: 50,
    eta: "2025-08-22",
    notes: "Started boosting session",
    createdAt: "2025-08-17T16:00:00Z"
  },
  {
    id: "order_005",
    userId: "user_789",
    username: "NightOwl#2468",
    serviceType: "priority-farm",
    character: "Wolverine",
    characterClass: "duelist",
    characterIcon: `${ICON_BASE}Wolverine%20Deluxe%20Avatar.png`,
    status: "pending",
    booster: null,
    progress: 0,
    price: 20,
    eta: "TBD",
    notes: "Awaiting farm setup",
    createdAt: "2025-08-18T11:00:00Z"
  }
];

export const mockBoosters = [
  { id: "booster_1", username: "ProBooster#9999", avatar: "https://cdn.discordapp.com/embed/avatars/1.png", ordersCompleted: 156, rating: 4.9 },
  { id: "booster_2", username: "EliteCarry#1234", avatar: "https://cdn.discordapp.com/embed/avatars/2.png", ordersCompleted: 243, rating: 4.95 },
  { id: "booster_3", username: "SpeedRun#5555", avatar: "https://cdn.discordapp.com/embed/avatars/3.png", ordersCompleted: 89, rating: 4.8 }
];

export const mockFAQs = [
  {
    question: "What is Priority Farm?",
    answer: "Priority Farm is where we host a farm for you, but you do the work yourself. You get access to our optimized farming setup at the base price for each character."
  },
  {
    question: "What is Lord Boosting?",
    answer: "Lord Boosting is our premium service where we do the farm for you. Our expert boosters handle everything while you relax. This service costs an additional $10 on top of the base character price."
  },
  {
    question: "Is my account safe?",
    answer: "Absolutely! We use VPN protection, follow strict security protocols, and our boosters are thoroughly vetted. We've completed thousands of orders with zero account issues."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept PayPal (paypal.me/mariosharpe), Cash App ($mariosharpe711), and Venmo (@msharpe711). After selecting your service, click the payment method to complete your purchase."
  },
  {
    question: "How long does Lord Boosting take?",
    answer: "Most single character boosts are completed within 24-48 hours. Exact times depend on the character complexity and current queue. You'll receive progress updates throughout."
  },
  {
    question: "Can I get a refund?",
    answer: "Yes! If we cannot complete your order or you're unsatisfied with the service, we offer full or partial refunds based on the situation. Contact support via Discord for assistance."
  },
  {
    question: "How do I contact support?",
    answer: "Join our Discord server and open a support ticket. Our team is available 24/7 to help with any questions or issues."
  }
];

export const mockStats = {
  ordersCompleted: 12500,
  happyCustomers: 8900,
  activeBoosters: 45,
  averageRating: 4.9
};
