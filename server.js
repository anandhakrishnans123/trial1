const express = require('express');
const { chromium } = require('playwright'); // Import Playwright
const path = require('path'); // For path handling

const app = express();
const port = 3000;

// Set up middleware
app.use(express.static('public')); // To serve static files like HTML
app.use(express.json()); // To handle JSON request bodies
app.use(express.urlencoded({ extended: true })); // To handle URL-encoded data

// Function to attempt login and navigate to target page
async function attemptLogin(page, email, password) {
  try {
    await page.context().clearCookies();
    await page.goto('https://esgbeta.samcorporate.com');
    await page.waitForSelector('text=Login');
    await page.click('text=Login');
    await page.waitForURL('**/login');

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
        return { success: false, message: "Login failed" };
      } else {
        const iterations=10;
        for (let i = 0; i < iterations; i++) {
          console.log(`Iteration ${i + 1} of ${iterations}`);
  
          // Navigate to the target page
          await page.goto('https://esgbeta.samcorporate.com/app/ih0w9cralvbmwlou0fo0jgpayrx/page/manage/users/list');
          await page.waitForSelector('h1'); // Wait for some content to load on the target page
  
          // Perform actions
          await page.click('text=Invite');
          const user_role_value = 'Role B';
          await page.selectOption('select#workspaceUserRoleId', { label: user_role_value });
          await page.fill(`input#email`, `anandhakrishnan+${i + 1}@samcorporate.com`);

          await page.fill('input#react-select-2-input', "ABC HoldCo");
          await page.keyboard.press('Enter');
          await page.click('button[type="submit"]:has-text("Add User")');
  
          // Wait for 5 seconds after submission
          await page.waitForTimeout(3000);
  
          // Capture a screenshot
          const screenshotPath = path.join(__dirname, `screenshot/target_page_screenshot_${i + 1}.png`);
          await page.screenshot({ path: screenshotPath });
  
          console.log(`Iteration ${i + 1} completed. Screenshot saved to: ${screenshotPath}`);
        }
  
        return { success: true, message: "All iterations completed successfully" };
      }
    } catch (e) {
      console.error(`Error during login attempt: ${e}`);
      return { success: false, message: `Error during login attempt: ${e}` };
    }
  }

// Route to handle login submission
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const result = await attemptLogin(page, email, password);
  await page.close();
  await browser.close();

  // Send response with screenshot path if login and navigation are successful
  res.json(result);
});

// Serve the HTML form at the root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
