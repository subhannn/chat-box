import { h, render } from 'preact';
import Widget from './widget';
import {defaultConfiguration} from './default-configuration';
var jwt = require('jwt-simple')
import io from './socket.io'

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
        try {
            let confString = jwt.decode(token, "apikmedia123", true)
            var chat = new ChatObject()
            chat.init(confString)
        } catch (e) {
            console.log('Failed to parse conf', e);
        }
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
        this.conf = {}
        Object.assign(this.conf, options)
        
        this.connectSocket()
        // this.injectChat()
    }

    injectChat() {
        let root = document.createElement('div');
        root.id = 'chatBoxRoot';
        document.getElementsByTagName('body')[0].appendChild(root);
        this.conf = defaultConfiguration;

        render(
            <Widget isMobile={this.conf.isMobile}
                    conf={this.conf}
            />,
            root
        );
    }

    connectSocket () {
        var scheme = document.location.protocol == "https:" ? "wss" : "ws";
        var port = document.location.port ? (":" + document.location.port) : "";
        var wsURL = scheme + "://" + document.location.hostname + port;

        window.SocketIO = io(wsURL, {
            path: '/ws'
        });

        window.SocketIO.on("connect", this.onConnect.bind(this))
    }

    onConnect () {
        console.log(this.conf)
        window.SocketIO.emit('connected', this.conf, function(data){
            console.log(data)
        })
    }
}
