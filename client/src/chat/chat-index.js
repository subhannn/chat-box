import { h, render } from 'preact';
import Chat from './chat';
import InputInfo from './input-info';
import * as store from 'store'
var jwt = require('jwt-simple');

let conf = {};
const token = getUrlParameter('token');
if (token) {
    try {
        let confString = jwt.decode(token, getUrlParameter('host')) //JSON.parse(confString);
        conf = JSON.parse(confString)
    } catch (e) {
        console.log('Failed to parse conf', confString, e);
    }
}

render(
    // <Chat
    //     chatId={conf.channelId}
    //     userId={getUserId()}
    //     host={getUrlParameter('host')}
    //     conf={conf}
    // />,
    <InputInfo
        chatId={conf.channelId}
        userId={getUserId()}
        host={getUrlParameter('host')}
        conf={conf}
    />,
    document.getElementById('boxChat')
);

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getUserId () {
    if (store.enabled) {
        return store.get('userId') || store.set('userId', generateRandomId());
    } else {
        return generateRandomId();
    }
}

function generateRandomId() {
    return Math.random().toString(36).substr(2, 6);
}