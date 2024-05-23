import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Transcendence");
    }

    getHtml = async () => {
        return `
        <div class="window">
        <div class="menu-topbar">
          <div class="title">Menu</div>
        </div>
        <div class="content">
          <button class="large-button">Pong</button>
          <button class="large-button">Tetris</button>
        </div>
      </div>
        `
    }
}
