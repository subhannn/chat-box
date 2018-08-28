import dateFormat from 'dateformat'
import { h, Component } from 'preact';
import MsgLoading from './msg-loading';

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
                {props.messages.map(({id, name, text, from, time, type, photo, loading}, index) => {
                    if (from === 'visitor') {
                        name = "You";
                    }
                    if (type == 'chat' || type == 'intro') {
                    return (
                        <li class={from} data-id={id}>
                            <div class="msg">
                                {
                                    (loading)?
                                    <MsgLoading loading={loading} onResend={() => {
                                        props.onResend(index)
                                    }} />
                                    :
                                    ''
                                }
                                <div class="name">{name}</div>
                                <figure class="avatar">
                                    {
                                        (photo != null && photo != "")?
                                        <img src={photo+"?s=50"} />
                                        :
                                        <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" />
                                    }
                                </figure>
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
