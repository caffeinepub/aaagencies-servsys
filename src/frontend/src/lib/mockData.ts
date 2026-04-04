// MOCK DATA - Phase 3/4 will replace with real API calls

export type MockOrg = {
  id: string;
  name: string;
  description: string;
  planTier: string;
  primaryLanguage: string;
  supportedLanguages: string[];
  isActive: boolean;
  createdAt: string;
  memberCount: number;
};

export type MockUser = {
  id: string;
  principal: string;
  displayName: string;
  email: string;
  role: string;
  orgId: string;
  orgName: string;
  branchId?: string;
  isActive: boolean;
  lastLoginAt: string;
  preferredLanguage: string;
};

export type MockWallet = {
  id: string;
  name: string;
  accountType: string;
  orgId: string;
  currency: string;
  balanceUSD: number;
  balanceFrac: number;
  isActive: boolean;
};

export type MockAgent = {
  id: string;
  orgId: string;
  name: string;
  description: string;
  capabilities: string[];
  supportedLanguages: string[];
  status: "active" | "inactive" | "training";
  modelType: string;
};

export type MockTask = {
  id: string;
  orgId: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignedAgentId?: string;
  assignedAgentName?: string;
  language: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type MockTransaction = {
  id: string;
  walletId: string;
  txType: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  createdAt: string;
};

export const MOCK_ORGS: MockOrg[] = [
  {
    id: "org-001",
    name: "TechVentures Global",
    description: "Enterprise AI solutions for Fortune 500 clients worldwide",
    planTier: "enterprise",
    primaryLanguage: "en",
    supportedLanguages: ["en", "es", "zh", "fr"],
    isActive: true,
    createdAt: "2025-11-15",
    memberCount: 47,
  },
  {
    id: "org-002",
    name: "EduAI Partners",
    description: "AI-powered educational tools and services",
    planTier: "professional",
    primaryLanguage: "en",
    supportedLanguages: ["en", "es", "pt"],
    isActive: true,
    createdAt: "2025-12-03",
    memberCount: 18,
  },
  {
    id: "org-003",
    name: "Nexus Dynamics",
    description: "Emerging markets AI deployment and consulting",
    planTier: "starter",
    primaryLanguage: "en",
    supportedLanguages: ["en", "sw", "ar"],
    isActive: true,
    createdAt: "2026-01-20",
    memberCount: 8,
  },
  {
    id: "org-004",
    name: "LaunchPad AI",
    description: "Startup accelerator leveraging AI services",
    planTier: "free",
    primaryLanguage: "en",
    supportedLanguages: ["en"],
    isActive: false,
    createdAt: "2026-02-10",
    memberCount: 3,
  },
];

export const MOCK_USERS: MockUser[] = [
  {
    id: "u-001",
    principal: "2vxsx-fae",
    displayName: "Alex Rivera",
    email: "alex@aaagencies.ai",
    role: "super_admin",
    orgId: "",
    orgName: "AAAgencies Platform",
    isActive: true,
    lastLoginAt: "2026-04-04",
    preferredLanguage: "en",
  },
  {
    id: "u-002",
    principal: "rrkah-fqaaa",
    displayName: "Priya Nair",
    email: "priya@techventures.io",
    role: "org_admin",
    orgId: "org-001",
    orgName: "TechVentures Global",
    isActive: true,
    lastLoginAt: "2026-04-03",
    preferredLanguage: "en",
  },
  {
    id: "u-003",
    principal: "ryjl3-tyaaa",
    displayName: "Carlos Mendez",
    email: "carlos@eduai.org",
    role: "org_admin",
    orgId: "org-002",
    orgName: "EduAI Partners",
    isActive: true,
    lastLoginAt: "2026-04-02",
    preferredLanguage: "es",
  },
  {
    id: "u-004",
    principal: "aaaaa-aa",
    displayName: "Amara Okonkwo",
    email: "amara@nexus.io",
    role: "team_member",
    orgId: "org-001",
    orgName: "TechVentures Global",
    branchId: "branch-001",
    isActive: true,
    lastLoginAt: "2026-04-04",
    preferredLanguage: "en",
  },
  {
    id: "u-005",
    principal: "bbbbb-bb",
    displayName: "Lena Fischer",
    email: "lena@techventures.io",
    role: "team_member",
    orgId: "org-001",
    orgName: "TechVentures Global",
    isActive: true,
    lastLoginAt: "2026-04-01",
    preferredLanguage: "fr",
  },
  {
    id: "u-006",
    principal: "ccccc-cc",
    displayName: "James Woo",
    email: "james.woo@client.com",
    role: "end_customer",
    orgId: "org-001",
    orgName: "TechVentures Global",
    isActive: true,
    lastLoginAt: "2026-04-03",
    preferredLanguage: "zh",
  },
  {
    id: "u-007",
    principal: "ddddd-dd",
    displayName: "Sofia Torres",
    email: "sofia@startup.co",
    role: "end_customer",
    orgId: "org-002",
    orgName: "EduAI Partners",
    isActive: true,
    lastLoginAt: "2026-03-30",
    preferredLanguage: "es",
  },
  {
    id: "u-008",
    principal: "eeeee-ee",
    displayName: "Kwame Asante",
    email: "kwame@nexus.io",
    role: "team_member",
    orgId: "org-003",
    orgName: "Nexus Dynamics",
    isActive: true,
    lastLoginAt: "2026-04-02",
    preferredLanguage: "sw",
  },
];

export const MOCK_WALLETS: MockWallet[] = [
  {
    id: "wal-001",
    name: "TechVentures Treasury",
    accountType: "org_treasury",
    orgId: "org-001",
    currency: "USD",
    balanceUSD: 284750.0,
    balanceFrac: 0.345,
    isActive: true,
  },
  {
    id: "wal-002",
    name: "NYC Branch Fund",
    accountType: "branch_fund",
    orgId: "org-001",
    currency: "USD",
    balanceUSD: 42300.0,
    balanceFrac: 0.0523,
    isActive: true,
  },
  {
    id: "wal-003",
    name: "My Member Wallet",
    accountType: "member_wallet",
    orgId: "org-001",
    currency: "USD",
    balanceUSD: 1850.75,
    balanceFrac: 0.0023,
    isActive: true,
  },
  {
    id: "wal-004",
    name: "Vendor Expansion Account",
    accountType: "vendor_account",
    orgId: "org-001",
    currency: "USD",
    balanceUSD: 15000.0,
    balanceFrac: 0.0185,
    isActive: true,
  },
];

export const MOCK_AGENTS: MockAgent[] = [
  {
    id: "agent-001",
    orgId: "org-001",
    name: "AlphaAssist",
    description:
      "General-purpose customer service agent with multi-lingual support",
    capabilities: [
      "customer-service",
      "faq-answering",
      "ticket-routing",
      "escalation",
    ],
    supportedLanguages: ["en", "es", "fr", "zh"],
    status: "active",
    modelType: "GPT-4 Vision",
  },
  {
    id: "agent-002",
    orgId: "org-001",
    name: "DataDig Pro",
    description: "Specialized data analysis and reporting agent",
    capabilities: [
      "data-analysis",
      "report-generation",
      "trend-detection",
      "visualization",
    ],
    supportedLanguages: ["en"],
    status: "active",
    modelType: "Claude 3.5",
  },
  {
    id: "agent-003",
    orgId: "org-002",
    name: "EduBot Scholar",
    description: "Educational content delivery and tutoring agent",
    capabilities: [
      "tutoring",
      "content-creation",
      "quiz-generation",
      "progress-tracking",
    ],
    supportedLanguages: ["en", "es", "pt"],
    status: "training",
    modelType: "Gemini Pro",
  },
];

export const MOCK_TASKS: MockTask[] = [
  {
    id: "task-001",
    orgId: "org-001",
    title: "Process Q1 customer support backlog",
    description:
      "Review and respond to all pending customer tickets from Q1 using AlphaAssist routing",
    status: "in_progress",
    priority: "high",
    assignedAgentId: "agent-001",
    assignedAgentName: "AlphaAssist",
    language: "en",
    tags: ["customer-service", "q1", "priority"],
    createdAt: "2026-04-01",
    updatedAt: "2026-04-03",
  },
  {
    id: "task-002",
    orgId: "org-001",
    title: "Monthly analytics report generation",
    description:
      "Generate comprehensive monthly analytics for all active clients",
    status: "pending",
    priority: "medium",
    assignedAgentId: "agent-002",
    assignedAgentName: "DataDig Pro",
    language: "en",
    tags: ["analytics", "monthly", "reporting"],
    createdAt: "2026-04-02",
    updatedAt: "2026-04-02",
  },
  {
    id: "task-003",
    orgId: "org-001",
    title: "Spanish-language FAQ update",
    description:
      "Review and update FAQ documents for Spanish-speaking customers",
    status: "completed",
    priority: "low",
    assignedAgentId: "agent-001",
    assignedAgentName: "AlphaAssist",
    language: "es",
    tags: ["content", "spanish", "faq"],
    createdAt: "2026-03-28",
    updatedAt: "2026-04-01",
  },
  {
    id: "task-004",
    orgId: "org-001",
    title: "Urgent: Enterprise client onboarding",
    description:
      "Immediate onboarding support needed for new enterprise client TechCorp Inc.",
    status: "pending",
    priority: "urgent",
    language: "en",
    tags: ["onboarding", "enterprise", "urgent"],
    createdAt: "2026-04-04",
    updatedAt: "2026-04-04",
  },
  {
    id: "task-005",
    orgId: "org-001",
    title: "Security audit documentation review",
    description:
      "Review AI agent access logs and generate security compliance report",
    status: "in_progress",
    priority: "high",
    assignedAgentId: "agent-002",
    assignedAgentName: "DataDig Pro",
    language: "en",
    tags: ["security", "audit", "compliance"],
    createdAt: "2026-04-03",
    updatedAt: "2026-04-04",
  },
  {
    id: "task-006",
    orgId: "org-002",
    title: "Student progress report batch",
    description:
      "Generate end-of-term progress reports for 200+ enrolled students",
    status: "pending",
    priority: "medium",
    assignedAgentId: "agent-003",
    assignedAgentName: "EduBot Scholar",
    language: "en",
    tags: ["education", "reports", "batch"],
    createdAt: "2026-04-02",
    updatedAt: "2026-04-02",
  },
];

export const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: "tx-001",
    walletId: "wal-001",
    txType: "deposit",
    amount: 50000,
    currency: "USD",
    description: "Stripe subscription payment - TechCorp Enterprise Q2",
    status: "completed",
    createdAt: "2026-04-01",
  },
  {
    id: "tx-002",
    walletId: "wal-001",
    txType: "transfer",
    amount: -15000,
    currency: "USD",
    description: "Transfer to NYC Branch Fund",
    status: "completed",
    createdAt: "2026-04-02",
  },
  {
    id: "tx-003",
    walletId: "wal-002",
    txType: "deposit",
    amount: 15000,
    currency: "USD",
    description: "Transfer from Treasury",
    status: "completed",
    createdAt: "2026-04-02",
  },
  {
    id: "tx-004",
    walletId: "wal-001",
    txType: "fractionalize",
    amount: -5000,
    currency: "USD",
    description: "FinFracFran distribution - Q1 profit sharing",
    status: "completed",
    createdAt: "2026-04-03",
  },
  {
    id: "tx-005",
    walletId: "wal-003",
    txType: "distribute",
    amount: 350,
    currency: "USD",
    description: "FinFracFran fractional share received",
    status: "completed",
    createdAt: "2026-04-03",
  },
];

export const PLATFORM_METRICS = {
  totalOrgs: 47,
  totalUsers: 312,
  totalTasks: 1847,
  totalWallets: 189,
  totalTransactions: 4203,
  monthlyGrowth: [
    { month: "Oct", orgs: 28, users: 185, tasks: 892 },
    { month: "Nov", orgs: 31, users: 210, tasks: 1050 },
    { month: "Dec", orgs: 35, users: 241, tasks: 1230 },
    { month: "Jan", orgs: 38, users: 264, tasks: 1410 },
    { month: "Feb", orgs: 42, users: 288, tasks: 1620 },
    { month: "Mar", orgs: 45, users: 301, tasks: 1750 },
    { month: "Apr", orgs: 47, users: 312, tasks: 1847 },
  ],
};
