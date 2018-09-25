import store from 'store'
import React from 'react';
import linkState from 'linkstate';
import Chat from './chat';
import styles from '../../assets/stylesheets/base.css'
import ReCaptcha from './recaptcha'
import Cookie from './cookie'
import Config from './config'
import Helper from './helper'

export default class InputInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            readyConnect: false,
            name: "",
            email: "",
            phone: "",
            newRegister: false,
            editProfile: true
        }

        this.win = Helper.getFrameWindow()
        this.win.addEventListener('end_chat', this.onEndChat.bind(this), true)
    }

    componentWillMount(){
        this.initEdit()
    }

    initEdit(){
        var user = Cookie.getCookie("user")
        if(user){
            this.setState({
                readyConnect: user.activeSession,
                name: user.name,
                email: user.email,
                phone: user.phone,
                editProfile: (user.activeSession)?true:false
            })
        }
    }

    onEndChat(){
        setTimeout(function(){
            window.SocketIO.connect()
        }, 300)
        Cookie.saveToCookie({
            user: {
                activeSession: false,
                name: this.state.name,
                email: this.state.email,
                phone: this.state.phone
            }
        })
        this.initEdit()
        this.setState({
            readyConnect: false
        })
        this.textarea.value = ""
    }

    render() {
        return (
            <div>
                <div style={{
                        display: !this.state.readyConnect?'block':'none',
                    }}>
                    <form onSubmit={this.onSetInfo}>
                        <div className={styles.cont}>
                            <div className={styles.sr_info}>
                            {
                                (this.state.editProfile)?
                                <div>
                                    <div className={styles.field_cont}>
                                        <label>Your name: <span>*</span></label>
                                        <input type="text" name="name" value={this.state.name} required onChange={linkState(this, 'name')} />
                                    </div>
                                    <div className={styles.field_cont}>
                                        <label>E-mail: <span>*</span></label>
                                        <input type="email" name="email" value={this.state.email} required onChange={linkState(this, 'email')} />
                                    </div>
                                </div>
                                :
                                <div className={styles.cont_info} onClick={() => { this.setState({editProfile: true}) }}>
                                    <figure className={styles.figure}>
                                        <img src="http://localhost:8081/assets/admin.png" />
                                    </figure>
                                    <div className={styles.name_info}>
                                        {this.state.name}
                                    </div>
                                    <div className={styles.name_info}>
                                        {this.state.email}
                                    </div>
                                    <input type="hidden" name="name" value={this.state.name} required onChange={linkState(this, 'name')} />
                                    <input type="hidden" name="email" value={this.state.email} required onChange={linkState(this, 'email')} />
                                </div>
                            }
                                <div className={styles.field_cont}>
                                    <label>Phone No. <span className={styles.muted}>(optional)</span></label>
                                    <input type="number" min="6" name="phone" onChange={linkState(this, 'phone')} />
                                </div>
                                <div className={styles.field_cont}>
                                    <label>Message: <span>*</span></label>
                                    <textarea ref={ele => this.textarea = ele} rows="4" required name="message" onInput={linkState(this, 'message')}></textarea>
                                </div>
                                <div className={styles.field_cont}>
                                    {/* <ReCaptcha ref={ele => { this.captcha = ele }} /> */}
                                </div>
                            </div>
                        </div>
                        <div className={styles.button_action}>
                            <button name="cancel" id="cancel" type="button" className={styles.end_chat} onClick={this.onCancel}>Cancel</button>
                            <button style={{
                                backgroundColor: Config.getConfig('ui.mainColor')
                            }} type="submit" className={styles.start_chat}>Start Chat</button>
                        </div>
                    </form>
                </div>

                <div style={{
                    display: this.state.readyConnect?'block':'none',
                }}>
                    { !this.state.readyConnect ? null: <Chat {...this.props} newRegister={this.state.newRegister} message={this.state.message} />  }
                </div>
            </div>
        );
    }

    onCancel = () => {
        var $this = this
        setTimeout(function(){
            $this.props.onCancel()
        }, 100)
    }

    onSetInfo = (e) => {
        e.preventDefault()
        this.setUser()
    };

    setUser = () => {
        // if (!this.captcha.getValue()) {
        //     alert("Please validate your captcha first.")
        //     return
        // }

        if(!this.state.name || !this.state.email){
            alert("Please input your name and valid email.")
            return
        }

        if (!this.state.message) {
            alert("Please input your message.")
            return
        }

        Cookie.saveToCookie({
            user: {
                activeSession: true,
                name: this.state.name,
                email: this.state.email,
                phone: this.state.phone
            }
        })

        this.setState({
            email: this.state.email,
            name: this.state.name,
            phone: this.state.phone,
            message: this.state.message,
            readyConnect: true,
            newRegister: true
        })
    }
}