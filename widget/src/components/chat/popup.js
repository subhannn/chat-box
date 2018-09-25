import React from 'react';
import styles from '../../assets/stylesheets/base.css'
import Config from './config'
import Helper from './helper'

export default class PopUp extends React.Component {
    constructor(props){
        super(props)
        this.win = Helper.getFrameWindow()

        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    hide(){
        this.props.onClose()
    }

    componentDidMount() {
        this.win.document.addEventListener('mousedown', this.handleClickOutside)
    }

    componentWillUnmount() {
        this.win.document.addEventListener('mousedown', this.handleClickOutside)
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.hide()
        }
    }

    render() {
        return (
            <div className={styles.popup} ref={this.setWrapperRef}>
                {this.props.children}
            </div>
        );
    }
}
