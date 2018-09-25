import React from 'react';
import styles from '../../assets/stylesheets/base.css'
import Config from './config'

export default class GoBot extends React.Component {
    constructor(props){
        super(props)
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <div className={styles.scroll_bot} style={{
                display: this.props.show ? 'block': 'none'
            }} onClick={this.props.onGoBot}>
                {
                    (this.props.unread == 0) ?'':<span>{this.props.unread}</span>
                }
                <svg style={{
                    fill: Config.getConfig('ui.mainColor'),
                }} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 314.5 314.5" xmlSpace="preserve">
                    <path d="M314.5,90.5c0,6-2,13-7,18l-133,133c-5,5-10,7-17,7s-12-2-17-7l-133-133c-10-10-10-25,0-35    s24-10,34,0l116,116l116-116c10-10,24-10,34,0C312.5,78.5,314.5,84.5,314.5,90.5z"/>
                </svg>
            </div>
        );
    }

}
