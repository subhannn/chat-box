import { h, render } from 'preact';
import Widget from './widget';
import {defaultConfiguration} from './default-configuration';
var jwt = require('jwt-simple')

if (window.attachEvent) {
    window.attachEvent('onload', init);
} else {
    window.addEventListener('load', init, false);
}

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

window.chatLog = function(){
    if (arguments.length > 0) {
        console.log(arguments[0])
    }
}

function init(){
    var token = getUrlParameter('token')
    if (token != "") {
        // try {
            let confString = jwt.decode(token, "apikmedia123", true)
            // console.log(confString)
            // chatLog(confString)
            var chat = new ChatObject()
            chat.init(confString)
        // } catch (e) {
        //     console.log('Failed to parse conf', e);
        // }
    }
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

class ChatObject {
    constructor(){
        return this
    }

    init(options){
        Object.assign(defaultConfiguration, options)
        
        this.injectChat()
    }

    injectChat() {
        if (!defaultConfiguration.channelId) {
            console.error('Please set channelId in Init Config');
        } else {
            let root = document.createElement('div');
            root.id = 'chatBoxRoot';
            document.getElementsByTagName('body')[0].appendChild(root);
            var currentPath = getRunningScript()
            const server = defaultConfiguration.serverUrl || currentPath.protocol+'//'+currentPath.host;
            defaultConfiguration.serverUrl = server
            const host = window.location.host || 'unknown-host';
            const conf = { ...defaultConfiguration, ...window.intergramCustomizations };

            render(
                <Widget channelId={defaultConfiguration.channelId}
                        host={host}
                        isMobile={conf.isMobile}
                        conf={conf}
                />,
                root
            );
        }
    }
}
