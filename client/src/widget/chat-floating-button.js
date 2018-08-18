import { h, Component } from 'preact';
import {mobileTitleStyle} from "./style";

export default class ChatFloatingButton extends Component {

    render({color, onClick},{}) {
        return (
            <div
                style={{background: color, ...mobileTitleStyle}}
                onClick={onClick}>

            </div>
        );
    }
}
