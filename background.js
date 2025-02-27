// Function to handle code injection
async function injectCode(tabId, code) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            world: 'MAIN',
            func: (text) => {
                try {
                    const editor = document.querySelector('.ace_editor');
                    if (!editor) throw new Error('Editor not found');

                    const instance = ace.edit(editor);
                    instance.setValue(text);
                    instance.clearSelection();
                    instance.moveCursorTo(0, 0);
                    return { success: true };
                } catch (e) {
                    console.error('Editor error:', e);
                    return { success: false, error: e.message };
                }
            },
            args: [code]
        });
        return { success: true };
    } catch (error) {
        console.error('Injection error:', error);
        return { success: false, error: error.message };
    }
}

// Function to clean the generated code
function cleanGeneratedCode(code) {
    if (!code) return "";

    // Remove lines containing only backticks, and any leading/trailing whitespace
    const cleanedCode = code.split('\n').filter(line => !line.trim().match(/^```/)).join('\n').trim();

    return cleanedCode;
}

// Function to click the "Check code" button
async function clickCheckCodeButton(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const checkButton = document.querySelector('[data-testid="submitCodeButton"]');
                        if (checkButton) {
                            checkButton.click();
                            resolve({ success: true });
                        } else {
                            reject("Check code button not found.");
                        }
                    }, 1000); // 1-second delay. Adjust if needed.
                });
            },
            world: 'MAIN'
        });
        return { success: true };
    } catch (error) {
        console.error('Error clicking Check code button:', error);
        return { success: false, error: error.message };
    }
}

// Function to check if the output is wrong
async function isOutputWrong(tabId) {
    try {
        const result = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const yourOutput = document.querySelector('.styles_testcase_content__ZIMQU .styles_output__thX5r:first-of-type')?.textContent?.trim();
                const expectedOutput = document.querySelector('.styles_testcase_content__ZIMQU .styles_output__thX5r:last-of-type')?.textContent?.trim();
                const diffButton = document.querySelector('.styles_outputdifference__tCRkI button[data-testid="button"]');
                const failImage = document.querySelector('[data-testid="cody"][alt="Cody"][src="/_next/static/media/fail.ae725c27.svg"]');
                const passedImage = document.querySelector('[data-testid="cody"][alt="Cody"][src="/_next/static/media/okay.c3b8a4cf.svg"]');
                const testCasesPassed = document.querySelector('.styles_data__NidjD .styles_text___b___300__sqXQW')?.textContent?.trim();
                const score = document.querySelector('.styles_data__NidjD:nth-of-type(2) .styles_text___b___300__sqXQW')?.textContent?.trim();

                let wrongTestCases = "";
                let correctTestCases = "";
                const testCaseList = document.querySelector('[data-testid="testCaseList"]');
                if (testCaseList) {
                    const testCaseButtons = testCaseList.querySelectorAll('button[aria-label^="Open Test Case"]');

                    testCaseButtons.forEach(button => {
                        const testCaseWrapper = button.closest('[data-testid="testCaseCard"]');
                        const outputDiv = testCaseWrapper.querySelector('.styles_output__thX5r:first-of-type');
                        const secondOutputDiv = testCaseWrapper.querySelector('.styles_output__thX5r:last-of-type');
                        if (outputDiv && secondOutputDiv) {
                            const testCaseOutput = outputDiv.textContent?.trim();
                            const secondTestCaseOutput = secondOutputDiv.textContent?.trim();
                            if (testCaseOutput && testCaseOutput.length > 0 && testCaseOutput != secondTestCaseOutput) {
                                wrongTestCases += `Test case: ${button.querySelector('.styles_text_title__d_dJ2').textContent.trim()} \n your output: ${testCaseOutput}\n`;
                            }
                            else if (testCaseOutput && testCaseOutput == secondTestCaseOutput) {
                                correctTestCases += `Test case: ${button.querySelector('.styles_text_title__d_dJ2').textContent.trim()} \n your output: ${testCaseOutput}\n`;
                            }
                        }
                    })
                }
                if (yourOutput && yourOutput.includes("undefined reference to `main'")) {
                    return { isWrong: true, error: `Compilation error: ${yourOutput}`, failImage: false, passImage: false, wrongTestCases: wrongTestCases, correctTestCases: correctTestCases };
                }
                if (passedImage && score && score.includes("/")) {
                    const [numScore, totalScore] = score.split("/").map(Number);
                    if (numScore < totalScore) {
                        return { isWrong: true, error: `Not all test cases passed, score: ${score}`, failImage: false, passImage: true, wrongTestCases: wrongTestCases, correctTestCases: correctTestCases };
                    }
                }
                if (failImage) {
                    return { isWrong: true, error: "Failed", failImage: true, passImage: false, wrongTestCases: wrongTestCases, correctTestCases: correctTestCases };
                }
                if (yourOutput && expectedOutput && yourOutput.length > 0 && expectedOutput.length > 0 && yourOutput !== expectedOutput && diffButton) {
                    return { isWrong: true, error: `Your output does not match with the expected one:\n ${wrongTestCases}`, failImage: false, passImage: false, wrongTestCases: wrongTestCases, correctTestCases: correctTestCases }
                }
                else if (yourOutput && yourOutput.length > 0 && !expectedOutput) {
                    return { isWrong: true, error: `There is an error with the code:\n ${wrongTestCases}`, failImage: false, passImage: false, wrongTestCases: wrongTestCases, correctTestCases: correctTestCases };
                }
                else {
                    return { isWrong: false, error: "", failImage: false, passImage: false, wrongTestCases: wrongTestCases, correctTestCases: correctTestCases };
                }
            },
            world: 'MAIN'
        });
        return result[0].result;
    } catch (error) {
        console.error('Error checking output:', error);
        return { isWrong: false, error: error.message, failImage: false, passImage: false, wrongTestCases: "", correctTestCases: "" };
    }
}

