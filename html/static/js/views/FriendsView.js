import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Friends");
        this.addFriendName = '';
    }

    getHtml = async () => {
    return `
    <div class="window">
        <div class="topbar">
        <button id="back-button" onclick="history.back()" class="icon-button">
            <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;">
        </button>
        <div class="title">Friends</div>
        <a href="/" class="icon-button" data-link>
            <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;">
        </a>
        </div>
        <div class="content">
        <div class="people-list">
            <div class="scroll-people">
                <div class="friend-item">
                    <button class="friend-button">
                    <img class="small-pp" style="display: block;" src="./static/media/fallback-profile.png" draggable="false" (dragstart)="false;">
                    <div class="field">Aaron</div>
                    </button>
                    <button class="clean-button">
                    <img class="small-icon" src="./static/media/person-delete.svg" alt="Delete">
                    </button>
                </div>
                <div class="friend-item">
                    <button class="friend-button">
                    <img class="small-pp" style="display: block;" src="./static/media/fallback-profile.png" draggable="false" (dragstart)="false;">
                    <div class="field">Aaron</div>
                    </button>
                    <button class="clean-button">
                    <img class="small-icon" src="./static/media/person-delete.svg" alt="Delete">
                    </button>
                </div>
            </div>
        </div>
        <div class="label-field-button">
            <input id="friends-input" class="text-field" type="text" placeholder="username">
            <button id="add-friends" class="small-button">add</button>
        </div>
        </div>
    </div>
        `
    }

    attachEventListeners() {
        this.inputFriend = document.getElementById('friends-input');
        this.addFriendButton = document.getElementById('add-friends');
        
        
        this.handleAddFriend = () => {
            const friendValue = this.inputFriend.value;


            var myHeader = new Headers();
            if (friendValue) {
                /* TODO: make api request to create a friend */
                console.log(friendValue);
                const friendItem = document.createElement('div');
                friendItem.classList.add('friend-item');
                friendItem.innerHTML = this.getFriendTemplate(friendValue);
                
                /* add event listener to the delete button */
                const deleteButton = friendItem.querySelector('.clean-button');
                const deleteHandler = () => {
                //TODO: make an api call to /api/friends/{friend_id}
                deleteButton.removeEventListener('click', deleteHandler);
                friendItem.remove();
                };
                deleteButton.addEventListener('click', deleteHandler);

                /* attach the new created friend to the list */
                this.peopleListContainer.appendChild(friendItem);
                this.inputFriend.value = '';
            }
        }
        this.addFriendButton.addEventListener('click', this.handleAddFriend);
    }

    getFriendTemplate(friend) {
        return `
        <button class="friend-button">
            <img class="small-pp" style="display: block;" src="./static/media/fallback-profile.png" draggable="false" (dragstart)="false;">
            <div class="field">${friend}</div>
        </button>
            <button class="clean-button">
            <img class="small-icon" src="./static/media/person-delete.svg" alt="Delete">
        </button>
        `;
    }

    afterRender = async () => {
        this.attachEventListeners();
        this.peopleListContainer = document.querySelector('.scroll-people');
        this.peopleListContainer.innerHTML = '';

        /* TODO: make api call to get the list of friends */
        const people = [
            { name: "markus" },
            { name: "florian" }, 
            { name: "sanjok" },
            { name: "aaron" }
        ];

        if (people.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.classList.add('friend-item');
            emptyMessage.textContent = 'No friends';
            this.peopleListContainer.appendChild(emptyMessage);
            return;
        }

        const fragment = document.createDocumentFragment();

        people.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.classList.add('friend-item');
            friendItem.innerHTML = this.getFriendTemplate(friend.name);
            
            const deleteButton = friendItem.querySelector('.clean-button');
            const deleteHandler = () => {
                //TODO: make an api call to /api/friends/{friend_id}
                deleteButton.removeEventListener('click', deleteHandler);
                friendItem.remove();
            };
            deleteButton.addEventListener('click', deleteHandler); 
            

            fragment.appendChild(friendItem);
        });

        this.peopleListContainer.appendChild(fragment);

        return () => {
            this.addFriendButton.removeEventListener('click', this.handleAddFriend);
        }
    }
}