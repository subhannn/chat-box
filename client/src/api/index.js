import { h, render } from 'preact';
import ChatFrame from './chat-frame';
import {$, jQuery} from 'jquery'
import Cookie from '../widget/cookie'
import * as store from 'store'
var jwt = require('jwt-simple')
import Frame from 'react-frame-component';

import {
    mobileOpenWrapperStyle, 
    mobileClosedWrapperStyle,
    iframeContainer,
    desktopCloseContainer,
    desktopOpenContainer,
} from "../widget/style";

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
    window.Chat = new ChatObject()
    window.Chat.init()
}

function getAccountKey() {
    console.log(window.document)
    var url = document.currentScript.getAttribute('src')
    var regex = new RegExp('[\\?&]([^&#]*)');
    var results = regex.exec(url);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

class ChatObject {
    root = null
    conf = {}

    constructor(){
        return this
    }

    init(){
        window.addEventListener('message', function(e){
            if (typeof e.data.message != 'undefined' && e.data.message == "chatopened") {
                this.chatOpened(e.data.isChatOpen)
            }
            if (typeof e.data.message != 'undefined' && e.data.message == "setconfig") {
                this.setConfig(e.data.config)
            }
        }.bind(this))

        this.injectIframe()
    }

    injectIframe() {
        this.root = document.createElement('div');
        this.root.id = 'chatBoxRoot';
        document.getElementsByTagName('body')[0].appendChild(this.root);
        var currentPath = getRunningScript()
        console.log(currentPath)
        var server = currentPath.protocol+'//'+currentPath.host;
        this.conf = {
            accountKey: getAccountKey(),
            origin: document.location.protocol+'//'+document.location.host,
            isMobile: this.isMobile()
        };
        
        this.chatOpened(this.wasChatOpened())
        var token = jwt.encode(this.conf, "apikmedia123")

        render(
            <ChatFrame styles={iframeContainer} iFrameSrc={server+'/iframe'} token={token} conf={this.conf} />,
            document.body,
        );
    }

    isMobile = () => {
        if (window.screen.width < 500){
            return true
        }

        return false
    }

    chatOpened = (isChatOpen) => {
        const desktopHeight = (window.innerHeight - 100 < 450) ? window.innerHeight - 90 : 450;
        const wrapperHeight = {height: desktopHeight+'px'};
        
        let wrapperStyle;
        if (!isChatOpen && (this.isMobile())) {
            wrapperStyle = { ...mobileClosedWrapperStyle}; // closed mobile floating button
        } else if (!this.isMobile()){
            wrapperStyle = (isChatOpen || this.wasChatOpened()) ?
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

    setConfig = (config) => {
        Object.assign(this.conf, config);
        if (store.enabled) {
            store.set('_cbconf', this.conf)
        }
    }

    getCookie = () => {
        return Cookie.getCookie("chatOpened");
    }
    
    wasChatOpened = () => {
        return (this.getCookie() == true) ? true : false;
    }
}

init()