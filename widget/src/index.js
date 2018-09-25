import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import io from 'socket.io-client'
import Config from './components/chat/config'

window.ChatRoot = document.createElement('div')
document.getElementsByTagName('body')[0].appendChild(window.ChatRoot);

function getAccountKey() {
    let regex = new RegExp('[\\?&]([^&#]*)');
    let results = regex.exec(document.currentScript.src);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

var st = []
var style = document.querySelectorAll('._chatboxLoaderCss')
style.forEach(element => {
    var cl = element.cloneNode(true)
    st.push(cl.innerHTML)
    element.remove()
});
st = st.join("\n")
var accountKey = getAccountKey()
var connected = false

window.SocketIO = io(process.env.SOCKET_URL, {
    transports: ['websocket'],
    path: 'ws',
    query: {
        token: accountKey
    }
})

window.SocketIO.on('connect', function(event){
    window.SocketIO.emit('connected', {}, function(data){
        connected = true
        if(typeof data.accountKey != 'undefined'){
            try{
                Config.saveConfig(data)
                ReactDOM.render(<App rootElement={window.ChatRoot} parentStyle={st} />, window.ChatRoot)
            }catch(e){
                console.error(e)
            }
        }

    })

    window.SocketIO.on('disconnect', () => {
        console.log('disconnect')
    })
})

window.SocketIO.on('connect_error', (error, a, b) => {
    if (error.type == 'TransportError' && connected == false) {
        window.SocketIO.close()
    }
})