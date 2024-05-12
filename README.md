## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/bsanjok/transcendence-42-auth.git
   ```

2. Navigate to the project directory:
   ```bash
   cd your_project/
   ```

3. Create a virtual environment (optional but recommended):
   ```bash
   python3 -m venv venv
   ```

4. Activate the virtual environment:
   - **For Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **For macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

5. Install project dependencies using `pip` and the provided `requirements.txt` file:
   ```bash
   pip install -r requirements.txt
   ```

6. Set up the Django project settings:
   - Create a copy of the `.env.example` file and rename it to `.env`.
   - Modify the `.env` file to configure settings such as credentials, secret key, etc.

## POSTGRES CONTAINER
   - Run postgress container from postgresql docker compose file.
   - command: docker compose build && docker compose up -d

7. Run migrations to apply database changes (if applicable):
   ```bash
   python manage.py migrate
   ```

8. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

9. Open a web browser and navigate to [http://127.0.0.1:8000/](http://127.0.0.1:8000/) to view the project.
Open [http://127.0.0.1:8000/api/auth/login](http://127.0.0.1:8000/api/auth/login) to initiate authentication with 42 account.

## You can get CLIENT_ID and CLIENT_SECRET from your intra->settings->API->Your Application->Register New Application.


