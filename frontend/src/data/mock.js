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

export const mockServices = [
  {
    id: "lord-farming",
    name: "Lord Farming",
    description: "Professional lord farming service. We grind the lords so you don't have to. Get maximum rewards with minimal effort.",
    icon: "Crown",
    packages: [
      { id: "lf-basic", name: "Basic", price: 29.99, eta: "24-48 hours", features: ["5 Lords Farmed", "Basic Rewards", "Standard Priority"] },
      { id: "lf-pro", name: "Pro", price: 59.99, eta: "24-48 hours", features: ["15 Lords Farmed", "Premium Rewards", "High Priority", "Priority Support"] },
      { id: "lf-elite", name: "Elite", price: 99.99, eta: "48-72 hours", features: ["30 Lords Farmed", "Maximum Rewards", "Top Priority", "24/7 Support", "Bonus Loot"] }
    ]
  },
  {
    id: "lord-boosting",
    name: "Lord Boosting",
    description: "Dominate the leaderboards with our expert boosters. Achieve your desired rank with guaranteed results.",
    icon: "Zap",
    packages: [
      { id: "lb-bronze", name: "Bronze Tier", price: 49.99, eta: "1-2 days", features: ["Bronze to Silver", "Account Safety", "Progress Updates"] },
      { id: "lb-silver", name: "Silver Tier", price: 89.99, eta: "2-3 days", features: ["Silver to Gold", "Account Safety", "Daily Updates", "VPN Protection"] },
      { id: "lb-gold", name: "Gold Tier", price: 149.99, eta: "3-5 days", features: ["Gold to Diamond", "Premium Safety", "Live Updates", "VPN Protection", "Stream on Request"] }
    ]
  },
  {
    id: "custom-orders",
    name: "Custom Orders",
    description: "Need something specific? Our team handles custom requests tailored to your exact requirements.",
    icon: "Settings",
    packages: [
      { id: "co-basic", name: "Basic Custom", price: 39.99, eta: "Varies", features: ["Custom Task", "Standard Support", "ETA Quote"] },
      { id: "co-premium", name: "Premium Custom", price: 79.99, eta: "Varies", features: ["Complex Tasks", "Priority Support", "Dedicated Booster"] },
      { id: "co-ultimate", name: "Ultimate Custom", price: 149.99, eta: "Varies", features: ["Any Request", "24/7 Support", "Top Booster", "Rush Option"] }
    ]
  }
];

export const mockOrders = [
  {
    id: "order_001",
    userId: "user_123",
    serviceId: "lord-farming",
    packageId: "lf-pro",
    serviceName: "Lord Farming",
    packageName: "Pro",
    status: "in_progress",
    booster: { username: "ProBooster#9999", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" },
    progress: 65,
    price: 59.99,
    eta: "2025-08-20",
    notes: "Currently at 10/15 lords. Great progress!",
    createdAt: "2025-08-15T10:30:00Z"
  },
  {
    id: "order_002",
    userId: "user_123",
    serviceId: "lord-boosting",
    packageId: "lb-silver",
    serviceName: "Lord Boosting",
    packageName: "Silver Tier",
    status: "completed",
    booster: { username: "EliteCarry#1234", avatar: "https://cdn.discordapp.com/embed/avatars/2.png" },
    progress: 100,
    price: 89.99,
    eta: "2025-08-12",
    notes: "Completed ahead of schedule!",
    createdAt: "2025-08-10T14:00:00Z"
  },
  {
    id: "order_003",
    userId: "user_123",
    serviceId: "custom-orders",
    packageId: "co-basic",
    serviceName: "Custom Orders",
    packageName: "Basic Custom",
    status: "pending",
    booster: null,
    progress: 0,
    price: 39.99,
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
    serviceId: "lord-farming",
    packageId: "lf-elite",
    serviceName: "Lord Farming",
    packageName: "Elite",
    status: "in_progress",
    booster: { username: "ProBooster#9999", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" },
    progress: 30,
    price: 99.99,
    eta: "2025-08-22",
    notes: "Started farming session",
    createdAt: "2025-08-17T16:00:00Z"
  },
  {
    id: "order_005",
    userId: "user_789",
    username: "NightOwl#2468",
    serviceId: "lord-boosting",
    packageId: "lb-gold",
    serviceName: "Lord Boosting",
    packageName: "Gold Tier",
    status: "pending",
    booster: null,
    progress: 0,
    price: 149.99,
    eta: "TBD",
    notes: "High priority order",
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
    question: "How does the boosting process work?",
    answer: "Once you purchase a service, our team assigns a verified booster to your order. The booster will complete the service within the estimated time frame. You can track progress in your dashboard."
  },
  {
    question: "Is my account safe?",
    answer: "Absolutely! We use VPN protection, follow strict security protocols, and our boosters are thoroughly vetted. We've completed thousands of orders with zero account issues."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, Apple Pay, and Google Pay through our secure Stripe payment system."
  },
  {
    question: "Can I get a refund?",
    answer: "Yes! If we cannot complete your order or you're unsatisfied with the service, we offer full or partial refunds based on the situation. Contact support via Discord for assistance."
  },
  {
    question: "How do I contact support?",
    answer: "Join our Discord server and open a support ticket. Our team is available 24/7 to help with any questions or issues."
  },
  {
    question: "What are the Discord rules?",
    answer: "Be respectful, no spam, follow instructions from boosters, and keep conversations in appropriate channels. Full rules are pinned in our Discord server."
  }
];

export const mockStats = {
  ordersCompleted: 12500,
  happyCustomers: 8900,
  activeBoosters: 45,
  averageRating: 4.9
};
