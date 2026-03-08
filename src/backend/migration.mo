import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  // Old types (should match the previous canister code)
  type OldOrder = {
    username : Text;
    itemName : Text;
    price : Text;
    transactionId : Text;
    timestamp : Time.Time;
    status : {
      #pending;
      #completed;
      #rejected;
    };
  };

  type OldUserProfile = {
    username : Text;
    email : Text;
  };

  type OldActor = {
    orders : List.List<OldOrder>;
    users : Map.Map<Principal, OldUserProfile>;
  };

  // New types (should match the new canister code)
  type NewOrder = {
    username : Text;
    minecraftUsername : Text;
    itemName : Text;
    price : Text;
    screenshotUrl : Text;
    timestamp : Time.Time;
    status : {
      #pending;
      #completed;
      #rejected;
    };
  };

  type NewUserProfile = {
    username : Text;
    email : Text;
  };

  type NewActor = {
    orders : List.List<NewOrder>;
    users : Map.Map<Principal, NewUserProfile>;
  };

  // The migration function. It takes the old actor state and returns the new actor state.
  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<OldOrder, NewOrder>(
      func(oldOrder) {
        {
          oldOrder with
          minecraftUsername = ""; // default value, as this didn't exist before
          screenshotUrl = ""; // default value, as this didn't exist before
        };
      }
    );
    {
      old with
      orders = newOrders;
    };
  };
};
