## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/bsanjok/transcendence-42-auth.git
   ```

2. Navigate to the project directory:
   ```bash
   cd your_project/
   ```
3. Run docker containers
   ```
   docker compose build && docker compose up -d 
   ```

4. Open a web browser and navigate to [http://127.0.0.1:8000/](http://127.0.0.1:8000/) to view the project.
Open [http://127.0.0.1:8000/api/auth/login](http://127.0.0.1:8000/api/auth/login) to initiate authentication with 42 account.

**You can get CLIENT_ID and CLIENT_SECRET from your intra->settings->API->Your Application->Register New Application.**


