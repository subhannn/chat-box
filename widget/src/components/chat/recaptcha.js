import React from 'react';
import Helper from './helper'

export default class ReCaptcha extends React.Component {
    constructor(props) {
        super(props)
        this.widget_id = null
        this.win = Helper.getFrameWindow()
    }

    getValue() {
        if (this.win.grecaptcha && this.widget_id !== undefined) {
            return this.win.grecaptcha.getResponse(this.widget_id);
            return false
        }
        return null;
    }

    componentDidMount() {
        this.explisitRender()
    }

    componentDidUpdate(){
        this.explisitRender()
    }

    explisitRender() {        
        this.win.onloadCallback = function(){
            if (this.widget_id == null) {
                const wrapper = this.win.document.createElement("div");
                this.widget_id = this.win.grecaptcha.render(wrapper, {
                    sitekey : '6Lf90m0UAAAAABdB9IlGBXn9bf1TWdUCr5VWJ1L-',
                });
                this.captcha.appendChild(wrapper);
            }
        }.bind(this)
        const sc = this.win.document.createElement('script')
        sc.sync = true
        sc.defer = true
        sc.src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit"
        this.win.document.getElementsByTagName('body')[0].appendChild(sc);
    }

    render() {
        return (
            <div id={this.widget_id} ref={ele => { this.captcha = ele }}></div>
        );
    }
}
