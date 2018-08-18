import { h, Component } from 'preact';
import ChatFrame from './chat-frame';
import ChatFloatingButton from './chat-floating-button';
import ChatTitleMsg from './chat-title-msg';
import ArrowIcon from './arrow-icon';
import * as store from 'store'
import {
    desktopTitleStyle, 
    desktopWrapperStyle,
    mobileOpenWrapperStyle, 
    mobileClosedWrapperStyle,
    desktopClosedWrapperStyleChat,
    chatOpened,
} from "./style";

export default class Widget extends Component {

    constructor() {
        super();
        this.state.isChatOpen = false;
        this.state.pristine = true;
        this.state.wasChatOpened = this.wasChatOpened();
        if (this.checkWasOpened()) {
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
                    { ...desktopWrapperStyle, ...wrapperWidth, ...chatOpened} // desktop mode, button style
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
                <div style={{
                    display: isChatOpen ? 'block' : 'none',
                    height: isMobile ? '100%' : desktopHeight,
                    position: 'relative'
                }}>
                    {pristine ? null : <ChatFrame {...this.props} onCancel={this.onClick}/> }
                </div>

            </div>
        );
    }

    onClick = () => {
        let stateData = {
            pristine: false,
            isChatOpen: !this.state.isChatOpen,
        }
        if(!this.state.isChatOpen && !this.wasChatOpened()){
            this.setCookie();
            stateData.wasChatOpened = true;
        }
        this.setState(stateData);
    }

    setCookie = () => {
        let date = new Date();
        let expirationTime = parseInt(this.props.conf.cookieExpiration);
        date.setTime(date.getTime()+(expirationTime*24*60*60*1000));
        let expires = "; expires="+date.toGMTString();
        document.cookie = "chatwasopened=1"+expires+"; path=/";
    }

    getCookie = () => {
        var nameEQ = "chatwasopened=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return false;
    }

    wasChatOpened = () => {
        return (this.getCookie() === false) ? false : true;
    }

    checkWasOpened () {
        if (store.enabled) {
            return store.get('userInfo')?true:false;
        } else {
            return false;
        }
    }
}
