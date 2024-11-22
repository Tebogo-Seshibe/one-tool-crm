// @ts-check
/// <reference path="../scripts/types.d.ts" />
/// <reference path="../scripts/const.js" />
/// <reference path="../scripts/api.js" />

/** @type {HTMLElement | null} */
let main;
/** @type {HTMLDivElement | null} */
let loggedIn;
/** @type {HTMLDivElement | null} */
let loginForm;
/** @type {HTMLSpanElement | null} */
let userField;
/** @type {HTMLElement | null} */
let loginButton;
/** @type {HTMLElement | null} */
let logoutButton;

window.addEventListener('load', async () => {
    main = document.getElementsByTagName('main')[0];
    userField = /** @type {HTMLSpanElement | null} */ (document.getElementById('logged-in-email'));
    loggedIn = /** @type {HTMLDivElement | null} */ (document.getElementById('logged-in'));
    loginForm = /** @type {HTMLDivElement | null} */ (document.getElementById('login-form'));
    
    if (!main || !loggedIn || !loginForm || !userField) {
        return;
    }

    main.removeChild(loggedIn);
    main.removeChild(loginForm);

    /** @type {CachedAuth | undefined} */
    const auth = (await chrome.storage.local.get())['auth'];

    if (auth) {
        main.appendChild(loggedIn);
        userField.innerHTML = auth.user;
    } else {
        main.appendChild(loginForm);
    }

    loginButton = document.getElementById('login');
    loginButton?.addEventListener('click', () => login());
    logoutButton = document.getElementById('logout');
    logoutButton?.addEventListener('click', () => logout());
});

async function login() {
    toggleLoader(true);

    const emailField = /** @type {HTMLInputElement | null} */ (document.getElementById('email'));
    const passwordField = /** @type {HTMLInputElement | null} */ (document.getElementById('password'));

    const api = new OneToolCRMApi();
    const response = await api.authUser({
        email: emailField?.value ?? '',
        password: passwordField?.value ?? ''
    });

    if (!response.success || !response.data) {
        alert('Failed to login');
        return;
    }

    await chrome.storage.local.set({ 
        auth: {
            tenant: response.data.tenant_identifier,
            token: `Bearer ${response.data.api_token}`,
            user: emailField?.value
        }
    });

    if (main && loggedIn && loginForm && userField) {
        main.removeChild(loginForm);
        main.appendChild(loggedIn);
        userField.innerHTML = emailField?.value ?? '';
    }
    
    toggleLoader(false);
}

async function logout() {
    toggleLoader(true);

    await chrome.storage.local.remove('auth');
    
    if (main && loggedIn && loginForm && userField) {
        main.removeChild(loggedIn);
        main.appendChild(loginForm);
        userField.innerHTML = '';
    }
    
    toggleLoader(false);
}

/**
 * @param {boolean} visible 
 * @returns {void}
 */
function toggleLoader(visible) {
    const spinner = document.getElementById('one-tool-crm-spinner');
    
    if (visible && !spinner) {
        const img = document.createElement('img');
        img.src = chrome.runtime.getURL('images/icon-32.png');
        img.id = 'one-tool-crm-spinner';

        if (loginButton) {
            loginForm?.removeChild(loginButton);
        }

        if (logoutButton) {
            loggedIn?.removeChild(logoutButton);
        }

        main?.appendChild(img);
    } else if (!visible && spinner) {
        spinner.parentElement?.removeChild(spinner);
        
        if (loginButton) {
            loginForm?.appendChild(loginButton);
        }

        if (logoutButton) {
            loggedIn?.appendChild(logoutButton);
        }
    }
}
