# Chumbot: Code Generation Chrome Extension for CodeChum

## Overview

Chumbot is a Chrome extension designed to assist users on the [CodeChum](https://www.codechum.com/) platform, a website for practicing programming skills. Chumbot automates the process of solving coding problems by:

1.  **Scraping Problem Requirements:** Extracting essential information about a coding problem, including the problem description, required function signature, test cases, and expected output.
2.  **Generating Code:** Sending the scraped problem data to a large language model (LLM) API (in this case, a Gemini API) to generate a code solution.
3.  **Injecting Code:** Automatically inserting the generated code into the CodeChum editor.
4.  **Testing Code:** Automatically clicking the "Check code" button to submit the generated code for evaluation.
5.  **Re-solving:** When the code fails some or all test cases, the extension can automatically re-attempt by sending additional context (failed test cases, the current code) to the LLM API for a revised solution.
6. **Correct test cases**: Pass the correct test cases so the model knows how to solve the problem.
7. **Compilation error**: Now the model is able to recognize compilation errors such as `undefined reference to main`.
8. **Multiple attempts**: The extension will try to solve the problem up to 3 times.
9. **Log**: The extension will log every step of the code generation and resolving.
10. **Toast notification**: The extension will display toast notification to make the process more user friendly.

## Features

*   **Automated Code Generation:** Automatically generates code solutions for CodeChum problems.
*   **Error Handling:** Detects and handles compilation errors, incorrect output, and partially correct solutions.
*   **Re-solving Logic:** Retries code generation up to three times, providing the LLM API with additional information on each re-attempt.
*   **Test Case Comparison:** Compares the generated output with expected output and informs the user if the code is incorrect.
*   **Correct Test Cases**: The extension passes the correct test cases to the LLM API.
*   **Programming Language Detection:** Automatically detects the programming language selected in the CodeChum editor and informs the LLM.
*   **Logs:** The extension logs every call to the API, making it easier to debug.
*   **Toast Notifications:** Displays toast notifications to indicate the status of the extension.
*   **Non-perfect Score Resolving:** Triggers a re-solve if the score is not perfect.

## Video Demonstration

[![Chumbot Demo Video](https://img.youtube.com/vi/L8T0pts35ug/0.jpg)](https://youtu.be/L8T0pts35ug?si=bT7nOoufdRhkoNED)

This video shows how the Chumbot extension helps to automate the process of solving problems on CodeChum.

## Installation

1.  **Download or Clone:** Download the extension code from the repository, or clone it using Git:
    ```bash
    git clone <repository-url>
    ```
2.  **Get a Gemini API Key:**
    *   You need your own API key to use the Gemini API.
    *   Follow the instructions to set up billing and obtain your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).
3.  **Replace the API Key:**
    *   Open `background.js` and replace `YOUR_API_KEY` with the API key that you obtained.
    *   The API key is in the `fetch` url.
    ```javascript
    response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY', {
        //...
    });
    ```
4.  **Open Chrome Extensions:** In your Chrome browser, go to `chrome://extensions/`.
5.  **Enable Developer Mode:** In the top right corner of the `chrome://extensions/` page, toggle the "Developer mode" switch to the ON position.
6.  **Load Unpacked:** Click the "Load unpacked" button.
7.  **Select Directory:** Select the directory where you downloaded or cloned the Chumbot extension code.

## Usage

1.  **Navigate to CodeChum:** Go to a problem in the study area of CodeChum (e.g., `https://citu.codechum.com/student/study-area`).
2.  **Wait until Chumbot is activated:** If the page is a study area problem, the extension will activate automatically.
3.  **Wait for Code:** Chumbot will automatically scrape the page content, send it to the API, and inject the generated code into the editor.
4.  **Check Code:** Chumbot will automatically click the "Check code" button.
5.  **View Results:** If the code is correct, you'll see a success message. If not, Chumbot will automatically attempt to re-solve the problem up to two more times.
6.  **Check logs:** You can press right click and select "Inspect" to open the dev tools and check the logs in the console.
7.  **Wait until the process is finished:** If the process ended successfully, the extension will show a "Code generated successfully!" toast; otherwise, it will show a "Failed to generate code" or "too many attempts" message.

## Troubleshooting

*   **"No response received from background script" Error:**
    *   This error means the content script isn't getting a response from the background script. If this happens, reload the extension.
*   **"ReferenceError: text is not defined":**
    *   This issue occurred in previous versions due to an incorrect argument being passed to a function. This has been resolved in the latest code.
*   **"TypeError: Cannot read properties of undefined (reading 'success')":**
    *   This issue occurred in previous versions due to the `content.js` not handling all the cases where there was no response. This has been resolved in the latest code.
*   **Missing `main` Function:**
    *   If the generated code is missing the `main` function and produces a compilation error, the extension will now detect that error and re-attempt to solve the problem.
*   **Re-solve logs:** Now the resolving process will be correctly logged.
*   **Test cases:** Now the extension will pass correct and wrong test cases to the LLM.
*   **API Key Error**
    * Remember to replace `YOUR_API_KEY` with your own API key.
    *   If you receive errors related to the API key, double-check that you have replaced it correctly and that it is a valid key.
*   **Check Console Logs:** If the extension is not working as expected, open the Chrome Developer Tools (right-click on the page and select "Inspect" or "Inspect Element") and check the "Console" tab for error messages or logs. The extension logs its progress, API calls, and any errors.

## Future Improvements

*   **User Interface:** Add a pop-up or other interface to give users more control over the extension's settings and behavior.
*   **More models:** Add support for more LLM models.
*   **Show errors:** Improve the toast to show the actual error from the LLM API.
*   **Prompt Customization:** Allow users to customize the prompt sent to the API.

## Contributing

Contributions to Chumbot are welcome! If you find a bug or have a suggestion for improvement, feel free to open an issue or create a pull request on the repository.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

**Note:** Replace `<repository-url>` with the actual URL of your Git repository.
