import * as store from 'store'
import { h, Component } from 'preact';
import linkState from 'linkstate';
import Chat from './chat';

export default class InputInfo extends Component {
    constructor(props) {
        super(props);

        if(this.checkWasOpened()){
            this.state.readyConnect = true
        }
    }

    render({conf},state) {
        return (
            <div>
                <div style={{
                        display: !this.state.readyConnect?'block':'none',
                    }}>
                    <form onSubmit={this.onSetInfo}>
                        <div class="cont">
                            <div class="sr-info">
                                <div class="field-cont">
                                    <label>Your name: <span>*</span></label>
                                    <input type="text" name="name" required onChange={linkState(this, 'name')} />
                                </div>
                                <div class="field-cont">
                                    <label>E-mail: <span>*</span></label>
                                    <input type="email" name="email" required onChange={linkState(this, 'email')} />
                                </div>
                                <div class="field-cont">
                                    <label>Phone No. <span class="muted">(optional)</span></label>
                                    <input type="number" min="6" name="phone" onChange={linkState(this, 'phone')} />
                                </div>
                                <div class="field-cont">
                                    <label>Message: <span>*</span></label>
                                    <textarea rows="4" required name="message" onInput={linkState(this, 'message')}></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="button-action">
                            <button name="cancel" id="cancel" type="button" class="end-chat">Cancel</button>
                            <button style={{
                                backgroundColor: conf.mainColor
                            }} type="submit" class="start-chat">Start Chat</button>
                        </div>
                    </form>
                </div>

                <div style={{
                    display: this.state.readyConnect?'block':'none',
                }}>
                    { !this.state.readyConnect ? null: <Chat {...this.props} />  }
                </div>
            </div>
        );
    }

    onSetInfo = (e) => {
        e.preventDefault()
        this.setUser()
    };

    setUser = () => {
        if(!this.state.name || !this.state.email){
            alert("Please input your name and valid email.")
            return
        }

        if (!this.state.message) {
            alert("Please input your message.")
            return
        }

        this.props.name = this.state.name
        this.props.email = this.state.email
        this.props.message = this.state.message
        this.props.phone = this.state.phone
        this.props.newRegister = true

        store.set('userInfo', {
            name: this.state.name,
            email: this.state.email
        })

        store.set('users', {
            name: this.state.name,
            email: this.state.email,
            phone: this.state.phone
        })

        this.setState({
            email: this.state.email,
            name: this.state.name,
            phone: this.state.phone,
            message: this.state.message,
            readyConnect: true
        })
    }

    checkWasOpened () {
        if (store.enabled) {
            return store.get('userInfo')?true:false;
        } else {
            return false;
        }
    }
}