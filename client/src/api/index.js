import { h, render } from 'preact';
import {defaultConfiguration} from '../widget/default-configuration';
import ChatFrame from './chat-frame';
var jwt = require('jwt-simple')

import {
    desktopTitleStyle, 
    desktopWrapperStyle,
    mobileOpenWrapperStyle, 
    mobileClosedWrapperStyle,
    desktopClosedWrapperStyleChat,
    chatOpened,
} from "../widget/style";

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
    if(typeof window.chatAsyncInit == "function"){
        window.Chat = new ChatObject()
        window.chatAsyncInit()
    }
}

class ChatObject {
    constructor(){
        return this
    }

    init(options){
        Object.assign(defaultConfiguration, options)
        
        this.injectIframe()
    }

    injectIframe() {
        if (!defaultConfiguration.channelId) {
            console.error('Please set channelId in Init Config');
        } else {
            let root = document.createElement('div');
            root.id = 'chatBoxRoot';
            document.getElementsByTagName('body')[0].appendChild(root);
            var currentPath = getRunningScript()
            const server = defaultConfiguration.serverUrl || currentPath.protocol+'//'+currentPath.host;
            defaultConfiguration.serverUrl = server
            const conf = { ...defaultConfiguration, ...window.intergramCustomizations };
            
            var isChatOpen = false
            var isMobile = false
            if (window.screen.width < 500){
                isMobile = true
            }

            let wrapperStyle;
            if (!isChatOpen && (isMobile || conf.alwaysUseFloatingButton)) {
                wrapperStyle = { ...mobileClosedWrapperStyle}; // closed mobile floating button
            } else if (!isMobile){
                wrapperStyle = (conf.closedStyle === 'chat' || isChatOpen || this.wasChatOpened()) ?
                    (isChatOpen) ? 
                        { ...desktopWrapperStyle, ...wrapperWidth, ...chatOpened} // desktop mode, button style
                        :
                        { ...desktopWrapperStyle}
                    :
                    { ...desktopClosedWrapperStyleChat}; // desktop mode, chat style
            } else {
                wrapperStyle = mobileOpenWrapperStyle; // open mobile wrapper should have no border
            }
            conf.isMobile = isMobile

            var token = jwt.encode(conf, "apikmedia123")
            chatLog(token)
            
            Object.assign(root.style, wrapperStyle);
            render(
                <ChatFrame iFrameSrc={server+'/iframe'} token={token} conf={conf} />,
                root,
            );
        }
    }
}
