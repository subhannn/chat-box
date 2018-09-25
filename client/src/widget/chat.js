import * as store from 'store'
import { h, Component } from 'preact';
import MessageArea from './message-area';
import GoBot from './go-bot';
import * as $ from 'jquery'
import styles from './style.css'
import io from './socket.io'
import 'storage-based-queue/dist/queue'
import Cookie from './cookie'
var md5 = require('md5')

class MessageWorker{
    retry = -1;
    timeout = 1000;

    handle (args) {
        try {
            return new Promise((resolve, reject) => {
                args.callback(resolve, reject)
            });
        } catch (e) {
            chatLog(e)
        }
    }
}

Queue.workers({ MessageWorker });

const queue = new Queue();
const channelA = queue.create("send-message");

export default class Chat extends Component {
    autoResponseState = 'pristine'; // pristine, set or canceled
    autoResponseTimer = 0;
    socket = null;

    constructor(props) {
        super(props);
        
        channelA.start()
        this.state.showGoBot = false
        this.state.unread = 0
        this.state.messages = [];
    }

    componentDidMount() {
        var scheme = document.location.protocol == "https:" ? "wss" : "ws";
        var port = document.location.port ? (":" + document.location.port) : "";
        var wsURL = scheme + "://" + document.location.hostname + port;

        this.socket = io(wsURL, {
            path: '/ws'
        });

        this.socket.on("connect", this.onConnect)
        this.socket.on("disconnect", this.onDisconnect)
        this.socket.on("error", this.onError)
        this.socket.on("connect_error", this.onError)
        this.socket.on("reconnecting", function(att){
            chatLog("reconnection")
            chatLog(att)
        })
        chatLog("Bind Chat chat-"+this.props.userId)
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
                        $this.state.showGoBot = false
                    }, 200)
                }
            },
            fail: function (err) {
                chatLog("Encountered an error")
                chatLog(err)
            }
        });
    }

    onConnect = () => {
        chatLog("connect")
        var $this = this

        this.socket.emit("register", {
            userId: this.props.userId,
            chatId: this.props.chatId,
            name: this.props.name,
            email: this.props.email,
            phone: this.props.phone,
        }, function(data){
            $this.setState({
                userPhoto: data.photo
            })

            if ($this.props.newRegister==true) {
                let datas = {
                    chatId: $this.props.chatId, 
                    userId: $this.props.userId,
                    name: $this.props.name,
                    email: $this.props.email,
                    text: $this.props.message,
                    phone: $this.props.phone,
                    from: 'visitor',
                    type: 'intro'
                }
                $this.props.newRegister = false
                
                $this.sendChat(datas)
            }
        })
    }

    onDisconnect = () => {
        chatLog("disconnect")
    }

    render(props,state) {
        this.props = props

        let info = this.userActive()
        if(typeof this.props.name == 'undefined' && typeof info.name != 'undefined'){
            this.props.name = info.name
            this.props.email = info.email
        }

        var soundUrl = props.conf.serverUrl + '/media/ping.mp3'
        return (
            <div>
                <div className={styles.contMsg} ref={(ele) => { this.contEle = ele } } onScroll={this.onMessageScroll}>
                    <MessageArea messages={this.state.messages} conf={this.props.conf} onResend={this.resendMessage}/>
                </div>
                <GoBot conf={this.props.conf} show={this.state.showGoBot} onGoBot={() => {
                    this.setState({
                        unread: 0
                    })
                    this.contEle.scrollTop = this.contEle.scrollHeight
                }} unread={this.state.unread}/>

                <div className={styles.fix_bot}>
                       <div className={styles.container_msg} ref={(ele) => { this.cont = ele }}>
                            <textarea name="message" className={styles.textarea} rows="2" spellcheck="false" ref={(input) => { this.input = input }} 
                            onKeyPress={this.handleKeyPress}
                            onInput={this.handleChange}
                            placeholder={this.props.conf.placeholderText}></textarea>
                        </div>

                    <a ref={(ele) => { this.banner = ele } } className={styles.banner} href="https://github.com/subhannn" target="_blank">
                        Powered by <b>NiceChatBox</b>&nbsp;
                    </a>
                </div>
                <audio id="messageSound" src={soundUrl} preload="auto"></audio>
            </div>
        );
    }

    handleChange = (e) => {
        var $this = this
        this.cont.style.cssText = 'height:'+e.target.scrollHeight+'px'
    }

    onError = (error) => {
        chatLog('error')
        chatLog(error)
    }

    handleKeyPress = (e) => {
        if (e.keyCode == 13 && this.input.value.trim() == "") {
            e.preventDefault()
            return
        }

        if (e.keyCode == 13 && this.input.value) {
            e.preventDefault()

            if (this.input.value.trim() == '') {
                return
            }

            if (!this.userActive()) {
                this.writeMessage(0, "Admin", "Your chat has ended, your message not send.", "admin", "notification", false)
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
            this.sendChat(data)
            this.input.value = '';
            // this.writeMessage(this.props.name, data.text, data.from)
        }
    }

    incomingMessage = (msg) => {
        var name = msg.name
        if (msg.alias != "") {
            name = msg.alias
        }
        this.writeMessage(msg.id, name, msg.text, msg.from, msg.type, false, msg.photo)
        if (msg.type == 'notification') {
            if (msg.command == "endsession") {
                this.logoutSession()
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
        chatLog(this.contEle.scrollTop)
        chatLog(this.contEle.scrollHeight)
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
            tolleran = 10
        }
        chatLog(tolleran)

        return tolleran
    }

    autoScrollToBot = (counter) => {
        var tolleran = this.getTollerant()
        if (this.contEle.scrollTop >= tolleran ){ // on top
            this.contEle.scrollTop = this.contEle.scrollHeight
        }else{
            if (counter){
                this.setState({
                    unread: (this.state.unread + 1)
                });
            }
        }
    }

    sendChat = (data) => {
        var $this = this
        var index = $this.writeMessage(0, data.name, data.text, data.from, data.type, 'loading', this.state.userPhoto)
        setTimeout(function(){
            $this.autoScrollToBot()
        }, 300)
        this.sendMessageChannel(data, index)
    }

    sendMessageChannel = (data, index) => {
        var $this = this
        channelA.add({
            handler: "MessageWorker",
            tag: "message-"+index,
            args: { callback: function(resolve, reject){
                chatLog("isConnected?", $this.socket.connected)
                if ($this.socket.connected) {
                    $this.socket.emit("chat", data, (data) => {
                        if (typeof data != 'undefined' && typeof data != 'null'){
                            $this.messageComplete(index, data.id, false)
                            resolve(true)
                        }
                    })
                }else{
                    setTimeout(function(){
                        $this.messageComplete(index, data.id, 'failed')
                        reject(true)
                    }, 300)
                }
            } },
        })
    }

    writeMessage = (id, name, message, from, type, loading, photo) => {
        var msg = {
            id: id,
            text: message,
            name: name,
            time: new Date(),
            userId: this.props.userId,
            chatId: this.props.chatId,
            photo: photo,
            from: from,
            type: type,
            loading: loading
        }
        var len = this.state.messages.length
        var newMsg = this.state.messages.push(msg)
        this.setState({
            message: newMsg
        });

        return len
    }

    resendMessage = (index) => {
        chatLog('resend', index)
        if (typeof this.state.messages[index] != 'undefined'){
            this.messageComplete(index, 0, 'loading')
            let data = {
                chatId: this.props.chatId, 
                userId: this.props.userId,
                name: this.props.name,
                email: this.props.email,
                text: this.state.messages[index]['text'],
                from: 'visitor',
                type: 'chat'
            }

            this.sendMessageChannel(data, index)
        }else{
            chatLog('tidak ada')
        }
    }

    messageComplete = (index, newId, status) => {
        if (typeof this.state.messages[index] != 'undefined'){
            chatLog('update')
            this.state.messages[index]['id'] = newId
            this.state.messages[index]['loading'] = status

            this.setState({
                message: this.state.messages
            });
        }else{
            chatLog('tidak ada')
        }
    }

    userActive = () => {
        var user = Cookie.getCookie("user")
        if(user){
            return user
        }else{
            return false
        }
    }

    logoutSession = () => {
        Cookie.removeCookie("user")
    }
}
