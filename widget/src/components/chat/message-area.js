import dateFormat from 'dateformat'
import React from 'react';
import MsgLoading from './msg-loading';
import styles from '../../assets/stylesheets/base.css'
var linkify = require('linkifyjs');
var linkifyHtml = require('linkifyjs/html');
import { ReactHTMLConverter } from 'react-html-converter/node';
const converter = ReactHTMLConverter();

const dayInMillis = 60 * 60 * 24 * 1000;

export default class MessageArea extends React.Component {
    constructor(props){
        super(props)
    }

    render() {
        const currentTime = new Date();
        
        return (
            <ol className={styles.chat}>
                {this.props.messages.map(({id, name, text, from, time, type, photo, loading}, index) => {
                    var defaultUrlAdmin = process.env.ASSETS_URL +'assets/admin.png'

                    if (from === 'visitor') {
                        name = "You";
                    }
                    if (type == 'chat' || type == 'intro') {
                    return (
                        <li className={styles[from]} data-id={id} key={index}>
                            <div className={styles.msg}>
                                {
                                    (loading)?
                                    <MsgLoading loading={loading} onResend={() => {
                                        this.props.onResend(index)
                                    }} />
                                    :
                                    ''
                                }
                                <div className={styles.name}>{name}</div>
                                <figure className={styles.avatar}>
                                    {
                                        (photo != null && photo != "")?
                                        <img src={photo+"?s=50"} />
                                        :
                                        <img src={defaultUrlAdmin} />
                                    }
                                </figure>
                                { converter.convert(linkifyHtml(this.nl2br(text))) }
                                <div className={styles.time}>
                                    {
                                        currentTime - new Date(time) < dayInMillis ?
                                            dateFormat(time, "HH:MM") :
                                            dateFormat(time, "m/d/yy HH:MM")
                                    }
                                </div>
                            </div>
                        </li>
                    );
                    }else{
                        return (
                            <li className={styles[type+"_msg"]} key={index}>
                                <span>{text}</span>
                            </li>
                        )
                    }
                })}
            </ol>
        );
    }

    nl2br(str, isXhtml) {
        var breakTag = isXhtml ? '<br />' : '<br>';
        return String(str).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }
}
