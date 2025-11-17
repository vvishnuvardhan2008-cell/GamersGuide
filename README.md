## Getting Started

To run this project locally, you will need to provide your own Google Gemini API key.

### 1. Clone the repository
git clone <your-repo-link>
cd GamersGuide

### 2. Install dependencies
npm install

### 3. Set up your environment variables
1.  Create a new file in the root of the project named `.env`
2.  Copy the contents of the `.env.example` file into your new `.env` file.
3.  Inside `.env`, replace `"your_own_api_key_goes_here"` with your personal Google Gemini API key.

    Your `.env` file should look like this:
    `EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy.......`

### 4. Run the app
npx expo start
