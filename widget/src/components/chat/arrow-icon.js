import React from 'react';

export default class ArrowIcon extends React.Component {

    constructor(props){
        super(props)
    }

    onCancel = () => {
        var $this = this
        setTimeout(function(){
            $this.props.onCancel()
        }, 100)
    }

    render() {
        return (
            <div style={{padding: '0px 6px 0px 12px', display: 'flex', }} onClick={this.onCancel}>
                {/* keyboard arrow up */}
                { (this.props.isOpened) ?
                    <svg style={{
                            marginRight: 15,
                            marginTop: 6,
                            verticalAlign: 'middle',
                        }}
                        fill="#FFFFFF" height="15" viewBox="0 0 15 15" width="15"
                        xmlns="http://www.w3.org/2000/svg">
                        <line x1="1" y1="15" 
                            x2="15" y2="1" 
                            stroke="white" 
                            strokeWidth="1"/>
                        <line x1="1" y1="1" 
                            x2="15" y2="15" 
                            stroke="white" 
                            strokeWidth="1"/>
                    </svg>
                    :
                    <svg style={{
                        width: '31px',
                        height: '26px',
                        verticalAlign: 'middle',
                        marginTop: '3px'
                    }}
                        fill="#FFFFFF" height="35" viewBox="0 0 35 35" width="35"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.282,32.706c-0.081,0-0.163-0.02-0.237-0.06c-0.162-0.087-0.263-0.257-0.263-0.44v-7.124C2.405,22.806,0,18.821,0,13.828
                        C0,6.112,7.093,0.294,16.5,0.294S33,6.112,33,13.828c0,7.715-7.093,13.533-16.5,13.533c-0.309,0-0.612-0.017-0.916-0.033
                        l-0.02-0.001l-8.007,5.296C7.474,32.678,7.378,32.706,7.282,32.706z M16.5,1.294C7.664,1.294,1,6.683,1,13.828
                        c0,3.323,1.128,7.842,6.503,10.499c0.17,0.084,0.278,0.258,0.278,0.448v6.501l7.369-4.874c0.09-0.06,0.199-0.095,0.302-0.082
                        l0.186,0.01c0.286,0.016,0.571,0.031,0.861,0.031c8.836,0,15.5-5.388,15.5-12.533S25.336,1.294,16.5,1.294z"/>
                    </svg>
                    
                }
            </div>
        );
    }
}