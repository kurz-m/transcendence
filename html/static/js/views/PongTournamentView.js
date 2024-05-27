import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Tournament");
    }

    getHtml = async () => {
    return `
    <div class="window">
        <div class="topbar">
        <button id="back-button" onclick="history.back()" class="icon-button">
            <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;">
        </button>
        <div class="title">Tournament</div>
        <a href="/" class="icon-button" data-link>
            <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;">
        </a>
        </div>
        <div class="content">
        <div class="h-content">
            <div class="v-content">
            <div class="people-list">
                <div class="scroll-people">
                <div class="list-item">
                    <div class="field">Aaron</div>
                    <button class="clean-button">
                    <img class="small-icon" src="./static/media/person-remove.svg" alt="Remove">
                    </button>
                </div>

                <div class="list-item">
                    <div class="field">Aaron</div>
                    <button class="clean-button">
                    <img class="small-icon" src="./static/media/person-remove.svg" alt="Remove">
                    </button>
                </div>
                <div class="list-item">
                    <div class="field">Aaron</div>
                    <button class="clean-button">
                    <img class="small-icon" src="./static/media/person-remove.svg" alt="Remove">
                    </button>
                </div>

                </div>
            </div>
            <div class="label-field-button">
                <input class="text-field" type="text" placeholder="name">
                <button class="small-button">add</button>
            </div>
            </div>
            <div class="v-content">
            <div class="ai-selection">
                <div class="subheading">AI</div>
                <div class="h-content">
                <div class="large-text">2</div>
                <div class="stepper">
                    <button class="stepper-inc">
                    <div class="stepper-text-inc">+</div>
                    </button>
                    <!-- <hr class="stepper-divider"> -->
                    <button class="stepper-dec">
                    <div class="stepper-text-dec">-</div>
                    </button>
                </div>
                </div>
            </div>
            <div class="v-spacer"></div>
            <div class="small-text">Total Players: 6</div>
            <button class="large-button">Play</button>
            </div>
        </div>
        </div>
    </div>
    `
    }
}
