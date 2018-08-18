
export const desktopWrapperStyle = {
    position: 'fixed',
    bottom: 0,
    right: '32px',
    zIndex: 2147483647,
    boxSizing: 'content-box',
    overflow: 'hidden',
    borderRadius: '5px 5px 0 0'
};

export const chatOpened = {
    boxShadow: '0 0 0.5rem 0 rgba(0,0,0,0.2)',
    backgroundColor: 'rgba(255,255,255,0.98)',
}

export const desktopClosedWrapperStyleChat = {
    position: 'fixed',
    bottom: '0px',
    right: '0px',
    zIndex: 2147483647,
    minWidth: '400px',
    boxSizing: 'content-box',
    overflow: 'hidden',
    minHeight: '120px'
};

export const mobileClosedWrapperStyle = {
    position: 'fixed',
    bottom: 0,
    right: '32px',
    zIndex: 2147483647,
    boxSizing: 'content-box',
    overflow: 'hidden',
    borderRadius: '5px 5px 0 0',
};

export const mobileOpenWrapperStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2147483647,
    width: '100%',
    height: '100%',
    background: 'rgb(229, 229, 229)',
    overflowY: 'visible',
    boxSizing: 'content-box'
};

export const desktopTitleStyle = {
    lineHeight: '30px',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'Lato, sans-serif',
    color: 'rgb(255, 255, 255)',
    cursor: 'pointer',
    padding: '4px 2px',
};

export const mobileTitleStyle = {
    height: 52,
    width: 52,
    cursor: 'pointer',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    webkitBoxShadow: '1px 1px 4px rgba(101,119,134,.75)',
    boxShadow: '1px 1px 4px rgba(101,119,134,.75)'
};

export const cancelBtnCont = {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: '120px',
    textAlign: 'right',
    padding: '5px 0'
}

export const cancelBtn = {
    fontSize: '14px',
    fontWeight: 'normal',
    fontFamily: 'inherit',
    opacity: 1,
    textTransform: 'none',
    borderRadius: '0.3em',
    borderStyle: 'initial',
    borderImage: 'initial',
    cursor: 'pointer',
    display: 'inline-block',
    verticalAlign: 'middle',
    backgroundColor: 'transparent',
    color: '#ababab',
    border: '1px solid #dfdfdf',
    padding: '10px 12px',
}