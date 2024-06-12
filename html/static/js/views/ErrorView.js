import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Error");
        document.getElementById('login-button').classList.remove('hidden');
    }

    isNumber(str) {
        return /^-?\d+$/.test(str);
    }

    getHtml = async () => {
        this.urlParams = new URLSearchParams(location.search);
        const statusCode = this.urlParams.get('statuscode');
        
        if (this.isNumber(statusCode)) {
            if ((Number(statusCode) !== 0) && Number(statusCode) < 100 || Number(statusCode) > 599) {
                statusCode = '418';
            }
        }

        const STATUS_CODE = {
            0: 'You appear to be offline',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            418: `I'm a teapot`,
            503: 'Service Unavailable'
        }; 
        const statusCodeText = STATUS_CODE[statusCode] || 'Unknown Error';
            
        return `
        <div class="window">
            <div class="topbar">
                <button id="back-button" onclick="history.back()" class="icon-button">
                    <i class="bi bi-caret-left-fill"></i>
                </button>
                <div class="title">Error</div>
                <a href="/" class="icon-button" (dragstart)="false;" draggable="false" data-link>
                    <i class="bi bi-house-fill"></i>
                </a>
            </div>
            <div class="error-code">${statusCode}: ${statusCodeText}</div>
        </div>
        `
    }
}
