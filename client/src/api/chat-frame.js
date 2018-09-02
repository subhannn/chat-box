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
        this.tempForm = $('<form id="chatIframe" method="post" />')
        .attr( {
            id: this.frameId,
            target: this.frameId,
            action: this.props.iFrameSrc+'?token='+this.props.token,
        } )
        .appendTo( 'body' )
        
        this.tempForm.submit().remove();
    }

    render(props,{}) {
        return (
            <iframe style={props.styles} id={this.frameId} ref={ele => {
                this.iframe = ele
            }} src="about:blank;" name={this.frameId}
                    frameborder='0' />
        );
    }
}
