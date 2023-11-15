const C3 = self.C3;

const DOM_COMPONENT_ID = "playfabapi";
const COMPANY_TITLE = "Zalance Inc.";
const API_DOMAIN = 'https://{titleId}.playfabapi.com';
const API_PRICES_DOMAIN = 'https://x8ki-letl-twmt.n7.xano.io/api:kkl1GMQr';
const API_WS_DOMAIN = 'wss://realtime.ably.io?key=uXZHPA.morNBQ:spIwqa7KLhYxhwvbZmG_KHYiG5dCHZQ33Z-ue2ToQwI';
const API_AUTH_LOGIN_WITH_PLAYFAB = API_DOMAIN + '/Client/LoginWithPlayFab';
const API_AUTH_LOGIN_WITH_EMAIL = API_DOMAIN + '/Client/LoginWithEmailAddress';
const API_AUTH_REGISTER_PLAYFAB_USER = API_DOMAIN + '/Client/RegisterPlayFabUser';
const API_INVENTORY_GET_ITEMS = API_DOMAIN + '/Inventory/GetInventoryItems';
const API_INVENTORY_ADD_ITEMS = API_DOMAIN + '/Inventory/AddInventoryItems';
const API_INVENTORY_SUBTRACT_ITEMS = API_DOMAIN + '/Inventory/SubtractInventoryItems';
const API_INVENTORY_DELETE_ITEMS = API_DOMAIN + '/Inventory/DeleteInventoryItems';

const API_RESPONSE_500_GENERIC = 'An unknown error has occured';
const API_RESPONSE_200_GENERIC = 'success';

Array.prototype.subarray = function(start, end) {
    if (!end) { end = -1; } 
    return this.slice(start, this.length + 1 - (end * -1));
};


const inMemoryTokenManager = () => {
    let _entityToken = null;

    const getToken = () => { return _entityToken?.EntityToken || '' };
    const getEntityId = () => { return _entityToken?.Entity?.Id || '' }
    const getEntityType = () => { return _entityToken?.Entity?.Type || '' }
    const setEntity = (token) => {
        _entityToken = token;
    };
    const deleteToken = () => {
        _entityToken = null;
    };

    return {
        getToken,
        getEntityId,
        getEntityType,
        setEntity,
        deleteToken,
    };
};

const tokenManager = inMemoryTokenManager();

const HandleErrorResponse = (err) => {
    if (err?.errorMessage) {
        return {
            success: false,
            code: err.code,
            error: err.error,
            errorCode: err.errorCode,
            errorDetails: err.errorDetails,
            errorMessage: err.errorMessage,
            status: err.status,
        };
    }
    else if (err?.message) {
        return {
            success: false,
            code: 500,
            status: 500,
            errorDetails: err.stack,
            errorMessage: err.message,
        };
    }

    const msg = "unhandled error";
    return {
        success: false,
        code: 500,
        status: 500,
        errorDetails: err,
        errorMessage: msg,
    };
}

