import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  public type RankConfig = {
    name : Text;
    price : Text;
    perks : [Text];
  };

  public type CoinPackageConfig = {
    packageLabel : Text;
    amount : Nat;
    price : Text;
    perks : [Text];
  };

  public type SiteConfig = {
    serverIp : Text;
    discordLink : Text;
    ranks : [RankConfig];
    coinPackages : [CoinPackageConfig];
  };

  var siteConfig : SiteConfig = {
    serverIp = "swordmc.zenithcloud.fun";
    discordLink = "https://discord.gg/wgKXAYYqD";
    ranks = [
      {
        name = "VIP";
        price = "₹49";
        perks = [
          "Exclusive Chat Tag",
          "Access to VIP Lounge",
          "1.25x Money Boost",
          "Purple Glow in Chat",
          "Access to Ender Chest",
        ];
      },
      {
        name = "MVP";
        price = "₹99";
        perks = [
          "VIP Perks Included",
          "Access to /enderchest",
          "1.5x Money Boost",
          "Customizable Glow Effect",
          "Access to /fly for 1 hour",
        ];
      },
      {
        name = "GOD";
        price = "₹199";
        perks = [
          "MVP Perks Included",
          "Permanent /fly Access",
          "2x Money Boost",
          "Access to /fix tools",
          "Exclusive GOD Armor Kit",
        ];
      },
      {
        name = "SWORD";
        price = "₹349";
        perks = [
          "GOD Perks Included",
          "4x XP Earn Rate",
          "Access to /vanish",
          "Custom Sword Tag",
          "Exclusive Sword Armor Set",
        ];
      },
      {
        name = "IMMORTAL";
        price = "₹599";
        perks = [
          "SWORD Perks Included",
          "Access to /godmode",
          "5x Money & XP Boost",
          "Exclusive Immortal Armor Set",
          "Customizable Particle Trail",
        ];
      },
    ];
    coinPackages = [
      {
        packageLabel = "50 Coins";
        amount = 50;
        price = "₹39";
        perks = ["Small XP Boost", "Temporary Access to /fly"];
      },
      {
        packageLabel = "150 Coins";
        amount = 150;
        price = "₹99";
        perks = ["Permanent /fly Access", "VIP Rank Perks"];
      },
      {
        packageLabel = "500 Coins";
        amount = 500;
        price = "₹299";
        perks = ["Access to /vanish", "Exclusive GOD Kit"];
      },
    ];
  };

  public query ({ caller }) func getPublicSiteConfig() : async SiteConfig {
    siteConfig;
  };

  public query ({ caller }) func adminGetSiteConfig() : async SiteConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    siteConfig;
  };

  public shared ({ caller }) func adminUpdateSiteConfig(config : SiteConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    siteConfig := config;
  };

  public type OrderStatus = {
    #pending;
    #completed;
    #rejected;
  };

  public type Order = {
    username : Text;
    minecraftUsername : Text;
    itemName : Text;
    price : Text;
    screenshotUrl : Text;
    timestamp : Time.Time;
    status : OrderStatus;
  };

  public type UserProfile = {
    username : Text;
    email : Text;
  };

  public type AuthSession = {
    principal : Principal;
    username : Text;
  };

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let orders = List.empty<Order>();
  let users = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (users.get(caller)) {
      case (null) {
        users.add(caller, profile);
      };
      case (?existingProfile) {
        if (existingProfile.username != profile.username) {
          Runtime.trap("Username change not allowed");
        };
        users.add(caller, profile);
      };
    };
  };

  public shared ({ caller }) func submitOrder(order : Order) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit orders");
    };
    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("User not found. Please create a profile first. User: " # debug_show (caller));
      };
      case (?user) {
        if (user.username != order.username) {
          Runtime.trap("Order username does not match current user");
        };
        if (order.price.toNat() == null) {
          Runtime.trap("Invalid price format. Must be number as text");
        };
        orders.add({ order with status = #pending });
      };
    };
  };

  public query ({ caller }) func adminGetAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    orders.toArray();
  };

  public shared ({ caller }) func adminUpdateOrderStatus(index : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (index >= orders.size()) {
      Runtime.trap("Order not found. Invalid index: " # index.toText());
    };
    let ordersArray = orders.toArray();
    orders.clear();
    for (i in Nat.range(0, ordersArray.size() - 1)) {
      if (i == index) {
        orders.add({ ordersArray[i] with status = status });
      } else {
        orders.add(ordersArray[i]);
      };
    };
  };

  public shared ({ caller }) func adminDeleteOrder(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (index >= orders.size()) {
      Runtime.trap("Order not found. Invalid index: " # index.toText());
    } else if (orders.size() == 1 and index == 0) {
      orders.clear();
    } else {
      let ordersArray = orders.toArray();
      orders.clear();
      for (i in Nat.range(0, ordersArray.size() - 1)) {
        if (i != index) {
          orders.add(ordersArray[i]);
        };
      };
    };
  };

  public query ({ caller }) func adminGetOrderCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    orders.size();
  };

  public query ({ caller }) func adminGetUsers() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    users.toArray();
  };
};
