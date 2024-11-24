// @ts-check
/// <reference path="types.d.ts" />
/// <reference path="const.js" />
/// <reference path="utils.js" />
/// <reference path="api.js" />

/** @type {HTMLElement | null} */
let buttonContainer = null;
const refresh = 2500;


// @ts-ignore
window.navigation.addEventListener('navigate', async (/** @type {{ navigationType: 'replace' | 'push'; }} */ e) => {
    buttonContainer = null;

    if (e.navigationType === 'replace') {
        const label = document.getElementById('one-tool-crm-label');
        const button = document.getElementById('one-tool-crm-button');
        
        if (label) {
            label.parentElement?.removeChild(label);
        }
        
        if (button) {
            button.parentElement?.removeChild(button);
        }

        setTimeout(async () => await doExtensionWork(), refresh);
    }
});

window.addEventListener('load', async () => {
    await doExtensionWork();
});

/**
 * @function
 * @description
 * @returns {Promise<void>}
 */
async function doExtensionWork() {
    //#region Fetch User Information

    /** @type {LinkedInUser} */
    const user = {
        info: null,
        email: null,
        site: null,
        employment: null,
        region: null,
    };
    
    openContactInfoModal();
    await waitUntil(() => {
        const loaders = document.querySelectorAll('artdeco-loader');
        return loaders.length === 0 && !!getProfileName()
    });
    user.info = getProfileName();
    user.email = getProfileEmail();
    closeModal();

    buttonContainer = await waitUntil(
        () => document.getElementsByTagName('main')[0]
            ?.getElementsByTagName('section')[0]
            ?.getElementsByClassName('artdeco-dropdown')[0]
            ?.parentElement
    );

    if (!buttonContainer) {
        return;
    }

    buttonContainer.style.flexWrap = 'wrap';
    buttonContainer.style.rowGap = '8px';
    
    user.region = getProfileRegion();
    user.site = getProfileWebsite();
    user.employment = getCurrentEmployement();
    
    //#endregion


    toggleLoader(true);
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

    const isUserInSystem = await userInSystem(api, user);
    toggleLoader(false);
    if (isUserInSystem) {
        insertUserExistsLabel();
    } else {
        insertAddUserButton(api, user);
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
    const match = location.pathname.match(/\/in\/.+\/?$/);
    return !!match && 
           match.length > 0;
}


/**
 * @function
 * @description Tests whether the user exists within 1Tool
 * @param {OneToolCRMApi} api
 * @param {LinkedInUser} user
 * @returns {Promise<boolean>}
 */
async function userInSystem(api, user) {
    const response = await api.showContact({
        vorname: user.info?.firstname,
        name: user.info?.lastname,        
        
    });

    return response.success && 
           response.data?.data.length !== 0;
}

/**
 * @function
 * @description Adds a button to the user's name section,
 * to add said user to 1Tool.
 * @param {OneToolCRMApi} api
 * @param {LinkedInUser} user
 * @returns {void}
 */
function insertAddUserButton(api, user) {
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
        buttonContainer?.removeChild(button);
        
        const response = await api.createContact({
            vorname: user.info?.firstname,
            name: user.info?.lastname,
            mail: user.email ?? undefined,
            firma: user.employment?.company,
            job: user.employment?.title,
            // : user.region?.city,
            // : user.region?.country,

        });
        
        toggleLoader(false);
        if (response.success) {
            insertUserExistsLabel();
        } else {
            buttonContainer?.appendChild(button);
            alert('1ToolCRM: Failed to create contact')
        }
    });

    buttonContainer?.appendChild(button);
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
    span.innerHTML = 'Contact exists within 1Tool';

    const div = document.createElement('div');
    div.id = 'one-tool-crm-label';
    div.className = 'one-tool-crm-container';
    div.appendChild(img);
    div.appendChild(span);

    buttonContainer?.appendChild(div);
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

        buttonContainer?.appendChild(img);
    } else if (!visible && spinner) {
        spinner.parentElement?.removeChild(spinner);
    }
}
