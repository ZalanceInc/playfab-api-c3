"use strict";

self.PlayFabAPI = self.PlayFabAPI || {}

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

self.PlayFabAPI.Inventory = class Inventory
{
	constructor(titleId)
	{
		// Initialise object properties
        this._titleId = titleId;
        this._items = [];
        this._invItemsContToken = null;
	}

    async _GetInventoryItems(CollectionId = "default", Count = 50, next = true) {
        try {
            let url = self.PlayFabAPI.UrlPathReplace(self.PlayFabAPI.API_INVENTORY_GET_ITEMS, {
                titleId: this._titleId,
            });

            const Id = self.PlayFabAPI.tokenManager.getEntityId();
            const Type = self.PlayFabAPI.tokenManager.getEntityType();
            const ContinuationToken = next? this._invItemsContToken : null;

            const body = { 
                Count,
                CollectionId,
                ContinuationToken,
                CustomTags: {
                    user: "Zalance"
                },
                Entity: {
                    Id,
                    Type,
                }
            };

            let config = self.PlayFabAPI.GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.headers.append("X-EntityToken", self.PlayFabAPI.tokenManager.getToken());
            config.body = JSON.stringify(body);
    
            const response = await fetch(url, config);
            const responseJson = await response.json();

            if (response?.status === 200) {
                ({
                    Items: this._items,
                    ContinuationToken: this._invItemsContToken,
                } = responseJson.data);

                return { 
                    success: true, 
                    status: 200, 
                    Items: this._items, 
                    ContinuationToken: this._invItemsContToken 
                };
            }
            else {
                return self.PlayFabAPI.HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return self.PlayFabAPI.HandleErrorResponse(err);
        }
    };

    async _AddInventoryItems(Amount, itemid, CollectionId = "default", DurationInSeconds = undefined) {
        try {
            let url = self.PlayFabAPI.UrlPathReplace(self.PlayFabAPI.API_INVENTORY_ADD_ITEMS, {
                titleId: this._titleId,
            });

            const body = { 
                Amount,
                CollectionId,
                CustomTags: {
                    user: "Zalance"
                },
                IdempotencyId: generateUUID(),
                Entity: {
                    Id: self.PlayFabAPI.tokenManager.getEntityId(),
                    Type: self.PlayFabAPI.tokenManager.getEntityType(),
                },
                Item: {
                    Id: itemid
                }
            };

            if(typeof DurationInSeconds === 'number' && DurationInSeconds > 0) {
                body.DurationInSeconds = DurationInSeconds;
            }

            let config = self.PlayFabAPI.GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.headers.append("X-EntityToken", self.PlayFabAPI.tokenManager.getToken());
            config.body = JSON.stringify(body);
    
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
                return self.PlayFabAPI.HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return self.PlayFabAPI.HandleErrorResponse(err);
        }
    };

    async _SubtractInventoryItems(Amount, itemid, CollectionId = "default", DurationInSeconds = undefined) {
        try {
            let url = self.PlayFabAPI.UrlPathReplace(self.PlayFabAPI.API_INVENTORY_SUBTRACT_ITEMS, {
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
                    Id: self.PlayFabAPI.tokenManager.getEntityId(),
                    Type: self.PlayFabAPI.tokenManager.getEntityType(),
                },
                Item: {
                    Id: itemid
                }
            });

            if(typeof DurationInSeconds === 'number' && DurationInSeconds > 0) {
                body.DurationInSeconds = DurationInSeconds;
            }

            let config = self.PlayFabAPI.GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.headers.append("X-EntityToken", self.PlayFabAPI.tokenManager.getToken());
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
                return self.PlayFabAPI.HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return self.PlayFabAPI.HandleErrorResponse(err);
        }
    };

    async _DeleteInventoryItems(itemid, CollectionId = "default") {
        try {
            let url = self.PlayFabAPI.UrlPathReplace(self.PlayFabAPI.API_INVENTORY_DELETE_ITEMS, {
                titleId: this._titleId,
            });

            const body = JSON.stringify({ 
                CollectionId,
                CustomTags: {
                    user: "Zalance"
                },
                IdempotencyId: generateUUID(),
                Entity: {
                    Id: self.PlayFabAPI.tokenManager.getEntityId(),
                    Type: self.PlayFabAPI.tokenManager.getEntityType(),
                },
                Item: {
                    Id: itemid
                }
            });

            let config = self.PlayFabAPI.GetConfig();
            config.method = 'POST';
            config.headers = new Headers();
            config.headers.append("Content-Type", "application/json");
            config.headers.append("X-EntityToken", self.PlayFabAPI.tokenManager.getToken());
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
                return self.PlayFabAPI.HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return self.PlayFabAPI.HandleErrorResponse(err);
        }
    };

    _GetReadyInventoryItems(start = 0, count = 50) {
        if(count > 50 || count < 1) {
            count = 50;
        }

        const end = start + count <= this._items.length? start + count : this._items.length;

        if(start >= this._items.length || end > this._items.length) {
            return [];
        }

        const result = this._items.subarray(start, end);
        return result;
    }
}