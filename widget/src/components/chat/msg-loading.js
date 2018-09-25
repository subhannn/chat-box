import React from 'react';
import styles from '../../assets/stylesheets/base.css'

export default class MsgLoading extends React.Component {
    constructor(props){
        super(props)
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <div>
            { (this.props.loading == 'loading')?
            <span className={styles.msg_loading}>
                <svg style={{
                    background: 'none'
                }}
                width="20px"
                height="20px"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={{ background: 'none' }}><circle cx="84" cy="50" r="1.99566" fill="#fff"><animate attributeName="r" values="10;0;0;0;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="2.1s" repeatCount="indefinite" begin="0s"></animate><animate attributeName="cx" values="84;84;84;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="2.1s" repeatCount="indefinite" begin="0s"></animate></circle><circle cx="77.2147" cy="50" r="10" fill="#fff"><animate attributeName="r" values="0;10;10;10;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="2.1s" repeatCount="indefinite" begin="-1.05s"></animate><animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="2.1s" repeatCount="indefinite" begin="-1.05s"></animate></circle><circle cx="43.2147" cy="50" r="10" fill="#fff"><animate attributeName="r" values="0;10;10;10;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="2.1s" repeatCount="indefinite" begin="-0.525s"></animate><animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="2.1s" repeatCount="indefinite" begin="-0.525s"></animate></circle><circle cx="16" cy="50" r="8.00434" fill="#fff"><animate attributeName="r" values="0;10;10;10;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="2.1s" repeatCount="indefinite" begin="0s"></animate><animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="2.1s" repeatCount="indefinite" begin="0s"></animate></circle><circle cx="16" cy="50" r="0" fill="#fff"><animate attributeName="r" values="0;0;10;10;10" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="2.1s" repeatCount="indefinite" begin="0s"></animate><animate attributeName="cx" values="16;16;16;50;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="2.1s" repeatCount="indefinite" begin="0s"></animate></circle></svg>
            </span>
            :
            <span className={styles.msg_loading} onClick={this.props.onResend} style={{
                cursor: 'pointer'
            }}>
                <svg width="20" height="20" 
                version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 491.236 491.236" style={{enableCackground: 'new 0 0 491.236 491.236'}} xmlSpace="preserve">
		<path d="M55.89,262.818c-3-26-0.5-51.1,6.3-74.3c22.6-77.1,93.5-133.8,177.6-134.8v-50.4c0-2.8,3.5-4.3,5.8-2.6l103.7,76.2
			c1.7,1.3,1.7,3.9,0,5.1l-103.6,76.2c-2.4,1.7-5.8,0.2-5.8-2.6v-50.3c-55.3,0.9-102.5,35-122.8,83.2c-7.7,18.2-11.6,38.3-10.5,59.4
			c1.5,29,12.4,55.7,29.6,77.3c9.2,11.5,7,28.3-4.9,37c-11.3,8.3-27.1,6-35.8-5C74.19,330.618,59.99,298.218,55.89,262.818z
			 M355.29,166.018c17.3,21.5,28.2,48.3,29.6,77.3c1.1,21.2-2.9,41.3-10.5,59.4c-20.3,48.2-67.5,82.4-122.8,83.2v-50.3
			c0-2.8-3.5-4.3-5.8-2.6l-103.7,76.2c-1.7,1.3-1.7,3.9,0,5.1l103.6,76.2c2.4,1.7,5.8,0.2,5.8-2.6v-50.4
			c84.1-0.9,155.1-57.6,177.6-134.8c6.8-23.2,9.2-48.3,6.3-74.3c-4-35.4-18.2-67.8-39.5-94.4c-8.8-11-24.5-13.3-35.8-5
			C348.29,137.718,346.09,154.518,355.29,166.018z"/>
                </svg>
            </span>
            }
            </div>
        );
    }

}