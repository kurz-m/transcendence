import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Error");
        document.getElementById('login-button').classList.remove('hidden');
    }

    getHtml = async () => {
        this.urlParams = new URLSearchParams(location.search);
        const statusCode = this.urlParams.get('statuscode');
        
        const STATUS_CODE = {
            403: 'Forbidden',
            404: 'Not Found',
            500: 'Internal Server Error'
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
