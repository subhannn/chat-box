import React from 'react';
import MessageArea from './message-area';
import GoBot from './go-bot';
import * as $ from 'jquery'
import styles from '../../assets/stylesheets/base.css'
import 'storage-based-queue/dist/queue'
import Cookie from './cookie'
import Config from './config'
import PopUp from './popup'
import Helper from './helper'

class MessageWorker{
    retry = -1;
    timeout = 1000;

    handle (args) {
        try {
            return new Promise((resolve, reject) => {
                args.callback(resolve, reject)
            });
        } catch (e) {
            
        }
    }
}

Queue.workers({ MessageWorker });

const queue = new Queue();
queue.setDebug(process.env.DEBUG)
const channelA = queue.create("send-message");

export default class Chat extends React.Component {
    autoResponseState = 'pristine'; // pristine, set or canceled
    autoResponseTimer = 0;

    constructor(props) {
        super(props);
        this.state = {
            showGoBot: false,
            unread: 0,
            messages: [],
            userPhoto: ""
        }
        channelA.start()
        this.state.showGoBot = false
        this.state.unread = 0
        this.state.messages = [];
        this.userInfo = this.userActive()
        this.win = Helper.getFrameWindow()
    }

    componentDidMount() {
        // var scheme = document.location.protocol == "https:" ? "wss" : "ws";
        // var port = document.location.port ? (":" + document.location.port) : "";
        // var wsURL = scheme + "://" + document.location.hostname + port;

        // this.socket = io(wsURL, {
        //     path: '/ws'
        // });

        // this.socket.on("connect", this.onConnect)
        // this.socket.on("disconnect", this.onDisconnect)
        // this.socket.on("error", this.onError)
        // this.socket.on("connect_error", this.onError)
        // this.socket.on("reconnecting", function(att){
        //     chatLog("reconnection")
        //     chatLog(att)
        // })
        // chatLog("Bind Chat chat-"+this.props.userId)
        window.SocketIO.on("chat-"+this.props.userId, this.incomingMessage)
        this.onConnect()
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
                // chatLog("Encountered an error")
                // chatLog(err)
            }
        });
    }

    onConnect = () => {
        var $this = this
        
        window.SocketIO.emit("register", {
            userId: this.props.userId,
            chatId: this.props.chatId,
            name: this.userInfo.name,
            email: this.userInfo.email,
            phone: this.userInfo.phone,
        }, (data) => {
            var d = data.messages.data.reverse()

            $this.setState({
                userPhoto: data.photo,
                messages: d
            })

            setTimeout(function(){
                $this.contEle.scrollTop = $this.contEle.scrollHeight
                $this.state.showGoBot = false
            }, 200)

            if ($this.props.newRegister==true) {
                Cookie.saveToCookie({
                    user: {
                        activeSession: true,
                        name: $this.userInfo.name,
                        email: $this.userInfo.email,
                        phone: $this.userInfo.phone,
                        photo: data.photo
                    }
                })

                let datas = {
                    chatId: $this.props.chatId, 
                    userId: $this.props.userId,
                    name: $this.userInfo.name,
                    email: $this.userInfo.email,
                    text: $this.props.message,
                    phone: $this.userInfo.phone,
                    from: 'visitor',
                    type: 'intro'
                }
                
                $this.sendChat(datas)
            }
        })
    }

    onDisconnect = () => {
        // chatLog("disconnect")
    }

    render() {
        var soundUrl =  process.env.ASSETS_URL + 'assets/ping.mp3'
        return (
            <div>
                <div className={styles.contMsg} ref={(ele) => { this.contEle = ele } } onScroll={this.onMessageScroll}>
                    <MessageArea messages={this.state.messages} onResend={this.resendMessage}/>
                </div>
                <GoBot show={this.state.showGoBot} onGoBot={() => {
                    this.setState({
                        unread: 0
                    })
                    this.contEle.scrollTop = this.contEle.scrollHeight
                }} unread={this.state.unread}/>

                <div className={styles.fix_bot}>
                       <div className={styles.container_msg} ref={(ele) => { this.cont = ele }}>
                            <textarea name="message" className={styles.textarea} rows="2" spellCheck="false" ref={(input) => { this.input = input }} 
                            onKeyPress={this.handleKeyPress}
                            onInput={this.handleChange}
                            placeholder={Config.getConfig('ui.textAreaPlaceholder')}></textarea>
                        </div>

                    <div className={styles.options_bar}>
                        <a className={styles.options} onClick={() => this.setState({showOptionModal: 'show'})}>Options</a>
                    </div>
                </div>
                <audio id="messageSound" src={soundUrl} preload="auto" ref={ele => { this.audio = ele }}></audio>

                {(['show', 'confirm'].includes(this.state.showOptionModal))?
                    <PopUp onClose={() => this.setState({showOptionModal: 'close'})}>
                        <div>
                            {(this.state.showOptionModal == 'show')?
                                <button type="button" style={{width: '100%'}} className={styles.small_btn+' '+styles.dark_btn} onClick={()=>this.setState({showOptionModal: 'confirm'})}>End This Chat</button>
                                :
                                <div>
                                    <span className={styles.confirm_message}>Are you sure want end this chat?</span>
                                    <button style={{width: '48%'}} className={styles.small_btn+' '+styles.dark_btn} type="button" onClick={this.endChat.bind(this)}>End</button>&nbsp;&nbsp;
                                    <button style={{width: '48%'}} className={styles.small_btn+' '+styles.default_btn} type="button" onClick={() => this.setState({showOptionModal: 'close'})}>Cancel</button>
                                </div>
                            }
                        </div>
                    </PopUp>
                    :
                    ''
                }
            </div>
        );
    }

    endChat(){
        this.setState({
            showOptionModal: 'close'
        })
        
        var event = new CustomEvent('end_chat', {});
        this.win.dispatchEvent(event)
        window.SocketIO.disconnect()
    }

    handleChange = (e) => {
        var $this = this
        this.cont.style.cssText = 'height:'+e.target.scrollHeight+'px'
    }

    onError = (error) => {
        
    }

    handleKeyPress = (e) => {
        if (!e.shiftKey && e.charCode == 13 && this.input.value.trim() == "") {
            e.preventDefault()
            return
        }
        
        if (!e.shiftKey && e.charCode == 13 && this.input.value) {
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
                name: this.userInfo.name,
                email: this.userInfo.email,
                text: text,
                from: 'visitor',
                type: 'chat'
            }
            this.sendChat(data)
            this.input.value = '';
            // this.writeMessage(this.userInfo.name, data.text, data.from)
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
                this.audio.play();
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
            tolleran = 10
        }

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
                console.log(window.SocketIO.connected)

                if (window.SocketIO.connected) {
                    window.SocketIO.emit("chat", data, (data) => {
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
        if (typeof this.state.messages[index] != 'undefined'){
            this.messageComplete(index, 0, 'loading')
            let data = {
                chatId: this.props.chatId, 
                userId: this.props.userId,
                name: this.userInfo.name,
                email: this.userInfo.email,
                text: this.state.messages[index]['text'],
                from: 'visitor',
                type: 'chat'
            }

            this.sendMessageChannel(data, index)
        }
    }

    messageComplete = (index, newId, status) => {
        if (typeof this.state.messages[index] != 'undefined'){
            this.state.messages[index]['id'] = newId
            this.state.messages[index]['loading'] = status

            this.setState({
                message: this.state.messages
            });
        }
    }

    userActive = () => {
        var user = Cookie.getCookie("user")
        if(user){
            return user
        }else{
            return {}
        }
    }

    logoutSession = () => {
        Cookie.removeCookie("user")
    }
}
