import * as store from 'store'
import { h, Component } from 'preact';
import MessageArea from './message-area';
import GoBot from './go-bot';
import * as $ from 'jquery'

export default class Chat extends Component {

    autoResponseState = 'pristine'; // pristine, set or canceled
    autoResponseTimer = 0;
    socket = null;

    constructor(props) {
        super(props);
        
        this.state.showGoBot = false
        this.state.unread = 0
        if (store.enabled) {
            this.messagesKey = 'messages' + '.' + props.chatId + '.' + props.host;
            this.state.messages = store.get(this.messagesKey) || store.set(this.messagesKey, []);
            let info = store.get('userInfo')
            if(info){
                this.props.name = info.name
                this.props.email = info.email
            }
        } else {
            this.state.messages = [];
        }
    }

    componentDidMount() {
        var scheme = document.location.protocol == "https:" ? "wss" : "ws";
        var port = document.location.port ? (":" + document.location.port) : "";
        // see app.Get("/echo", ws.Handler()) on main.go
        var wsURL = scheme + "://" + document.location.hostname + port+"/ws";

        this.socket = io(wsURL);

        this.socket.on("connect", this.onConnect)
        this.socket.on("disconnect", this.onDisconnect)
        this.socket.on("error", this.onError)
        this.socket.on("connect_error", this.onError)
        this.socket.on("reconnecting", function(att){
            console.log("reconnection")
            console.log(att)
        })
        console.log("Bind Chat chat-"+this.props.userId)
        this.socket.on("chat-"+this.props.userId, this.incomingMessage)

        if (typeof this.contEle != 'undefined') {
            var c = this.input.clientHeight + this.banner.clientHeight
            this.contEle.style.cssText = 'bottom: '+c+'px';
        }

        this.loadMessages()
    }

    loadMessages = (before) => {
        var $this = this
        var data = {
            roomId: this.props.userId,
            limit: 10
        }

        if (before != "") {
            data["before"] = before
        }

        $.ajax({
            url: '/api/messages',
            type: "GET",
            dataType: "json",
            data: data,
            success: function (data) {
                if (typeof data.data != 'undefined' && data.data.length > 0) {
                    $this.state.messages = data.data.reverse()
                    $this.setState({
                        message: $this.state.messages
                    });
                    setTimeout(function(){
                        $this.contEle.scrollTop = $this.contEle.scrollHeight
                    }, 200)
                }
            },
            fail: function (err) {
                console.log("Encountered an error")
                console.log(err)
            }
        });
    }

    onConnect = () => {
        console.log("connect")
        console.log(this.props)
        this.socket.emit("register", {
            userId: this.props.userId,
            chatId: this.props.chatId,
            name: this.props.name,
            email: this.props.email
        })
        // this.writeMessage('Admin Bot', this.props.conf.introMessage, 'admin')
    }

    onDisconnect = () => {
        console.log("disconnect")
    }

    render({},state) {
        return (
            <div>
                <div class="contMsg" ref={(ele) => { this.contEle = ele } } onScroll={this.onMessageScroll}>
                    <MessageArea messages={this.state.messages} conf={this.props.conf}/>
                </div>
                <GoBot conf={this.props.conf} show={this.state.showGoBot} onGoBot={() => {
                    this.setState({
                        unread: 0
                    })
                    this.contEle.scrollTop = this.contEle.scrollHeight
                }} unread={this.state.unread}/>

                <div class="fix-bot">
                       <div class="container-msg" ref={(ele) => { this.cont = ele }}>
                            <textarea name="message" class="textarea" rows="2" spellcheck="false" ref={(input) => { this.input = input }} 
                            onKeyPress={this.handleKeyPress}
                            onInput={this.handleChange}
                            placeholder={this.props.conf.placeholderText}></textarea>
                        </div>

                    <a ref={(ele) => { this.banner = ele } } class="banner" href="https://github.com/subhannn" target="_blank">
                        Powered by <b>NiceChatBox</b>&nbsp;
                    </a>
                </div>
            </div>
        );
    }

    handleChange = (e) => {
        var $this = this
        this.cont.style.cssText = 'height:'+e.target.scrollHeight+'px'
    }

    onError = (error) => {
        console.log('error')
        console.log(error)
    }

    handleKeyPress = (e) => {
        if (e.keyCode == 13 && this.input.value) {
            e.preventDefault()

            if (!this.userActive()) {
                this.writeMessage("Admin", "Your chat has ended, your message not send.", "admin", "notification")
                this.input.value = '';
                return
            }

            let text = this.input.value;
            let data = {
                chatId: this.props.chatId, 
                userId: this.props.userId,
                name: this.props.name,
                email: this.props.email,
                text: text,
                from: 'visitor',
                type: 'chat'
            }
            this.socket.emit("chat", data, (data) => {
                console.log(data)
            })
            this.input.value = '';
            // this.writeMessage(this.props.name, data.text, data.from)
        }
    };

    incomingMessage = (msg) => {
        var name = msg.name
        if (msg.alias != "") {
            name = msg.alias
        }
        this.writeMessage(name, msg.text, msg.from, msg.type)
        if (msg.type == 'notification') {
            if (msg.command == "endsession") {
                if (store.enabled) {
                    store.clear()
                }
            }
        }else{
            if (msg.from === 'admin') {
                document.getElementById('messageSound').play();
            }
        }

        var $this = this
        setTimeout(function(){
            $this.autoScrollToBot( (msg.from == 'admin' && msg.type == "chat")?true:false )
        }, 200)
    }

    onMessageScroll = () => {
        var tolleran = this.getTollerant()
        if ( this.contEle.scrollTop < tolleran ){ // on top
            this.setState({
                showGoBot: true
            });
        }else{
            var d = {
                showGoBot: false
            }
            if (this.contEle.scrollTop >= tolleran){
                d["unread"] = 0
            }
            this.setState(d);
        }
    }

    getTollerant = () => {
        var tolleran = Math.floor(this.contEle.scrollHeight * 40 / 100)
        if (this.contEle.scrollHeight < 500) {
            tolleran = 0
        }

        return tolleran
    }

    autoScrollToBot = (counter) => {
        if (this.contEle.scrollTop >= this.getTollerant() ){ // on top
            this.contEle.scrollTop = this.contEle.scrollHeight
        }else{
            if (counter){
                this.setState({
                    unread: (this.state.unread + 1)
                });
            }
        }
    }

    writeMessage = (name, message, from, type) => {
        var msg = {
            text: message,
            name: name,
            time: new Date(),
            userId: this.props.userId,
            chatId: this.props.chatId,
            from: from,
            type: type
        }
        this.setState({
            message: this.state.messages.push(msg)
        });
    }

    userActive = () => {
        if (store.enabled) {
            return store.get('userInfo')?true:false;
        } else {
            return false;
        }
    }
}
