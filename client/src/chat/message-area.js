import dateFormat from 'dateformat'
import { h, Component } from 'preact';

const dayInMillis = 60 * 60 * 24 * 1000;

export default class MessageArea extends Component {

    componentDidMount() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    componentDidUpdate() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    render(props,{}) {
        const currentTime = new Date();
        return (
            <ol class="chat">
                {props.messages.map(({name, text, from, time, type}) => {
                    if (from === 'visitor') {
                        name = "You";
                    }
                    if (type == 'chat') {
                    return (
                        <li class={from}>
                            <div class="msg">
                                <div class="name">{name}</div>
                                { (from == 'admin')?
                                <figure class="avatar">
                                    <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" />
                                </figure>
                                :
                                ''
                                }
                                { text }
                                { (props.conf.displayMessageTime) ?
                                    <div class="time">
                                        {
                                            currentTime - new Date(time) < dayInMillis ?
                                                dateFormat(time, "HH:MM") :
                                                dateFormat(time, "m/d/yy HH:MM")
                                        }
                                    </div> 
                                    :
                                    ''
                                }
                            </div>
                        </li>
                    );
                    }else{
                        return (
                            <li class={type+"-msg"}>
                                <span>{text}</span>
                            </li>
                        )
                    }
                })}
            </ol>
        );
    }

}
