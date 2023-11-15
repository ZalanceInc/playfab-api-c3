
const SDK = self.SDK;

const PLUGIN_CLASS = SDK.Plugins.PlayFabAPI;

PLUGIN_CLASS.Type = class ZalancePlayFabType extends SDK.ITypeBase
{
	constructor(sdkPlugin, iObjectType)
	{
		super(sdkPlugin, iObjectType);
	}
};
