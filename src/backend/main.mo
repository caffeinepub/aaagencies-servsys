import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

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
      // descending: newer first
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  let organizations = Map.empty<Text, Organization>();
  let users = Map.empty<Principal.Principal, User>();
  let inviteLinks = Map.empty<Text, InviteLink>();
  let inviteLinksByCode = Map.empty<Text, Text>(); // code -> id
  let leads = Map.empty<Text, Lead>();

  var nextInviteId : Nat = 1;
  var nextLeadId : Nat = 1;

  type OrganizationInput = {
    name : Text;
    description : Text;
    planTier : PlanTier;
    primaryLanguage : Text;
    ownerId : Principal.Principal;
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

  // Helper: check if an email is already used by another principal
  func isEmailTaken(email : Text, excludePrincipal : ?Principal.Principal) : Bool {
    for ((p, u) in users.entries()) {
      if (u.email == email) {
        switch (excludePrincipal) {
          case (?excl) {
            if (not p.equal(excl)) { return true };
          };
          case (null) { return true };
        };
      };
    };
    false;
  };

  public shared ({ caller }) func createOrganization(input : OrganizationInput) : async {
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

  public shared ({ caller }) func registerUser(input : UserInput) : async {
    #ok : User;
    #err : Text;
  } {
    if (users.containsKey(input.principal)) {
      return #err("User already exists");
    };
    // Informational duplicate email check
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

  // --- Invite Link APIs ---

  public shared ({ caller }) func createInviteLink(input : CreateInviteLinkInput) : async {
    #ok : InviteLink;
    #err : Text;
  } {
    let idNum = nextInviteId;
    nextInviteId += 1;
    let idText = idNum.toText();
    // Simple unique code: prefix + id + last 6 digits of timestamp (abs)
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

  public shared ({ caller }) func redeemInviteLink(code : Text, input : UserInput) : async {
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
            // Informational duplicate email check
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
        let isSuperAdmin = switch (users.get(caller)) {
          case (null) { false };
          case (?u) {
            switch (u.role) {
              case (#super_admin) { true };
              case (_) { false };
            };
          };
        };
        if (not isOwner and not isSuperAdmin) {
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

  // --- Lead APIs ---

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
    let isSuperAdmin = switch (users.get(caller)) {
      case (null) { false };
      case (?u) {
        switch (u.role) {
          case (#super_admin) { true };
          case (_) { false };
        };
      };
    };
    if (not isSuperAdmin) {
      return #err("Not authorized");
    };
    let all = leads.values().toArray();
    #ok(all.sort(Lead.compareByCreatedAt));
  };
};
