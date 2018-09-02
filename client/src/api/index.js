import { h, render } from 'preact';
import {defaultConfiguration} from '../widget/default-configuration';
import ChatFrame from './chat-frame';
var jwt = require('jwt-simple')

import {
    desktopTitleStyle, 
    desktopWrapperStyle,
    mobileOpenWrapperStyle, 
    mobileClosedWrapperStyle,
    iframeContainer,
    chatOpened,
    desktopCloseContainer,
    desktopOpenContainer,
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
    root = null
    conf = {}

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
            this.root = document.createElement('div');
            this.root.id = 'chatBoxRoot';
            document.getElementsByTagName('body')[0].appendChild(this.root);
            var currentPath = getRunningScript()
            const server = defaultConfiguration.serverUrl || currentPath.protocol+'//'+currentPath.host;
            defaultConfiguration.serverUrl = server
            this.conf = { ...defaultConfiguration, ...window.intergramCustomizations };
            
            this.chatOpened(false)
            var token = jwt.encode(this.conf, "apikmedia123")
            chatLog(token)

            render(
                <ChatFrame styles={iframeContainer} iFrameSrc={server+'/iframe'} token={token} conf={this.conf} />,
                this.root,
            );
        }
    }

    chatOpened = (isChatOpen) => {
        const wrapperWidth = {width: this.conf.desktopWidth};
        const desktopHeight = (window.innerHeight - 100 < this.conf.desktopHeight) ? window.innerHeight - 90 : this.conf.desktopHeight;
        const wrapperHeight = {height: desktopHeight+'px'};
        console.log(wrapperHeight)
        var isMobile = false
        if (window.screen.width < 500){
            isMobile = true
        }
        console.log(isChatOpen)
        let wrapperStyle;
        if (!isChatOpen && (isMobile || this.conf.alwaysUseFloatingButton)) {
            wrapperStyle = { ...mobileClosedWrapperStyle}; // closed mobile floating button
        } else if (!isMobile){
            wrapperStyle = (this.conf.closedStyle === 'chat' || isChatOpen || this.wasChatOpened()) ?
                (isChatOpen) ? 
                    { ...desktopOpenContainer, ...wrapperHeight} // desktop mode, button style
                    :
                    { ...desktopCloseContainer}
                :
                { ...desktopOpenContainer}; // desktop mode, chat style
        } else {
            wrapperStyle = mobileOpenWrapperStyle; // open mobile wrapper should have no border
        }

        Object.assign(this.root.style, wrapperStyle);
    }

    getCookie = () => {
        var nameEQ = "chatwasopened=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return false;
    }
    
    wasChatOpened = () => {
        return (this.getCookie() === false) ? false : true;
    }
}