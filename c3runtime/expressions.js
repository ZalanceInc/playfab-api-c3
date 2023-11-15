
self.C3.Plugins.PlayFabAPI.Exps =
{
	Double(number)
	{
		return number * 2;
	},
    GetMessage()
	{
		return this._message;
	},
    GetAccountId()
	{
		return this._GetAccountId();
	},
    GetReadyInventoryItems(index, count, type)
	{
		const items = this._GetReadyInventoryItems(index, count);

        if(type) {
            return JSON.stringify(items, null, 4);
        }
        else {
            return items;
        }
	},
};
