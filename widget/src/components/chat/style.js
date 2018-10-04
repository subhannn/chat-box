
export const desktopWrapperStyle = {
    zIndex: 2147483647,
    boxSizing: 'content-box',
    overflow: 'hidden',
    borderRadius: '5px 5px 0 0',
    width: '100%',
    height: '100%',
};

export const chatOpened = {
    backgroundColor: 'rgba(255,255,255,0.98)',
}

export const desktopClosedWrapperStyleChat = {
    position: 'fixed',
    bottom: '0px',
    right: '0px',
    zIndex: 2147483647,
    boxSizing: 'content-box',
    overflow: 'hidden',
    borderRadius: '5px 5px 0px 0px'
};

export const mobileClosedWrapperStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '32px',
    zIndex: 2147483647,
    boxSizing: 'content-box',
    overflow: 'hidden',
    borderRadius: '5px 5px 0 0',
    cursor: 'pointer',
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
    WebkitBoxShadow: '1px 1px 4px rgba(101,119,134,.75)',
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

export const iframeContainer = {
    backgroundColor: 'transparent',
    verticalAlign: 'text-bottom',
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: '100%',
    minHeight: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    margin: '0px',
    overflow: 'hidden',
    display: 'block',
}

export const desktopCloseContainer = {
    position: 'fixed',
    bottom: '-1px',
    right: '32px',
    zIndex: '2147483647',
    overflow: 'hidden',
    borderRadius: '5px 5px 0px 0px',
    height: '38px',
}

export const desktopOpenContainer = {
    position: 'fixed',
    bottom: '0px',
    right: '32px',
    zIndex: '2147483647',
    overflow: 'hidden',
    borderRadius: '5px 5px 0px 0px',
    width: '370px',
    height: '408px',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 0px 0.5rem 0px',
}

export const inputInfoCont = {
    position: 'absolute',
    top: '39px',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgb(255, 255, 255)',
}