self.C3.Plugins.PlayFabAPI.Cnds =
{
	IsLargeNumber(number)
	{
		return number > 100;
	},
    OnRegistered()
	{
		return true;
	},
    OnAuthenticated()
	{
		return this._isAuthenticated;
	},
    OnMessage() {
        if(this._triggerMessage) {
            this._triggerMessage = false;
            return true;
        }

        return false;
    },
    OnInventoryReady() {
        return this._inventory._itemsReady;
    },
    OnInventoryAdded() {
        if(this._triggerInventoryAdded) {
            this._triggerInventoryAdded = false;
            return true;
        }

        return false;
    },
    OnInventorySubtracted() {
        if(this._triggerInventorySubtracted) {
            this._triggerInventorySubtracted = false;
            return true;
        }

        return false;
    },
    OnInventoryDeleted() {
        if(this._triggerInventoryDeleted) {
            this._triggerInventoryDeleted = false;
            return true;
        }

        return false;
    },
    OnOpened() {
        return true;
    },
    OnClosed() {
        return true;
    },
    OnError() {
        return true;
    },
    OnBinaryMessage(objectClass) {
        if (!objectClass) {
            return false;
        }

        const inst = objectClass.GetFirstPicked(this._inst);
        if (!inst) {
            return false;
        }

        const sdkInst = inst.GetSdkInstance();
        sdkInst.SetArrayBufferTransfer(this._mmWS._ws?._messageBinary);
        return true;
    },
    IsOpen() {
        return this._mmWS._ws && this._mmWS._ws.readyState === 1;
    },
    IsConnecting() {
        return this._mmWS._ws && this._mmWS._ws.readyState === 0;
    },
    IsSupported() {
        return true;
    }
};