const generateUUID = () => {
    var d = new Date().getTime();
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0; // Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){ // Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else { // Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

const GetConfig = () => {
    const config = {
        method: 'GET',
        headers: undefined,
        body: undefined,
        // credentials: 'include',
        redirect: 'follow',
    };

    return config;
};

const UrlPathReplace = (path, params, isLocalParam = false) => {
    const exp = isLocalParam ? /:\w+/g : /{\w+}/g;

    const result = path.replace(exp, (placeholder) => {
        const length = isLocalParam ? placeholder.length : placeholder.length - 1;
        return params[placeholder.substring(1, length)] || placeholder;
    });

    return result;
};

class Inventory
{
	constructor(titleId)
	{
		// Initialise object properties
        this._titleId = titleId;
        this._items = [];
        this._invItemsContToken = null;
        this._itemsReady = false;
	}

    _GetInventoryItems = async (CollectionId = "default", Count = 50) => {
        try {
            let url = UrlPathReplace(API_INVENTORY_GET_ITEMS, {
                titleId: this._titleId,
            });

            const Id = tokenManager.getEntityId();
            const Type = tokenManager.getEntityType();

            const body = JSON.stringify({ 
                CollectionId,
                Count,
                CustomTags: {
                    user: "Zalance"
                },
                Entity: {
                    Id,
                    Type,
                }
            });

            let config = GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.headers.append("X-EntityToken", tokenManager.getToken());
            config.body = body;
    
            const response = await fetch(url, config);
            const responseJson = await response.json();

            if (response?.status === 200) {
                ({
                    Items: this._items,
                    ContinuationToken: this._invItemsContToken,
                } = responseJson.data);

                this._itemsReady = true;

                return { 
                    success: true, 
                    status: 200, 
                    Items: this._items, 
                    ContinuationToken: this._invItemsContToken 
                };
            }
            else {
                return HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return HandleErrorResponse(err);
        }
    };

    _AddInventoryItems = async (Amount, itemid, CollectionId = "default") => {
        try {
            let url = UrlPathReplace(API_INVENTORY_ADD_ITEMS, {
                titleId: this._titleId,
            });

            const body = JSON.stringify({ 
                Amount,
                CollectionId,
                CustomTags: {
                    user: "Zalance"
                },
                IdempotencyId: generateUUID(),
                Entity: {
                    Id: tokenManager.getEntityId(),
                    Type: tokenManager.getEntityType(),
                },
                Item: {
                    Id: itemid
                }
            });

            let config = GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.headers.append("X-EntityToken", tokenManager.getToken());
            config.body = body;
    
            const response = await fetch(url, config);
            const responseJson = await response.json();

            if (response?.status === 200) {
                let TransactionIds = null;
                let IdempotencyId = null;
                ({
                    TransactionIds,
                    IdempotencyId
                } = responseJson.data);

                return { 
                    success: true, 
                    status: 200, 
                    TransactionIds,
                    IdempotencyId
                };
            }
            else {
                return HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return HandleErrorResponse(err);
        }
    };

    _SubtractInventoryItems = async (Amount, itemid, CollectionId = "default") => {
        try {
            let url = UrlPathReplace(API_INVENTORY_SUBTRACT_ITEMS, {
                titleId: this._titleId,
            });

            const body = JSON.stringify({ 
                DeleteEmptyStacks: false,
                Amount,
                CollectionId,
                CustomTags: {
                    user: "Zalance"
                },
                IdempotencyId: generateUUID(),
                Entity: {
                    Id: tokenManager.getEntityId(),
                    Type: tokenManager.getEntityType(),
                },
                Item: {
                    Id: itemid
                }
            });

            let config = GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.headers.append("X-EntityToken", tokenManager.getToken());
            config.body = body;
    
            const response = await fetch(url, config);
            const responseJson = await response.json();

            if (response?.status === 200) {
                let TransactionIds = null;
                let IdempotencyId = null;
                ({
                    TransactionIds,
                    IdempotencyId
                } = responseJson.data);

                return { 
                    success: true, 
                    status: 200, 
                    TransactionIds,
                    IdempotencyId
                };
            }
            else {
                return HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return HandleErrorResponse(err);
        }
    };

    _DeleteInventoryItems = async (itemid, CollectionId = "default") => {
        try {
            let url = UrlPathReplace(API_INVENTORY_DELETE_ITEMS, {
                titleId: this._titleId,
            });

            const body = JSON.stringify({ 
                CollectionId,
                CustomTags: {
                    user: "Zalance"
                },
                IdempotencyId: generateUUID(),
                Entity: {
                    Id: tokenManager.getEntityId(),
                    Type: tokenManager.getEntityType(),
                },
                Item: {
                    Id: itemid
                }
            });

            let config = GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.headers.append("X-EntityToken", tokenManager.getToken());
            config.body = body;
    
            const response = await fetch(url, config);
            const responseJson = await response.json();

            if (response?.status === 200) {
                let TransactionIds = null;
                let IdempotencyId = null;
                ({
                    TransactionIds,
                    IdempotencyId
                } = responseJson.data);

                return { 
                    success: true, 
                    status: 200, 
                    TransactionIds,
                    IdempotencyId
                };
            }
            else {
                return HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return HandleErrorResponse(err);
        }
    };

    _GetReadyInventoryItems = (start = 0, count = 50) => {
        if(count > 50 || count < 1) {
            count = 50;
        }

        const end = start + count <= this._items.length? start + count : this._items.length;

        if(start >= this._items.length || end > this._items.length) {
            return [];
        }

        this._itemsReady = false;
        const result = this._items.subarray(start, end);
        return result;
    }
}

class Authentication
{
	constructor(titleId)
	{
		// Initialise object properties
        this._titleId = titleId;
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
	}

    _GetAccountId()
	{
        return tokenManager.getEntityId();
	}

    _VerifyUsernameForm = (username, password) => {
        if (!username || typeof username !== 'string' || username.length === 0) {
            return { success: false, errorMessage: 'Invalid username provided' };
        }
    
        if (!password || typeof password !== 'string' || password.length === 0) {
            return { success: false, errorMessage: 'Invalid password provided' };
        }
    
        return { success: true, errorMessage: undefined };
    };

    _VerifyEmailForm = (email, password) => {
        if (!email || typeof email !== 'string' || email.length === 0) {
            return { success: false, errorMessage: 'Invalid email provided' };
        }
    
        if (!password || typeof password !== 'string' || password.length === 0) {
            return { success: false, errorMessage: 'Invalid password provided' };
        }
    
        return { success: true, errorMessage: undefined };
    };

    _RegisterPlayFabUser = async (email, password, username, requireBothUsernameAndEmail = true, displayName = undefined) => {
        this._isAuthenticated = false;

        const { success, errorMessage } = this._VerifyEmailForm(email, password);
        if (!success) {
            return { success: false, status: 400, errorMessage };
        }
        
        try {
            let url = UrlPathReplace(API_AUTH_REGISTER_PLAYFAB_USER, {
                titleId: this._titleId,
            });

            const body = { 
                TitleId: this._titleId,
                Email: email, 
                Password: password, 
                Username: username
            };

            if(displayName) {
                body.DisplayName = displayName;
            }

            if(requireBothUsernameAndEmail) {
                body.RequireBothUsernameAndEmail = requireBothUsernameAndEmail;
            }

            let config = GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.body = JSON.stringify(body);

            const response = await fetch(url, config);
            const responseJson = await response.json();
            
            if (response?.status === 200) {
                let EntityToken = null;

                ({
                    EntityToken,
                    PlayFabId: this._PlayFabId,
                    SessionTicket: this._SessionTicket,
                    SettingsForUser: this._SettingsForUser,
                    Username: this._Username
                } = responseJson.data);

                tokenManager.setEntity(EntityToken);

                return { success: true, status: 200 };
            }
            else {
                return HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return HandleErrorResponse(err);
        }
    };

    _LogInWithPlayFab = async (username, password) => {
        this._isAuthenticated = false;

        const { success, errorMessage } = this._VerifyUsernameForm(username, password);
        if (!success) {
            return { success, status: 401, errorMessage };
        }
    
        try {
            let url = UrlPathReplace(API_AUTH_LOGIN_WITH_PLAYFAB, {
                titleId: this._titleId,
            });

            const body = JSON.stringify({ 
                Username: username, 
                Password: password, 
                TitleId: this._titleId 
            });

            let config = GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.body = body;
    
            const response = await fetch(url, config);
            const responseJson = await response.json();

            if (response?.status === 200) {
                let EntityToken = null;

                ({
                    EntityToken,
                    InfoResultPayload: this._InfoResultPayload, 
                    LastLoginTime: this._LastLoginTime, 
                    NewlyCreated: this._NewlyCreated,
                    PlayFabId: this._PlayFabId,
                    SessionTicket: this._SessionTicket,
                    SettingsForUser: this._SettingsForUser,
                    TreatmentAssignment: this._TreatmentAssignment
                } = responseJson.data);

                tokenManager.setEntity(EntityToken);
                
                return { success: true, status: 200 };
            }
            else {
                return HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return HandleErrorResponse(err);
        }
    };

    _LogInWithEmail = async (email, password) => {
        this._isAuthenticated = false;

        const { success, errorMessage } = this._VerifyEmailForm(email, password);
        if (!success) {
            return { success, status: 401, errorMessage };
        }
    
        try {
            let url = UrlPathReplace(API_AUTH_LOGIN_WITH_EMAIL, {
                titleId: this._titleId,
            });

            const body = JSON.stringify({ 
                Email: email, 
                Password: password, 
                TitleId: this._titleId 
            });

            let config = GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.body = body;
    
            const response = await fetch(url, config);
            const responseJson = await response.json();

            if (response?.status === 200) {
                let EntityToken = null;

                ({
                    EntityToken,
                    LastLoginTime: this._LastLoginTime, 
                    NewlyCreated: this._NewlyCreated,
                    PlayFabId: this._PlayFabId,
                    SessionTicket: this._SessionTicket,
                    SettingsForUser: this._SettingsForUser,
                    TreatmentAssignment: this._TreatmentAssignment
                } = responseJson.data);

                tokenManager.setEntity(EntityToken);

                const Id = tokenManager.getEntityId();
                const Type = tokenManager.getEntityType();
                console.log('Id', Id, 'Type', Type);
                
                return { success: true, status: 200 };
            }
            else {
                return HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return HandleErrorResponse(err);
        }
    };
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
        this._triggerInventoryAdded = false;
        this._triggerInventorySubtracted = false;
        this._triggerInventoryDeleted = false;
                    
		if (properties)		// note properties may be null in some cases
		{
			this._testProperty = properties[0];
            this._titleId = properties[1];
		}

        this._auth = new Authentication(this._titleId);
        this._inventory = new Inventory(this._titleId);
	}

    _GetAccountId()
	{
		return this._auth._GetAccountId();
	}

    

    _RegisterPlayFabUser = async (email, password, username, requireBothUsernameAndEmail = true, displayName = undefined) => {
        const result = await this._auth._RegisterPlayFabUser(email, password, username, requireBothUsernameAndEmail, displayName);
        if(result.success) {
            this._OnRegistered();
        }
        else {
            this._OnMessage(result.errorMessage);
        }
    };

    _LogInWithPlayFab = async (username, password) => {
        const result = await this._auth._LogInWithPlayFab(username, password);
        if(result.success) {
            this._OnAuthenticated();
        }
        else {
            this._OnMessage(result.errorMessage);
        }
    };

    _LogInWithEmail = async (email, password) => {
        const result = await this._auth._LogInWithEmail(email, password);
        if(result.success) {
            this._OnAuthenticated();
        }
        else {
            this._OnMessage(result.errorMessage);
        }
    };

    _GetInventoryItems = async (collectionid, count, next) => {
        const result = await this._inventory._GetInventoryItems(collectionid, count, next);
        if(result.success) {
            this.FastTrigger(C3.Plugins.PlayFabAPI.Cnds.OnInventoryReady);
        }
        else {
            this._OnMessage(result.errorMessage);
        }
    };

    _GetReadyInventoryItems()
	{
		return this._inventory._GetReadyInventoryItems();
	}

    _AddInventoryItems = async (amount, itemid, collectionid) => {
        const result = await this._inventory._AddInventoryItems(amount, itemid, collectionid);
        if(result.success) {
            this._triggerInventoryAdded = true;
            this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnInventoryAdded);
        }
        else {
            this._OnMessage(result.errorMessage);
        }
    };

    _SubtractInventoryItems = async (amount, itemid, collectionid) => {
        const result = await this._inventory._SubtractInventoryItems(amount, itemid, collectionid);
        if(result.success) {
            this._triggerInventorySubtracted = true;
            this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnInventorySubtracted);
        }
        else {
            this._OnMessage(result.errorMessage);
        }
    };

    _DeleteInventoryItems = async (itemid, collectionid) => {
        const result = await this._inventory._DeleteInventoryItems(itemid, collectionid);
        if(result.success) {
            this._triggerInventoryDeleted = true;
            this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnInventoryDeleted);
        }
        else {
            this._OnMessage(result.errorMessage);
        }
    };

    _OnRegistered = () => {
        this._isAuthenticated = true;

		// Trigger 'On Registered' in the event system
		this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnRegistered);
    }

    _OnAuthenticated = () => {
        // Dispatch script event so callers can use addEventListener("click", ...)
		// this.GetScriptInterface().dispatchEvent(new C3.Event("click", true));

        this._isAuthenticated = true;
		this.Trigger(C3.Plugins.PlayFabAPI.Cnds.OnAuthenticated);
    }

    _OnMessage = (msg) => {
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