//Function to click the resolve button
async function clickResolveButton(tabId) {
    try {
        console.log('Attempting to click resolve button'); //Log resolve click attempt
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const resolveButton = document.querySelector('#resolveButton');
                if (resolveButton) {
                    console.log('Resolve button found. Clicking...'); //Log resolve button found
                    resolveButton.click();
                    return { success: true };
                } else {
                    console.error('Resolve button not found.'); //Log resolve button not found
                    throw new Error("Resolve button not found.");
                }
            },
            world: 'MAIN'
        });
        console.log('Resolve button clicked successfully'); //Log resolve click success
        return { success: true };
    } catch (error) {
        console.error('Error clicking Resolve button:', error);
        return { success: false, error: error.message };
    }
}

// Function to get the programming language
async function getProgrammingLanguage(tabId) {
    try {
        const result = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const languageElement = document.querySelector('[data-testid="singleValueLabel"]');
                if (languageElement) {
                    return languageElement.textContent.trim();
                } else {
                    throw new Error("Language element not found.");
                }
            },
            world: 'MAIN'
        });
        return result[0].result;
    } catch (error) {
        console.error('Error getting programming language:', error);
        return "C"; // Default to C if not found
    }
}

async function getCurrentCode(tabId) {
    try {
        const result = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const editor = document.querySelector('.ace_editor');
                if (editor) {
                    const instance = ace.edit(editor);
                    return instance.getValue();
                } else {
                    throw new Error('Editor not found');
                }
            },
            world: 'MAIN',
        });
        return result[0].result;
    } catch (error) {
        console.error('Error getting current code:', error);
        return ""; // Return empty string if code cannot be retrieved
    }
}
// Function to scrape data and send it to the API
async function scrapeAndGenerateCode(sender, prompt) {
    const tabId = sender.tab.id; // Get the tabId
    const programmingLanguage = await getProgrammingLanguage(tabId);
    let currentCode = "";
    let codeIsWrong = true;
    let numberOfAttempts = 0;
    let response = { success: false, error: "" };
    const requestBody = (wrongTestCases = "", correctTestCases = "") => {
        return {
            contents: [{
                parts: [{
                    text: `You are a senior software developer. You will receive a prompt with some wrong test cases. Your goal is to correct the code to pass all test cases.
                           If you dont include a main function the code will not compile, so make sure the code always has a main function.
                        ${prompt}
                         ${wrongTestCases ? `\n\n Wrong test cases:\n ${wrongTestCases}` : ""} ${correctTestCases ? `\n\n Correct test cases:\n ${correctTestCases}` : ""} \n\n Current code:\n${currentCode}
                        Important Notes:
                        1. Your response must contain ONLY the function implementation that matches the Required Function Signature exactly.
                        2. Do not include any other code, comments, or explanations.
                        3. Make sure your code handles the example case: processing user input and printing the expected format.
                        4. Your function will be called with different test cases, ensure it works for all possible inputs.
                        5. The programming language must be ${programmingLanguage}.` }]
            }]
        };
    };
    while (codeIsWrong && numberOfAttempts < 3) {
        numberOfAttempts++;
        codeIsWrong = false;

        if (numberOfAttempts > 1) {
            console.log(`Attempt ${numberOfAttempts}: Clicking Resolve Button`); //Log resolve click action with attempt number
            const resolveResult = await clickResolveButton(tabId);
            if (!resolveResult.success) throw new Error(resolveResult.error || 'Failed to click resolve button');
            await new Promise(resolve => setTimeout(resolve, 1000));
            currentCode = await getCurrentCode(tabId);
        }
        const isWrongResult = await isOutputWrong(tabId);
        const newRequestBody = requestBody(isWrongResult.wrongTestCases, isWrongResult.correctTestCases);
        console.log('API Call:', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'); //Log the url
        console.log('Request Body:', newRequestBody);//Log the request body
        try {
            const apiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRequestBody)
            });
                console.log('API Response Status:', apiResponse.status); //Log the response status
                 const data = await apiResponse.json();
                 console.log('API Response Body:', data); // Log the response body
                if (!apiResponse.ok) throw new Error(data.error?.message || 'API Error');

                // Get the generated code
                let code = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!code) throw new Error('No code generated');

                // Clean the generated code
                const cleanedCode = cleanGeneratedCode(code);

                // Inject the code into the editor
                const result = await injectCode(tabId, cleanedCode);
                if (!result.success) throw new Error(result.error || 'Injection failed');

                // Add a delay before clicking the button
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay. Adjust if needed.

                // Click the Check code button
                const clickResult = await clickCheckCodeButton(tabId);
                if (!clickResult.success) throw new Error(clickResult.error || 'Failed to click Check code button');
                await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second delay. Adjust if needed.

                const checkResult = await isOutputWrong(tabId);

                  if (checkResult.isWrong) {
                            throw new Error(`Code is wrong: ${checkResult.error}`);
                  }
                  response = { success: true };

        } catch (error) {
            console.error('Error:', error);
             response = { success: false, error: error.message };
                 if (error.message.includes("Code is wrong") ) {
                    codeIsWrong = true;
                 }
        }
        if (codeIsWrong) {
                continue;

        }
        if (!codeIsWrong)
        {
         return response;
        }

    }
    console.log("returning response");
    return response;
}
// Message handler
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'scrapeData') {
        const response = await scrapeAndGenerateCode(sender, message.data);
        sendResponse(response);
        return true;
    }
    return false;
});
