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

  let organizations = Map.empty<Text, Organization>();
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
    if (organizations.containsKey(input.name)) {
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
    };
    organizations.add(input.name, newOrg);
    #ok(newOrg);
  };

  public shared func getOrganizationById(id : Text) : async ?Organization {
    organizations.get(id);
  };

  public shared func getAllOrganizations() : async [Organization] {
    organizations.values().toArray().sort();
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
      case (?orgId) { organizations.get(orgId) };
    };
  };

  public shared ({ caller }) func updateOrganization(id : Text, input : UpdateOrgInput) : async {
    #ok : Organization;
    #err : Text;
  } {
    switch (organizations.get(id)) {
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
        };
        organizations.remove(id);
        organizations.add(updated.id, updated);
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


};
