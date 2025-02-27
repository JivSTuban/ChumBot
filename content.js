// Initialize observer after document is ready
function initializeExtension() {
    // Toast notification system
    function showToast(message, type = 'info', duration = 3000) {
        // Remove any existing toast
        const existingToast = document.querySelector('.chumbot-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `chumbot-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Hide and remove the toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    // Function to get test case content
    async function getTestCaseContent(button) {
        return new Promise((resolve) => {
            // Click the button to show content
            button.click();

            // Wait for content to be visible
            setTimeout(() => {
                const wrapper = button.closest('[data-testid="testCaseCard"]');
                const output = wrapper.querySelector('.styles_output__thX5r')?.textContent?.trim();
                // Click again to close
                button.click();
                resolve(output);
            }, 500);
        });
    }

    // Function to scrape page content
    async function scrapeExpectedOutput() {
        let expectedOutput = '';
        const scrapedData = {};

        // Get the problem description
        const problemDesc = document.querySelector('[data-testid="problemDescription"]')?.textContent?.trim();
        if (problemDesc) {
            scrapedData.problemDescription = problemDesc;
            expectedOutput += "Problem Description: " + problemDesc + '\n\n';
        }

        // Get minimum requirements and programming language
        const minimumRequirements = document.querySelector('[data-testid="problemMinimumRequirementsList"]');
        let programmingLanguage = '';

        if (minimumRequirements) {
            const languageTag = minimumRequirements.querySelector('.styles_language__xuk6N');
            if (languageTag) {
                const langImg = languageTag.querySelector('img');
                if (langImg) {
                    programmingLanguage = langImg.alt;
                    scrapedData.programmingLanguage = programmingLanguage;
                    expectedOutput += "Language: " + programmingLanguage + '\n\n';
                }
            }

            const requirementText = minimumRequirements.querySelector('[data-testid="functionName"]')?.textContent?.trim();
            if (requirementText) {
                const shouldUseMatch = requirementText.match(/Should use:\s*(.*)/);
                if (shouldUseMatch) {
                    const functionRequirement = shouldUseMatch[1];
                    scrapedData.functionSignature = functionRequirement;
                    expectedOutput += "Required Function Signature: " + functionRequirement + '\n\n';
                }
            }
        }

        // Get test cases
        const testCaseList = document.querySelector('[data-testid="testCaseList"]');
        if (testCaseList) {
            scrapedData.testCases = [];
            const testCaseButtons = testCaseList.querySelectorAll('button[aria-label^="Open Test Case"]');

            for (const button of testCaseButtons) {
                const testOutput = await getTestCaseContent(button);
                if (testOutput) {
                    const testNumber = button.querySelector('.styles_text_title__d_dJ2')?.textContent?.trim();
                    scrapedData.testCases.push({
                        name: testNumber,
                        expected: testOutput
                    });
                    expectedOutput += `${testNumber}:\n${testOutput}\n\n`;
                }
            }
        }

        // Add example from problem description if available
        const mainExample = document.querySelector('.styles_output__thX5r')?.textContent?.trim();
        if (mainExample) {
            scrapedData.example = mainExample;
            expectedOutput += `Example Output:\n${mainExample}\n\n`;
        }

        console.log('Scraped data:', scrapedData);
        return expectedOutput;
    }

    // Function to process and generate code
    async function processContent() {
        try {
            showToast('Processing problem requirements...', 'info');
            const expectedOutput = await scrapeExpectedOutput();
            if (!expectedOutput) {
                showToast('No content found to process', 'error');
                return;
            }

            showToast('Generating code solution...', 'info');
            const response = await chrome.runtime.sendMessage({
                action: 'scrapeData',
                data: expectedOutput
            });
             if (response) { // Check if response is defined
                if (response.success) {
                    showToast('Code generated successfully!', 'success');
                } else {
                    showToast(response.error || 'Failed to generate code', 'error');
                }
            } else {
                showToast('No response received from background script', 'error');
            }
           
        } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred. Please try again.', 'error');
        }
    }

    // Create and initialize observer
    let observer;
    function startObserver() {
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver((mutations) => {
             const isStudyAreaPage = window.location.href.includes('citu.codechum.com/student/study-area');
             const problemDesc = document.querySelector('[data-testid="problemDescription"]');
             const editor = document.querySelector('.ace_editor');

             if (isStudyAreaPage)
             {
                 if(problemDesc && editor)
                {
                    observer.disconnect();
                    showToast('Chumbot activated', 'info');
                    processContent();
                }
             }
        });

        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
     // Start observing immediately
      startObserver();
       
}

// Initialize when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}
