self.PlayFabAPI = self.PlayFabAPI || {}

const API_DOMAIN = 'https://{titleId}.playfabapi.com';
self.PlayFabAPI.API_PRICES_DOMAIN = 'https://x8ki-letl-twmt.n7.xano.io/api:kkl1GMQr';
self.PlayFabAPI.API_AUTH_LOGIN_WITH_PLAYFAB = API_DOMAIN + '/Client/LoginWithPlayFab';
self.PlayFabAPI.API_AUTH_LOGIN_WITH_EMAIL = API_DOMAIN + '/Client/LoginWithEmailAddress';
self.PlayFabAPI.API_AUTH_REGISTER_PLAYFAB_USER = API_DOMAIN + '/Client/RegisterPlayFabUser';
self.PlayFabAPI.API_INVENTORY_GET_ITEMS = API_DOMAIN + '/Inventory/GetInventoryItems';
self.PlayFabAPI.API_INVENTORY_ADD_ITEMS = API_DOMAIN + '/Inventory/AddInventoryItems';
self.PlayFabAPI.API_INVENTORY_SUBTRACT_ITEMS = API_DOMAIN + '/Inventory/SubtractInventoryItems';
self.PlayFabAPI.API_INVENTORY_DELETE_ITEMS = API_DOMAIN + '/Inventory/DeleteInventoryItems';


self.PlayFabAPI.GetConfig = () => {
    const config = {
        method: 'GET',
        headers: undefined,
        body: undefined,
        // credentials: 'include',
        redirect: 'follow',
    };

    return config;
};

self.PlayFabAPI.UrlPathReplace = (path, params, isLocalParam = false) => {
    const exp = isLocalParam ? /:\w+/g : /{\w+}/g;

    const result = path.replace(exp, (placeholder) => {
        const length = isLocalParam ? placeholder.length : placeholder.length - 1;
        return params[placeholder.substring(1, length)] || placeholder;
    });

    return result;
};

self.PlayFabAPI.HandleErrorResponse = (err) => {
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