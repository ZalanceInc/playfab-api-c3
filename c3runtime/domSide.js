'use strict';
{
    function elemsForSelector(selector, isAll) {
        if (!selector)
            return [document.documentElement];
        else if (isAll)
            return Array.from(document.querySelectorAll(selector));
        else {
            const e = document.querySelector(selector);
            return e ? [e] : []
        }
    }

    function noop() {}
    const DOM_COMPONENT_ID = "playfabapi";
    const HANDLER_CLASS = class ZalancePlayFabDOMHandler extends self.DOMHandler {
        constructor(iRuntime) {
            super(iRuntime, DOM_COMPONENT_ID);
            this._exportType = "";
            this.AddRuntimeMessageHandlers([
                ["alert", e=>this._OnAlert(e)], 
                ["navigate", e=>this._OnNavigate(e)], 
                ["request-fullscreen", e=>this._OnRequestFullscreen(e)], 
                ["exit-fullscreen", ()=>this._OnExitFullscreen()], 
                ["set-hash", e=>this._OnSetHash(e)], 
                ["set-document-css-style", e=>this._OnSetDocumentCSSStyle(e)], 
                ["get-document-css-style", e=>this._OnGetDocumentCSSStyle(e)],
            ]);
            window.addEventListener("online", ()=>this._OnOnlineStateChanged(true));
            window.addEventListener("offline", ()=>this._OnOnlineStateChanged(false));
            window.addEventListener("hashchange", ()=>this._OnHashChange());
            document.addEventListener("backbutton", ()=>this._OnCordovaBackButton())
        }
        
        _OnCordovaBackButton() {
            this.PostToRuntime("backbutton")
        }

        GetNWjsWindow() {
            if (this._exportType === "nwjs")
                return nw["Window"]["get"]();
            else
                return null
        }

        _OnAlert(e) {
            alert(e["message"])
        }
                
        _OnNavigate(e) {
            const type = e["type"];
            if (type === "back")
                if (navigator["app"] && navigator["app"]["backHistory"])
                    navigator["app"]["backHistory"]();
                else
                    window.history.back();
            else if (type === "forward")
                window.history.forward();
            else if (type === "reload")
                location.reload();
            else if (type === "url") {
                const url = e["url"];
                const target = e["target"];
                const exportType = e["exportType"];
                if (self["cordova"] && self["cordova"]["InAppBrowser"])
                    self["cordova"]["InAppBrowser"]["open"](url, "_system");
                else if (exportType === "preview" || exportType === "windows-webview2")
                    window.open(url, "_blank");
                else if (!this._isConstructArcade)
                    if (target === 2)
                        window.top.location = url;
                    else if (target === 1)
                        window.parent.location = url;
                    else
                        window.location = url
            } else if (type === "new-window") {
                const url = e["url"];
                const tag = e["tag"];
                if (self["cordova"] && self["cordova"]["InAppBrowser"])
                    self["cordova"]["InAppBrowser"]["open"](url, "_system");
                else
                    window.open(url, tag)
            }
        }

        _OnRequestFullscreen(e) {
            if (this._exportType === "windows-webview2" || this._exportType === "macos-wkwebview") {
                self.RuntimeInterface._SetWrapperIsFullscreenFlag(true);
                this._iRuntime._SendWrapperMessage({
                    "type": "set-fullscreen",
                    "fullscreen": true
                })
            } else {
                const opts = {
                    "navigationUI": "auto"
                };
                const navUI = e["navUI"];
                if (navUI === 1)
                    opts["navigationUI"] = "hide";
                else if (navUI === 2)
                    opts["navigationUI"] = "show";
                const elem = document.documentElement;
                let ret;
                if (elem["requestFullscreen"])
                    ret = elem["requestFullscreen"](opts);
                else if (elem["mozRequestFullScreen"])
                    ret = elem["mozRequestFullScreen"](opts);
                else if (elem["msRequestFullscreen"])
                    ret = elem["msRequestFullscreen"](opts);
                else if (elem["webkitRequestFullScreen"])
                    if (typeof Element["ALLOW_KEYBOARD_INPUT"] !== "undefined")
                        ret = elem["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
                    else
                        ret = elem["webkitRequestFullScreen"]();
                if (ret instanceof Promise)
                    ret.catch(noop)
            }
        }

        _OnExitFullscreen() {
            if (this._exportType === "windows-webview2" || this._exportType === "macos-wkwebview") {
                self.RuntimeInterface._SetWrapperIsFullscreenFlag(false);
                this._iRuntime._SendWrapperMessage({
                    "type": "set-fullscreen",
                    "fullscreen": false
                })
            } else {
                let ret;
                if (document["exitFullscreen"])
                    ret = document["exitFullscreen"]();
                else if (document["mozCancelFullScreen"])
                    ret = document["mozCancelFullScreen"]();
                else if (document["msExitFullscreen"])
                    ret = document["msExitFullscreen"]();
                else if (document["webkitCancelFullScreen"])
                    ret = document["webkitCancelFullScreen"]();
                if (ret instanceof Promise)
                    ret.catch(noop)
            }
        }

        _OnSetHash(e) {
            location.hash = e["hash"]
        }

        _OnHashChange() {
            this.PostToRuntime("hashchange", {
                "location": location.toString()
            })
        }

        _OnSetDocumentCSSStyle(e) {
            const prop = e["prop"];
            const value = e["value"];
            const selector = e["selector"];
            const isAll = e["is-all"];
            try {
                const arr = elemsForSelector(selector, isAll);
                for (const e of arr)
                    if (prop.startsWith("--"))
                        e.style.setProperty(prop, value);
                    else
                        e.style[prop] = value
            } catch (err) {
                console.warn("[Browser] Failed to set style: ", err)
            }
        }

        _OnGetDocumentCSSStyle(e) {
            const prop = e["prop"];
            const selector = e["selector"];
            try {
                const elem = document.querySelector(selector);
                if (elem) {
                    const computedStyle = window.getComputedStyle(elem);
                    return {
                        "isOk": true,
                        "result": computedStyle.getPropertyValue(prop)
                    }
                } else
                    return {
                        "isOk": false
                    }
            } catch (err) {
                console.warn("[Browser] Failed to get style: ", err);
                return {
                    "isOk": false
                }
            }
        }
    };
    
    self.RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS)
};