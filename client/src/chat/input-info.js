import * as store from 'store'
import { h, Component } from 'preact';
import linkState from 'linkstate';
import Chat from './chat';

export default class InputInfo extends Component {
    state = {
        name: '',
        email: '',
        readyConnect: false
    };

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
                                    <input type="email" name="emai" required onChange={linkState(this, 'email')} />
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
            alert("Please input your name and email.")
            return
        }

        this.props.name = this.state.name
        this.props.email = this.state.email

        store.set('userInfo', {
            name: this.state.name,
            email: this.state.email
        })

        this.setState({
            email: this.state.email,
            name: this.state.name,
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