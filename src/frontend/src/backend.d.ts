import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FractionalAssetUpdateInput {
    name?: string;
    valuationUsd?: bigint;
    description?: string;
    isActive?: boolean;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface OrgSettings {
    timezone: string;
    webhookEvents: Array<string>;
    notifyOnAgentDeactivated: boolean;
    notifyOnTaskComplete: boolean;
    defaultLanguage: string;
    notifyOnUserJoined: boolean;
    webhookUrl?: string;
}
export interface TaskUpdateInput {
    status?: TaskStatus;
    inputData?: string;
    title?: string;
    assignedTo?: Principal;
    tags?: Array<string>;
    description?: string;
    assignedAgentId?: string;
    language?: string;
    outputData?: string;
    priority?: TaskPriority;
}
export interface UpdateOrgInput {
    customSubdomain?: string;
    customDomain?: string;
    name: string;
    description: string;
    logoUrl?: string;
    supportedLanguages: Array<string>;
    primaryLanguage: string;
}
export interface PlanLimits {
    maxBranches: bigint;
    maxUsers: bigint;
    maxAgents: bigint;
    maxApiKeys: bigint;
    maxWallets: bigint;
}
export interface LeadInput {
    preferredLanguage: string;
    orgName?: string;
    interest: string;
    source: string;
    name: string;
    email: string;
}
export interface CreateInviteLinkInput {
    expiresAt?: bigint;
    orgId?: string;
    role: Role;
    maxRedemptions?: bigint;
}
export interface PlatformSettings {
    announcementBannerEnabled: boolean;
    announcementBanner?: string;
    launchDate?: bigint;
}
export interface AuditEntry {
    id: string;
    action: string;
    actorName: string;
    orgId?: string;
    description: string;
    actorId: Principal;
    targetKind: string;
    timestamp: bigint;
    targetId: string;
}
export interface TaskInput {
    inputData?: string;
    title: string;
    assignedTo?: Principal;
    tags: Array<string>;
    description: string;
    assignedAgentId?: string;
    language: string;
    priority: TaskPriority;
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
export interface ActivityEvent {
    id: string;
    actorName: string;
    orgId: string;
    description: string;
    actorId: Principal;
    targetName?: string;
    timestamp: bigint;
    targetId?: string;
    eventType: ActivityEventType;
}
export interface PlatformMetrics {
    totalTasks: bigint;
    totalAgents: bigint;
    totalWallets: bigint;
    orgsByPlan: OrgsByPlan;
    totalOrgs: bigint;
    totalUsers: bigint;
    activeOrgs: bigint;
}
export interface AgentTemplate {
    id: string;
    orgId?: string;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    tags: Array<string>;
    description: string;
    endpointUrl?: string;
    systemPrompt?: string;
    isPublic: boolean;
    endpointHeaders?: string;
}
export interface RevenueSplit {
    id: string;
    status: RevenueSplitStatus;
    orgId: string;
    assetId: string;
    createdAt: bigint;
    createdBy: Principal;
    distributedAt?: bigint;
    totalAmountUsd: bigint;
    distribution: Array<RevenueSplitEntry>;
}
export interface RevenueSplitEntry {
    userName: string;
    shares: bigint;
    userId: Principal;
    amountUsd: bigint;
}
export interface AgentUpdateInput {
    status?: AgentStatus;
    capabilities?: Array<string>;
    name?: string;
    description?: string;
    endpointUrl?: string;
    supportedLanguages?: Array<string>;
    modelType?: string;
}
export interface OrgsByPlan {
    enterprise: bigint;
    starter: bigint;
    free: bigint;
    professional: bigint;
}
export interface FractionalAsset {
    id: string;
    orgId: string;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    valuationUsd: bigint;
    description: string;
    isActive: boolean;
    updatedAt: bigint;
    assetType: FFFAssetType;
    totalShares: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ApiKeyInput {
    permissions: Array<string>;
    name: string;
    description: string;
}
export interface AgentTemplateInput {
    orgId?: string;
    name: string;
    tags: Array<string>;
    description: string;
    endpointUrl?: string;
    systemPrompt?: string;
    isPublic: boolean;
    endpointHeaders?: string;
}
export interface FractionalOwnership {
    id: string;
    userName: string;
    shares: bigint;
    orgId: string;
    assetId: string;
    userId: Principal;
    issuedAt: bigint;
}
export interface Notification {
    id: string;
    title: string;
    orgId: string;
    userId: Principal;
    notificationType: NotificationType;
    createdAt: bigint;
    isRead: boolean;
    message: string;
    relatedId?: string;
}
export interface AgentInput {
    status: AgentStatus;
    capabilities: Array<string>;
    name: string;
    description: string;
    endpointUrl?: string;
    supportedLanguages: Array<string>;
    modelType: string;
}
export interface FractionalAssetInput {
    orgId: string;
    name: string;
    valuationUsd: bigint;
    description: string;
    assetType: FFFAssetType;
    totalShares: bigint;
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
export interface Organization {
    id: string;
    customSubdomain?: string;
    customDomain?: string;
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
export interface SearchResult {
    id: string;
    url: string;
    resultLabel: string;
    kind: string;
    subtitle: string;
}
export interface Task {
    id: string;
    status: TaskStatus;
    inputData?: string;
    title: string;
    assignedTo?: Principal;
    orgId: string;
    createdAt: bigint;
    createdBy: Principal;
    tags: Array<string>;
    description: string;
    assignedAgentId?: string;
    language: string;
    updatedAt: bigint;
    outputData?: string;
    priority: TaskPriority;
}
export interface ApiKey {
    id: string;
    lastUsedAt?: bigint;
    permissions: Array<string>;
    orgId: string;
    keyPrefix: string;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    description: string;
    isActive: boolean;
    keyHash: bigint;
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
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface UserInput {
    principal: Principal;
    preferredLanguage: string;
    displayName: string;
    email: string;
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
export interface AgentDefinition {
    id: string;
    status: AgentStatus;
    capabilities: Array<string>;
    orgId: string;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    description: string;
    endpointUrl?: string;
    supportedLanguages: Array<string>;
    modelType: string;
}
export interface WalletInput {
    orgId: string;
    name: string;
    accountType: AccountType;
    branchId?: string;
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
export type Principal = Principal;
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
export interface FranchiseLink {
    id: string;
    status: FranchiseLinkStatus;
    royaltyPct: bigint;
    createdAt: bigint;
    createdBy: Principal;
    franchisorOrgId: string;
    franchiseeOrgId: string;
    updatedAt: bigint;
    termsUrl?: string;
}
export interface UpdateProfileInput {
    preferredLanguage: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
}
export interface OrganizationInput {
    ownerId: Principal;
    name: string;
    description: string;
    planTier: PlanTier;
    primaryLanguage: string;
}
export interface ConversationMessage {
    id: string;
    isError: boolean;
    content: string;
    orgId: string;
    agentId: string;
    timestamp: bigint;
    senderRole: SenderRole;
    senderId: Principal;
}
export enum AccountType {
    vendor_account = "vendor_account",
    branch_fund = "branch_fund",
    org_treasury = "org_treasury",
    member_wallet = "member_wallet"
}
export enum ActivityEventType {
    userInvited = "userInvited",
    agentDeactivated = "agentDeactivated",
    orgCreated = "orgCreated",
    taskFailed = "taskFailed",
    userJoined = "userJoined",
    taskCompleted = "taskCompleted",
    taskCreated = "taskCreated",
    walletCreated = "walletCreated",
    agentRegistered = "agentRegistered"
}
export enum AgentStatus {
    active = "active",
    inactive = "inactive",
    training = "training"
}
export enum FFFAssetType {
    realEstate = "realEstate",
    custom = "custom",
    business = "business",
    revenueStream = "revenueStream",
    intellectualProperty = "intellectualProperty"
}
export enum FranchiseLinkStatus {
    active = "active",
    terminated = "terminated",
    pending = "pending"
}
export enum NotificationType {
    agentDeactivated = "agentDeactivated",
    taskStatusChanged = "taskStatusChanged",
    orgCreated = "orgCreated",
    systemMessage = "systemMessage",
    inviteRedeemed = "inviteRedeemed"
}
export enum PlanTier {
    enterprise = "enterprise",
    starter = "starter",
    free = "free",
    professional = "professional"
}
export enum RevenueSplitStatus {
    distributed = "distributed",
    cancelled = "cancelled",
    pending = "pending"
}
export enum Role {
    super_admin = "super_admin",
    org_admin = "org_admin",
    end_customer = "end_customer",
    team_member = "team_member"
}
export enum SenderRole {
    agent = "agent",
    user = "user"
}
export enum TaskPriority {
    low = "low",
    high = "high",
    urgent = "urgent",
    medium = "medium"
}
export enum TaskStatus {
    cancelled = "cancelled",
    pending = "pending",
    in_progress = "in_progress",
    completed = "completed",
    failed = "failed"
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
export interface backendInterface {
    assignTaskToAgent(taskId: string, agentId: string): Promise<{
        __kind__: "ok";
        ok: Task;
    } | {
        __kind__: "err";
        err: string;
    }>;
    bulkUpdateTaskStatus(ids: Array<string>, status: string): Promise<{
        __kind__: "ok";
        ok: {
            updated: bigint;
            failed: bigint;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    cloneAgentFromTemplate(templateId: string, orgId: string, nameOverride: string | null, endpointOverride: string | null): Promise<{
        __kind__: "ok";
        ok: AgentDefinition;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createAgentTemplate(input: AgentTemplateInput): Promise<{
        __kind__: "ok";
        ok: AgentTemplate;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createBranch(input: BranchInput): Promise<{
        __kind__: "ok";
        ok: Branch;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createFractionalAsset(input: FractionalAssetInput): Promise<{
        __kind__: "ok";
        ok: FractionalAsset;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createFranchiseLink(franchisorOrgId: string, franchiseeOrgId: string, royaltyPct: bigint, termsUrl: string | null): Promise<{
        __kind__: "ok";
        ok: FranchiseLink;
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
    createRevenueSplit(assetId: string, totalAmountUsd: bigint, distribution: Array<RevenueSplitEntry>): Promise<{
        __kind__: "ok";
        ok: RevenueSplit;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createSystemNotification(userId: Principal, title: string, message: string, relatedId: string | null): Promise<{
        __kind__: "ok";
        ok: Notification;
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
    createWallet(input: WalletInput): Promise<{
        __kind__: "ok";
        ok: WalletAccount;
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
    deleteAgentTemplate(id: string): Promise<{
        __kind__: "ok";
        ok: boolean;
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
    distributeRevenueSplit(splitId: string): Promise<{
        __kind__: "ok";
        ok: RevenueSplit;
    } | {
        __kind__: "err";
        err: string;
    }>;
    generateApiKey(input: ApiKeyInput): Promise<{
        __kind__: "ok";
        ok: {
            apiKey: ApiKey;
            fullKey: string;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    getActivityFeed(orgId: string | null): Promise<{
        __kind__: "ok";
        ok: Array<ActivityEvent>;
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
    getAgentTemplates(orgId: string | null): Promise<{
        __kind__: "ok";
        ok: Array<AgentTemplate>;
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
    getAuditLog(orgId: string | null): Promise<{
        __kind__: "ok";
        ok: Array<AuditEntry>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getBranchesByOrg(orgId: string): Promise<Array<Branch>>;
    getConversationHistory(agentId: string): Promise<{
        __kind__: "ok";
        ok: Array<ConversationMessage>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getFractionalAssetById(id: string): Promise<{
        __kind__: "ok";
        ok: FractionalAsset;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getFractionalAssets(orgId: string): Promise<{
        __kind__: "ok";
        ok: Array<FractionalAsset>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getFranchiseLinks(orgId: string): Promise<{
        __kind__: "ok";
        ok: Array<FranchiseLink>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getInviteLinkByCode(code: string): Promise<{
        __kind__: "ok";
        ok: InviteLink;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyInviteLinks(): Promise<Array<InviteLink>>;
    getMyNotifications(): Promise<{
        __kind__: "ok";
        ok: Array<Notification>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyOrganization(): Promise<Organization | null>;
    getMyOwnership(): Promise<{
        __kind__: "ok";
        ok: Array<FractionalOwnership>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyProfile(): Promise<User>;
    getMyTasks(): Promise<{
        __kind__: "ok";
        ok: Array<Task>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyWallets(): Promise<Array<WalletAccount>>;
    getOrgSettings(orgId: string): Promise<{
        __kind__: "ok";
        ok: OrgSettings;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getOrganizationById(id: string): Promise<Organization | null>;
    getOwnershipByAsset(assetId: string): Promise<{
        __kind__: "ok";
        ok: Array<FractionalOwnership>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getPlanLimits(tier: PlanTier): Promise<PlanLimits>;
    getPlatformFranchiseLinks(): Promise<{
        __kind__: "ok";
        ok: Array<FranchiseLink>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getPlatformMetrics(): Promise<{
        __kind__: "ok";
        ok: PlatformMetrics;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getPlatformSettings(): Promise<{
        __kind__: "ok";
        ok: PlatformSettings;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getRevenueSplits(assetId: string): Promise<{
        __kind__: "ok";
        ok: Array<RevenueSplit>;
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
    getTasksByOrg(orgId: string): Promise<{
        __kind__: "ok";
        ok: Array<Task>;
    } | {
        __kind__: "err";
        err: string;
    }>;
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
    issueShares(assetId: string, userId: Principal, shares: bigint): Promise<{
        __kind__: "ok";
        ok: FractionalOwnership;
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
    markAllNotificationsRead(): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markNotificationRead(id: string): Promise<{
        __kind__: "ok";
        ok: Notification;
    } | {
        __kind__: "err";
        err: string;
    }>;
    redeemInviteLink(code: string, input: UserInput): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerAgent(input: AgentInput): Promise<{
        __kind__: "ok";
        ok: AgentDefinition;
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
    revokeApiKey(keyId: string): Promise<{
        __kind__: "ok";
        ok: ApiKey;
    } | {
        __kind__: "err";
        err: string;
    }>;
    searchOrg(orgId: string, searchQuery: string): Promise<Array<SearchResult>>;
    searchPlatform(searchQuery: string): Promise<Array<SearchResult>>;
    sendAgentMessage(agentId: string, userMessage: string): Promise<{
        __kind__: "ok";
        ok: Array<ConversationMessage>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setOrgActive(orgId: string, isActive: boolean): Promise<{
        __kind__: "ok";
        ok: Organization;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setOrgPlanOverride(orgId: string, tier: PlanTier): Promise<{
        __kind__: "ok";
        ok: Organization;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setPlanLimits(tier: PlanTier, limits: PlanLimits): Promise<{
        __kind__: "ok";
        ok: PlanLimits;
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
    transformHttpResponse(input: TransformationInput): Promise<TransformationOutput>;
    updateAgent(id: string, input: AgentUpdateInput): Promise<{
        __kind__: "ok";
        ok: AgentDefinition;
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
    updateFractionalAsset(id: string, input: FractionalAssetUpdateInput): Promise<{
        __kind__: "ok";
        ok: FractionalAsset;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateFranchiseLinkStatus(id: string, newStatus: FranchiseLinkStatus): Promise<{
        __kind__: "ok";
        ok: FranchiseLink;
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
    updateOrgDomain(orgId: string, customDomain: string | null, customSubdomain: string | null): Promise<{
        __kind__: "ok";
        ok: Organization;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateOrgSettings(orgId: string, input: OrgSettings): Promise<{
        __kind__: "ok";
        ok: OrgSettings;
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
    updatePlatformSettings(input: PlatformSettings): Promise<{
        __kind__: "ok";
        ok: PlatformSettings;
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
    updateUserRole(targetPrincipal: Principal, newRole: Role): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
