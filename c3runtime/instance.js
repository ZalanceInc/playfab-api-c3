const C3 = self.C3;

const DOM_COMPONENT_ID = "playfabapi";


Array.prototype.subarray = function(start, end) {
    if (!end) { end = -1; } 
    return this.slice(start, this.length + 1 - (end * -1));
};

C3.Plugins.PlayFabAPI.Instance = class ZalancePlayFabInstance extends C3.SDKInstanceBase
{
	constructor(inst, properties)
	{
		super(inst, DOM_COMPONENT_ID);
		
		// Initialise object properties
		this._testProperty = 0;
        this._titleId = '';
        this._message = "";
        this._isAuthenticated = false;
        this._Username = "";
        this._EntityToken = null;
        this._LastLoginTime = null;
        this._NewlyCreated = null;
        this._PlayFabId = null;
        this._SessionTicket = null;
        this._SettingsForUser = null;
        this._TreatmentAssignment = null;
        this._triggerMessage = null;
        this._triggerInventoryReady = false;
        this._triggerInventoryAdded = false;
        this._triggerInventorySubtracted = false;
        this._triggerInventoryDeleted = false;
                    
		if (properties)		// note properties may be null in some cases
		{
			this._testProperty = properties[0];
            this._titleId = properties[1];
		}

        this._auth = new self['PlayFabAPI']['Authentication'](this._titleId);
        this._inventory = new self['PlayFabAPI']['Inventory'](this._titleId);
	}

    _GetAccountId()
	{
		return this._auth['_GetAccountId']();
	}

    async _RegisterPlayFabUser (email, password, username, requireBothUsernameAndEmail = true, displayName = undefined) {
        const result = await this._auth['_RegisterPlayFabUser'](email, password, username, requireBothUsernameAndEmail, displayName);
        if(result['success']) {
            this._OnRegistered();
        }
        else {
            this._OnMessage(result['errorMessage']);
        }
    };

    async _LogInWithPlayFab(username, password) {
        const result = await this._auth['_LogInWithPlayFab'](username, password);
        if(result['success']) {
            this._OnAuthenticated();
        }
        else {
            this._OnMessage(result['errorMessage']);
        }
    };

    async _LogInWithEmail (email, password) {
        const result = await this._auth['_LogInWithEmail'](email, password);
        if(result['success']) {
            this._OnAuthenticated();
        }
        else {
            this._OnMessage(result['errorMessage']);
        }
    };

    async _GetInventoryItems(collectionid, count, next) {
        const result = await this._inventory['_GetInventoryItems'](collectionid, count, next);
        if(result['success']) {
            this._triggerInventoryReady = true;
            this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnInventoryReady);
        }
        else {
            this._OnMessage(result['errorMessage']);
        }
    };

    _GetReadyInventoryItems()
	{
		return this._inventory['_GetReadyInventoryItems']();
	}

    async _AddInventoryItems(amount, itemid, collectionid, durationinseconds) {
        const result = await this._inventory['_AddInventoryItems'](amount, itemid, collectionid, durationinseconds);
        if(result['success']) {
            this._triggerInventoryAdded = true;
            this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnInventoryAdded);
        }
        else {
            this._OnMessage(result['errorMessage']);
        }
    };

    async _SubtractInventoryItems(amount, itemid, collectionid, durationinseconds) {
        const result = await this._inventory['_SubtractInventoryItems'](amount, itemid, collectionid, durationinseconds);
        if(result['success']) {
            this._triggerInventorySubtracted = true;
            this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnInventorySubtracted);
        }
        else {
            this._OnMessage(result['errorMessage']);
        }
    };

    async _DeleteInventoryItems(itemid, collectionid) {
        const result = await this._inventory['_DeleteInventoryItems'](itemid, collectionid);
        if(result['success']) {
            this._triggerInventoryDeleted = true;
            this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnInventoryDeleted);
        }
        else {
            this._OnMessage(result['errorMessage']);
        }
    };

    _OnRegistered() {
        this._isAuthenticated = true;

		// Trigger 'On Registered' in the event system
		this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnRegistered);
    }

    _OnAuthenticated() {
        // Dispatch script event so callers can use addEventListener("click", ...)
		// this.GetScriptInterface().dispatchEvent(new C3.Event("click", true));

        this._isAuthenticated = true;
		this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnAuthenticated);
    }

    _OnMessage(msg) {
        this._message = msg;
        this._triggerMessage = true;
		this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnMessage);
    }

    _GoToURL(url, target) {
        this._PostToDOMMaybeSync("navigate", {
            "type": "url",
            "url": url,
            "target": target,
            "exportType": this._runtime.GetExportType()
        })
    }

    _GoToURLWindow(url, tag) {
        this._PostToDOMMaybeSync("navigate", {
            "type": "new-window",
            "url": url,
            "tag": tag,
            "exportType": this._runtime.GetExportType()
        })
    }
	
	Release()
	{
		super.Release();
	}

	_SetTestProperty(n)
	{
		this._testProperty = n;
	}

	_GetTestProperty()
	{
		return this._testProperty;
	}

    _SetTitleId(n)
	{
		this._titleId = n;
	}

	_GetTitleId()
	{
		return this._titleId;
	}
	
	SaveToJson()
	{
		return {
			// data to be saved for savegames
		};
	}
	
	LoadFromJson(o)
	{
		// load state for savegames
	}

	GetScriptInterfaceClass()
	{
		return self.IZalancePlayFabInstance;
	}
};

// Script interface. Use a WeakMap to safely hide the internal implementation details from the
// caller using the script interface.
const map = new WeakMap();

self.IZalancePlayFabInstance = class IZalancePlayFabInstance extends self.IInstance {
	constructor()
	{
		super();
		
		// Map by SDK instance
		map.set(this, self.IInstance._GetInitInst().GetSdkInstance());
	}

	// Example setter/getter property on script interface
	set testProperty(n)
	{
		map.get(this)._SetTestProperty(n);
	}

	get testProperty()
	{
		return map.get(this)._GetTestProperty();
	}

    set titleId(n)
	{
		map.get(this)._SetTitleId(n);
	}

	get titleId()
	{
		return map.get(this)._GetTitleId();
	}
};
