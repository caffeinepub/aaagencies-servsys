import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Char "mo:core/Char";
import Nat32 "mo:core/Nat32";
import OutCall "http-outcalls/outcall";



actor {
  type Role = {
    #super_admin;
    #org_admin;
    #team_member;
    #end_customer;
  };

  type PlanTier = {
    #free;
    #starter;
    #professional;
    #enterprise;
  };


  type PlanLimits = {
    maxUsers : Nat;
    maxBranches : Nat;
    maxAgents : Nat;
    maxApiKeys : Nat;
    maxWallets : Nat;
  };

  type OrgsByPlan = {
    free : Nat;
    starter : Nat;
    professional : Nat;
    enterprise : Nat;
  };

  type PlatformMetrics = {
    totalOrgs : Nat;
    totalUsers : Nat;
    totalAgents : Nat;
    totalTasks : Nat;
    totalWallets : Nat;
    activeOrgs : Nat;
    orgsByPlan : OrgsByPlan;
  };

  type Organization = {
    id : Text;
    name : Text;
    description : Text;
    planTier : PlanTier;
    ownerId : Principal.Principal;
    stripeCustomerId : ?Text;
    stripeSubscriptionId : ?Text;
    isActive : Bool;
    createdAt : Int;
    logoUrl : ?Text;
    primaryLanguage : Text;
    supportedLanguages : [Text];
    customDomain : ?Text;
    customSubdomain : ?Text;
  };

  // Migration type: shape of Organization before 5A-iii (no customDomain/customSubdomain)
  type OrganizationLegacy = {
    id : Text;
    name : Text;
    description : Text;
    planTier : PlanTier;
    ownerId : Principal.Principal;
    stripeCustomerId : ?Text;
    stripeSubscriptionId : ?Text;
    isActive : Bool;
    createdAt : Int;
    logoUrl : ?Text;
    primaryLanguage : Text;
    supportedLanguages : [Text];
  };

  module Organization {
    public func compare(org1 : Organization, org2 : Organization) : Order.Order {
      Text.compare(org1.id, org2.id);
    };
  };

  type User = {
    principal : Principal.Principal;
    role : Role;
    orgId : ?Text;
    branchId : ?Text;
    displayName : Text;
    email : Text;
    preferredLanguage : Text;
    isActive : Bool;
    createdAt : Int;
    lastLoginAt : ?Int;
    avatarUrl : ?Text;
    stripeCustomerId : ?Text;
  };

  module User {
    public func compare(user1 : User, user2 : User) : Order.Order {
      Text.compare(user1.displayName, user2.displayName);
    };

    public func compareByEmail(user1 : User, user2 : User) : Order.Order {
      Text.compare(user1.email, user2.email);
    };
  };

  type Branch = {
    id : Text;
    orgId : Text;
    name : Text;
    location : Text;
    siteUrl : ?Text;
    phone : ?Text;
    timezone : Text;
    primaryLanguage : Text;
    subWalletEnabled : Bool;
    managerId : ?Principal.Principal;
    isActive : Bool;
    createdAt : Int;
  };

  module Branch {
    public func compare(a : Branch, b : Branch) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type InviteLink = {
    id : Text;
    code : Text;
    orgId : ?Text;
    createdBy : Principal.Principal;
    role : Role;
    maxRedemptions : ?Nat;
    redemptionCount : Nat;
    expiresAt : ?Int;
    isActive : Bool;
    createdAt : Int;
  };

  module InviteLink {
    public func compare(a : InviteLink, b : InviteLink) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type Lead = {
    id : Text;
    name : Text;
    email : Text;
    interest : Text;
    orgName : ?Text;
    preferredLanguage : Text;
    createdAt : Int;
    source : Text;
  };

  module Lead {
    public func compareByCreatedAt(a : Lead, b : Lead) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  type AccountType = {
    #org_treasury;
    #branch_fund;
    #member_wallet;
    #vendor_account;
  };

  type WalletAccount = {
    id : Text;
    ownerId : Principal.Principal;
    orgId : Text;
    branchId : ?Text;
    accountType : AccountType;
    name : Text;
    currency : Text;
    balanceE8s : Nat;
    isActive : Bool;
    createdAt : Int;
  };

  type TxType = {
    #deposit;
    #withdrawal;
    #transfer;
    #fractionalize;
    #distribute;
  };

  type TransactionStatus = {
    #pending;
    #completed;
    #failed;
  };

  type Transaction = {
    id : Text;
    fromWalletId : Text;
    toWalletId : Text;
    amountE8s : Nat;
    description : Text;
    txType : TxType;
    status : TransactionStatus;
    createdAt : Int;
    initiatedBy : Principal.Principal;
  };

  type ApiKey = {
    id : Text;
    orgId : Text;
    createdBy : Principal.Principal;
    name : Text;
    description : Text;
    permissions : [Text];
    keyPrefix : Text;
    keyHash : Nat;
    isActive : Bool;
    createdAt : Int;
    lastUsedAt : ?Int;
  };

  type AgentStatus = {
    #active;
    #inactive;
    #training;
  };

  type AgentDefinition = {
    id : Text;
    orgId : Text;
    name : Text;
    description : Text;
    capabilities : [Text];
    supportedLanguages : [Text];
    modelType : Text;
    status : AgentStatus;
    endpointUrl : ?Text;
    createdAt : Int;
    createdBy : Principal.Principal;
  };

  // ── Task Types ────────────────────────────────────────────

  type TaskStatus = {
    #pending;
    #in_progress;
    #completed;
    #failed;
    #cancelled;
  };

  type TaskPriority = {
    #low;
    #medium;
    #high;
    #urgent;
  };

  type Task = {
    id : Text;
    orgId : Text;
    createdBy : Principal.Principal;
    assignedAgentId : ?Text;
    assignedTo : ?Principal.Principal;
    title : Text;
    description : Text;
    status : TaskStatus;
    priority : TaskPriority;
    language : Text;
    tags : [Text];
    inputData : ?Text;
    outputData : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  module Task {
    public func compareByCreatedAt(a : Task, b : Task) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };


  type SenderRole = {
    #user;
    #agent;
  };

  type ConversationMessage = {
    id : Text;
    agentId : Text;
    orgId : Text;
    senderId : Principal.Principal;
    senderRole : SenderRole;
    content : Text;
    timestamp : Int;
    isError : Bool;
  };

  type Conversation = {
    id : Text;
    agentId : Text;
    userId : Principal.Principal;
    orgId : Text;
    messages : [ConversationMessage];
    createdAt : Int;
    lastMessageAt : Int;
  };

  module Conversation {
    public func compareByLastMessage(a : Conversation, b : Conversation) : Order.Order {
      Int.compare(b.lastMessageAt, a.lastMessageAt);
    };
  };

  let organizations = Map.empty<Text, OrganizationLegacy>();
  let organizationsNew = Map.empty<Text, Organization>();
  let users = Map.empty<Principal.Principal, User>();
  let branches = Map.empty<Text, Branch>();
  let inviteLinks = Map.empty<Text, InviteLink>();
  let inviteLinksByCode = Map.empty<Text, Text>();
  let leads = Map.empty<Text, Lead>();
  let wallets = Map.empty<Text, WalletAccount>();
  let transactions = Map.empty<Text, Transaction>();
  let apiKeys = Map.empty<Text, ApiKey>();
  let agents = Map.empty<Text, AgentDefinition>();
  let tasks = Map.empty<Text, Task>();
  let conversations = Map.empty<Text, Conversation>();

  var nextInviteId : Nat = 1;
  var nextLeadId : Nat = 1;
  var nextBranchId : Nat = 1;
  var nextWalletId : Nat = 1;
  var nextTxId : Nat = 1;
  var nextApiKeyId : Nat = 1;
  var nextAgentId : Nat = 1;
  var nextTaskId : Nat = 1;
  var nextConversationId : Nat = 1;
  var _nextMessageId : Nat = 1;

  let planLimitsMap = Map.empty<Text, PlanLimits>();

  // ─── Activity Feed Types ───────────────────────────────────────────────────

  type ActivityEventType = {
    #taskCreated;
    #taskCompleted;
    #taskFailed;
    #agentRegistered;
    #agentDeactivated;
    #userInvited;
    #userJoined;
    #walletCreated;
    #orgCreated;
  };

  type ActivityEvent = {
    id : Text;
    eventType : ActivityEventType;
    orgId : Text;
    actorId : Principal.Principal;
    actorName : Text;
    targetId : ?Text;
    targetName : ?Text;
    description : Text;
    timestamp : Int;
  };

  let activityEvents = Map.empty<Text, ActivityEvent>();
  var _nextActivityId : Nat = 1;

  // ─── Notification Types ───────────────────────────────────────────────────

  type NotificationType = {
    #taskStatusChanged;
    #inviteRedeemed;
    #agentDeactivated;
    #systemMessage;
    #orgCreated;
  };

  type Notification = {
    id : Text;
    userId : Principal.Principal;
    orgId : Text;
    notificationType : NotificationType;
    title : Text;
    message : Text;
    isRead : Bool;
    createdAt : Int;
    relatedId : ?Text;
  };

  let notifications = Map.empty<Text, Notification>();
  var _nextNotificationId : Nat = 1;


  // ─── Settings Types ───────────────────────────────────────────────────────

  type OrgSettings = {
    webhookUrl : ?Text;
    webhookEvents : [Text];
    notifyOnTaskComplete : Bool;
    notifyOnUserJoined : Bool;
    notifyOnAgentDeactivated : Bool;
    defaultLanguage : Text;
    timezone : Text;
  };

  type PlatformSettings = {
    announcementBanner : ?Text;
    announcementBannerEnabled : Bool;
    launchDate : ?Int;
  };

  let orgSettingsMap = Map.empty<Text, OrgSettings>();
  var platformSettings : PlatformSettings = {
    announcementBanner = null;
    announcementBannerEnabled = false;
    launchDate = null;
  };


  type OrganizationInput = {
    name : Text;
    description : Text;
    planTier : PlanTier;
    primaryLanguage : Text;
    ownerId : Principal.Principal;
  };

  type UpdateOrgInput = {
    name : Text;
    description : Text;
    logoUrl : ?Text;
    primaryLanguage : Text;
    supportedLanguages : [Text];
    customDomain : ?Text;
    customSubdomain : ?Text;
  };

  type BranchInput = {
    orgId : Text;
    name : Text;
    location : Text;
    siteUrl : ?Text;
    phone : ?Text;
    timezone : Text;
    primaryLanguage : Text;
    subWalletEnabled : Bool;
    managerId : ?Principal.Principal;
  };

  type BranchUpdateInput = {
    name : ?Text;
    location : ?Text;
    siteUrl : ?Text;
    phone : ?Text;
    timezone : ?Text;
    primaryLanguage : ?Text;
    subWalletEnabled : ?Bool;
    managerId : ?Principal.Principal;
    isActive : ?Bool;
  };

  type UserInput = {
    displayName : Text;
    email : Text;
    preferredLanguage : Text;
    principal : Principal.Principal;
  };

  type UpdateProfileInput = {
    displayName : Text;
    email : Text;
    preferredLanguage : Text;
    avatarUrl : ?Text;
  };

  type CreateInviteLinkInput = {
    role : Role;
    maxRedemptions : ?Nat;
    expiresAt : ?Int;
    orgId : ?Text;
  };

  type LeadInput = {
    name : Text;
    email : Text;
    interest : Text;
    orgName : ?Text;
    preferredLanguage : Text;
    source : Text;
  };

  type WalletInput = {
    orgId : Text;
    branchId : ?Text;
    accountType : AccountType;
    name : Text;
  };

  type ApiKeyInput = {
    name : Text;
    description : Text;
    permissions : [Text];
  };

  type AgentInput = {
    name : Text;
    description : Text;
    capabilities : [Text];
    supportedLanguages : [Text];
    modelType : Text;
    status : AgentStatus;
    endpointUrl : ?Text;
  };

  type AgentUpdateInput = {
    name : ?Text;
    description : ?Text;
    capabilities : ?[Text];
    supportedLanguages : ?[Text];
    modelType : ?Text;
    status : ?AgentStatus;
    endpointUrl : ?Text;
  };

  // ── Task Input Types ──────────────────────────────────────

  type TaskInput = {
    title : Text;
    description : Text;
    priority : TaskPriority;
    language : Text;
    tags : [Text];
    assignedAgentId : ?Text;
    assignedTo : ?Principal.Principal;
    inputData : ?Text;
  };

  type TaskUpdateInput = {
    title : ?Text;
    description : ?Text;
    status : ?TaskStatus;
    priority : ?TaskPriority;
    language : ?Text;
    tags : ?[Text];
    assignedAgentId : ?Text;
    assignedTo : ?Principal.Principal;
    inputData : ?Text;
    outputData : ?Text;
  };

  // ── Helpers ──────────────────────────────────────────────

  func isEmailTaken(email : Text, excludePrincipal : ?Principal.Principal) : Bool {
    for ((p, u) in users.entries()) {
      if (u.email == email) {
        switch (excludePrincipal) {
          case (?excl) { if (not p.equal(excl)) { return true } };
          case (null) { return true };
        };
      };
    };
    false;
  };

  func isSuperAdmin(caller : Principal.Principal) : Bool {
    switch (users.get(caller)) {
      case (null) { false };
      case (?u) {
        switch (u.role) {
          case (#super_admin) { true };
          case (_) { false };
        };
      };
    };
  };

  func isOrgAdmin(caller : Principal.Principal) : Bool {
    switch (users.get(caller)) {
      case (null) { false };
      case (?u) {
        switch (u.role) {
          case (#org_admin) { true };
          case (_) { false };
        };
      };
    };
  };

  func isRegisteredUser(caller : Principal.Principal) : Bool {
    switch (users.get(caller)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  func getCallerOrgId(caller : Principal.Principal) : ?Text {
    switch (users.get(caller)) {
      case (null) { null };
      case (?u) { u.orgId };
    };
  };

  // ── Organization APIs ─────────────────────────────────────

  public shared func createOrganization(input : OrganizationInput) : async {
    #ok : Organization;
    #err : Text;
  } {
    if (organizationsNew.containsKey(input.name)) {
      return #err("Organization already exists");
    };
    let newOrg = {
      id = input.name;
      name = input.name;
      description = input.description;
      planTier = input.planTier;
      ownerId = input.ownerId;
      stripeCustomerId = null;
      stripeSubscriptionId = null;
      isActive = true;
      createdAt = Time.now();
      logoUrl = null;
      primaryLanguage = input.primaryLanguage;
      supportedLanguages = [];
      customDomain = null;
      customSubdomain = null;
    };
    organizationsNew.add(input.name, newOrg);
    _recordActivity(#orgCreated, newOrg.id, newOrg.ownerId, ?newOrg.id, ?newOrg.name, "Organization \"" # newOrg.name # "\" was created");
    _recordAudit("organization.created", newOrg.ownerId, switch (users.get(newOrg.ownerId)) { case (?u) { u.displayName }; case null { "System" } }, "org", newOrg.id, "Organization created: " # newOrg.name, ?newOrg.id);
    #ok(newOrg);
  };

  public shared func getOrganizationById(id : Text) : async ?Organization {
    organizationsNew.get(id);
  };

  public shared func getAllOrganizations() : async [Organization] {
    organizationsNew.values().toArray().sort();
  };

  public shared ({ caller }) func getMyOrganization() : async ?Organization {
    var foundOrg : ?Text = null;
    for ((principal, user) in users.entries()) {
      if (user.principal.equal(caller) and user.orgId != null) {
        foundOrg := user.orgId;
      };
    };
    switch (foundOrg) {
      case (null) { null };
      case (?orgId) { organizationsNew.get(orgId) };
    };
  };

  public shared ({ caller }) func updateOrganization(id : Text, input : UpdateOrgInput) : async {
    #ok : Organization;
    #err : Text;
  } {
    switch (organizationsNew.get(id)) {
      case (null) { #err("Organization not found") };
      case (?org) {
        let authorized = isSuperAdmin(caller) or org.ownerId.equal(caller);
        if (not authorized) {
          return #err("Not authorized");
        };
        let updated : Organization = {
          id = org.id;
          name = input.name;
          description = input.description;
          planTier = org.planTier;
          ownerId = org.ownerId;
          stripeCustomerId = org.stripeCustomerId;
          stripeSubscriptionId = org.stripeSubscriptionId;
          isActive = org.isActive;
          createdAt = org.createdAt;
          logoUrl = input.logoUrl;
          primaryLanguage = input.primaryLanguage;
          supportedLanguages = input.supportedLanguages;
          customDomain = input.customDomain;
          customSubdomain = input.customSubdomain;
        };
        organizationsNew.remove(id);
        organizationsNew.add(updated.id, updated);
        #ok(updated);
      };
    };
  };

  // ── Branch APIs ───────────────────────────────────────────

  public shared ({ caller }) func createBranch(input : BranchInput) : async {
    #ok : Branch;
    #err : Text;
  } {
    let callerOrgId = getCallerOrgId(caller);
    let authorized = isSuperAdmin(caller) or (
      switch (callerOrgId) {
        case (?oid) { oid == input.orgId };
        case (null) { false };
      }
    );
    if (not authorized) {
      return #err("Not authorized");
    };
    // Plan limit check
    let branchLimits = _getOrgLimits(input.orgId);
    let existingBranches = branches.values().toArray().filter(func(b : Branch) : Bool { b.orgId == input.orgId });
    if (existingBranches.size() >= branchLimits.maxBranches) {
      return #err("Plan limit reached: upgrade your plan to add more branches (limit: " # branchLimits.maxBranches.toText() # ")");
    };
    let idNum = nextBranchId;
    nextBranchId += 1;
    let id = "BR" # idNum.toText();
    let newBranch : Branch = {
      id = id;
      orgId = input.orgId;
      name = input.name;
      location = input.location;
      siteUrl = input.siteUrl;
      phone = input.phone;
      timezone = input.timezone;
      primaryLanguage = input.primaryLanguage;
      subWalletEnabled = input.subWalletEnabled;
      managerId = input.managerId;
      isActive = true;
      createdAt = Time.now();
    };
    branches.add(id, newBranch);
    #ok(newBranch);
  };

  public shared func getBranchesByOrg(orgId : Text) : async [Branch] {
    let all = branches.values().toArray();
    let filtered = all.filter(func(b : Branch) : Bool { b.orgId == orgId });
    filtered.sort();
  };

  public shared ({ caller }) func updateBranch(id : Text, input : BranchUpdateInput) : async {
    #ok : Branch;
    #err : Text;
  } {
    switch (branches.get(id)) {
      case (null) { #err("Branch not found") };
      case (?b) {
        let callerOrgId = getCallerOrgId(caller);
        let authorized = isSuperAdmin(caller) or (
          isOrgAdmin(caller) and (
            switch (callerOrgId) {
              case (?oid) { oid == b.orgId };
              case (null) { false };
            }
          )
        );
        if (not authorized) {
          return #err("Not authorized");
        };
        let updated : Branch = {
          id = b.id;
          orgId = b.orgId;
          name = switch (input.name) { case (?v) { v }; case (null) { b.name } };
          location = switch (input.location) { case (?v) { v }; case (null) { b.location } };
          siteUrl = switch (input.siteUrl) { case (?v) { ?v }; case (null) { b.siteUrl } };
          phone = switch (input.phone) { case (?v) { ?v }; case (null) { b.phone } };
          timezone = switch (input.timezone) { case (?v) { v }; case (null) { b.timezone } };
          primaryLanguage = switch (input.primaryLanguage) { case (?v) { v }; case (null) { b.primaryLanguage } };
          subWalletEnabled = switch (input.subWalletEnabled) { case (?v) { v }; case (null) { b.subWalletEnabled } };
          managerId = switch (input.managerId) { case (?v) { ?v }; case (null) { b.managerId } };
          isActive = switch (input.isActive) { case (?v) { v }; case (null) { b.isActive } };
          createdAt = b.createdAt;
        };
        branches.remove(id);
        branches.add(id, updated);
        #ok(updated);
      };
    };
  };

  public shared ({ caller }) func deactivateBranch(id : Text) : async {
    #ok : Branch;
    #err : Text;
  } {
    switch (branches.get(id)) {
      case (null) { #err("Branch not found") };
      case (?b) {
        let callerOrgId = getCallerOrgId(caller);
        let authorized = isSuperAdmin(caller) or (
          isOrgAdmin(caller) and (
            switch (callerOrgId) {
              case (?oid) { oid == b.orgId };
              case (null) { false };
            }
          )
        );
        if (not authorized) {
          return #err("Not authorized");
        };
        let updated : Branch = {
          id = b.id;
          orgId = b.orgId;
          name = b.name;
          location = b.location;
          siteUrl = b.siteUrl;
          phone = b.phone;
          timezone = b.timezone;
          primaryLanguage = b.primaryLanguage;
          subWalletEnabled = b.subWalletEnabled;
          managerId = b.managerId;
          isActive = false;
          createdAt = b.createdAt;
        };
        branches.remove(id);
        branches.add(id, updated);
        #ok(updated);
      };
    };
  };

  // ── Team Management APIs ──────────────────────────────────

  public shared func getTeamMembersByOrg(orgId : Text) : async [User] {
    let all = users.values().toArray();
    let filtered = all.filter(func(u : User) : Bool {
      switch (u.orgId) {
        case (?oid) { oid == orgId };
        case (null) { false };
      };
    });
    filtered.sort();
  };

  public shared ({ caller }) func updateUserRole(targetPrincipal : Principal.Principal, newRole : Role) : async {
    #ok : User;
    #err : Text;
  } {
    let promotingToSuperAdmin = switch (newRole) {
      case (#super_admin) { true };
      case (_) { false };
    };
    if (promotingToSuperAdmin and not isSuperAdmin(caller)) {
      return #err("Only super_admin can grant super_admin role");
    };
    switch (users.get(targetPrincipal)) {
      case (null) { #err("User not found") };
      case (?target) {
        let callerOrgId = getCallerOrgId(caller);
        let sameOrg = switch (callerOrgId) {
          case (?oid) {
            switch (target.orgId) {
              case (?toid) { oid == toid };
              case (null) { false };
            };
          };
          case (null) { false };
        };
        let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and sameOrg);
        if (not authorized) {
          return #err("Not authorized");
        };
        let updated : User = {
          principal = target.principal;
          role = newRole;
          orgId = target.orgId;
          branchId = target.branchId;
          displayName = target.displayName;
          email = target.email;
          preferredLanguage = target.preferredLanguage;
          isActive = target.isActive;
          createdAt = target.createdAt;
          lastLoginAt = target.lastLoginAt;
          avatarUrl = target.avatarUrl;
          stripeCustomerId = target.stripeCustomerId;
        };
        users.remove(targetPrincipal);
        users.add(targetPrincipal, updated);
        #ok(updated);
      };
    };
  };

  public shared ({ caller }) func removeUserFromOrg(targetPrincipal : Principal.Principal) : async {
    #ok : User;
    #err : Text;
  } {
    switch (users.get(targetPrincipal)) {
      case (null) { #err("User not found") };
      case (?target) {
        let callerOrgId = getCallerOrgId(caller);
        let sameOrg = switch (callerOrgId) {
          case (?oid) {
            switch (target.orgId) {
              case (?toid) { oid == toid };
              case (null) { false };
            };
          };
          case (null) { false };
        };
        let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and sameOrg);
        if (not authorized) {
          return #err("Not authorized");
        };
        let updated : User = {
          principal = target.principal;
          role = target.role;
          orgId = null;
          branchId = null;
          displayName = target.displayName;
          email = target.email;
          preferredLanguage = target.preferredLanguage;
          isActive = target.isActive;
          createdAt = target.createdAt;
          lastLoginAt = target.lastLoginAt;
          avatarUrl = target.avatarUrl;
          stripeCustomerId = target.stripeCustomerId;
        };
        users.remove(targetPrincipal);
        users.add(targetPrincipal, updated);
        #ok(updated);
      };
    };
  };

  // ── User APIs ─────────────────────────────────────────────

  public shared func registerUser(input : UserInput) : async {
    #ok : User;
    #err : Text;
  } {
    if (users.containsKey(input.principal)) {
      return #err("User already exists");
    };
    if (isEmailTaken(input.email, null)) {
      return #err("Email already in use by another account. If this is your email, you can still continue - Internet Identity is your unique login.");
    };
    // Note: registerUser creates a free-tier user with no org yet, no limit enforced here.
    // Limit enforcement for org-scoped users happens at invite redemption.
    let newUser = {
      principal = input.principal;
      role = #team_member;
      orgId = null;
      branchId = null;
      displayName = input.displayName;
      email = input.email;
      preferredLanguage = input.preferredLanguage;
      isActive = true;
      createdAt = Time.now();
      lastLoginAt = ?Time.now();
      avatarUrl = null;
      stripeCustomerId = null;
    };
    users.add(input.principal, newUser);
    #ok(newUser);
  };

  public shared ({ caller }) func updateMyProfile(input : UpdateProfileInput) : async {
    #ok : User;
    #err : Text;
  } {
    switch (users.get(caller)) {
      case (null) { #err("User not found") };
      case (?existing) {
        let updated = {
          principal = existing.principal;
          role = existing.role;
          orgId = existing.orgId;
          branchId = existing.branchId;
          displayName = input.displayName;
          email = input.email;
          preferredLanguage = input.preferredLanguage;
          isActive = existing.isActive;
          createdAt = existing.createdAt;
          lastLoginAt = existing.lastLoginAt;
          avatarUrl = input.avatarUrl;
          stripeCustomerId = existing.stripeCustomerId;
        };
        users.remove(caller);
        users.add(caller, updated);
        #ok(updated);
      };
    };
  };

  public shared ({ caller }) func updateLastLogin() : async () {
    switch (users.get(caller)) {
      case (null) { () };
      case (?existing) {
        let updated = {
          principal = existing.principal;
          role = existing.role;
          orgId = existing.orgId;
          branchId = existing.branchId;
          displayName = existing.displayName;
          email = existing.email;
          preferredLanguage = existing.preferredLanguage;
          isActive = existing.isActive;
          createdAt = existing.createdAt;
          lastLoginAt = ?Time.now();
          avatarUrl = existing.avatarUrl;
          stripeCustomerId = existing.stripeCustomerId;
        };
        users.remove(caller);
        users.add(caller, updated);
      };
    };
  };

  public shared func getUserById(principal : Principal.Principal) : async User {
    switch (users.get(principal)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };
  };

  public query ({ caller }) func isRegistered() : async Bool {
    users.containsKey(caller);
  };

  public shared ({ caller }) func getMyProfile() : async User {
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  public query func getAllUsers() : async [User] {
    users.values().toArray().sort();
  };

  public query func getAllUsersByEmail() : async [User] {
    users.values().toArray().sort(User.compareByEmail);
  };

  // ── Invite Link APIs ──────────────────────────────────────

  public shared ({ caller }) func createInviteLink(input : CreateInviteLinkInput) : async {
    #ok : InviteLink;
    #err : Text;
  } {
    let idNum = nextInviteId;
    nextInviteId += 1;
    let idText = idNum.toText();
    let ts = Time.now();
    let tsAbs : Nat = if (ts >= 0) { Int.abs(ts) % 1000000 } else { 0 };
    let code = "INV" # idText # tsAbs.toText();
    let newLink : InviteLink = {
      id = idText;
      code = code;
      orgId = input.orgId;
      createdBy = caller;
      role = input.role;
      maxRedemptions = input.maxRedemptions;
      redemptionCount = 0;
      expiresAt = input.expiresAt;
      isActive = true;
      createdAt = Time.now();
    };
    inviteLinks.add(idText, newLink);
    inviteLinksByCode.add(code, idText);
    let inviteOrgId = switch (input.orgId) { case (?oid) { oid }; case null { "platform" } };
    _recordActivity(#userInvited, inviteOrgId, caller, ?idText, null, "Invite link created for role access");
    #ok(newLink);
  };

  public query func getInviteLinkByCode(code : Text) : async {
    #ok : InviteLink;
    #err : Text;
  } {
    switch (inviteLinksByCode.get(code)) {
      case (null) { #err("Invite code not found") };
      case (?id) {
        switch (inviteLinks.get(id)) {
          case (null) { #err("Invite link not found") };
          case (?link) {
            if (not link.isActive) { return #err("Invite link is no longer active") };
            switch (link.expiresAt) {
              case (?exp) {
                if (Time.now() > exp) { return #err("Invite link has expired") };
              };
              case (null) {};
            };
            switch (link.maxRedemptions) {
              case (?max) {
                if (link.redemptionCount >= max) { return #err("Invite link has reached its redemption limit") };
              };
              case (null) {};
            };
            #ok(link);
          };
        };
      };
    };
  };

  public query ({ caller }) func getMyInviteLinks() : async [InviteLink] {
    let all = inviteLinks.values().toArray();
    let filtered = all.filter(func(link : InviteLink) : Bool {
      link.createdBy.equal(caller);
    });
    filtered.sort();
  };

  public query func getAllInviteLinks() : async [InviteLink] {
    inviteLinks.values().toArray().sort();
  };

  public shared func redeemInviteLink(code : Text, input : UserInput) : async {
    #ok : User;
    #err : Text;
  } {
    switch (inviteLinksByCode.get(code)) {
      case (null) { return #err("Invite code not found") };
      case (?id) {
        switch (inviteLinks.get(id)) {
          case (null) { return #err("Invite link not found") };
          case (?link) {
            if (not link.isActive) { return #err("Invite link is no longer active") };
            switch (link.expiresAt) {
              case (?exp) {
                if (Time.now() > exp) { return #err("Invite link has expired") };
              };
              case (null) {};
            };
            switch (link.maxRedemptions) {
              case (?max) {
                if (link.redemptionCount >= max) { return #err("Invite link has reached its redemption limit") };
              };
              case (null) {};
            };
            if (users.containsKey(input.principal)) {
              return #err("User already registered");
            };
            if (isEmailTaken(input.email, null)) {
              return #err("Email already in use by another account. If this is your email, you can still continue - Internet Identity is your unique login.");
            };
            // Plan limit check for org-scoped user count
            switch (link.orgId) {
              case (?linkOrgId) {
                let userLimits = _getOrgLimits(linkOrgId);
                let orgUserCount = users.values().toArray().filter(func(u : User) : Bool {
                  switch (u.orgId) { case (?uid) { uid == linkOrgId }; case null { false } };
                }).size();
                if (orgUserCount >= userLimits.maxUsers) {
                  return #err("Plan limit reached: this organization cannot add more users (limit: " # userLimits.maxUsers.toText() # "). Contact the org admin to upgrade.");
                };
              };
              case null {};
            };
            let newUser : User = {
              principal = input.principal;
              role = link.role;
              orgId = link.orgId;
              branchId = null;
              displayName = input.displayName;
              email = input.email;
              preferredLanguage = input.preferredLanguage;
              isActive = true;
              createdAt = Time.now();
              lastLoginAt = ?Time.now();
              avatarUrl = null;
              stripeCustomerId = null;
            };
            users.add(input.principal, newUser);
            let joinOrgId = switch (link.orgId) { case (?oid) { oid }; case null { "platform" } };
            _recordActivity(#userJoined, joinOrgId, input.principal, null, ?input.displayName, input.displayName # " joined via invite link");
            // Notify invite creator
            _sendNotification(link.createdBy, joinOrgId, #inviteRedeemed, "Invite Accepted", input.displayName # " has joined your organization via invite link.", null);
            // Webhook outcall
            ignore _triggerWebhook(joinOrgId, "user.joined", "{\"userId\":\"" # input.principal.toText() # "\",\"displayName\":\"" # input.displayName # "\"}");
            let updatedCount = link.redemptionCount + 1;
            let shouldDeactivate = switch (link.maxRedemptions) {
              case (?max) { updatedCount >= max };
              case (null) { false };
            };
            let updatedLink : InviteLink = {
              id = link.id;
              code = link.code;
              orgId = link.orgId;
              createdBy = link.createdBy;
              role = link.role;
              maxRedemptions = link.maxRedemptions;
              redemptionCount = updatedCount;
              expiresAt = link.expiresAt;
              isActive = if (shouldDeactivate) { false } else { link.isActive };
              createdAt = link.createdAt;
            };
            inviteLinks.remove(id);
            inviteLinks.add(id, updatedLink);
            #ok(newUser);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deactivateInviteLink(id : Text) : async {
    #ok : InviteLink;
    #err : Text;
  } {
    switch (inviteLinks.get(id)) {
      case (null) { #err("Invite link not found") };
      case (?link) {
        let isOwner = link.createdBy.equal(caller);
        if (not isOwner and not isSuperAdmin(caller)) {
          return #err("Not authorized");
        };
        let updated : InviteLink = {
          id = link.id;
          code = link.code;
          orgId = link.orgId;
          createdBy = link.createdBy;
          role = link.role;
          maxRedemptions = link.maxRedemptions;
          redemptionCount = link.redemptionCount;
          expiresAt = link.expiresAt;
          isActive = false;
          createdAt = link.createdAt;
        };
        inviteLinks.remove(id);
        inviteLinks.add(id, updated);
        #ok(updated);
      };
    };
  };

  // ── Lead APIs ─────────────────────────────────────────────

  public shared func submitLead(input : LeadInput) : async {
    #ok : Lead;
    #err : Text;
  } {
    let idNum = nextLeadId;
    nextLeadId += 1;
    let idText = "LEAD" # idNum.toText();
    let newLead : Lead = {
      id = idText;
      name = input.name;
      email = input.email;
      interest = input.interest;
      orgName = input.orgName;
      preferredLanguage = input.preferredLanguage;
      createdAt = Time.now();
      source = input.source;
    };
    leads.add(idText, newLead);
    #ok(newLead);
  };

  public shared ({ caller }) func getAllLeads() : async {
    #ok : [Lead];
    #err : Text;
  } {
    if (not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    let all = leads.values().toArray();
    #ok(all.sort(Lead.compareByCreatedAt));
  };

  // ── Wallet & ICP Token Management ─────────────────────────

  public shared ({ caller }) func createWallet(input : WalletInput) : async {
    #ok : WalletAccount;
    #err : Text;
  } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    // Plan limit check
    let walletOrgId = switch (getCallerOrgId(caller)) {
      case (?oid) { oid };
      case null   { if (isSuperAdmin(caller)) { input.orgId } else { return #err("No organization found") } };
    };
    let walletLimits = _getOrgLimits(walletOrgId);
    let existingWallets = wallets.values().toArray().filter(func(w : WalletAccount) : Bool { w.orgId == walletOrgId });
    if (existingWallets.size() >= walletLimits.maxWallets) {
      return #err("Plan limit reached: upgrade your plan to add more wallets (limit: " # walletLimits.maxWallets.toText() # ")");
    };
    let id = "WALLET" # nextWalletId.toText();
    nextWalletId += 1;
    let newWallet = {
      id = id;
      ownerId = caller;
      orgId = input.orgId;
      branchId = input.branchId;
      accountType = input.accountType;
      name = input.name;
      currency = "ICP";
      balanceE8s = 0;
      isActive = true;
      createdAt = Time.now();
    };
    wallets.add(id, newWallet);
    _recordActivity(#walletCreated, input.orgId, caller, ?id, ?input.name, "Wallet \"" # input.name # "\" was created");
    #ok(newWallet);
  };

  public query ({ caller }) func getMyWallets() : async [WalletAccount] {
    wallets.values().toArray().filter(
      func(w) { w.ownerId.equal(caller) }
    );
  };

  public shared ({ caller }) func getWalletsByOrg(orgId : Text) : async {
    #ok : [WalletAccount];
    #err : Text;
  } {
    let authorized = isOrgAdmin(caller) or isSuperAdmin(caller);
    if (not authorized) {
      return #err("Not authorized");
    };
    #ok(wallets.values().toArray().filter(
      func(w) { w.orgId == orgId }
    ));
  };

  public shared ({ caller }) func transferICP(fromWalletId : Text, toWalletId : Text, amountE8s : Nat, description : Text) : async {
    #ok : Transaction;
    #err : Text;
  } {
    func getWallet(id : Text, errMsg : Text) : WalletAccount {
      switch (wallets.get(id)) {
        case (null) { Runtime.trap(errMsg) };
        case (?wallet) { wallet };
      };
    };

    let fromWallet = getWallet(fromWalletId, "From wallet not found");
    let toWallet = getWallet(toWalletId, "To wallet not found");

    let authorized = fromWallet.ownerId.equal(caller) or (
      isOrgAdmin(caller) and fromWallet.orgId == toWallet.orgId
    );

    if (not authorized) {
      return #err("Not authorized");
    };

    if (fromWallet.balanceE8s < amountE8s) {
      return #err("Insufficient balance");
    };

    let updatedFrom = {
      id = fromWallet.id;
      ownerId = fromWallet.ownerId;
      orgId = fromWallet.orgId;
      branchId = fromWallet.branchId;
      accountType = fromWallet.accountType;
      name = fromWallet.name;
      currency = fromWallet.currency;
      balanceE8s = if (fromWallet.balanceE8s >= amountE8s) { Nat.sub(fromWallet.balanceE8s, amountE8s) } else { 0 };
      isActive = fromWallet.isActive;
      createdAt = fromWallet.createdAt;
    };

    let updatedTo = {
      id = toWallet.id;
      ownerId = toWallet.ownerId;
      orgId = toWallet.orgId;
      branchId = toWallet.branchId;
      accountType = toWallet.accountType;
      name = toWallet.name;
      currency = toWallet.currency;
      balanceE8s = toWallet.balanceE8s + amountE8s;
      isActive = toWallet.isActive;
      createdAt = toWallet.createdAt;
    };

    wallets.remove(fromWalletId);
    wallets.add(fromWalletId, updatedFrom);
    wallets.remove(toWalletId);
    wallets.add(toWalletId, updatedTo);

    let txId = "TX" # nextTxId.toText();
    nextTxId += 1;
    let transaction : Transaction = {
      id = txId;
      fromWalletId = fromWalletId;
      toWalletId = toWalletId;
      amountE8s = amountE8s;
      description = description;
      txType = #transfer;
      status = #completed;
      createdAt = Time.now();
      initiatedBy = caller;
    };
    transactions.add(txId, transaction);
    #ok(transaction);
  };

  public shared ({ caller }) func depositToWallet(walletId : Text, amountE8s : Nat, description : Text) : async {
    #ok : Transaction;
    #err : Text;
  } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    switch (wallets.get(walletId)) {
      case (null) { #err("Wallet not found") };
      case (?wallet) {
        let updated : WalletAccount = {
          id = wallet.id;
          ownerId = wallet.ownerId;
          orgId = wallet.orgId;
          branchId = wallet.branchId;
          accountType = wallet.accountType;
          name = wallet.name;
          currency = wallet.currency;
          balanceE8s = wallet.balanceE8s + amountE8s;
          isActive = wallet.isActive;
          createdAt = wallet.createdAt;
        };
        wallets.remove(walletId);
        wallets.add(walletId, updated);

        let txId = "TX" # nextTxId.toText();
        nextTxId += 1;
        let transaction : Transaction = {
          id = txId;
          fromWalletId = walletId;
          toWalletId = walletId;
          amountE8s = amountE8s;
          description = description;
          txType = #deposit;
          status = #completed;
          createdAt = Time.now();
          initiatedBy = caller;
        };
        transactions.add(txId, transaction);
        #ok(transaction);
      };
    };
  };

  public shared ({ caller }) func getTransactionHistory(walletId : Text) : async {
    #ok : [Transaction];
    #err : Text;
  } {
    switch (wallets.get(walletId)) {
      case (null) { #err("Wallet not found") };
      case (?wallet) {
        let authorized = wallet.ownerId.equal(caller) or isOrgAdmin(caller);

        if (not authorized) { return #err("Not authorized") };

        let filtered = transactions.values().toArray().filter(
          func(t) { t.fromWalletId == walletId or t.toWalletId == walletId }
        );
        #ok(filtered);
      };
    };
  };

  public shared ({ caller }) func getTransactionHistoryByOrg(orgId : Text) : async {
    #ok : [Transaction];
    #err : Text;
  } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    #ok(
      transactions.values().toArray().filter(
        func(t) {
          switch (wallets.get(t.fromWalletId)) {
            case (?w) { w.orgId == orgId };
            case (null) { false };
          };
        }
      )
    );
  };
  // ── API Key Helpers ────────────────────────────────────────

  func simpleHash(s : Text) : Nat {
    var h : Nat = 5381;
    for (c in s.chars()) {
      h := h * 33 + c.toNat32().toNat();
    };
    h;
  };

  func generateKeyString(id : Nat, ts : Int) : Text {
    let base = "aak_" # id.toText() # "_" # ts.toText();
    let body = simpleHash(base).toText() # (id * 999983).toText() # "x0y1z2";
    "aak_" # Text.fromIter(body.chars().take(32));
  };

  // ── API Key APIs ───────────────────────────────────────────

  public shared ({ caller }) func generateApiKey(input : ApiKeyInput) : async {
    #ok : { apiKey : ApiKey; fullKey : Text };
    #err : Text;
  } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    let orgId = switch (getCallerOrgId(caller)) {
      case (null) {
        if (isSuperAdmin(caller)) { "system" } else {
          return #err("No organization found");
        };
      };
      case (?id) { id };
    };
    // Plan limit check
    let apiKeyLimits = _getOrgLimits(orgId);
    let existingApiKeys = apiKeys.values().toArray().filter(func(k : ApiKey) : Bool { k.orgId == orgId and k.isActive });
    if (existingApiKeys.size() >= apiKeyLimits.maxApiKeys) {
      return #err("Plan limit reached: upgrade your plan to add more API keys (limit: " # apiKeyLimits.maxApiKeys.toText() # ")");
    };
    let id = "APIKEY" # nextApiKeyId.toText();
    nextApiKeyId += 1;
    let fullKey = generateKeyString(nextApiKeyId, Time.now());
    let prefix = Text.fromIter(fullKey.chars().take(12));
    let keyHash = simpleHash(fullKey);
    let apiKey : ApiKey = {
      id = id;
      orgId = orgId;
      createdBy = caller;
      name = input.name;
      description = input.description;
      permissions = input.permissions;
      keyPrefix = prefix;
      keyHash = keyHash;
      isActive = true;
      createdAt = Time.now();
      lastUsedAt = null;
    };
    apiKeys.add(id, apiKey);
    _recordAudit("api_key.generated", caller, switch (users.get(caller)) { case (?u) { u.displayName }; case null { "System" } }, "apikey", apiKey.id, "API key generated: " # apiKey.name, ?orgId);
    #ok({ apiKey = apiKey; fullKey = fullKey });
  };

  public shared ({ caller }) func listApiKeys() : async {
    #ok : [ApiKey];
    #err : Text;
  } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    let orgId = switch (getCallerOrgId(caller)) {
      case (null) {
        if (isSuperAdmin(caller)) {
          return #ok(apiKeys.values().toArray());
        } else {
          return #err("No organization found");
        };
      };
      case (?id) { id };
    };
    #ok(
      apiKeys.values().toArray().filter(
        func(k : ApiKey) : Bool { k.orgId == orgId }
      )
    );
  };

  public shared ({ caller }) func revokeApiKey(keyId : Text) : async {
    #ok : ApiKey;
    #err : Text;
  } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    switch (apiKeys.get(keyId)) {
      case (null) { #err("API key not found") };
      case (?k) {
        let authorized = k.createdBy.equal(caller) or isSuperAdmin(caller) or
          (isOrgAdmin(caller) and (
            switch (getCallerOrgId(caller)) {
              case (?orgId) { k.orgId == orgId };
              case (null) { false };
            }
          ));
        if (not authorized) { return #err("Not authorized") };
        let revoked : ApiKey = {
          id = k.id;
          orgId = k.orgId;
          createdBy = k.createdBy;
          name = k.name;
          description = k.description;
          permissions = k.permissions;
          keyPrefix = k.keyPrefix;
          keyHash = k.keyHash;
          isActive = false;
          createdAt = k.createdAt;
          lastUsedAt = k.lastUsedAt;
        };
        apiKeys.remove(keyId);
        apiKeys.add(keyId, revoked);
        _recordAudit("api_key.revoked", caller, switch (users.get(caller)) { case (?u) { u.displayName }; case null { "System" } }, "apikey", keyId, "API key revoked: " # revoked.name, ?revoked.orgId);
        #ok(revoked);
      };
    };
  };


  // ── Agent Registry APIs ───────────────────────────────────

  public shared ({ caller }) func registerAgent(input : AgentInput) : async {
    #ok : AgentDefinition;
    #err : Text;
  } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    let orgId = switch (getCallerOrgId(caller)) {
      case (null) {
        if (isSuperAdmin(caller)) { "system" } else {
          return #err("No organization found");
        };
      };
      case (?id) { id };
    };
    // Plan limit check
    let agentLimits = _getOrgLimits(orgId);
    let existingAgents = agents.values().toArray().filter(func(a : AgentDefinition) : Bool { a.orgId == orgId });
    if (existingAgents.size() >= agentLimits.maxAgents) {
      return #err("Plan limit reached: upgrade your plan to register more agents (limit: " # agentLimits.maxAgents.toText() # ")");
    };
    let id = "AGENT" # nextAgentId.toText();
    nextAgentId += 1;
    let agent : AgentDefinition = {
      id = id;
      orgId = orgId;
      name = input.name;
      description = input.description;
      capabilities = input.capabilities;
      supportedLanguages = input.supportedLanguages;
      modelType = input.modelType;
      status = input.status;
      endpointUrl = input.endpointUrl;
      createdAt = Time.now();
      createdBy = caller;
    };
    agents.add(id, agent);
    _recordActivity(#agentRegistered, agent.orgId, caller, ?agent.id, ?agent.name, "Agent \"" # agent.name # "\" was registered");
    _recordAudit("agent.registered", caller, switch (users.get(caller)) { case (?u) { u.displayName }; case null { "System" } }, "agent", agent.id, "Agent registered: " # agent.name, ?agent.orgId);
    #ok(agent);
  };

  public shared ({ caller }) func updateAgent(id : Text, input : AgentUpdateInput) : async {
    #ok : AgentDefinition;
    #err : Text;
  } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    switch (agents.get(id)) {
      case (null) { #err("Agent not found") };
      case (?agent) {
        let authorized = isSuperAdmin(caller) or (
          isOrgAdmin(caller) and (
            switch (getCallerOrgId(caller)) {
              case (?orgId) { agent.orgId == orgId };
              case (null) { false };
            }
          )
        );
        if (not authorized) { return #err("Not authorized") };
        let updated : AgentDefinition = {
          id = agent.id;
          orgId = agent.orgId;
          name = switch (input.name) { case (?v) { v }; case (null) { agent.name } };
          description = switch (input.description) { case (?v) { v }; case (null) { agent.description } };
          capabilities = switch (input.capabilities) { case (?v) { v }; case (null) { agent.capabilities } };
          supportedLanguages = switch (input.supportedLanguages) { case (?v) { v }; case (null) { agent.supportedLanguages } };
          modelType = switch (input.modelType) { case (?v) { v }; case (null) { agent.modelType } };
          status = switch (input.status) { case (?v) { v }; case (null) { agent.status } };
          endpointUrl = switch (input.endpointUrl) { case (?v) { ?v }; case (null) { agent.endpointUrl } };
          createdAt = agent.createdAt;
          createdBy = agent.createdBy;
        };
        agents.remove(id);
        agents.add(id, updated);
        #ok(updated);
      };
    };
  };

  public shared ({ caller }) func deactivateAgent(id : Text) : async {
    #ok : AgentDefinition;
    #err : Text;
  } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    switch (agents.get(id)) {
      case (null) { #err("Agent not found") };
      case (?agent) {
        let authorized = isSuperAdmin(caller) or (
          isOrgAdmin(caller) and (
            switch (getCallerOrgId(caller)) {
              case (?orgId) { agent.orgId == orgId };
              case (null) { false };
            }
          )
        );
        if (not authorized) { return #err("Not authorized") };
        let deactivated : AgentDefinition = {
          id = agent.id;
          orgId = agent.orgId;
          name = agent.name;
          description = agent.description;
          capabilities = agent.capabilities;
          supportedLanguages = agent.supportedLanguages;
          modelType = agent.modelType;
          status = #inactive;
          endpointUrl = agent.endpointUrl;
          createdAt = agent.createdAt;
          createdBy = agent.createdBy;
        };
        agents.remove(id);
        agents.add(id, deactivated);
        _recordActivity(#agentDeactivated, deactivated.orgId, caller, ?deactivated.id, ?deactivated.name, "Agent \"" # deactivated.name # "\" was deactivated");
        _recordAudit("agent.deactivated", caller, switch (users.get(caller)) { case (?u) { u.displayName }; case null { "System" } }, "agent", deactivated.id, "Agent deactivated: " # deactivated.name, ?deactivated.orgId);
        // Notify all org_admins in the same org (except caller)
        for ((_, u) in users.entries()) {
          if (u.role == #org_admin and u.orgId == ?deactivated.orgId and not u.principal.equal(caller)) {
            _sendNotification(u.principal, deactivated.orgId, #agentDeactivated, "Agent Deactivated", "Agent \"" # deactivated.name # "\" has been deactivated.", ?deactivated.id);
          };
        };
        // Webhook outcall
        ignore _triggerWebhook(deactivated.orgId, "agent.deactivated", "{\"agentId\":\"" # deactivated.id # "\",\"name\":\"" # deactivated.name # "\"}");
        #ok(deactivated);
      };
    };
  };

  public shared ({ caller }) func getAgentsByOrg(orgId : Text) : async {
    #ok : [AgentDefinition];
    #err : Text;
  } {
    let callerIsRegistered = switch (users.get(caller)) { case (null) { false }; case (?_) { true } };
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller) and not callerIsRegistered) {
      return #err("Not authorized");
    };
    #ok(
      agents.values().toArray().filter(
        func(a : AgentDefinition) : Bool { a.orgId == orgId }
      )
    );
  };

  public shared ({ caller }) func getAgentById(id : Text) : async {
    #ok : AgentDefinition;
    #err : Text;
  } {
    let callerIsRegisteredById = switch (users.get(caller)) { case (null) { false }; case (?_) { true } };
    if (not callerIsRegisteredById) {
      return #err("Not authorized");
    };
    switch (agents.get(id)) {
      case (null) { #err("Agent not found") };
      case (?agent) { #ok(agent) };
    };
  };

  // ── Task Management APIs ──────────────────────────────────

  public shared ({ caller }) func createTask(input : TaskInput) : async {
    #ok : Task;
    #err : Text;
  } {
    if (not isRegisteredUser(caller)) {
      return #err("Not authorized");
    };
    let orgId = switch (getCallerOrgId(caller)) {
      case (null) {
        if (isSuperAdmin(caller)) { "system" } else {
          return #err("No organization found — join or create an org first");
        };
      };
      case (?id) { id };
    };
    let id = "TASK" # nextTaskId.toText();
    nextTaskId += 1;
    let now = Time.now();
    let task : Task = {
      id = id;
      orgId = orgId;
      createdBy = caller;
      assignedAgentId = input.assignedAgentId;
      assignedTo = input.assignedTo;
      title = input.title;
      description = input.description;
      status = #pending;
      priority = input.priority;
      language = input.language;
      tags = input.tags;
      inputData = input.inputData;
      outputData = null;
      createdAt = now;
      updatedAt = now;
    };
    tasks.add(id, task);
    _recordActivity(#taskCreated, task.orgId, caller, ?task.id, ?task.title, "Task \"" # task.title # "\" was created");
    #ok(task);
  };

  public shared ({ caller }) func updateTask(id : Text, input : TaskUpdateInput) : async {
    #ok : Task;
    #err : Text;
  } {
    switch (tasks.get(id)) {
      case (null) { #err("Task not found") };
      case (?task) {
        let isCreator = task.createdBy.equal(caller);
        let callerOrgId = getCallerOrgId(caller);
        let sameOrg = switch (callerOrgId) {
          case (?oid) { oid == task.orgId };
          case (null) { false };
        };
        let authorized = isCreator or isSuperAdmin(caller) or (isOrgAdmin(caller) and sameOrg);
        if (not authorized) { return #err("Not authorized") };
        let updated : Task = {
          id = task.id;
          orgId = task.orgId;
          createdBy = task.createdBy;
          assignedAgentId = switch (input.assignedAgentId) { case (?v) { ?v }; case (null) { task.assignedAgentId } };
          assignedTo = switch (input.assignedTo) { case (?v) { ?v }; case (null) { task.assignedTo } };
          title = switch (input.title) { case (?v) { v }; case (null) { task.title } };
          description = switch (input.description) { case (?v) { v }; case (null) { task.description } };
          status = switch (input.status) { case (?v) { v }; case (null) { task.status } };
          priority = switch (input.priority) { case (?v) { v }; case (null) { task.priority } };
          language = switch (input.language) { case (?v) { v }; case (null) { task.language } };
          tags = switch (input.tags) { case (?v) { v }; case (null) { task.tags } };
          inputData = switch (input.inputData) { case (?v) { ?v }; case (null) { task.inputData } };
          outputData = switch (input.outputData) { case (?v) { ?v }; case (null) { task.outputData } };
          createdAt = task.createdAt;
          updatedAt = Time.now();
        };
        tasks.remove(id);
        tasks.add(id, updated);
        #ok(updated);
      };
    };
  };

  public shared ({ caller }) func updateTaskStatus(id : Text, newStatus : TaskStatus) : async {
    #ok : Task;
    #err : Text;
  } {
    switch (tasks.get(id)) {
      case (null) { #err("Task not found") };
      case (?task) {
        let isCreator = task.createdBy.equal(caller);
        let isAssignee = switch (task.assignedTo) {
          case (?p) { p.equal(caller) };
          case (null) { false };
        };
        let callerOrgId = getCallerOrgId(caller);
        let sameOrg = switch (callerOrgId) {
          case (?oid) { oid == task.orgId };
          case (null) { false };
        };
        let authorized = isCreator or isAssignee or isSuperAdmin(caller) or (isOrgAdmin(caller) and sameOrg);
        if (not authorized) { return #err("Not authorized") };
        let updated : Task = {
          id = task.id;
          orgId = task.orgId;
          createdBy = task.createdBy;
          assignedAgentId = task.assignedAgentId;
          assignedTo = task.assignedTo;
          title = task.title;
          description = task.description;
          status = newStatus;
          priority = task.priority;
          language = task.language;
          tags = task.tags;
          inputData = task.inputData;
          outputData = task.outputData;
          createdAt = task.createdAt;
          updatedAt = Time.now();
        };
        tasks.remove(id);
        tasks.add(id, updated);
        switch (newStatus) {
          case (#completed) {
            _recordActivity(#taskCompleted, task.orgId, caller, ?task.id, ?task.title, "Task \"" # task.title # "\" was completed");
            // Notify task creator if different from caller
            if (not task.createdBy.equal(caller)) {
              _sendNotification(task.createdBy, task.orgId, #taskStatusChanged, "Task Completed", "Your task \"" # task.title # "\" has been marked complete.", ?task.id);
            };
            // Webhook outcall
            ignore _triggerWebhook(task.orgId, "task.completed", "{\"taskId\":\"" # task.id # "\",\"title\":\"" # task.title # "\",\"status\":\"completed\"}");
          };
          case (#failed) {
            _recordActivity(#taskFailed, task.orgId, caller, ?task.id, ?task.title, "Task \"" # task.title # "\" failed");
            // Notify task creator if different from caller
            if (not task.createdBy.equal(caller)) {
              _sendNotification(task.createdBy, task.orgId, #taskStatusChanged, "Task Failed", "Your task \"" # task.title # "\" has been marked as failed.", ?task.id);
            };
            // Webhook outcall
            ignore _triggerWebhook(task.orgId, "task.failed", "{\"taskId\":\"" # task.id # "\",\"title\":\"" # task.title # "\",\"status\":\"failed\"}");
          };
          case (_) {};
        };
        _recordAudit("task.status_updated", caller, switch (users.get(caller)) { case (?u) { u.displayName }; case null { "System" } }, "task", id, "Task status updated to " # debug_show(newStatus), ?task.orgId);
        #ok(updated);
      };
    };
  };

  public shared ({ caller }) func assignTaskToAgent(taskId : Text, agentId : Text) : async {
    #ok : Task;
    #err : Text;
  } {
    switch (tasks.get(taskId)) {
      case (null) { #err("Task not found") };
      case (?task) {
        let isCreator = task.createdBy.equal(caller);
        let callerOrgId = getCallerOrgId(caller);
        let sameOrg = switch (callerOrgId) {
          case (?oid) { oid == task.orgId };
          case (null) { false };
        };
        let authorized = isCreator or isSuperAdmin(caller) or (isOrgAdmin(caller) and sameOrg);
        if (not authorized) { return #err("Not authorized") };
        // Verify agent exists
        switch (agents.get(agentId)) {
          case (null) { return #err("Agent not found") };
          case (?_) {};
        };
        let updated : Task = {
          id = task.id;
          orgId = task.orgId;
          createdBy = task.createdBy;
          assignedAgentId = ?agentId;
          assignedTo = task.assignedTo;
          title = task.title;
          description = task.description;
          status = task.status;
          priority = task.priority;
          language = task.language;
          tags = task.tags;
          inputData = task.inputData;
          outputData = task.outputData;
          createdAt = task.createdAt;
          updatedAt = Time.now();
        };
        tasks.remove(taskId);
        tasks.add(taskId, updated);
        #ok(updated);
      };
    };
  };

  public shared ({ caller }) func getTasksByOrg(orgId : Text) : async {
    #ok : [Task];
    #err : Text;
  } {
    let callerOrgId = getCallerOrgId(caller);
    let sameOrg = switch (callerOrgId) {
      case (?oid) { oid == orgId };
      case (null) { false };
    };
    let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and sameOrg);
    if (not authorized) { return #err("Not authorized") };
    let filtered = tasks.values().toArray().filter(
      func(t : Task) : Bool { t.orgId == orgId }
    );
    #ok(filtered.sort(Task.compareByCreatedAt));
  };

  public shared ({ caller }) func getMyTasks() : async {
    #ok : [Task];
    #err : Text;
  } {
    if (not isRegisteredUser(caller)) {
      return #err("Not authorized");
    };
    let filtered = tasks.values().toArray().filter(
      func(t : Task) : Bool {
        let isCreator = t.createdBy.equal(caller);
        let isAssignee = switch (t.assignedTo) {
          case (?p) { p.equal(caller) };
          case (null) { false };
        };
        isCreator or isAssignee;
      }
    );
    #ok(filtered.sort(Task.compareByCreatedAt));
  };

  public shared ({ caller }) func getTasksByAgent(agentId : Text) : async {
    #ok : [Task];
    #err : Text;
  } {
    if (not isRegisteredUser(caller)) {
      return #err("Not authorized");
    };
    let filtered = tasks.values().toArray().filter(
      func(t : Task) : Bool {
        switch (t.assignedAgentId) {
          case (?aid) { aid == agentId };
          case (null) { false };
        };
      }
    );
    #ok(filtered.sort(Task.compareByCreatedAt));
  };

  public shared ({ caller }) func getConversationHistory(agentId : Text) : async {
    #ok : [ConversationMessage];
    #err : Text;
  } {
    if (not isRegisteredUser(caller)) {
      return #err("Not authorized");
    };
    let callerOrgId = getCallerOrgId(caller);
    let orgId = switch (callerOrgId) {
      case (?oid) { oid };
      case (null) { return #err("User has no organization") };
    };
    // Lookup conversation by agentId + userId composite key
    let convKey = agentId # ":" # caller.toText();
    switch (conversations.get(convKey)) {
      case (?conv) { #ok(conv.messages) };
      case (null) {
        // Create empty conversation record
        let id = "CONV" # nextConversationId.toText();
        nextConversationId += 1;
        let newConv : Conversation = {
          id = id;
          agentId = agentId;
          userId = caller;
          orgId = orgId;
          messages = [];
          createdAt = Time.now();
          lastMessageAt = Time.now();
        };
        conversations.add(convKey, newConv);
        #ok([]);
      };
    };
  };



  // HTTP outcall transform (required by ICP — strips non-deterministic headers)
  public query func transformHttpResponse(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Extract a JSON string field value from a simple flat JSON object.
  // e.g. extractJsonStringField(`{"reply":"Hello"}`, "reply") => ?"Hello"
  func extractJsonStringField(json : Text, fieldName : Text) : ?Text {
    let needle = "\"" # fieldName # "\":\"";
    let parts = json.split(#text needle).toArray();
    if (parts.size() < 2) { return null };
    let afterKey = parts[1];
    let valueParts = afterKey.split(#text "\"").toArray();
    if (valueParts.size() < 1) { return null };
    ?valueParts[0];
  };

  // Send a message to an agent via HTTP outcall (generic REST POST {"message":"..."})
  // and persist both the user message and agent reply in the conversation.
  public shared ({ caller }) func sendAgentMessage(agentId : Text, userMessage : Text) : async {
    #ok : [ConversationMessage];
    #err : Text;
  } {
    if (not isRegisteredUser(caller)) {
      return #err("Not authorized");
    };
    let callerOrgId = getCallerOrgId(caller);
    let orgId = switch (callerOrgId) {
      case (?oid) { oid };
      case (null) { return #err("User has no organization") };
    };

    // Lookup agent
    let agent = switch (agents.get(agentId)) {
      case (?a) { a };
      case (null) { return #err("Agent not found") };
    };

    let convKey = agentId # ":" # caller.toText();

    // Get or create the conversation
    let existingConv : Conversation = switch (conversations.get(convKey)) {
      case (?c) { c };
      case (null) {
        let id = "CONV" # nextConversationId.toText();
        nextConversationId += 1;
        let newConv : Conversation = {
          id = id;
          agentId = agentId;
          userId = caller;
          orgId = orgId;
          messages = [];
          createdAt = Time.now();
          lastMessageAt = Time.now();
        };
        conversations.add(convKey, newConv);
        newConv;
      };
    };

    // Record the user message
    let userMsgId = "MSG" # _nextMessageId.toText();
    _nextMessageId += 1;
    let userMsg : ConversationMessage = {
      id = userMsgId;
      agentId = agentId;
      orgId = orgId;
      senderId = caller;
      senderRole = #user;
      content = userMessage;
      timestamp = Time.now();
      isError = false;
    };

    // Call agent endpoint or return fallback
    let agentMsg : ConversationMessage = switch (agent.endpointUrl) {
      case (null) {
        let msgId = "MSG" # _nextMessageId.toText();
        _nextMessageId += 1;
        {
          id = msgId;
          agentId = agentId;
          orgId = orgId;
          senderId = Principal.fromText("aaaaa-aa");
          senderRole = #agent;
          content = "This agent does not have an endpoint configured yet. Please ask your administrator to set up an endpoint URL.";
          timestamp = Time.now();
          isError = false;
        };
      };
      case (?url) {
        let requestBody = "{\"message\":\"" # userMessage # "\"}";
        let headers : [OutCall.Header] = [
          { name = "Content-Type"; value = "application/json" },
          { name = "Accept";       value = "application/json" },
        ];
        try {
          let rawResponse = await OutCall.httpPostRequest(url, headers, requestBody, transformHttpResponse);
          // Parse {"reply":"..."} from response; fall back to raw text on failure
          let replyContent = switch (extractJsonStringField(rawResponse, "reply")) {
            case (?v) { v };
            case (null) { rawResponse };
          };
          let msgId = "MSG" # _nextMessageId.toText();
          _nextMessageId += 1;
          {
            id = msgId;
            agentId = agentId;
            orgId = orgId;
            senderId = Principal.fromText("aaaaa-aa");
            senderRole = #agent;
            content = replyContent;
            timestamp = Time.now();
            isError = false;
          };
        } catch (_err) {
          let msgId = "MSG" # _nextMessageId.toText();
          _nextMessageId += 1;
          {
            id = msgId;
            agentId = agentId;
            orgId = orgId;
            senderId = Principal.fromText("aaaaa-aa");
            senderRole = #agent;
            content = "Failed to reach the agent endpoint. Please check the URL configuration and try again.";
            timestamp = Time.now();
            isError = true;
          };
        };
      };
    };

    // Persist updated conversation
    let updatedMessages = existingConv.messages.concat([userMsg, agentMsg]);
    let updatedConv : Conversation = {
      existingConv with
      messages = updatedMessages;
      lastMessageAt = Time.now();
    };
    conversations.add(convKey, updatedConv);
    #ok(updatedMessages);
  };



  // ─── PaaS Plan Limits Helpers ─────────────────────────────────────────────

  // Returns the resolved plan limits for a given orgId
  func _getOrgLimits(orgId : Text) : PlanLimits {
    switch (organizationsNew.get(orgId)) {
      case (?org) { _resolvedPlanLimits(org.planTier) };
      case null   { _getDefaultPlanLimits(#free) };
    };
  };

  func _getDefaultPlanLimits(tier : PlanTier) : PlanLimits {
    switch (tier) {
      case (#free)         { { maxUsers = 5;      maxBranches = 2;      maxAgents = 1;      maxApiKeys = 2;      maxWallets = 2      } };
      case (#starter)      { { maxUsers = 20;     maxBranches = 5;      maxAgents = 5;      maxApiKeys = 10;     maxWallets = 5      } };
      case (#professional) { { maxUsers = 100;    maxBranches = 20;     maxAgents = 20;     maxApiKeys = 50;     maxWallets = 20     } };
      case (#enterprise)   { { maxUsers = 999999; maxBranches = 999999; maxAgents = 999999; maxApiKeys = 999999; maxWallets = 999999 } };
    };
  };

  func _planTierKey(tier : PlanTier) : Text {
    switch (tier) {
      case (#free)         "free";
      case (#starter)      "starter";
      case (#professional) "professional";
      case (#enterprise)   "enterprise";
    };
  };

  func _resolvedPlanLimits(tier : PlanTier) : PlanLimits {
    let key = _planTierKey(tier);
    switch (planLimitsMap.get(key)) {
      case (?limits) limits;
      case null      _getDefaultPlanLimits(tier);
    };
  };

  // ─── Plan Limits APIs ─────────────────────────────────────────────────────

  public query ({ caller = _ }) func getPlanLimits(tier : PlanTier) : async PlanLimits {
    _resolvedPlanLimits(tier);
  };

  public shared ({ caller }) func setPlanLimits(tier : PlanTier, limits : PlanLimits) : async { #ok : PlanLimits; #err : Text } {
    let callerUser = switch (users.get(caller)) {
      case (?u) u;
      case null return #err("Not registered");
    };
    if (callerUser.role != #super_admin) return #err("Only super_admin can set plan limits");
    let key = _planTierKey(tier);
    planLimitsMap.add(key, limits);
    #ok(limits);
  };

  // ─── Platform Metrics API ─────────────────────────────────────────────────

  public query ({ caller }) func getPlatformMetrics() : async { #ok : PlatformMetrics; #err : Text } {
    let callerUser = switch (users.get(caller)) {
      case (?u) u;
      case null return #err("Not registered");
    };
    if (callerUser.role != #super_admin) return #err("Only super_admin can view platform metrics");

    let allOrgs = organizationsNew.values().toArray();
    let allUsers = users.values().toArray();
    let allAgents = agents.values().toArray();
    let allTasks = tasks.values().toArray();
    let allWallets = wallets.values().toArray();

    var freeCount : Nat = 0;
    var starterCount : Nat = 0;
    var proCount : Nat = 0;
    var enterpriseCount : Nat = 0;
    var activeCount : Nat = 0;

    for (org in allOrgs.vals()) {
      if (org.isActive) activeCount += 1;
      switch (org.planTier) {
        case (#free)         freeCount += 1;
        case (#starter)      starterCount += 1;
        case (#professional) proCount += 1;
        case (#enterprise)   enterpriseCount += 1;
      };
    };

    #ok({
      totalOrgs = allOrgs.size();
      totalUsers = allUsers.size();
      totalAgents = allAgents.size();
      totalTasks = allTasks.size();
      totalWallets = allWallets.size();
      activeOrgs = activeCount;
      orgsByPlan = {
        free = freeCount;
        starter = starterCount;
        professional = proCount;
        enterprise = enterpriseCount;
      };
    });
  };



  // ─── Org Domain Management ────────────────────────────────────────────────

  public shared ({ caller }) func updateOrgDomain(orgId : Text, customDomain : ?Text, customSubdomain : ?Text) : async { #ok : Organization; #err : Text } {
    let callerUser = switch (users.get(caller)) {
      case (?u) u;
      case null return #err("Not registered");
    };
    let authorized = callerUser.role == #super_admin or (
      callerUser.role == #org_admin and callerUser.orgId == ?orgId
    );
    if (not authorized) return #err("Not authorized");
    switch (organizationsNew.get(orgId)) {
      case (null) { #err("Organization not found") };
      case (?org) {
        let updated : Organization = {
          id = org.id;
          name = org.name;
          description = org.description;
          planTier = org.planTier;
          ownerId = org.ownerId;
          stripeCustomerId = org.stripeCustomerId;
          stripeSubscriptionId = org.stripeSubscriptionId;
          isActive = org.isActive;
          createdAt = org.createdAt;
          logoUrl = org.logoUrl;
          primaryLanguage = org.primaryLanguage;
          supportedLanguages = org.supportedLanguages;
          customDomain = customDomain;
          customSubdomain = customSubdomain;
        };
        organizationsNew.remove(orgId);
        organizationsNew.add(updated.id, updated);
        #ok(updated);
      };
    };
  };

  // ─── Org Plan Override ────────────────────────────────────────────────────

  public shared ({ caller }) func setOrgPlanOverride(orgId : Text, tier : PlanTier) : async { #ok : Organization; #err : Text } {
    let callerUser = switch (users.get(caller)) {
      case (?u) u;
      case null return #err("Not registered");
    };
    if (callerUser.role != #super_admin) return #err("Only super_admin can override plan tier");
    switch (organizationsNew.get(orgId)) {
      case (null) { #err("Organization not found") };
      case (?org) {
        let updated : Organization = {
          id = org.id;
          name = org.name;
          description = org.description;
          planTier = tier;
          ownerId = org.ownerId;
          stripeCustomerId = org.stripeCustomerId;
          stripeSubscriptionId = org.stripeSubscriptionId;
          isActive = org.isActive;
          createdAt = org.createdAt;
          logoUrl = org.logoUrl;
          primaryLanguage = org.primaryLanguage;
          supportedLanguages = org.supportedLanguages;
          customDomain = org.customDomain;
          customSubdomain = org.customSubdomain;
        };
        organizationsNew.remove(orgId);
        organizationsNew.add(updated.id, updated);
        #ok(updated);
      };
    };
  };

  // ─── Org Activation Toggle ────────────────────────────────────────────────

  public shared ({ caller }) func setOrgActive(orgId : Text, isActive : Bool) : async { #ok : Organization; #err : Text } {
    let callerUser = switch (users.get(caller)) {
      case (?u) u;
      case null return #err("Not registered");
    };
    if (callerUser.role != #super_admin) return #err("Only super_admin can activate/deactivate tenants");
    switch (organizationsNew.get(orgId)) {
      case (null) { #err("Organization not found") };
      case (?org) {
        let updated : Organization = {
          id = org.id;
          name = org.name;
          description = org.description;
          planTier = org.planTier;
          ownerId = org.ownerId;
          stripeCustomerId = org.stripeCustomerId;
          stripeSubscriptionId = org.stripeSubscriptionId;
          isActive = isActive;
          createdAt = org.createdAt;
          logoUrl = org.logoUrl;
          primaryLanguage = org.primaryLanguage;
          supportedLanguages = org.supportedLanguages;
          customDomain = org.customDomain;
          customSubdomain = org.customSubdomain;
        };
        organizationsNew.remove(orgId);
        organizationsNew.add(updated.id, updated);
        _recordAudit(if (isActive) { "organization.activated" } else { "organization.deactivated" }, caller, callerUser.displayName, "org", orgId, if (isActive) { "Org activated" } else { "Org deactivated" }, ?orgId);
        #ok(updated);
      };
    };
  };


  // ─── Notification Internal Helper ────────────────────────────────────────

  func _sendNotification(
    userId : Principal.Principal,
    orgId : Text,
    notifType : NotificationType,
    title : Text,
    message : Text,
    relatedId : ?Text,
  ) {
    let nid = "NOTIF" # _nextNotificationId.toText();
    _nextNotificationId += 1;
    let notif : Notification = {
      id = nid;
      userId = userId;
      orgId = orgId;
      notificationType = notifType;
      title = title;
      message = message;
      isRead = false;
      createdAt = Time.now();
      relatedId = relatedId;
    };
    notifications.add(nid, notif);
  };

  // ─── Notification APIs ────────────────────────────────────────────────────

  public query ({ caller }) func getMyNotifications() : async { #ok : [Notification]; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?_) {
        let all = notifications.values().toArray().filter(
          func(n : Notification) : Bool { n.userId.equal(caller) }
        );
        let sorted = all.sort(func(a : Notification, b : Notification) : Order.Order {
          Int.compare(b.createdAt, a.createdAt)
        });
        let limited : [Notification] = if (sorted.size() > 50) {
          Array.tabulate(50, func(i : Nat) : Notification { sorted[i] })
        } else sorted;
        #ok(limited)
      };
    };
  };

  public shared ({ caller }) func markNotificationRead(id : Text) : async { #ok : Notification; #err : Text } {
    switch (notifications.get(id)) {
      case (null) { #err("Notification not found") };
      case (?notif) {
        if (not notif.userId.equal(caller)) { return #err("Not authorized") };
        let updated : Notification = {
          id = notif.id;
          userId = notif.userId;
          orgId = notif.orgId;
          notificationType = notif.notificationType;
          title = notif.title;
          message = notif.message;
          isRead = true;
          createdAt = notif.createdAt;
          relatedId = notif.relatedId;
        };
        notifications.remove(id);
        notifications.add(id, updated);
        #ok(updated)
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsRead() : async { #ok : Nat; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?_) {
        var count : Nat = 0;
        for ((nid, notif) in notifications.entries()) {
          if (notif.userId.equal(caller) and not notif.isRead) {
            let updated : Notification = {
              id = notif.id;
              userId = notif.userId;
              orgId = notif.orgId;
              notificationType = notif.notificationType;
              title = notif.title;
              message = notif.message;
              isRead = true;
              createdAt = notif.createdAt;
              relatedId = notif.relatedId;
            };
            notifications.remove(nid);
            notifications.add(nid, updated);
            count += 1;
          };
        };
        #ok(count)
      };
    };
  };

  public shared ({ caller }) func createSystemNotification(
    userId : Principal.Principal,
    title : Text,
    message : Text,
    relatedId : ?Text,
  ) : async { #ok : Notification; #err : Text } {
    if (not isSuperAdmin(caller) and not isOrgAdmin(caller)) {
      return #err("Not authorized");
    };
    switch (users.get(userId)) {
      case (null) { #err("Target user not found") };
      case (?targetUser) {
        let orgId = switch (targetUser.orgId) { case (?oid) { oid }; case null { "platform" } };
        let nid = "NOTIF" # _nextNotificationId.toText();
        _nextNotificationId += 1;
        let notif : Notification = {
          id = nid;
          userId = userId;
          orgId = orgId;
          notificationType = #systemMessage;
          title = title;
          message = message;
          isRead = false;
          createdAt = Time.now();
          relatedId = relatedId;
        };
        notifications.add(nid, notif);
        #ok(notif)
      };
    };
  };

  // ─── Activity Feed Internal Helper ──────────────────────────────────────────

  func _recordActivity(
    eventType : ActivityEventType,
    orgId : Text,
    actorPrincipal : Principal.Principal,
    targetId : ?Text,
    targetName : ?Text,
    description : Text,
  ) {
    let actorName = switch (users.get(actorPrincipal)) {
      case (?u) { u.displayName };
      case null { "System" };
    };
    let evId = "ACT" # _nextActivityId.toText();
    _nextActivityId += 1;
    let event : ActivityEvent = {
      id = evId;
      eventType = eventType;
      orgId = orgId;
      actorId = actorPrincipal;
      actorName = actorName;
      targetId = targetId;
      targetName = targetName;
      description = description;
      timestamp = Time.now();
    };
    activityEvents.add(evId, event);
  };

  // ─── Activity Feed API ────────────────────────────────────────────────────

  public query ({ caller }) func getActivityFeed(orgId : ?Text) : async { #ok : [ActivityEvent]; #err : Text } {
    let callerUser = switch (users.get(caller)) {
      case (?u) u;
      case null return #err("Not registered");
    };

    let allEvents = activityEvents.values().toArray();

    // Sort newest-first
    let sorted = allEvents.sort(func(a : ActivityEvent, b : ActivityEvent) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    });

    switch (orgId) {
      case (null) {
        // Platform-wide feed: super_admin only, 100 most recent
        if (callerUser.role != #super_admin) return #err("Only super_admin can view platform-wide feed");
        let limited : [ActivityEvent] = if (sorted.size() > 100) {
          Array.tabulate(100, func(i : Nat) : ActivityEvent { sorted[i] })
        } else sorted;
        #ok(limited)
      };
      case (?oid) {
        // Org-scoped feed: any authenticated user who belongs to that org, 50 most recent
        let authorized = callerUser.role == #super_admin or callerUser.orgId == ?oid;
        if (not authorized) return #err("Not authorized to view this org's activity feed");
        let filtered = sorted.filter(func(e : ActivityEvent) : Bool { e.orgId == oid });
        let limited : [ActivityEvent] = if (filtered.size() > 50) {
          Array.tabulate(50, func(i : Nat) : ActivityEvent { filtered[i] })
        } else filtered;
        #ok(limited)
      };
    };
  };

  // ─── Settings APIs ───────────────────────────────────────────────────────

  public query ({ caller }) func getOrgSettings(orgId : Text) : async { #ok : OrgSettings; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?u) {
        let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and u.orgId == ?orgId);
        if (not authorized) { return #err("Not authorized") };
        let defaults : OrgSettings = {
          webhookUrl = null;
          webhookEvents = [];
          notifyOnTaskComplete = true;
          notifyOnUserJoined = true;
          notifyOnAgentDeactivated = true;
          defaultLanguage = "en";
          timezone = "UTC";
        };
        #ok(switch (orgSettingsMap.get(orgId)) {
          case (?s) s;
          case null defaults;
        })
      };
    };
  };

  public shared ({ caller }) func updateOrgSettings(orgId : Text, input : OrgSettings) : async { #ok : OrgSettings; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?u) {
        let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and u.orgId == ?orgId);
        if (not authorized) { return #err("Not authorized") };
        orgSettingsMap.add(orgId, input);
        #ok(input)
      };
    };
  };

  public query ({ caller }) func getPlatformSettings() : async { #ok : PlatformSettings; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?_) { #ok(platformSettings) };
    };
  };

  public shared ({ caller }) func updatePlatformSettings(input : PlatformSettings) : async { #ok : PlatformSettings; #err : Text } {
    if (not isSuperAdmin(caller)) { return #err("Not authorized") };
    platformSettings := input;
    #ok(input)
  };

  // Internal: fire a webhook outcall if the org has a webhook URL configured for this event
  func _triggerWebhook(orgId : Text, eventName : Text, payload : Text) : async () {
    switch (orgSettingsMap.get(orgId)) {
      case (null) {};
      case (?settings) {
        switch (settings.webhookUrl) {
          case (null) {};
          case (?url) {
            // Only fire if eventName is in the webhookEvents list (empty list = all events)
            let shouldFire = settings.webhookEvents.size() == 0 or
              settings.webhookEvents.filter(func(e : Text) : Bool { e == eventName }).size() > 0;
            if (shouldFire) {
              let headers : [OutCall.Header] = [
                { name = "Content-Type"; value = "application/json" },
                { name = "X-AAA-Event";  value = eventName },
              ];
              try {
                ignore await OutCall.httpPostRequest(url, headers, payload, transformHttpResponse);
              } catch (_) {};
            };
          };
        };
      };
    };
  };

  // ── Migration: 5A-iii — copy legacy orgs (no domain fields) into typed map ──
  system func postupgrade() {
    for ((k, org) in organizations.entries()) {
      if (not organizationsNew.containsKey(k)) {
        let migrated : Organization = {
          id = org.id;
          name = org.name;
          description = org.description;
          planTier = org.planTier;
          ownerId = org.ownerId;
          stripeCustomerId = org.stripeCustomerId;
          stripeSubscriptionId = org.stripeSubscriptionId;
          isActive = org.isActive;
          createdAt = org.createdAt;
          logoUrl = org.logoUrl;
          primaryLanguage = org.primaryLanguage;
          supportedLanguages = org.supportedLanguages;
          customDomain = null;
          customSubdomain = null;
        };
        organizationsNew.add(k, migrated);
      };
    };
  };


  // ─── Phase 7E: Agent Templates ─────────────────────────────────────────────

  type AgentTemplate = {
    id             : Text;
    name           : Text;
    description    : Text;
    systemPrompt   : ?Text;
    endpointUrl    : ?Text;
    endpointHeaders : ?Text;  // JSON string
    tags           : [Text];
    isPublic       : Bool;
    orgId          : ?Text;
    createdBy      : Principal.Principal;
    createdAt      : Int;
  };

  type AgentTemplateInput = {
    name           : Text;
    description    : Text;
    systemPrompt   : ?Text;
    endpointUrl    : ?Text;
    endpointHeaders : ?Text;
    tags           : [Text];
    isPublic       : Bool;
    orgId          : ?Text;
  };

  let _agentTemplates = Map.empty<Text, AgentTemplate>();
  var _nextTemplateId : Nat = 1;

  public shared ({ caller }) func createAgentTemplate(input : AgentTemplateInput) : async { #ok : AgentTemplate; #err : Text } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    let user = switch (users.get(caller)) {
      case (?u) u;
      case null { return #err("Not registered") };
    };
    // org_admin can only create private templates for their own org
    let templateOrgId : ?Text = if (isSuperAdmin(caller)) { input.orgId } else { user.orgId };
    let isPublic = if (isSuperAdmin(caller)) { input.isPublic } else { false };
    let id = "TPL" # _nextTemplateId.toText();
    _nextTemplateId += 1;
    let tmpl : AgentTemplate = {
      id;
      name           = input.name;
      description    = input.description;
      systemPrompt   = input.systemPrompt;
      endpointUrl    = input.endpointUrl;
      endpointHeaders = input.endpointHeaders;
      tags           = input.tags;
      isPublic;
      orgId          = templateOrgId;
      createdBy      = caller;
      createdAt      = Time.now();
    };
    _agentTemplates.add(id, tmpl);
    #ok(tmpl)
  };

  public query ({ caller }) func getAgentTemplates(orgId : ?Text) : async { #ok : [AgentTemplate]; #err : Text } {
    switch (users.get(caller)) {
      case null { return #err("Not registered") };
      case (?_) {};
    };
    let all = _agentTemplates.values().toArray();
    let results = all.filter(func(t : AgentTemplate) : Bool {
      if (t.isPublic) { return true };
      switch (orgId) {
        case (?oid) {
          switch (t.orgId) {
            case (?tid) { tid == oid };
            case null   { false };
          }
        };
        case null { false };
      }
    });
    #ok(results)
  };

  public shared ({ caller }) func deleteAgentTemplate(id : Text) : async { #ok : Bool; #err : Text } {
    let user = switch (users.get(caller)) {
      case (?u) u;
      case null { return #err("Not registered") };
    };
    let tmpl = switch (_agentTemplates.get(id)) {
      case (?t) t;
      case null { return #err("Template not found") };
    };
    if (not isSuperAdmin(caller)) {
      // org_admin can only delete their own org's templates
      let sameOrg = switch (user.orgId, tmpl.orgId) {
        case (?uid, ?tid) { uid == tid };
        case _ { false };
      };
      if (not sameOrg) { return #err("Not authorized") };
    };
    _agentTemplates.remove(id);
    #ok(true)
  };

  public shared ({ caller }) func cloneAgentFromTemplate(
    templateId       : Text,
    orgId            : Text,
    nameOverride     : ?Text,
    endpointOverride : ?Text,
  ) : async { #ok : AgentDefinition; #err : Text } {
    if (not isOrgAdmin(caller) and not isSuperAdmin(caller)) {
      return #err("Not authorized");
    };
    let tmpl = switch (_agentTemplates.get(templateId)) {
      case (?t) t;
      case null { return #err("Template not found") };
    };
    // check plan agent limit
    let agentLimits = _getOrgLimits(orgId);
    let existingAgents = agents.values().toArray().filter(func(a : AgentDefinition) : Bool { a.orgId == orgId });
    if (existingAgents.size() >= agentLimits.maxAgents) {
      return #err("Plan limit reached: upgrade your plan to register more agents");
    };
    let agentId = "AGENT" # nextAgentId.toText();
    nextAgentId += 1;
    let agentName = switch (nameOverride) { case (?n) n; case null { tmpl.name } };
    let agentEndpoint : ?Text = switch (endpointOverride) {
      case (?e) { ?e };
      case null { tmpl.endpointUrl };
    };
    let agent : AgentDefinition = {
      id          = agentId;
      orgId;
      name        = agentName;
      description = tmpl.description;
      capabilities = [];
      supportedLanguages = [];
      modelType   = "custom";
      status      = #active;
      endpointUrl = agentEndpoint;
      createdAt   = Time.now();
      createdBy   = caller;
    };
    agents.add(agentId, agent);
    _recordActivity(#agentRegistered, agent.orgId, caller, ?agent.id, ?agent.name, "Agent \"" # agent.name # "\" cloned from template");
    #ok(agent)
  };

  // ─── Phase 7C: Search & Audit Types ────────────────────────────────────────

  type SearchResult = {
    kind        : Text;   // "user" | "agent" | "task" | "org"
    id          : Text;
    resultLabel : Text;
    subtitle    : Text;
    url         : Text;   // frontend route hint
  };

  type AuditEntry = {
    id          : Text;
    action      : Text;
    actorId     : Principal.Principal;
    actorName   : Text;
    targetKind  : Text;   // "org" | "user" | "agent" | "task" | "invite" | "apikey"
    targetId    : Text;
    description : Text;
    orgId       : ?Text;
    timestamp   : Int;
  };

  // ─── FinFracFran™ Types ────────────────────────────────────────────────────

  type FFFAssetType = {
    #realEstate;
    #business;
    #intellectualProperty;
    #revenueStream;
    #custom;
  };

  type FractionalAsset = {
    id : Text;
    orgId : Text;
    name : Text;
    description : Text;
    assetType : FFFAssetType;
    totalShares : Nat;
    valuationUsd : Nat;
    isActive : Bool;
    createdBy : Principal.Principal;
    createdAt : Int;
    updatedAt : Int;
  };

  type FractionalOwnership = {
    id : Text;
    assetId : Text;
    orgId : Text;
    userId : Principal.Principal;
    userName : Text;
    shares : Nat;
    issuedAt : Int;
  };

  type RevenueSplitStatus = {
    #pending;
    #distributed;
    #cancelled;
  };

  type RevenueSplitEntry = {
    userId : Principal.Principal;
    userName : Text;
    shares : Nat;
    amountUsd : Nat;
  };

  type RevenueSplit = {
    id : Text;
    assetId : Text;
    orgId : Text;
    totalAmountUsd : Nat;
    distribution : [RevenueSplitEntry];
    status : RevenueSplitStatus;
    createdBy : Principal.Principal;
    createdAt : Int;
    distributedAt : ?Int;
  };

  type FranchiseLinkStatus = {
    #pending;
    #active;
    #terminated;
  };

  type FranchiseLink = {
    id : Text;
    franchisorOrgId : Text;
    franchiseeOrgId : Text;
    royaltyPct : Nat;
    termsUrl : ?Text;
    status : FranchiseLinkStatus;
    createdBy : Principal.Principal;
    createdAt : Int;
    updatedAt : Int;
  };

  type FractionalAssetInput = {
    orgId : Text;
    name : Text;
    description : Text;
    assetType : FFFAssetType;
    totalShares : Nat;
    valuationUsd : Nat;
  };

  type FractionalAssetUpdateInput = {
    name : ?Text;
    description : ?Text;
    valuationUsd : ?Nat;
    isActive : ?Bool;
  };

  // ─── FinFracFran™ Storage ──────────────────────────────────────────────────

  let fffAssets = Map.empty<Text, FractionalAsset>();
  let _fffOwnerships = Map.empty<Text, FractionalOwnership>();
  let _fffRevenueSplits = Map.empty<Text, RevenueSplit>();
  let _fffFranchiseLinks = Map.empty<Text, FranchiseLink>();
  var _nextFFFAssetId : Nat = 1;
  var _nextFFFOwnershipId : Nat = 1;
  var _nextFFFSplitId : Nat = 1;
  var _nextFFFLinkId : Nat = 1;

  // ─── Phase 7C: Audit Storage ────────────────────────────────────────────────
  let _auditLog    = Map.empty<Text, AuditEntry>();
  var _nextAuditId : Nat = 1;

  // ─── FinFracFran™ Asset APIs ───────────────────────────────────────────────

  public shared ({ caller }) func createFractionalAsset(input : FractionalAssetInput) : async { #ok : FractionalAsset; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?u) {
        let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and u.orgId == ?input.orgId);
        if (not authorized) { return #err("Not authorized") };
        let id = "fff-asset-" # _nextFFFAssetId.toText();
        _nextFFFAssetId += 1;
        let now = Time.now();
        let asset : FractionalAsset = {
          id;
          orgId = input.orgId;
          name = input.name;
          description = input.description;
          assetType = input.assetType;
          totalShares = input.totalShares;
          valuationUsd = input.valuationUsd;
          isActive = true;
          createdBy = caller;
          createdAt = now;
          updatedAt = now;
        };
        fffAssets.add(id, asset);
        #ok(asset)
      };
    };
  };

  public query ({ caller }) func getFractionalAssets(orgId : Text) : async { #ok : [FractionalAsset]; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?u) {
        let authorized = isSuperAdmin(caller) or u.orgId == ?orgId;
        if (not authorized) { return #err("Not authorized") };
        let results = fffAssets.values().toArray().filter(func(a : FractionalAsset) : Bool { a.orgId == orgId });
        #ok(results)
      };
    };
  };

  public query ({ caller }) func getFractionalAssetById(id : Text) : async { #ok : FractionalAsset; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?_) {
        switch (fffAssets.get(id)) {
          case (null) { #err("Asset not found") };
          case (?asset) { #ok(asset) };
        };
      };
    };
  };

  public shared ({ caller }) func updateFractionalAsset(id : Text, input : FractionalAssetUpdateInput) : async { #ok : FractionalAsset; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?u) {
        switch (fffAssets.get(id)) {
          case (null) { #err("Asset not found") };
          case (?asset) {
            let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and u.orgId == ?asset.orgId);
            if (not authorized) { return #err("Not authorized") };
            let updated : FractionalAsset = {
              id = asset.id;
              orgId = asset.orgId;
              name = switch (input.name) { case (?n) n; case null asset.name };
              description = switch (input.description) { case (?d) d; case null asset.description };
              assetType = asset.assetType;
              totalShares = asset.totalShares;
              valuationUsd = switch (input.valuationUsd) { case (?v) v; case null asset.valuationUsd };
              isActive = switch (input.isActive) { case (?b) b; case null asset.isActive };
              createdBy = asset.createdBy;
              createdAt = asset.createdAt;
              updatedAt = Time.now();
            };
            fffAssets.add(id, updated);
            #ok(updated)
          };
        };
      };
    };
  };



  // ─── FinFracFran™ Ownership APIs ──────────────────────────────────────────

  public shared ({ caller }) func issueShares(assetId : Text, userId : Principal, shares : Nat) : async { #ok : FractionalOwnership; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?u) {
        switch (fffAssets.get(assetId)) {
          case (null) { #err("Asset not found") };
          case (?asset) {
            let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and u.orgId == ?asset.orgId);
            if (not authorized) { return #err("Not authorized") };
            let targetName = switch (users.get(userId)) {
              case (null) { userId.toText() };
              case (?tu) { tu.displayName };
            };
            let id = "fff-own-" # _nextFFFOwnershipId.toText();
            _nextFFFOwnershipId += 1;
            let ownership : FractionalOwnership = {
              id;
              assetId;
              orgId = asset.orgId;
              userId;
              userName = targetName;
              shares;
              issuedAt = Time.now();
            };
            _fffOwnerships.add(id, ownership);
            #ok(ownership)
          };
        };
      };
    };
  };

  public query ({ caller }) func getOwnershipByAsset(assetId : Text) : async { #ok : [FractionalOwnership]; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?_) {
        let results = _fffOwnerships.values().toArray().filter(func(o : FractionalOwnership) : Bool { o.assetId == assetId });
        #ok(results)
      };
    };
  };

  public query ({ caller }) func getMyOwnership() : async { #ok : [FractionalOwnership]; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?_) {
        let results = _fffOwnerships.values().toArray().filter(func(o : FractionalOwnership) : Bool { o.userId == caller });
        #ok(results)
      };
    };
  };

  // ─── FinFracFran™ Revenue Split APIs ──────────────────────────────────────

  public shared ({ caller }) func createRevenueSplit(assetId : Text, totalAmountUsd : Nat, distribution : [RevenueSplitEntry]) : async { #ok : RevenueSplit; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?u) {
        switch (fffAssets.get(assetId)) {
          case (null) { #err("Asset not found") };
          case (?asset) {
            let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and u.orgId == ?asset.orgId);
            if (not authorized) { return #err("Not authorized") };
            let id = "fff-split-" # _nextFFFSplitId.toText();
            _nextFFFSplitId += 1;
            let split : RevenueSplit = {
              id;
              assetId;
              orgId = asset.orgId;
              totalAmountUsd;
              distribution;
              status = #pending;
              createdBy = caller;
              createdAt = Time.now();
              distributedAt = null;
            };
            _fffRevenueSplits.add(id, split);
            #ok(split)
          };
        };
      };
    };
  };

  public shared ({ caller }) func distributeRevenueSplit(splitId : Text) : async { #ok : RevenueSplit; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?u) {
        switch (_fffRevenueSplits.get(splitId)) {
          case (null) { #err("Revenue split not found") };
          case (?split) {
            let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and u.orgId == ?split.orgId);
            if (not authorized) { return #err("Not authorized") };
            if (split.status != #pending) { return #err("Split is not pending") };
            let updated : RevenueSplit = {
              id = split.id;
              assetId = split.assetId;
              orgId = split.orgId;
              totalAmountUsd = split.totalAmountUsd;
              distribution = split.distribution;
              status = #distributed;
              createdBy = split.createdBy;
              createdAt = split.createdAt;
              distributedAt = ?Time.now();
            };
            _fffRevenueSplits.add(splitId, updated);
            #ok(updated)
          };
        };
      };
    };
  };

  public query ({ caller }) func getRevenueSplits(assetId : Text) : async { #ok : [RevenueSplit]; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?_) {
        let results = _fffRevenueSplits.values().toArray().filter(func(s : RevenueSplit) : Bool { s.assetId == assetId });
        #ok(results)
      };
    };
  };

  // ─── FinFracFran™ Franchise Link APIs ─────────────────────────────────────

  public shared ({ caller }) func createFranchiseLink(franchisorOrgId : Text, franchiseeOrgId : Text, royaltyPct : Nat, termsUrl : ?Text) : async { #ok : FranchiseLink; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?u) {
        let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and u.orgId == ?franchisorOrgId);
        if (not authorized) { return #err("Not authorized") };
        if (royaltyPct > 100) { return #err("Royalty percentage cannot exceed 100") };
        let id = "fff-link-" # _nextFFFLinkId.toText();
        _nextFFFLinkId += 1;
        let now = Time.now();
        let link : FranchiseLink = {
          id;
          franchisorOrgId;
          franchiseeOrgId;
          royaltyPct;
          termsUrl;
          status = #pending;
          createdBy = caller;
          createdAt = now;
          updatedAt = now;
        };
        _fffFranchiseLinks.add(id, link);
        #ok(link)
      };
    };
  };

  public shared ({ caller }) func updateFranchiseLinkStatus(id : Text, newStatus : FranchiseLinkStatus) : async { #ok : FranchiseLink; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?u) {
        switch (_fffFranchiseLinks.get(id)) {
          case (null) { #err("Franchise link not found") };
          case (?link) {
            let authorized = isSuperAdmin(caller) or (isOrgAdmin(caller) and (u.orgId == ?link.franchisorOrgId or u.orgId == ?link.franchiseeOrgId));
            if (not authorized) { return #err("Not authorized") };
            let updated : FranchiseLink = {
              id = link.id;
              franchisorOrgId = link.franchisorOrgId;
              franchiseeOrgId = link.franchiseeOrgId;
              royaltyPct = link.royaltyPct;
              termsUrl = link.termsUrl;
              status = newStatus;
              createdBy = link.createdBy;
              createdAt = link.createdAt;
              updatedAt = Time.now();
            };
            _fffFranchiseLinks.add(id, updated);
            #ok(updated)
          };
        };
      };
    };
  };

  public query ({ caller }) func getFranchiseLinks(orgId : Text) : async { #ok : [FranchiseLink]; #err : Text } {
    switch (users.get(caller)) {
      case (null) { #err("Not registered") };
      case (?_) {
        let results = _fffFranchiseLinks.values().toArray().filter(func(l : FranchiseLink) : Bool {
          l.franchisorOrgId == orgId or l.franchiseeOrgId == orgId
        });
        #ok(results)
      };
    };
  };

  public query ({ caller }) func getPlatformFranchiseLinks() : async { #ok : [FranchiseLink]; #err : Text } {
    if (not isSuperAdmin(caller)) { return #err("Not authorized") };
    let results = _fffFranchiseLinks.values().toArray();
    #ok(results)
  };

  // ─── Phase 7C: Audit Helper ─────────────────────────────────────────────────

  func _recordAudit(
    action      : Text,
    actorId     : Principal.Principal,
    actorName   : Text,
    targetKind  : Text,
    targetId    : Text,
    description : Text,
    orgId       : ?Text,
  ) : () {
    let id    = "AUD" # _nextAuditId.toText();
    _nextAuditId += 1;
    let entry : AuditEntry = {
      id          = id;
      action      = action;
      actorId     = actorId;
      actorName   = actorName;
      targetKind  = targetKind;
      targetId    = targetId;
      description = description;
      orgId       = orgId;
      timestamp   = Time.now();
    };
    _auditLog.add(id, entry);
  };

  // ─── Phase 7C: Search APIs ──────────────────────────────────────────────────

  public query ({ caller }) func searchOrg(orgId : Text, searchQuery : Text) : async [SearchResult] {
    switch (users.get(caller)) {
      case null { return [] };
      case (?user) {
        let isAuthorized = isSuperAdmin(caller) or user.orgId == ?orgId;
        if (not isAuthorized) { return [] };
        let q = searchQuery.toLower();
        var results : [SearchResult] = [];
        // Search users in org
        for ((_, u) in users.entries()) {
          if (u.orgId == ?orgId) {
            let name  = u.displayName.toLower();
            let email = u.email.toLower();
            if (name.contains(#text q) or email.contains(#text q)) {
              results := results.concat([{
                kind        = "user";
                id          = u.principal.toText();
                resultLabel = u.displayName;
                subtitle    = u.email;
                url         = "/users";
              }]);
            };
          };
        };
        // Search agents in org
        for ((_, a) in agents.entries()) {
          if (a.orgId == orgId) {
            let name = a.name.toLower();
            let desc = a.description.toLower();
            if (name.contains(#text q) or desc.contains(#text q)) {
              results := results.concat([{
                kind        = "agent";
                id          = a.id;
                resultLabel = a.name;
                subtitle    = a.description;
                url         = "/agents";
              }]);
            };
          };
        };
        // Search tasks in org
        for ((_, t) in tasks.entries()) {
          if (t.orgId == orgId) {
            let title = t.title.toLower();
            let desc  = t.description.toLower();
            if (title.contains(#text q) or desc.contains(#text q)) {
              results := results.concat([{
                kind        = "task";
                id          = t.id;
                resultLabel = t.title;
                subtitle    = t.description;
                url         = "/tasks";
              }]);
            };
          };
        };
        // Cap at 20
        if (results.size() > 20) { results.sliceToArray(0, 20) } else { results }
      };
    }
  };

  public query ({ caller }) func searchPlatform(searchQuery : Text) : async [SearchResult] {
    if (not isSuperAdmin(caller)) { return [] };
    let q = searchQuery.toLower();
    var results : [SearchResult] = [];
    // Search orgs
    for ((_, o) in organizationsNew.entries()) {
      let name = o.name.toLower();
      if (name.contains(#text q)) {
        results := results.concat([{
          kind        = "org";
          id          = o.id;
          resultLabel = o.name;
          subtitle    = debug_show(o.planTier);
          url         = "/organizations";
        }]);
      };
    };
    // Search users
    for ((_, u) in users.entries()) {
      let name  = u.displayName.toLower();
      let email = u.email.toLower();
      if (name.contains(#text q) or email.contains(#text q)) {
        results := results.concat([{
          kind        = "user";
          id          = u.principal.toText();
          resultLabel = u.displayName;
          subtitle    = u.email;
          url         = "/users";
        }]);
      };
    };
    // Search agents
    for ((_, a) in agents.entries()) {
      let name = a.name.toLower();
      let desc = a.description.toLower();
      if (name.contains(#text q) or desc.contains(#text q)) {
        results := results.concat([{
          kind        = "agent";
          id          = a.id;
          resultLabel = a.name;
          subtitle    = a.description;
          url         = "/agents";
        }]);
      };
    };
    // Search tasks
    for ((_, t) in tasks.entries()) {
      let title = t.title.toLower();
      let desc  = t.description.toLower();
      if (title.contains(#text q) or desc.contains(#text q)) {
        results := results.concat([{
          kind        = "task";
          id          = t.id;
          resultLabel = t.title;
          subtitle    = t.description;
          url         = "/tasks";
        }]);
      };
    };
    // Cap at 30
    if (results.size() > 30) { results.sliceToArray(0, 30) } else { results }
  };

  // ─── Phase 7C: Bulk Task Status Update ──────────────────────────────────────

  public shared ({ caller }) func bulkUpdateTaskStatus(
    ids    : [Text],
    status : Text,
  ) : async { #ok : { updated : Nat; failed : Nat }; #err : Text } {
    switch (users.get(caller)) {
      case null { return #err("Not registered") };
      case (?user) {
        if (user.role != #org_admin and user.role != #super_admin) {
          return #err("Not authorized");
        };
        let newStatus : TaskStatus = switch (status) {
          case ("open")        { #pending     };
          case ("pending")     { #pending     };
          case ("in_progress") { #in_progress };
          case ("completed")   { #completed   };
          case ("failed")      { #failed      };
          case ("cancelled")   { #cancelled   };
          case (_)             { return #err("Invalid status: " # status) };
        };
        var updated : Nat = 0;
        var failed  : Nat = 0;
        for (id in ids.vals()) {
          switch (tasks.get(id)) {
            case null { failed += 1 };
            case (?task) {
              let sameOrg = user.orgId == ?task.orgId;
              if (user.role == #super_admin or sameOrg) {
                let t2 : Task = {
                  id             = task.id;
                  orgId          = task.orgId;
                  createdBy      = task.createdBy;
                  assignedAgentId = task.assignedAgentId;
                  assignedTo     = task.assignedTo;
                  title          = task.title;
                  description    = task.description;
                  status         = newStatus;
                  priority       = task.priority;
                  language       = task.language;
                  tags           = task.tags;
                  inputData      = task.inputData;
                  outputData     = task.outputData;
                  createdAt      = task.createdAt;
                  updatedAt      = Time.now();
                };
                tasks.remove(id);
                tasks.add(id, t2);
                updated += 1;
              } else {
                failed += 1;
              };
            };
          };
        };
        let callerOrgId = user.orgId;
        _recordAudit(
          "bulk_update_task_status",
          caller,
          user.displayName,
          "task",
          updated.toText() # " of " # ids.size().toText() # " tasks",
          "Bulk updated " # updated.toText() # " tasks to " # status,
          callerOrgId,
        );
        #ok({ updated = updated; failed = failed })
      };
    }
  };

  // ─── Phase 7C: Audit Log API ────────────────────────────────────────────────

  public shared ({ caller }) func getAuditLog(
    orgId : ?Text,
  ) : async { #ok : [AuditEntry]; #err : Text } {
    switch (users.get(caller)) {
      case null { return #err("Not registered") };
      case (?user) {
        if (user.role == #super_admin) {
          // Platform-wide: last 200 entries sorted desc
          let all = _auditLog.values().toArray();
          let sorted = all.sort(func(a : AuditEntry, b : AuditEntry) : Order.Order {
            Int.compare(b.timestamp, a.timestamp)
          });
          let cap : [AuditEntry] = if (sorted.size() > 200) {
            sorted.sliceToArray(0, 200)
          } else { sorted };
          return #ok(cap);
        } else if (user.role == #org_admin) {
          let targetOrg : Text = switch (orgId) {
            case (?oid) { oid };
            case null   {
              switch (user.orgId) {
                case (?oid) { oid };
                case null   { return #err("No org found") };
              }
            };
          };
          switch (user.orgId) {
            case (?oid) { if (oid != targetOrg) { return #err("Not authorized") } };
            case null   { return #err("Not authorized") };
          };
          let filtered = _auditLog.values().toArray().filter(
            func(e : AuditEntry) : Bool {
              switch (e.orgId) {
                case (?eid) { eid == targetOrg };
                case null   { false };
              }
            }
          );
          let sorted = filtered.sort(func(a : AuditEntry, b : AuditEntry) : Order.Order {
            Int.compare(b.timestamp, a.timestamp)
          });
          let cap : [AuditEntry] = if (sorted.size() > 100) {
            sorted.sliceToArray(0, 100)
          } else { sorted };
          return #ok(cap);
        } else {
          return #err("Not authorized");
        };
      };
    }
  };

};
