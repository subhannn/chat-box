import React from 'react';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import Cookie from './chat/cookie'
const css = require('../assets/stylesheets/content.css').toString();
import Widget from './chat/widget'
import Config from './chat/config'

import {
  mobileOpenWrapperStyle, 
  mobileClosedWrapperStyle,
  desktopCloseContainer,
  desktopOpenContainer,
  iframeContainer,
} from "./chat/style";

class App extends React.Component {
  constructor(props){
    super(props)
    this.initialContent = '<!DOCTYPE html><html><head></head><body></body></html>'
  }

  componentDidMount() {
    this.chatOpened(this.wasChatOpened())
  }

  render() {
    var js = 'https://www.google.com/recaptcha/api.js?onload=onloadcallback&render=explicit'
    return (
      <Frame initialContent={this.initialContent} mountTarget={'body'} frameBorder='0' style={iframeContainer} head={[
          <style key={1} type="text/css" dangerouslySetInnerHTML={{__html: this.props.parentStyle }}></style>,
          <link key={2} href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />,
          <script key={3} src={js} async defer></script>
      ]} name="chat">
        <FrameContextConsumer>
          {
            ({document, window}) => {
              return (<Widget document={document} window={window} chatOpened={this.chatOpened} isMobile={this.isMobile()} />)
            }
          }
        </FrameContextConsumer>
     </Frame>
    );
  }

  isMobile = () => {
    if (window.screen.width < 500){
        return true
    }

    return false
  }

  chatOpened = (isChatOpen) => {
      const desktopHeight = (window.innerHeight - 100 < Config.getConfig('settings.desktopHeight')) ? window.innerHeight - 90 : Config.getConfig('settings.desktopHeight');
      const wrapperHeight = {height: desktopHeight+'px'};
      
      let wrapperStyle;
      if (!isChatOpen && (this.isMobile() || Config.getConfig('ui.alwaysFloatingButton'))) {
          wrapperStyle = { ...mobileClosedWrapperStyle}; // closed mobile floating button
      } else if (!this.isMobile()){
          wrapperStyle = (isChatOpen || this.wasChatOpened()) ?
              (isChatOpen) ? 
                  { ...desktopOpenContainer, ...wrapperHeight} // desktop mode, button style
                  :
                  { ...desktopCloseContainer}
              :
              { ...desktopCloseContainer}; // desktop mode, chat style
      } else {
          wrapperStyle = mobileOpenWrapperStyle; // open mobile wrapper should have no border
      }

      Object.assign(this.props.rootElement.style, wrapperStyle);
  }

  getCookie = () => {
      return Cookie.getCookie("chatOpened");
  }

  wasChatOpened = () => {
      return (this.getCookie() == true) ? true : false;
  }
}
export default App;
