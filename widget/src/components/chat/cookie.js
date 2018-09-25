import Cookies from 'js-cookie'
var jwt = require('jwt-simple');
import Config from './config'

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
		var OldCookie = window.Cookie;
		var api = window.Cookie = factory();
		api.noConflict = function () {
			window.Cookie = OldCookie;
			return api;
		};
	}
}(function(){
    function init(){
        return {
            getCookie: function(key){
                let COOKIE_KEY = 'chatbox_auth'
                var token = Cookies.get(COOKIE_KEY)
                if (token) {
                    var options = jwt.decode(token, "chatboxxx")
                    if (typeof options[key] != 'undefined') {
                        return options[key]
                    }
                    return null
                }else{
                    return null
                }
            },
            removeCookie: function(key){
                let COOKIE_KEY = 'chatbox_auth'
                var token = Cookies.get(COOKIE_KEY)
                if (token) {
                    var options = jwt.decode(token, "chatboxxx")
                    if (typeof options[key] != 'undefined') {
                        delete options[key]
                        var jwtStr = jwt.encode(options, "chatboxxx")
                        Cookies.set(COOKIE_KEY, jwtStr, {
                            expires: Config.getConfig('settings.cookieExpiration'),
                            domain: document.location.hostname,
                        })
                        return true
                    }
                    return false
                }else{
                    return false
                }
            },
            saveToCookie: function(data) {
                let COOKIE_KEY = 'chatbox_auth'
        
                var token = Cookies.get(COOKIE_KEY)
                if (token) {
                    var options = jwt.decode(token, "chatboxxx")
                    Object.assign(options, data);
                }else{
                    var options = {}
                    Object.assign(options, data);
                }
                var jwtStr = jwt.encode(options, "chatboxxx")
                Cookies.set(COOKIE_KEY, jwtStr, {
                    expires: 1,
                    domain: document.location.hostname,
                })
            }
        }
    }

    return init()
}))