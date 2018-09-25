import store from 'store'

window.getRunningScript = function() {
    let err = new Error()
    let link = err.stack.split('(')
    link = link[1]
    link = link.split(')')[0]
    link = link.split(':')
    link.splice(-2, 2)
    link = link.join(':')

    var l = document.createElement("a")
    l.href = link

    return l
}

;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldConfig = window.Config;
		var api = window.Config = factory();
		api.noConflict = function () {
			window.Config = OldConfig;
			return api;
		};
	}
}(function(){
    const KEY_STORAGE = '_cbconf'
    const DEFAULT_CONF = {}
    function init(){
        return {
            getConfig: function(key){
                if (store.enabled) {
                    var config = store.get(KEY_STORAGE)
                    if (!config) {
                        config = {}
                    }
                    config = { ...config, ...DEFAULT_CONF }

                    var splt = key.split('.')
                    var result = config
                    splt.forEach(function(val, index){
                        if (typeof result[val] != 'undefined') {
                            result = result[val]
                            if (index == (splt.length-1)) {
                                return
                            }
                        }else{
                            result = null
                            return
                        }
                    })

                    return result
                }else{
                    throw "Local Storage not enabled, plase use new browser."
                }
            },
            saveConfig: function(config){
                if (store.enabled) {
                    store.set(KEY_STORAGE, config)
                }else{
                    throw "Local Storage not enabled, plase use new browser."
                }
            }
        }
    }

    return init()
}))