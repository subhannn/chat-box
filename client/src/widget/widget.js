import { h, Component } from 'preact';
import ChatFloatingButton from './chat-floating-button';
import ChatTitleMsg from './chat-title-msg';
import ArrowIcon from './arrow-icon';
import * as store from 'store'
import InputInfo from './input-info';
import Cookie from './cookie'

import {
    desktopTitleStyle, 
    desktopWrapperStyle,
    mobileOpenWrapperStyle, 
    mobileClosedWrapperStyle,
    desktopClosedWrapperStyleChat,
    chatOpened,
    inputInfoCont,
} from "./style";

export default class Widget extends Component {

    constructor() {
        super();
        this.state.isChatOpen = false;
        this.state.pristine = true;
        this.state.wasChatOpened = this.wasChatOpened();
        if (this.state.wasChatOpened) {
            this.state.isChatOpen = true
            this.state.pristine = false
        }
    }

    render({conf, isMobile}, {isChatOpen, pristine}) {
        const wrapperWidth = {width: conf.desktopWidth};
        const desktopHeight = (window.innerHeight - 100 < conf.desktopHeight) ? window.innerHeight - 90 : conf.desktopHeight;
        const wrapperHeight = {height: desktopHeight};

        let wrapperStyle;
        if (!isChatOpen && (isMobile || conf.alwaysUseFloatingButton)) {
            wrapperStyle = { ...mobileClosedWrapperStyle}; // closed mobile floating button
        } else if (!isMobile){
            wrapperStyle = (conf.closedStyle === 'chat' || isChatOpen || this.wasChatOpened()) ?
                (isChatOpen) ? 
                    { ...desktopWrapperStyle, ...chatOpened} // desktop mode, button style
                    :
                    { ...desktopWrapperStyle}
                :
                { ...desktopClosedWrapperStyleChat}; // desktop mode, chat style
        } else {
            wrapperStyle = mobileOpenWrapperStyle; // open mobile wrapper should have no border
        }

        return (
            <div style={wrapperStyle}>

                {/* Open/close button */}
                { (isMobile || conf.alwaysUseFloatingButton) && !isChatOpen ?

                    <ChatFloatingButton color={conf.mainColor} onClick={this.onClick}/>

                    :

                    (conf.closedStyle === 'chat' || isChatOpen || this.wasChatOpened()) ?
                        <div>
                        { (isChatOpen) ? 
                            <div style={{background: conf.mainColor, ...desktopTitleStyle}}>
                                <ArrowIcon isOpened={isChatOpen} onCancel={this.onClick}/>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0px 20px 0px 0px',
                                    fontWeight: 'normal',
                                    fontStyle: 'normal',
                                }}>
                                    {  isChatOpen ? conf.titleOpen : conf.titleClosed }
                                </div>
                            </div>
                            : 
                            <div style={{background: conf.mainColor, ...desktopTitleStyle}} onClick={() => this.onClick(false)}>
                                <ArrowIcon isOpened={isChatOpen}/>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0px 20px 0px 0px',
                                    fontWeight: 'normal',
                                    fontStyle: 'normal',
                                }}>
                                    {  isChatOpen ? conf.titleOpen : conf.titleClosed }
                                </div>
                            </div>
                        }
                        </div>
                        :
                        <ChatTitleMsg onClick={this.onClick} conf={conf}/>
                }

                {/*Chat IFrame*/}
                <div style={{...inputInfoCont, ...{
                    display: isChatOpen ? 'block' : 'none',
                }}}>
                    {pristine ? null : <InputInfo 
                        onCancel={this.onClick}
                        chatId={conf.channelId}
                        userId={this.getUserId()}
                    conf={conf} /> }
                </div>

            </div>
        );
    }

    onClick = () => {
        parent.postMessage(
            {
                message: "chatopened",
                isChatOpen: !this.state.isChatOpen
            },
            this.props.conf.origin
        )
        let stateData = {
            pristine: false,
            isChatOpen: !this.state.isChatOpen,
            wasChatOpened: !this.state.wasChatOpened
        }
        this.setCookie();
        this.setState(stateData);
    }

    setCookie = () => {
        Cookie.saveToCookie({
            chatOpened: !this.state.wasChatOpened
        })
    }

    getCookie = () => {
        return Cookie.getCookie("chatOpened");
    }

    wasChatOpened = () => {
        return (this.getCookie() == true) ? true : false;
    }

    getUserId = () => {
        if (store.enabled) {
            return store.get('userId') || store.set('userId', this.generateRandomId());
        } else {
            return this.generateRandomId();
        }
    }

    generateRandomId = () => {
        return Math.random().toString(36).substr(2, 6);
    }
}
