import { h, Component } from 'preact';
var jwt = require('jwt-simple');
var $ = require('jquery');

export default class ChatFrame extends Component {
    frameId = 'chatFrame'

    constructor(props){
        super(props)
    }

    componentDidMount() {
        this.onDone()
        var $this = this
        $(this.iframe)
            .on('load', function(){
                setTimeout(function(){
                    $this.onLoad(this)
                }.bind(this), 200)
            })
    }

    onLoad = (ele) => {
        var iframe = $(ele).contents()
        console.log(iframe)
        iframe.find('#cancel').on('click', function(e){
            e.preventDefault()
            this.props.onCancel()
        }.bind(this))
    }

    onDone = () => {
        var host = getRunningScript()
        let ecode = jwt.encode(JSON.stringify(this.props.conf), host.hostname)
        this.tempForm = $('<form id="chatIframe" method="post" />')
        .attr( {
            id: this.frameId,
            // target: this.frameId,
            action: this.props.iFrameSrc + '?token=' + ecode+'&host='+host.hostname
        } )
        .appendTo( 'body' );
        var $this = this
        var currentPath = getRunningScript()
        // $.ajaxSetup()
        $('#chatIframe').submit(function(e){
            var $form = this
            e.preventDefault()
            $.ajax({
                type: "POST",
                url: $(this).attr('action'),
                headers: {
                    "Origin-Form": currentPath.protocol+'//'+currentPath.host
                },
                success: function(data)
                {
                    console.log(data)
                    $('#chatFrame', data)
                }
            });
        }).remove();
    }

    render({channelId, host, iFrameSrc, isMobile, conf},{}) {
        let dynamicConf = window.intergramOnOpen || {}; // these configuration are loaded when the chat frame is opened
        
        return (
            <iframe id={this.frameId} ref={ele => {
                this.iframe = ele
            }} src="about:blank;" name={this.frameId}
                    width='100%'
                    height={isMobile ? '94%' : '100%'}
                    frameborder='0' />
        );
    }
}
