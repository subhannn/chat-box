
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
		var OldHelper = window.Helper;
		var api = window.Helper = factory();
		api.noConflict = function () {
			window.Helper = OldHelper;
			return api;
		};
	}
}(function(){
    function init(){
        return {
            getFrameWindow: function(){
                if (typeof window.frames['chat'] != 'undefined') {
                    return window.frames['chat']
                }else{
                    return window
                }
            }
        }
    }

    return init()
}))