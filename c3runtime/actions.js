self.C3.Plugins.PlayFabAPI.Acts =
{
	Alert() {
		alert("Test property = " + this._GetTestProperty());
	},
    LogInWithPlayFab(email, password) {
        this._LogInWithPlayFab(email, password);
    },
    LogInWithEmail(email, password) {
        this._LogInWithEmail(email, password);
    },
    RegisterPlayFabUser(email, password, username) {
        this._RegisterPlayFabUser(email, password, username);
    },
    GetInventoryItems(collectionid, count, next) {
        this._GetInventoryItems(collectionid, count, next);
    },
    AddInventoryItems(amount, itemid, collectionid) {
        this._AddInventoryItems(amount, itemid, collectionid);
    },
    SubtractInventoryItems(amount, itemid, collectionid) {
        this._SubtractInventoryItems(amount, itemid, collectionid);
    },
    DeleteInventoryItems(itemid, collectionid) {
        this._DeleteInventoryItems(itemid, collectionid);
    }
};