"use strict";

self.PlayFabAPI = self.PlayFabAPI || {}

self.PlayFabAPI.Authentication = class Authentication
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
        return self.PlayFabAPI.tokenManager.getEntityId();
    }

    _VerifyUsernameForm(username, password) {
        if (!username || typeof username !== 'string' || username.length === 0) {
            return { success: false, errorMessage: 'An username is required.' };
        }
    
        if (!password || typeof password !== 'string' || password.length === 0) {
            return { success: false, errorMessage: 'A valid password is required.' };
        }
    
        return { success: true, errorMessage: undefined };
    };

    _VerifyEmailForm(email, password) {
        if (!email || typeof email !== 'string' || email.length === 0) {
            return { success: false, errorMessage: 'An email is required.' };
        }
    
        if (!password || typeof password !== 'string' || password.length === 0) {
            return { success: false, errorMessage: 'A valid password is required.' };
        }
    
        return { success: true, errorMessage: undefined };
    };

    _VerifyUsernameOrEmailForm(email, password, username) {
        if ((typeof email !== 'string' || email.length === 0) && (typeof username !== 'string' || username.length === 0)) {
            return { success: false, errorMessage: 'An email or username is required.' };
        }
    
        if (!password || typeof password !== 'string' || password.length === 0) {
            return { success: false, errorMessage: 'A valid password is required.' };
        }
    
        return { success: true, errorMessage: undefined };
    };

    async _RegisterPlayFabUser(email, password, username, requireBothUsernameAndEmail = undefined, displayName = undefined) {
        this._isAuthenticated = false;

        const { success, errorMessage } = this._VerifyUsernameOrEmailForm(email, password, username);
        if (!success) {
            return { success: false, status: 400, errorMessage };
        }
        
        try {
            let url = self.PlayFabAPI.UrlPathReplace(
                self.PlayFabAPI.API_AUTH_REGISTER_PLAYFAB_USER, 
                { titleId: this._titleId }
            );

            const body = { 
                TitleId: this._titleId,
                Password: password, 
            };

            if(email && email.length) {
                body.Email = email;
            }

            if(username && username.length) {
                body.Username = username;
            }

            if(typeof requireBothUsernameAndEmail === 'boolean') {
                body.RequireBothUsernameAndEmail = requireBothUsernameAndEmail;
            }

            if(typeof displayName === 'string' && displayName.length) {
                body.DisplayName = displayName;
            }

            let config = self.PlayFabAPI.GetConfig();
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

                self.PlayFabAPI.tokenManager.setEntity(EntityToken);

                return { success: true, status: 200 };
            }
            else {
                return self.PlayFabAPI.HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return self.PlayFabAPI.HandleErrorResponse(err);
        }
    };

    async _LogInWithPlayFab(username, password) {
        this._isAuthenticated = false;

        const { success, errorMessage } = this._VerifyUsernameForm(username, password);
        if (!success) {
            return { success, status: 401, errorMessage };
        }
    
        try {
            let url = self.PlayFabAPI.UrlPathReplace(self.PlayFabAPI.API_AUTH_LOGIN_WITH_PLAYFAB, {
                titleId: this._titleId,
            });

            const body = JSON.stringify({ 
                Username: username, 
                Password: password, 
                TitleId: this._titleId 
            });

            let config = self.PlayFabAPI.GetConfig();
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

                self.PlayFabAPI.tokenManager.setEntity(EntityToken);
                
                return { success: true, status: 200 };
            }
            else {
                return self.PlayFabAPI.HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return self.PlayFabAPI.HandleErrorResponse(err);
        }
    };

    async _LogInWithEmail(email, password) {
        this._isAuthenticated = false;

        const { success, errorMessage } = this._VerifyEmailForm(email, password);
        if (!success) {
            return { success, status: 401, errorMessage };
        }
    
        try {
            let url = self.PlayFabAPI.UrlPathReplace(self.PlayFabAPI.API_AUTH_LOGIN_WITH_EMAIL, {
                titleId: this._titleId,
            });

            const body = JSON.stringify({ 
                Email: email, 
                Password: password, 
                TitleId: this._titleId 
            });

            let config = self.PlayFabAPI.GetConfig();
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

                self.PlayFabAPI.tokenManager.setEntity(EntityToken);

                const Id = self.PlayFabAPI.tokenManager.getEntityId();
                const Type = self.PlayFabAPI.tokenManager.getEntityType();
                
                return { success: true, status: 200 };
            }
            else {
                return self.PlayFabAPI.HandleErrorResponse(responseJson);
            }
        } catch (err) {
            return self.PlayFabAPI.HandleErrorResponse(err);
        }
    };
};