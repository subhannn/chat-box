import React from 'react';
import ChatFloatingButton from './chat-floating-button';
import ChatTitleMsg from './chat-title-msg';
import ArrowIcon from './arrow-icon';
import store from 'store'
import InputInfo from './input-info';
import Cookie from './cookie'
import Config from './config'

import {
    desktopTitleStyle, 
    desktopWrapperStyle,
    mobileOpenWrapperStyle, 
    mobileClosedWrapperStyle,
    desktopClosedWrapperStyleChat,
    chatOpened,
    inputInfoCont,
} from "./style";

class Widget extends React.Component {
    constructor() {
        super();
        this.state = {
            isChatOpen: false,
            pristine: true,
            wasChatOpened: this.wasChatOpened()
        }
        if (this.state.wasChatOpened) {
            this.state.isChatOpen = true
            this.state.pristine = false
        }
    }

    componentDidMount() {
        var width = this.wrapperDiv.clientWidth
        window.ChatRoot.style.width = width+'px'
    }

    componentDidUpdate() {
        var width = this.wrapperDiv.clientWidth
        window.ChatRoot.style.width = width+'px'
    }

    render() {
        const wrapperWidth = {width: Config.getConfig('settings.desktopWidth')};
        const desktopHeight = (window.innerHeight - 100 < Config.getConfig('settings.desktopHeight')) ? window.innerHeight - 90 : Config.getConfig('settings.desktopHeight');
        const wrapperHeight = {height: desktopHeight};
        
        let wrapperStyle;
        if (!this.state.isChatOpen && this.props.isMobile) {
            wrapperStyle = { ...mobileClosedWrapperStyle}; // closed mobile floating button
        } else if (!this.props.isMobile){
            wrapperStyle = (this.state.isChatOpen || this.wasChatOpened()) ?
                (this.state.isChatOpen) ? 
                    { ...desktopWrapperStyle, ...chatOpened} // desktop mode, button style
                    :
                    { ...desktopWrapperStyle}
                :
                { ...desktopClosedWrapperStyleChat }; // desktop mode, chat style
        } else {
            wrapperStyle = mobileOpenWrapperStyle; // open mobile wrapper should have no border
        }
        
        return (
            <div style={wrapperStyle} ref={ele => { this.wrapperDiv = ele }}>

                {/* Open/close button */}
                { (this.props.isMobile || Config.getConfig('ui.alwaysFloatingButton')) && !this.state.isChatOpen ?

                    <ChatFloatingButton color={Config.getConfig('ui.mainColor')} onClick={this.onClick}/>

                    :

                    (true || this.state.isChatOpen || this.wasChatOpened()) ?
                        <div>
                        { (this.state.isChatOpen) ? 
                            <div style={{background: Config.getConfig('ui.mainColor'), ...desktopTitleStyle}}>
                                <ArrowIcon isOpened={this.state.isChatOpen} onCancel={this.onClick}/>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0px 20px 0px 0px',
                                    fontWeight: 'normal',
                                    fontStyle: 'normal',
                                }}>
                                    {  this.state.isChatOpen ? Config.getConfig('ui.titleOpen') : Config.getConfig('ui.titleClosed') }
                                </div>
                            </div>
                            : 
                            <div style={{background: Config.getConfig('ui.mainColor'), ...desktopTitleStyle}} onClick={() => this.onClick(false)}>
                                <ArrowIcon isOpened={this.state.isChatOpen}/>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0px 20px 0px 0px',
                                    fontWeight: 'normal',
                                    fontStyle: 'normal',
                                }}>
                                    {  this.state.isChatOpen ? Config.getConfig('ui.titleOpen') : Config.getConfig('ui.titleClosed') }
                                </div>
                            </div>
                        }
                        </div>
                        :
                        <ChatTitleMsg onClick={this.onClick} />
                }

                {/*Chat IFrame*/}
                <div style={{...inputInfoCont, ...{
                    display: this.state.isChatOpen ? 'block' : 'none',
                }}}>
                    {this.state.pristine ? null : <InputInfo 
                        onCancel={this.onClick}
                        chatId={Config.getConfig('channelId')}
                        userId={this.getUserId()} /> }
                </div>

            </div>
        );
    }

    onClick = () => {
        this.props.chatOpened(!this.state.isChatOpen)
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

export default Widget;