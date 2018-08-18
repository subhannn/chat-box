import { h, Component } from 'preact';
var jwt = require('jwt-simple');

export default class ChatFrame extends Component {
    
    constructor(props){
        super(props)
        this.iframeRef = element => {
            element.addEventListener('load', this.onIframeLoad)
        }
    }

    shouldComponentUpdate() {
        // do not re-render via diff:
        // console.log(this.refs.iframe)
        // this.refs.iframe.getDOMNode().addEventListener('load', this.onIframeLoad)
        return false;
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
            <iframe id="chatIframe" ref={this.iframeRef} src={iFrameSrc + '?token=' + ecode + '&host=' + host }
                    width='100%'
                    height={isMobile ? '94%' : '100%'}
                    frameborder='0' />
        );
    }
}
