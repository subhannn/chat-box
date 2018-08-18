import { h, Component } from 'preact';
var jwt = require('jwt-simple');

export default class ChatFrame extends Component {
    
    constructor(props){
        super(props)
    }

    onIframeLoad = () => {
        var iframe = document.getElementById('chatIframe');
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        innerDoc.getElementById("cancel").addEventListener('click', this.onCancel)
    }

    onCancel = (e) => {
        this.props.onCancel()
    }

    render({channelId, host, iFrameSrc, isMobile, conf},{}) {
        let dynamicConf = window.intergramOnOpen || {}; // these configuration are loaded when the chat frame is opened
        let encodedConf = encodeURIComponent(JSON.stringify({...conf, ...dynamicConf}));
        let ecode = jwt.encode(JSON.stringify(conf), host)
        
        return (
            <iframe id="chatIframe" ref={(ele) => {
                this.iframe = ele
            }} onload={this.onIframeLoad} src={iFrameSrc + '?token=' + ecode + '&host=' + host }
                    width='100%'
                    height={isMobile ? '94%' : '100%'}
                    frameborder='0' />
        );
    }
}
