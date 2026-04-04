import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface UserInput {
    principal: Principal;
    preferredLanguage: string;
    displayName: string;
    email: string;
}
export interface UpdateProfileInput {
    displayName: string;
    email: string;
    preferredLanguage: string;
    avatarUrl?: string;
}
export interface OrganizationInput {
    ownerId: Principal;
    name: string;
    description: string;
    planTier: PlanTier;
    primaryLanguage: string;
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
export interface Lead {
    id: string;
    name: string;
    email: string;
    interest: string;
    orgName?: string;
    preferredLanguage: string;
    createdAt: bigint;
    source: string;
}
export interface LeadInput {
    name: string;
    email: string;
    interest: string;
    orgName?: string;
    preferredLanguage: string;
    source: string;
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
export interface backendInterface {
    createOrganization(input: OrganizationInput): Promise<{
        __kind__: "ok";
        ok: Organization;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllOrganizations(): Promise<Array<Organization>>;
    getAllUsers(): Promise<Array<User>>;
    getAllUsersByEmail(): Promise<Array<User>>;
    getMyOrganization(): Promise<Organization | null>;
    getMyProfile(): Promise<User>;
    getOrganizationById(id: string): Promise<Organization | null>;
    getUserById(principal: Principal): Promise<User>;
    isRegistered(): Promise<boolean>;
    registerUser(input: UserInput): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateMyProfile(input: UpdateProfileInput): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateLastLogin(): Promise<void>;
    submitLead(input: LeadInput): Promise<{
        __kind__: "ok";
        ok: Lead;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllLeads(): Promise<{
        __kind__: "ok";
        ok: Array<Lead>;
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
    getAllInviteLinks(): Promise<Array<InviteLink>>;
    getMyInviteLinks(): Promise<Array<InviteLink>>;
    getInviteLinkByCode(code: string): Promise<{
        __kind__: "ok";
        ok: InviteLink;
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
    deactivateInviteLink(id: string): Promise<{
        __kind__: "ok";
        ok: InviteLink;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
export interface InviteLink {
    id: string;
    code: string;
    orgId?: string;
    createdBy: Principal;
    role: Role;
    maxRedemptions?: bigint;
    redemptionCount: bigint;
    expiresAt?: bigint;
    isActive: boolean;
    createdAt: bigint;
}
export interface CreateInviteLinkInput {
    role: Role;
    maxRedemptions?: bigint;
    expiresAt?: bigint;
    orgId?: string;
}
