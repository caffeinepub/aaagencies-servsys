import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WalletInput {
    orgId: string;
    name: string;
    accountType: AccountType;
    branchId?: string;
}
export interface BranchInput {
    timezone: string;
    orgId: string;
    name: string;
    subWalletEnabled: boolean;
    managerId?: Principal;
    siteUrl?: string;
    phone?: string;
    location: string;
    primaryLanguage: string;
}
export interface User {
    principal: Principal;
    preferredLanguage: string;
    displayName: string;
    orgId?: string;
    lastLoginAt?: bigint;
    createdAt: bigint;
    role: Role;
    isActive: boolean;
    email: string;
    stripeCustomerId?: string;
    avatarUrl?: string;
    branchId?: string;
}
export interface UpdateOrgInput {
    name: string;
    description: string;
    logoUrl?: string;
    supportedLanguages: Array<string>;
    primaryLanguage: string;
}
export type Principal = Principal;
export interface CreateInviteLinkInput {
    expiresAt?: bigint;
    orgId?: string;
    role: Role;
    maxRedemptions?: bigint;
}
export interface LeadInput {
    preferredLanguage: string;
    orgName?: string;
    interest: string;
    source: string;
    name: string;
    email: string;
}
export interface Transaction {
    id: string;
    status: TransactionStatus;
    createdAt: bigint;
    description: string;
    toWalletId: string;
    fromWalletId: string;
    txType: TxType;
    amountE8s: bigint;
    initiatedBy: Principal;
}
export interface Lead {
    id: string;
    preferredLanguage: string;
    orgName?: string;
    interest: string;
    source: string;
    name: string;
    createdAt: bigint;
    email: string;
}
export interface InviteLink {
    id: string;
    expiresAt?: bigint;
    orgId?: string;
    redemptionCount: bigint;
    code: string;
    createdAt: bigint;
    createdBy: Principal;
    role: Role;
    isActive: boolean;
    maxRedemptions?: bigint;
}
export interface UpdateProfileInput {
    preferredLanguage: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
}
export interface Branch {
    id: string;
    timezone: string;
    orgId: string;
    name: string;
    createdAt: bigint;
    isActive: boolean;
    subWalletEnabled: boolean;
    managerId?: Principal;
    siteUrl?: string;
    phone?: string;
    location: string;
    primaryLanguage: string;
}
export interface UserInput {
    principal: Principal;
    preferredLanguage: string;
    displayName: string;
    email: string;
}
export interface OrganizationInput {
    ownerId: Principal;
    name: string;
    description: string;
    planTier: PlanTier;
    primaryLanguage: string;
}
export interface WalletAccount {
    id: string;
    orgId: string;
    ownerId: Principal;
    name: string;
    createdAt: bigint;
    isActive: boolean;
    accountType: AccountType;
    currency: string;
    balanceE8s: bigint;
    branchId?: string;
}
export interface Organization {
    id: string;
    ownerId: Principal;
    stripeSubscriptionId?: string;
    name: string;
    createdAt: bigint;
    description: string;
    isActive: boolean;
    logoUrl?: string;
    stripeCustomerId?: string;
    supportedLanguages: Array<string>;
    planTier: PlanTier;
    primaryLanguage: string;
}
export interface BranchUpdateInput {
    timezone?: string;
    name?: string;
    isActive?: boolean;
    subWalletEnabled?: boolean;
    managerId?: Principal;
    siteUrl?: string;
    phone?: string;
    location?: string;
    primaryLanguage?: string;
}
export enum AccountType {
    vendor_account = "vendor_account",
    branch_fund = "branch_fund",
    org_treasury = "org_treasury",
    member_wallet = "member_wallet"
}
export enum PlanTier {
    enterprise = "enterprise",
    starter = "starter",
    free = "free",
    professional = "professional"
}
export enum Role {
    super_admin = "super_admin",
    org_admin = "org_admin",
    end_customer = "end_customer",
    team_member = "team_member"
}
export enum TransactionStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum TxType {
    deposit = "deposit",
    fractionalize = "fractionalize",
    distribute = "distribute",
    withdrawal = "withdrawal",
    transfer = "transfer"
}
export interface ApiKey {
    id: string;
    orgId: string;
    createdBy: Principal;
    name: string;
    description: string;
    permissions: Array<string>;
    keyPrefix: string;
    keyHash: bigint;
    isActive: boolean;
    createdAt: bigint;
    lastUsedAt?: bigint;
}
export interface ApiKeyInput {
    name: string;
    description: string;
    permissions: Array<string>;
}

