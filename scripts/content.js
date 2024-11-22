/// <reference path="types.d.ts" />
/// <reference path="const.js" />
/// <reference path="api.js" />

/** @type {HTMLElement | null} */
let moreButton = null;
let timeout = -1;
let lifetime = 10000;
const refresh = 2500;
const delay = 50;

window.navigation.addEventListener('navigate', (e) => {
    moreButton = null;

    if (e.navigationType === 'replace') {
        const label = document.getElementById('one-tool-crm-label');
        const button = document.getElementById('one-tool-crm-button');
        
        if (label) {
            label.parentElement?.removeChild(label);
        }
        
        if (button) {
            button.parentElement?.removeChild(button);
        }

        timeout = setTimeout(() => waitForButtons(), refresh);
    }
});

// @ts-check
window.addEventListener('load', () => {
    waitForButtons();
});

/**
 * @function
 * @description
 * @returns {Promise<void>}
 */
async function doExtensionWork() {
    const api = new OneToolCRMApi();

    const authenticated = await authenticate(api);
    if (!authenticated) {
        toggleLoader(false);
        return;
    }

    if (!profileDashboardIsVisible()) {
        toggleLoader(false);
        return;
    }

    const { firstNames, lastName } = getUserNames();
    if (!firstNames) {
        alert('1ToolCRM: Failed to locate user names');
        toggleLoader(false);
        return;
    }

    const isUserInSystem = await userInSystem(api, firstNames, lastName);
    toggleLoader(false);
    if (isUserInSystem) {
        insertUserExistsLabel();
    } else {
        insertAddUserButton(api, firstNames, lastName);
    }
}

/**
 * @function
 * @param {OneToolCRMApi} api 
 * @returns {Promise<boolean>}
 */
async function authenticate(api) {
    /** @type {CachedAuth | undefined} */
    let auth = (await chrome.storage.local.get())['auth'];
    
    if (!auth) {
        alert('1ToolCRM: User not logged in');        
        return false;
    }

    api.headers[AUTHORIZATION_HEADER] = auth.token;
    api.headers[TENANT_HEADER] = auth.tenant;

    return true;
}


/**
 * @function
 * @description Matches the url to identity whether we are viewing the
 * user's profile dashboard
 * @returns {boolean}
 */
function profileDashboardIsVisible() {
    const match = location.pathname.match(/\/in\/.+\/$/);
    return !!match && 
           match.length > 0;
}

/**
 * @function
 * @description Parses the user's profile to their name
 * @returns {{firstNames: string, lastName:string}}
 */
function getUserNames() {
    let firstNames = ''
    let lastName = ''

    const notificationButtonLabel = document.getElementsByTagName('main')[0]
        ?.getElementsByClassName('artdeco-button')[0]
        ?.getAttribute('aria-label') ?? '';
    const fullName = document.getElementsByTagName('main')[0]
        ?.getElementsByTagName('a')[0]
        ?.getElementsByTagName('h1')[0]
        ?.innerHTML ?? '';

    if (notificationButtonLabel) {
        firstNames = notificationButtonLabel
            .replace('Notify me about all of ', '')
            .replace('’s posts', '')
            .replace('Message ', '')
            .trim()
            ?? '';
        lastName = fullName.replace(firstNames, '').trim();
    } else {
        firstNames = fullName;
    }

    return {
        firstNames,
        lastName
    };
}

/**
 * @function
 * @description Tests whether the user exists within 1Tool
 * @param {OneToolCRMApi} api 
 * @param {string} firstNames 
 * @param {string} lastName
 * @returns {Promise<boolean>}
 */
async function userInSystem(api, firstNames, lastName) {
    const response = await api.showContact({
        vorname: firstNames,
        name: lastName,
    });

    return response.success && 
           response.data?.data.length !== 0;
}

/**
 * @function
 * @description Adds a button to the user's name section,
 * to add said user to 1Tool.
 * @param {OneToolCRMApi} api
 * @param {string} firstNames
 * @param {string} lastName
 * @returns {void}
 */
function insertAddUserButton(api, firstNames, lastName) {
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('images/icon-16.png');

    const span = document.createElement('span');
    span.innerHTML = 'Add to 1Tool';

    const button = document.createElement('button');
    button.id = 'one-tool-crm-button';
    button.className = 'one-tool-crm-container';
    button.appendChild(img);
    button.appendChild(span);
    button.addEventListener('click', async () => {
        toggleLoader(true);
        moreButton.parentElement?.removeChild(button);
        
        const response = await api.createContact({
            vorname: firstNames,
            name: lastName,
        });
        
        toggleLoader(false);
        if (response.success) {
            insertUserExistsLabel();
        } else {
            moreButton.parentElement?.appendChild(button);
            alert('1ToolCRM: Failed to create user')
        }
    });

    moreButton.parentElement?.appendChild(button);
}

/**
 * @function
 * @description Adds a label to the user's name section,
 * showing that they have already been added to the system.
 * @returns {void}
*/
function insertUserExistsLabel() {
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('images/icon-16.png');

    const span = document.createElement('span');
    span.innerHTML = 'User exists within 1Tool';

    const div = document.createElement('div');
    div.id = 'one-tool-crm-label';
    div.className = 'one-tool-crm-container';
    div.appendChild(img);
    div.appendChild(span);

    moreButton?.parentElement?.appendChild(div);
}


/**
 * @function
 * @description Fetches the "More" button dom element
 * @returns {HTMLElement | null}
 */
function getMoreButton() {
    return 
}

/**
 * @function
 * @description Loops until the buttons on the user's action buttons are
 * visible
 * @returns {void}
 */
function waitForButtons() {
    clearTimeout(timeout);

    moreButton = document.getElementsByTagName('main')[0]
        ?.getElementsByTagName('section')[0]
        ?.getElementsByClassName('artdeco-dropdown')[0];

    if (!moreButton || !moreButton.parentElement) {
        lifetime -= delay;

        if (lifetime < 0) {
            alert('1ToolCRM: Button took longer than expected to load');
        } else {   
            timeout = setTimeout(() => waitForButtons(), delay);
        }
    } else {
        moreButton.parentElement.style.flexWrap = 'wrap';
        moreButton.parentElement.style.rowGap = '8px';
        toggleLoader(true);
        doExtensionWork();
    }
}

/**
 * @param {boolean} visible 
 * @returns {void}
 */
function toggleLoader(visible) {
    const spinner = document.getElementById('one-tool-crm-spinner');
    
    if (visible && !spinner) {
        const img = document.createElement('img');
        img.src = chrome.runtime.getURL('images/icon-16.png');
        img.id = 'one-tool-crm-spinner';

        moreButton.parentElement?.appendChild(img);
    } else if (!visible && spinner) {
        spinner.parentElement?.removeChild(spinner);
    }
}
