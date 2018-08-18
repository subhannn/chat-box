import { h, render } from 'preact';
import Widget from './widget';
import {defaultConfiguration} from './default-configuration';

if (window.attachEvent) {
    window.attachEvent('onload', init);
} else {
    window.addEventListener('load', init, false);
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
        
        this.injectChat()
    }

    injectChat() {
        if (!defaultConfiguration.channelId) {
            console.error('Please set channelId in Init Config');
        } else {
            let root = document.createElement('div');
            root.id = 'chatBoxRoot';
            document.getElementsByTagName('body')[0].appendChild(root);
            const server = defaultConfiguration.serverUrl || 'http://localhost:9000';
            const iFrameSrc = server + '/chat.html';
            const host = window.location.host || 'unknown-host';
            const conf = { ...defaultConfiguration, ...window.intergramCustomizations };
    
            render(
                <Widget channelId={defaultConfiguration.channelId}
                        host={host}
                        isMobile={window.screen.width < 500}
                        iFrameSrc={iFrameSrc}
                        conf={conf}
                />,
                root
            );
    
            // try {
            //     const request = new XMLHttpRequest();
            //     request.open('POST', server + '/usage-start?host=' + host);
            //     request.send();
            // } catch (e) { console.log(e) /* Fail silently */ }
    
        }
    }
}