export enum AgentStatus {
    active = "active",
    inactive = "inactive",
    training = "training"
}
export interface AgentDefinition {
    id: string;
    orgId: string;
    name: string;
    description: string;
    capabilities: Array<string>;
    supportedLanguages: Array<string>;
    modelType: string;
    status: AgentStatus;
    endpointUrl?: string;
    createdAt: bigint;
    createdBy: Principal;
}
export interface AgentInput {
    name: string;
    description: string;
    capabilities: Array<string>;
    supportedLanguages: Array<string>;
    modelType: string;
    status: AgentStatus;
    endpointUrl?: string;
}
export interface AgentUpdateInput {
    name?: string;
    description?: string;
    capabilities?: Array<string>;
    supportedLanguages?: Array<string>;
    modelType?: string;
    status?: AgentStatus;
    endpointUrl?: string;
}
export interface backendInterface {
    createBranch(input: BranchInput): Promise<{
        __kind__: "ok";
        ok: Branch;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createInviteLink(input: CreateInviteLinkInput): Promise<{
        __kind__: "ok";
        ok: InviteLink;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createOrganization(input: OrganizationInput): Promise<{
        __kind__: "ok";
        ok: Organization;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createWallet(input: WalletInput): Promise<{
        __kind__: "ok";
        ok: WalletAccount;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deactivateBranch(id: string): Promise<{
        __kind__: "ok";
        ok: Branch;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deactivateInviteLink(id: string): Promise<{
        __kind__: "ok";
        ok: InviteLink;
    } | {
        __kind__: "err";
        err: string;
    }>;
    depositToWallet(walletId: string, amountE8s: bigint, description: string): Promise<{
        __kind__: "ok";
        ok: Transaction;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllInviteLinks(): Promise<Array<InviteLink>>;
    getAllLeads(): Promise<{
        __kind__: "ok";
        ok: Array<Lead>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllOrganizations(): Promise<Array<Organization>>;
    getAllUsers(): Promise<Array<User>>;
    getAllUsersByEmail(): Promise<Array<User>>;
    getBranchesByOrg(orgId: string): Promise<Array<Branch>>;
    getInviteLinkByCode(code: string): Promise<{
        __kind__: "ok";
        ok: InviteLink;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyInviteLinks(): Promise<Array<InviteLink>>;
    getMyOrganization(): Promise<Organization | null>;
    getMyProfile(): Promise<User>;
    getMyWallets(): Promise<Array<WalletAccount>>;
    getOrganizationById(id: string): Promise<Organization | null>;
    getTeamMembersByOrg(orgId: string): Promise<Array<User>>;
    getTransactionHistory(walletId: string): Promise<{
        __kind__: "ok";
        ok: Array<Transaction>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getTransactionHistoryByOrg(orgId: string): Promise<{
        __kind__: "ok";
        ok: Array<Transaction>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getUserById(principal: Principal): Promise<User>;
    getWalletsByOrg(orgId: string): Promise<{
        __kind__: "ok";
        ok: Array<WalletAccount>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    isRegistered(): Promise<boolean>;
    redeemInviteLink(code: string, input: UserInput): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerUser(input: UserInput): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    removeUserFromOrg(targetPrincipal: Principal): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitLead(input: LeadInput): Promise<{
        __kind__: "ok";
        ok: Lead;
    } | {
        __kind__: "err";
        err: string;
    }>;
    transferICP(fromWalletId: string, toWalletId: string, amountE8s: bigint, description: string): Promise<{
        __kind__: "ok";
        ok: Transaction;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateBranch(id: string, input: BranchUpdateInput): Promise<{
        __kind__: "ok";
        ok: Branch;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateLastLogin(): Promise<void>;
    updateMyProfile(input: UpdateProfileInput): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateOrganization(id: string, input: UpdateOrgInput): Promise<{
        __kind__: "ok";
        ok: Organization;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateUserRole(targetPrincipal: Principal, newRole: Role): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    generateApiKey(input: ApiKeyInput): Promise<{
        __kind__: "ok";
        ok: { apiKey: ApiKey; fullKey: string };
    } | {
        __kind__: "err";
        err: string;
    }>;
    listApiKeys(): Promise<{
        __kind__: "ok";
        ok: Array<ApiKey>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    revokeApiKey(keyId: string): Promise<{
        __kind__: "ok";
        ok: ApiKey;
    } | {
        __kind__: "err";
        err: string;
    }>;
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;

    registerAgent(input: AgentInput): Promise<{
        __kind__: "ok";
        ok: AgentDefinition;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateAgent(id: string, input: AgentUpdateInput): Promise<{
        __kind__: "ok";
        ok: AgentDefinition;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deactivateAgent(id: string): Promise<{
        __kind__: "ok";
        ok: AgentDefinition;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAgentsByOrg(orgId: string): Promise<{
        __kind__: "ok";
        ok: Array<AgentDefinition>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAgentById(id: string): Promise<{
        __kind__: "ok";
        ok: AgentDefinition;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createTask(input: TaskInput): Promise<{
        __kind__: "ok";
        ok: Task;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTask(id: string, input: TaskUpdateInput): Promise<{
        __kind__: "ok";
        ok: Task;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTaskStatus(id: string, newStatus: TaskStatus): Promise<{
        __kind__: "ok";
        ok: Task;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignTaskToAgent(taskId: string, agentId: string): Promise<{
        __kind__: "ok";
        ok: Task;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getTasksByOrg(orgId: string): Promise<{
        __kind__: "ok";
        ok: Array<Task>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyTasks(): Promise<{
        __kind__: "ok";
        ok: Array<Task>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getTasksByAgent(agentId: string): Promise<{
        __kind__: "ok";
        ok: Array<Task>;
    } | {
        __kind__: "err";
        err: string;
    }>;
}

export enum TaskStatus {
    pending = "pending",
    in_progress = "in_progress",
    completed = "completed",
    failed = "failed",
    cancelled = "cancelled"
}

export enum TaskPriority {
    low = "low",
    medium = "medium",
    high = "high",
    urgent = "urgent"
}

export interface Task {
    id: string;
    orgId: string;
    createdBy: Principal;
    assignedAgentId?: string;
    assignedTo?: Principal;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    language: string;
    tags: Array<string>;
    inputData?: string;
    outputData?: string;
    createdAt: bigint;
    updatedAt: bigint;
}

export interface TaskInput {
    title: string;
    description: string;
    priority: TaskPriority;
    language: string;
    tags: Array<string>;
    assignedAgentId?: string;
    assignedTo?: Principal;
    inputData?: string;
}

export interface TaskUpdateInput {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    language?: string;
    tags?: Array<string>;
    assignedAgentId?: string;
    assignedTo?: Principal;
    inputData?: string;
    outputData?: string;
    status?: TaskStatus;
}
