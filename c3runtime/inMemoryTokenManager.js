self.PlayFabAPI = self.PlayFabAPI || {}

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

self.PlayFabAPI.tokenManager = inMemoryTokenManager();