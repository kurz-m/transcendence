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
                    <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;" />
                </button>
                <div class="title">Error</div>
                <a href="/" class="icon-button" data-link>
                    <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;" />
                </a>
            </div>
            <div class="error-code">${statusCode}: ${statusCodeText}</div>
        </div>
        `
    }
}
